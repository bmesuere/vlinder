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
# Routes
#

get '/' do
  json stations: request.url + 'stations',
       measurements: request.url + 'measurements'
end

get '/stations' do
end

get '/stations/:id' do
end

get '/measurements' do
end

get '/measurements/:id' do
end

