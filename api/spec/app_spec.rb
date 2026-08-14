require 'spec_helper'

RSpec.describe 'Vlinder API' do
  let(:mock_vlinder) { double('Vlinder Relation') }

  # a row hash shaped like what the rom-sql adapter hands to #process
  def row(overrides = {})
    {
      StationID: 'station1',
      datetime: Time.now,
      temperature: 20.0,
      humidity: 50.0,
      pressure_0: 101_300.0,
      WindSpeed: 3.0,
      WindDirection: 180.0,
      WindGust: 5.0,
      RainVolume: 0.0,
      RainIntensity: 0.0,
      wet_bulb_globe_temp: 18.0
    }.merge(overrides)
  end

  before do
    # Inject our mock into the global variable used by the app
    $vlinder = mock_vlinder

    # Mock cache to avoid nil errors if logic depends on it
    $cache ||= {}
    $cache[:measurements] ||= {}
    $cache[:stations] ||= {}

    # Mock station info to ensure stations exist
    # $station_info is populated by read_stations in app.rb
    # We can override it here
    $station_info = {
      'station1' => {
        id: 'station1',
        name: 'Test Station',
        coordinates: { latitude: 50.0, longitude: 3.0 },
        city: 'Ghent',
        measurements: 'http://localhost/measurements/station1'
      }
    }
    $station_info_last_modified = Time.now
  end

  describe 'GET /' do
    it 'returns the API root' do
      get '/'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to have_key('stations')
      expect(json_response).to have_key('measurements')
    end
  end

  describe 'GET /stations' do
    it 'returns list of stations' do
      get '/stations'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['id']).to eq('station1')
    end
  end

  describe 'GET /stations/:id' do
    it 'returns a specific station' do
      get '/stations/station1'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response['id']).to eq('station1')
    end

    it 'returns 404 for unknown station' do
      get '/stations/unknown'
      expect(last_response.status).to eq(404)
    end
  end

  describe 'GET /measurements' do
    it 'returns measurements for all stations' do
      # Mock the database call
      allow(mock_vlinder).to receive(:all_stations).and_return({
        last_modified: Time.now,
        data: [{ id: 'station1', temp: 20 }]
      })

      # Mock updated_since? to true so it fetches new data
      # Or just clear cache
      $cache[:measurements] = { last_modified: Time.now - 1000, data: [] }

      get '/measurements'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['id']).to eq('station1')
      expect(json_response.first['temp']).to eq(20)
    end

    it 'does not stick an empty first fetch to the cache for the whole update window' do
      # a slow feed can return an empty first fetch; it must not get cached
      $cache[:measurements] = {}

      real_vlinder = Vlinder.allocate
      allow(real_vlinder).to receive(:retry_until_succeeded).and_return(
        [],
        [row(StationID: 'station1')]
      )
      $vlinder = real_vlinder

      get '/measurements'
      expect(last_response.status).to eq(200) # not a 500 from results.last on an empty array
      expect(JSON.parse(last_response.body)).to eq([])
      expect(last_response.headers['Cache-Control']).to eq('no-store')
      expect(last_response.headers['Last-Modified']).to be_nil

      # The cache must still be considered stale, so this second request
      # retries instead of serving the cached-empty result, and gets normal
      # cache headers back now that there is real data.
      get '/measurements'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['id']).to eq('station1')
      expect(last_response.headers['Cache-Control']).to include('max-age')
      expect(last_response.headers['Last-Modified']).not_to be_nil

      expect(real_vlinder).to have_received(:retry_until_succeeded).twice
    end
  end

  describe 'GET /measurements/:id' do
    it 'returns measurements for a specific station (recent)' do
      # Mock the database call for recent data
      allow(mock_vlinder).to receive(:station).with('station1').and_return({
        last_modified: Time.now,
        data: [{ id: 'station1', temp: 22, time: Time.now.to_s }]
      })

      get '/measurements/station1'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['temp']).to eq(22)
    end

    it 'returns measurements for a specific station (range)' do
      start_time = '2023-01-01T00:00:00Z'
      end_time = '2023-01-02T00:00:00Z'

      # Mock the database call for range
      # Note: The app parses parameters using Time.parse via httpdate_or_nil helper
      # We need to match the arguments passed to station method

      allow(mock_vlinder).to receive(:station) do |id, start, stop|
        expect(id).to eq('station1')
        expect(start).to be_a(Time)
        expect(stop).to be_a(Time)
        {
            last_modified: Time.now,
            data: [{ id: 'station1', temp: 25, time: start.to_s }]
        }
      end

      get "/measurements/station1?start=#{start_time}&end=#{end_time}"
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['temp']).to eq(25)
    end

    it 'returns 404 for unknown station' do
      get '/measurements/unknown'
      expect(last_response.status).to eq(404)
    end

    it 'does not stick an empty first fetch for a station to the cache' do
      # Same regression as GET /measurements, for the per-station cache path.
      $cache[:stations] = {} # start from a completely empty/stale cache

      real_vlinder = Vlinder.allocate
      allow(real_vlinder).to receive(:retry_until_succeeded).and_return(
        [],
        [row(StationID: 'station1')]
      )
      $vlinder = real_vlinder

      get '/measurements/station1'
      expect(last_response.status).to eq(200)
      expect(JSON.parse(last_response.body)).to eq([])
      expect(last_response.headers['Cache-Control']).to eq('no-store')
      expect(last_response.headers['Last-Modified']).to be_nil

      get '/measurements/station1'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['id']).to eq('station1')
      expect(last_response.headers['Cache-Control']).to include('max-age')
      expect(last_response.headers['Last-Modified']).not_to be_nil

      expect(real_vlinder).to have_received(:retry_until_succeeded).twice
    end
  end
end
