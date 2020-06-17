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

require 'byebug'

#
# Configuration
#

DB_CONFIG_FILE = 'login.json'
STATIONS_CSV_FILE = 'data.csv'
UPDATE_INTERVAL = 300
LOOKBACK_UPDATES = 2
DATETIME_FMT = "%a, %d %b %Y %I:%M:%S %Z"

# vlinder database uses UTC, and we want to respond with UTC,
# so setting our timezone to UTC makes our life easier
ENV['TZ'] = 'UTC'

configure do
  register Sinatra::Cors
  set :allow_origin, '*'
  set :allow_headers, 'content-type,if-modified-since'
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
  config[:reconnect] = true
  Mysql2::Client.new(config)
end

LAND_USAGE_TYPES = {
  'water' => 'water',
  'verhard' => 'paved',
  'groen' => 'green'
}.freeze

def read_stations
  stations_file = File.new(STATIONS_CSV_FILE)
  stations = {}
  CSV.foreach(stations_file, headers: true) do |row|
    stations[row['ID']] = {
      id: row['ID'],
      name: row['VLINDER'],
      coords: { latitude: row['lat'].to_f, longitude: row['lon'].to_f },
      city: row['stad'],
      given_name: row['benaming'],
      measurements: $url + 'measurements/' + row['ID'],
      landUse: [20, 50, 100, 250, 500].map { |distance|
        {
          distance: distance,
          usage:
            LAND_USAGE_TYPES.map { |type_nl, type_en|
            { type: type_en, value: row["#{type_nl}#{distance}"].to_f }
          }
        }
      }
    }
  end
  [stations, stations_file.mtime]
end

def updated_since?(last_modified)
  Time.now - UPDATE_INTERVAL > last_modified
end

def httpdate_or_nil(input)
  Time.parse(input || '')
rescue ArgumentError
  nil
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
  {
    data: data.drop(1).map do |current|
      status = status_for(previous, current)
      rainVolume = rain_delta(previous, current)
      previous = current
      {
        humidity: current['humidity'].to_f,
        id: current['StationID'],
        measurements: $url + 'measurements/' + current['StationID'],
        pressure: current['pressure'].to_f / 100,
        rainIntensity: current['RainIntensity'].to_f,
        rainVolume: rainVolume,
        station: $url + 'stations/' + current['StationID'],
        status: status,
        temp: current['temperature'].to_f,
        time: current['datetime'].strftime(DATETIME_FMT),
        windDirection: current['WindDirection'].to_f,
        windGust: current['WindGust'].to_f,
        windSpeed: current['WindSpeed'].to_f,
      }
    end,
    last_modified: previous['datetime']
  }
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
  result = $all_query.execute(lookback)
                     .group_by{ |row| row['StationID'] }
                     .values
                     .map{ |datapoints| process_measurements(datapoints) }
  {
    data: result.map{ |station| station[:data].first },
    last_modified: result.map{ |station| station[:last_modified] }.max,
  }
end

def query_station!(id, start = nil, stop = nil)
  $station_query ||= $db.prepare(
    %q(
    SELECT *
    FROM Vlinder
    WHERE StationID = ?
      AND datetime > ?
      AND datetime < ?
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

get '/stations/?' do
  last_modified $station_info_last_modified
  json $station_info.values
end

get '/stations/:id' do
  id = params['id']
  pass if not $station_info.has_key? id
  last_modified $station_info_last_modified
  json $station_info[id]
end

get '/measurements/?' do
  $latest_update ||= (Time.now - UPDATE_INTERVAL - 1)

  if updated_since? $latest_update
    $measurements_result, $latest_update = query_all_stations!
  end

  last_modified $latest_update
  json $measurements_result
end

get '/measurements/:id' do
  $station_24h ||= {}
  id = params['id']
  pass if not $station_info.has_key? id
  start = httpdate_or_nil params['start']
  stop = httpdate_or_nil params['end']

  if start.nil? && stop.nil?
    # This will be called most of the time: fetch the last 24h of a station.

    result = $station_24h[id]
    if result.nil? || updated_since?(result[:last_modified])
      result = query_station!(id)
      $station_24h[id] = result
    end
    last_modified result[:last_modified]
    json result[:data]

  else

    last_modified stop if stop
    json query_station!(id, start, stop)
  end
end
