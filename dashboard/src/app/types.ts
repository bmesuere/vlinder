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
  school: string;
  landUse: LandUse[];
}

export interface LandUse {
  distance: number;
  usage: {
    water: number;
    paved: number;
    green: number;
  };
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

export interface WeatherProperty {
  property: string;
  name: string;
  legend: string;
  icon: string;
  title: string;
  unit: string;
}

export type WeatherPropertyName = 'temp' | 'rainVolume' | 'windSpeed';
