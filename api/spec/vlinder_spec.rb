require 'spec_helper'

# These specs exercise the real business logic in Vlinder (changed?, rain_delta,
# process) directly, instead of going through the mocked $vlinder double used
# by spec/app_spec.rb. Vlinder < ROM::Relation[:sql] normally needs a live DB
# connection to build its dataset/schema (see reconnect_database in app.rb),
# but none of the methods under test touch the dataset or schema at all - they
# are pure transformations over plain row hashes. So we use Vlinder.allocate
# to get an instance without running ROM's initializer, and call the private
# methods via #send. No changes to app.rb were needed for this.
RSpec.describe Vlinder do
  subject(:vlinder) { described_class.allocate }

  # Builds a fake DB row hash shaped like what the mysql2/rom-sql adapter
  # would hand to Vlinder#process (see the `data:` hash built in #process).
  def row(overrides = {})
    {
      StationID: 'station1',
      datetime: Time.utc(2024, 1, 1, 12, 0, 0),
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

  describe '#changed?' do
    it 'is false when all tracked attributes are identical' do
      expect(vlinder.send(:changed?, row, row)).to be false
    end

    it 'is true when temperature differs' do
      expect(vlinder.send(:changed?, row, row(temperature: 21.0))).to be true
    end

    it 'is true when humidity differs' do
      expect(vlinder.send(:changed?, row, row(humidity: 60.0))).to be true
    end

    it 'is true when pressure differs' do
      expect(vlinder.send(:changed?, row, row(pressure_0: 100_000.0))).to be true
    end

    it 'is true when wind speed differs' do
      expect(vlinder.send(:changed?, row, row(WindSpeed: 10.0))).to be true
    end

    it 'is true when wind direction differs' do
      expect(vlinder.send(:changed?, row, row(WindDirection: 90.0))).to be true
    end

    it 'is true when wind gust differs' do
      expect(vlinder.send(:changed?, row, row(WindGust: 12.0))).to be true
    end

    it 'ignores rain volume/intensity changes (they are not tracked attributes)' do
      old = row(RainVolume: 1.0, RainIntensity: 2.0)
      new = row(RainVolume: 5.0, RainIntensity: 9.0)
      expect(vlinder.send(:changed?, old, new)).to be false
    end
  end

  describe '#rain_delta' do
    it 'returns the plain difference when the rain counter increases' do
      old = row(RainVolume: 2.0)
      new = row(RainVolume: 2.5)
      expect(vlinder.send(:rain_delta, old, new)).to eq(0.5)
    end

    it 'returns zero when the rain counter is unchanged' do
      old = row(RainVolume: 3.0)
      new = row(RainVolume: 3.0)
      expect(vlinder.send(:rain_delta, old, new)).to eq(0.0)
    end

    it 'treats a decreasing counter as a midnight rollover and returns the new value as-is' do
      old = row(RainVolume: 15.2) # accumulated near the end of the day
      new = row(RainVolume: 0.4)  # counter reset to a small value after midnight
      expect(vlinder.send(:rain_delta, old, new)).to eq(0.4)
    end
  end

  describe '#process' do
    def at(minutes_from_start)
      Time.utc(2024, 1, 1, 12, 0, 0) + (minutes_from_start * 60)
    end

    it 'formats a single measurement into the expected output shape' do
      measurement = row(
        datetime: at(0),
        temperature: 21.234,
        humidity: 55.555,
        pressure_0: 101_325.0,
        WindSpeed: 3.456,
        WindDirection: 180.1,
        WindGust: 6.789,
        RainIntensity: 0.123,
        wet_bulb_globe_temp: 19.876
      )

      result = vlinder.send(:process, [measurement]).first

      expect(result).to eq(
        humidity: 55.56,
        id: 'station1',
        measurements: 'http://test.host/measurements/station1',
        pressure: 1013.25,
        rainIntensity: 0.12,
        rainVolume: 0.0,
        station: 'http://test.host/stations/station1',
        status: 'Ok',
        temp: 21.23,
        time: 'Mon, 01 Jan 2024 12:00:00 UTC',
        windDirection: 180.1,
        windGust: 6.79,
        windSpeed: 3.46,
        wbgt: 19.88
      )
    end

    it 'reports nil pressure and wbgt when the underlying values are nil' do
      measurement = row(pressure_0: nil, wet_bulb_globe_temp: nil)

      result = vlinder.send(:process, [measurement]).first

      expect(result[:pressure]).to be_nil
      expect(result[:wbgt]).to be_nil
    end

    it 'marks a station Offline only after LOOKBACK_UPDATES consecutive unchanged readings' do
      # Same tracked attributes on every reading: the station looks stuck.
      measurements = (0..4).map { |i| row(datetime: at(i * 5)) }

      statuses = vlinder.send(:process, measurements).map { |m| m[:status] }

      # index 0: baseline (compared against itself) -> Ok
      # index 1,2: still unchanged, no_changes climbs to 1, 2 -> Ok
      # index 3: no_changes reaches LOOKBACK_UPDATES (3) -> Offline
      # index 4: still unchanged -> stays Offline
      expect(statuses).to eq(%w[Ok Ok Ok Offline Offline])
    end

    it 'recovers to Ok as soon as a tracked attribute changes again' do
      measurements = [
        row(datetime: at(0)),
        row(datetime: at(5)),
        row(datetime: at(10)),
        row(datetime: at(15)), # 4th identical reading -> Offline
        row(datetime: at(20), temperature: 25.0) # attribute changes -> back Ok
      ]

      statuses = vlinder.send(:process, measurements).map { |m| m[:status] }

      expect(statuses).to eq(%w[Ok Ok Ok Offline Ok])
    end

    it 'stays Ok when attributes keep changing between readings' do
      measurements = (0..4).map { |i| row(datetime: at(i * 5), temperature: 20.0 + i) }

      statuses = vlinder.send(:process, measurements).map { |m| m[:status] }

      expect(statuses).to eq(%w[Ok Ok Ok Ok Ok])
    end

    it 'accumulates rain volume across readings, including a midnight rollover' do
      measurements = [
        row(datetime: at(0), RainVolume: 5.0),  # baseline: first entry always reports 0
        row(datetime: at(5), RainVolume: 5.6),  # +0.6
        row(datetime: at(10), RainVolume: 5.6), # +0.0 (no rain)
        row(datetime: at(15), RainVolume: 0.3), # counter reset after midnight -> +0.3
        row(datetime: at(20), RainVolume: 0.9)  # +0.6
      ]

      rain_volumes = vlinder.send(:process, measurements).map { |m| m[:rainVolume] }

      expect(rain_volumes).to eq([0.0, 0.6, 0.6, 0.9, 1.5])
    end

    it 'reports the raw RainVolume instead of accumulating when normalize_rain is false' do
      measurements = [
        row(datetime: at(0), RainVolume: 5.0),
        row(datetime: at(5), RainVolume: 5.6),
        row(datetime: at(10), RainVolume: 0.3) # would be a rollover if normalized
      ]

      rain_volumes = vlinder.send(:process, measurements, normalize_rain: false).map { |m| m[:rainVolume] }

      expect(rain_volumes).to eq([5.0, 5.6, 0.3])
    end
  end

  # #all_stations and #station are public and call #retry_until_succeeded
  # (which normally runs a real where/order/to_a query chain). Stubbing that
  # one method lets these run for real against a canned result set, without
  # needing a live DB connection - same technique as spec/app_spec.rb.
  describe '#all_stations' do
    it 'returns an empty, non-crashing result when the lookback window has no rows yet' do
      allow(vlinder).to receive(:retry_until_succeeded).and_return([])

      result = vlinder.all_stations

      expect(result).to eq(last_modified: nil, data: [])
    end

    it 'groups rows by station and reports the last_modified of the latest row' do
      rows = [row(StationID: 'station1', datetime: Time.utc(2024, 1, 1, 12, 0, 0)),
              row(StationID: 'station2', datetime: Time.utc(2024, 1, 1, 12, 5, 0))]
      allow(vlinder).to receive(:retry_until_succeeded).and_return(rows)

      result = vlinder.all_stations

      expect(result[:last_modified]).to eq(Time.utc(2024, 1, 1, 12, 5, 0))
      expect(result[:data].map { |m| m[:id] }).to contain_exactly('station1', 'station2')
    end
  end

  describe '#station' do
    it 'returns an empty, non-crashing result when the station has no rows in range' do
      allow(vlinder).to receive(:retry_until_succeeded).and_return([])

      result = vlinder.station('station1')

      expect(result).to eq(last_modified: nil, data: [])
    end

    it 'reports the data and last_modified of the latest row when rows exist' do
      rows = [row(datetime: Time.utc(2024, 1, 1, 12, 0, 0)),
              row(datetime: Time.utc(2024, 1, 1, 12, 5, 0))]
      allow(vlinder).to receive(:retry_until_succeeded).and_return(rows)

      result = vlinder.station('station1')

      expect(result[:last_modified]).to eq(Time.utc(2024, 1, 1, 12, 5, 0))
      expect(result[:data].size).to eq(2)
    end
  end
end
