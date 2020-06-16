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

require 'byebug'

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
def status_for(measurements)
  changed = ATTRIBUTES.any? do |attribute|
    measurements[0][attribute] != measurements[1][attribute]
  end
  if changed then 'Ok' else 'Offline' end
end

def rain_deltas(measurements)
  data = measurements.reverse_each
  previous = data.next
  data.map do |current|
    diff = current['RainVolume'].to_f - previous['RainVolume'].to_f
    if diff.negative? # midnight passed
      delta = current['RainVolume'].to_f
    else
      delta = diff
    end
    previous = current
    delta
  end
end

def process_measurements(measurements)
  latest = measurements.first
  {
    id: latest['StationID'],
    status: status_for(measurements),
    rainVolume: rain_deltas(measurements).first,
    time: latest['datetime'],
    temp: latest['temperature'].to_f,
    humidity: latest['humidity'].to_f,
    pressure: latest['pressure'].to_f / 100,
    windSpeed: latest['WindSpeed'].to_f,
    rainIntensity: latest['RainIntensity'].to_f,
    windGust: latest['WindGust'].to_f,
  }
end

def query_all_stations
  $all_query ||= $db.prepare('SELECT * FROM Vlinder WHERE datetime > ? ORDER BY datetime DESC')
  lookback = Time.now - UPDATE_INTERVAL * LOOKBACK_UPDATES
  $all_query.execute(lookback)
            .group_by{ |row| row['StationID'] }
            .map{ |_id, datapoints| process_measurements(datapoints) }
end

def current_measurements
  $latest_update_all ||= (Time.now - $update_interval - 1)
  if (Time.now - $update_interval) > $latest_update_all
    $all_data = query_all_stations
    $latest_update_all = Time.now
  end
  $all_data
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
  json $station_info
end

get '/stations/:id' do
  pass if not $station_info.has_key? params['id']
  json $station_info[params['id']]
end

get '/measurements' do
  json current_measurements
end

get '/measurements/:id' do
  pass if not $station_info.has_key? params['id']
  json measurements_for(params['id'])
end
