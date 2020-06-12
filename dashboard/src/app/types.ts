export interface Station {
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  given_name: string;
  id: string;
  measurements: string;
  name: string;
}

export interface Measurement {
  humidity: number;
  id: string;
  measurements: string;
  pressure: number;
  rainIntensity: number;
  rainVolume: number;
  station: string;
  status: string;
  temp: number;
  time: string;
  windDirection: number;
  windGust: number;
  windSpeed: number;
}

export interface MeasurementSeries {
  property: string;
  series: {stationId: string; values: number[]}[];
  timestamps: string[];
}
