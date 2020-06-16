#
#  ██    ██ ██      ██ ███    ██ ██████  ███████ ██████ 
#  ██    ██ ██      ██ ████   ██ ██   ██ ██      ██   ██ 
#  ██    ██ ██      ██ ██ ██  ██ ██   ██ █████   ██████  
#   ██  ██  ██      ██ ██  ██ ██ ██   ██ ██      ██   ██ 
#    ████   ███████ ██ ██   ████ ██████  ███████ ██   ██ 
#
#
#             █████  ██████  ██     __ .  . __
#            ██   ██ ██   ██ ██    (o.\ \/ /.o)
#            ███████ ██████  ██     \__\/\/__/
#            ██   ██ ██      ██     /O /==\ O\
#            ██   ██ ██      ██    (;O/ \/ \O;)
#                   

#
# Configuration
#

DB_CONFIG_FILE = 'login.json'
STATIONS_CSV_FILE = 'data.csv'
UPDATE_INTERVAL = 300
LOOKBACK_UPDATES = 2

# vlinder database uses UTC, and we want to respond with UTC,
# so setting our timezone to UTC makes our life easier
ENV['TZ'] = 'UTC'

configure do
  set :allow_origin, "*"
  set :allow_headers, "content-type,if-modified-since"
end

configure :development do
  $url = 'http://localhost:9292/'

  # Automatically reload when files change
  register Sinatra::Reloader
end

configure :production do
  $url = 'https://mooncake.ugent.be/api/'
end

before do
  cache_control :public, :must_revalidate
end

#
# Helpers
#

def connect_db
  config = JSON.parse(File.read(DB_CONFIG_FILE)).transform_keys(&:to_sym)
  config[:connect_timeout] = 2 # crash if we can't connect within 2 seconds
  Mysql2::Client.new(config)
end

def read_stations
  stations_file = File.new(STATIONS_CSV_FILE)
  stations = {}
  CSV.foreach(stations_file, headers: true) do |row|
    stations[row['ID']] = {
      id: row['ID'],
      name: row['VLINDER'],
      coords: { lat: row['lat'].to_f, lon: row['lon'].to_f },
      city: row['stad'],
      given_name: row['benaming'],
      measurements: $url + 'measurements/' + row['ID'],
      landUse: [20, 50, 100, 250, 500].map { |distance|
        {
          distance: distance,
          usage: ['water', 'verhard', 'groen'].map { |type|
            { type: type, value: row["#{type}#{distance}"].to_f }
          }
        }
      }
    }
  end
  [stations, stations_file.mtime]
end

ATTRIBUTES = %w(temp humidity pressure WindSpeed WindDirection WindGust RainIntensity RainVolume).freeze
def status_for(old, new)
  changed = ATTRIBUTES.any? do |attribute|
    old[attribute] != new[attribute]
  end
  if changed then 'Ok' else 'Offline' end
end

def rain_delta(old, new)
  diff = new['RainVolume'].to_f - old['RainVolume'].to_f
  if diff.negative? # midnight passed
    new['RainVolume'].to_f
  else
    diff
  end
end

def process_measurements(measurements)
  data = measurements.reverse_each
  previous = data.first
  data.drop(1).map do |current|
    status = status_for(previous, current)
    rainVolume = rain_delta(previous, current)
    previous = current
    {
      id: current['StationID'],
      station: $url + 'stations/' + current['StationID'],
      measurements: $url + 'measurements/' + current['StationID'],
      status: status,
      rainVolume: rainVolume,
      time: current['datetime'],
      temp: current['temperature'].to_f,
      humidity: current['humidity'].to_f,
      pressure: current['pressure'].to_f / 100,
      windSpeed: current['WindSpeed'].to_f,
      rainIntensity: current['RainIntensity'].to_f,
      windGust: current['WindGust'].to_f,
    }
  end
end

def query_all_stations!
  $all_query ||= $db.prepare(
    %q(
    SELECT *
    FROM Vlinder
    WHERE datetime > ?
    ORDER BY datetime DESC
    )
  )
  lookback = Time.now - UPDATE_INTERVAL * LOOKBACK_UPDATES
  $all_query.execute(lookback)
            .group_by{ |row| row['StationID'] }
            .values
            .map{ |datapoints| process_measurements(datapoints) }
end

def query_station!(id, start = nil, stop = nil)
  $station_query ||= $db.prepare(
    %q(
    SELECT *
    FROM Vlinder
    WHERE StationID = ?
      AND datetime > ?
      AND ? > datetime
    ORDER BY datetime DESC
    )
  )
  start ||= Time.now - 24 * 60 * 60
  stop ||= Time.now

  result = $station_query.execute(id, start, stop)
  process_measurements(result)
end

#
# Setup
#

$station_info, $station_info_last_modified = read_stations
$db = connect_db

#
# Routes
#

not_found do
  json error: 'not found'
end

error do
  json error: 'the server is on fire'
end

get '/' do
  json stations: $url + 'stations',
       measurements: $url + 'measurements'
end

get '/stations' do
  last_modified $station_info_last_modified
  json $station_info
end

get '/stations/:id' do
  pass if not $station_info.has_key? params['id']
  last_modified $station_info_last_modified
  json $station_info[params['id']]
end

get '/measurements' do
  $latest_update ||= (Time.now - UPDATE_INTERVAL - 1)

  if (Time.now - UPDATE_INTERVAL) > $latest_update
    $measurements_result = query_all_stations!
    $latest_update = Time.now
  end

  last_modified $latest_update
  json $measurements_result
end

get '/measurements/:id' do
  pass if not $station_info.has_key? params['id']
  json query_station!(params['id'], params['start'], params['end'])
end
