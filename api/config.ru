require 'rubygems'
require 'bundler'

# Only load the gems needed for the running environment: production (the
# default when RACK_ENV is unset) must not load :development/:test-only gems
# like byebug, puma or rspec/rack-test.
Bundler.require(:default, ENV.fetch('RACK_ENV', 'development').to_sym)

require "./app"
run Sinatra::Application
