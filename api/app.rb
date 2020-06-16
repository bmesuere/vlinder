
configure do
end

configure :development do
  register Sinatra::Reloader
  after_reload do
    puts '=== Sinatra reloaded ==='
  end
end

get '/' do
  json hello: 'world'
end
