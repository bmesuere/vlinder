require 'spec_helper'

RSpec.describe 'Vlinder API' do
  let(:mock_vlinder) { double('Vlinder Relation') }

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

      # We need to ensure updated_since? returns true.
      # In app.rb: updated_since?(last_modified) checks if Time.now - UPDATE_INTERVAL > last_modified
      # UPDATE_INTERVAL is 300.
      # So if last_modified is old enough.

      get '/measurements'
      expect(last_response).to be_ok
      json_response = JSON.parse(last_response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.first['id']).to eq('station1')
      expect(json_response.first['temp']).to eq(20)
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
  end
end
