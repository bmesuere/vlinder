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
