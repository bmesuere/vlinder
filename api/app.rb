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
DATETIME_FMT = "%a, %d %b %Y %H:%M:%S %Z"

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
  after_reload do
    $cache.clear
    puts '== Reloaded code & cleared caches =='
  end
end

configure :production do
  $url = 'https://mooncake.ugent.be/api/'
end

before do
  cache_control :public, :must_revalidate
end

#
# Database Object Mapper
#

opts = JSON.parse(File.read(DB_CONFIG_FILE)).transform_keys(&:to_sym)
opts[:connect_timeout] = 10
opts[:adapter] = :mysql2
opts[:max_connections] = 2

$db = ROM.container(:sql, opts) do |conf|
  class Vlinder < ROM::Relation[:sql]
    schema :Vlinder, infer: true, as: :vlinder do
      attribute :StationID, Types::String
    end

    def all_stations
      lookback = Time.now - UPDATE_INTERVAL * LOOKBACK_UPDATES
      tries = 0
      begin
        results = where { datetime > lookback }
                  .order { datetime.asc }
                  .to_a
      rescue
        raise unless ++tries < 5

        warn 'retrying query: ' + tries.to_s
        retry
      end
      {
        last_modified: results.last[:datetime],
        data: results.group_by { |data| data[:StationID] }
                     .map { |_id, data| process(data).last }
      }
    end

    def station(id, start=nil, stop=nil)
      start ||= Time.now - 24 * 60 * 60
      stop ||= Time.now

      tries = 0
      begin
        results = where(StationID: id)
                  .where { (datetime > start) & (datetime < stop) }
                  .order { datetime.asc }
                  .to_a
      rescue
        raise unless ++tries < 5

        warn 'retrying query: ' + tries.to_s
        retry
      end

      {
        last_modified: results.last[:datetime],
        data: process(results)
      }
    end

    private

    ATTRIBUTES = %i(temp humidity pressure WindSpeed WindDirection WindGust).freeze
    def status_for(old, new)
      changed = ATTRIBUTES.any? do |attribute|
        old[attribute] != new[attribute]
      end
      if changed then 'Ok' else 'Offline' end
    end

    def rain_delta(old, new)
      diff = new[:RainVolume].to_f - old[:RainVolume].to_f
      if diff.negative? # midnight passed
        new[:RainVolume].to_f
      else
        diff
      end
    end

    def process(measurements)
      previous = measurements.first
      rainVolume = 0
      measurements.drop(1).map do |current|
        status = status_for(previous, current)
        rainVolume += rain_delta(previous, current)
        previous = current
        {
          humidity: current[:humidity].to_f.round(2),
          id: current[:StationID],
          measurements: $url + 'measurements/' + current[:StationID],
          pressure: (current[:pressure].to_f / 100).round(2),
          rainIntensity: current[:RainIntensity].to_f.round(2),
          rainVolume: rainVolume.round(2),
          station: $url + 'stations/' + current[:StationID],
          status: status,
          temp: current[:temperature].to_f.round(2),
          time: current[:datetime].strftime(DATETIME_FMT),
          windDirection: current[:WindDirection].to_f.round(2),
          windGust: current[:WindGust].to_f.round(2),
          windSpeed: current[:WindSpeed].to_f.round(2)
        }
      end
    end
  end

  conf.register_relation(Vlinder)
end

#
# Helpers
#

LAND_USAGE_TYPES = {
  'water' => 'water',
  'verhard' => 'paved',
  'groen' => 'green'
}.freeze

def read_stations
  stations_file = File.new(STATIONS_CSV_FILE)
  stations = {}
  CSV.foreach(stations_file, encoding:'utf-8', headers: true) do |row|
    given_name, sponsor = row['benaming'].match(/(.*) \((.*)\)/).captures
    stations[row['ID']] = {
      id: row['ID'],
      name: row['VLINDER'],
      coordinates: { latitude: row['lat'].to_f, longitude: row['lon'].to_f },
      city: row['stad'],
      sponsor: sponsor,
      given_name: given_name,
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
  [stations, stations_file.mtime.round]
end

def updated_since?(last_modified)
  return true
  return true if last_modified.nil?
  Time.now - UPDATE_INTERVAL > last_modified
end

def httpdate_or_nil(input)
  Time.parse(input || '')
rescue ArgumentError
  nil
end

#
# Setup globals
#

$station_info, $station_info_last_modified = read_stations
$vlinder = $db.relations[:vlinder]
$cache = Hash.new { |hash, key| hash[key] = {} }

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

  if updated_since? $cache[:measurements][:last_modified]
    $cache[:measurements] = $vlinder.all_stations
  end

  last_modified $cache[:measurements][:last_modified]
  json $cache[:measurements][:data]
end

get '/measurements/:id' do
  id = params['id']
  pass if not $station_info.has_key? id
  start = httpdate_or_nil params['start']
  stop = httpdate_or_nil params['end']

  if start.nil? && stop.nil?
    # This will be called most of the time: fetch the last 24h of a station.

    result = $cache[:stations][id]
    if result.nil? || updated_since?(result[:last_modified])
      result = $vlinder.station(id)
      $cache[:stations][id] = result
    end
    last_modified result[:last_modified]
    json result[:data]

  else

    last_modified stop if stop
    json $vlinder.station(id, start, stop)[:data]
  end
end
