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
  humidity: number | null;
  id: string;
  measurements: string;
  pressure: number | null;
  rainIntensity: number;
  rainVolume: number | null;
  station: string;
  status: string;
  temp: number | null;
  time: string;
  windDirection: number;
  windGust: number;
  windSpeed: number | null;
  wbgt: number | null;
}

export interface MeasurementSeries {
  property: string;
  series: {stationId: string; values: (number | null)[]}[];
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

export type WeatherPropertyName = 'temp' | 'rainVolume' | 'windSpeed' | 'pressure' | 'humidity' | 'wbgt';
