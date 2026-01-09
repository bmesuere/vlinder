ENV['RACK_ENV'] = 'test'

require 'rspec'
require 'rack/test'
require 'json'
require 'rom'
require 'rom-sql'
require 'sinatra'
require 'sinatra/json'
require 'csv'

# I will assume `app.rb` is in the parent directory.
$LOAD_PATH.unshift File.expand_path('..', __dir__)

RSpec.configure do |config|
  config.include Rack::Test::Methods

  # Suppress warnings
  config.before(:suite) do
    $VERBOSE = nil
  end
end

require 'app'

def app
  Sinatra::Application
end
