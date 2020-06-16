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

$db_config_file = 'login.json'
$stations_csv_file = 'data.csv'

configure do
  set :allow_origin, "*"
  set :allow_headers, "content-type,if-modified-since"
end

configure :development do
  # Automatically reload when files change
  register Sinatra::Reloader
  after_reload do
    puts '=== Sinatra reloaded ==='
  end
end

#
# Helpers
#

def connect_db
  config = JSON.parse(File.read($db_config_file)).transform_keys(&:to_sym)
  config[:connect_timeout] = 2 # crash if we can't connect within 2 seconds
  Mysql2::Client.new(config)
end

def read_stations
  stations = {}
  CSV.foreach($stations_csv_file, headers: true) do |row|
    stations[row['ID']] = {
      id: row['ID'],
      name: row['VLINDER'],
      coords: { lat: row['lat'].to_f, lon: row['lon'].to_f },
      city: row['stad'],
      given_name: row['benaming'],
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
  stations
end

#
# Setup
#

$stations = read_stations
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
  json stations: request.url + 'stations',
       measurements: request.url + 'measurements'
end

get '/stations' do
  json $stations
end

get '/stations/:id' do
  pass if $stations[params['id']].nil?
  json $stations[params['id']]
end

get '/measurements' do
end

get '/measurements/:id' do
end
