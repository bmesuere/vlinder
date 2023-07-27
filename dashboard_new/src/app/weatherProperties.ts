const weatherProperties = {
  temp: {
    property: 'temp',
    name: 'Temperatuur',
    legend: 'Temperatuur (°C)',
    icon: 'mdi-thermometer',
    title: 'Temperatuur op dit moment',
    unit: '°C'
  },
  rainVolume: {
    property: 'rainVolume',
    name: 'Neerslag',
    legend: 'Neerslag vandaag (l/m²)',
    icon: 'mdi-weather-rainy',
    title: 'Neerslag sinds middernacht',
    unit: 'l/m²'
  },
  pressure: {
    property: 'pressure',
    name: 'Luchtdruk',
    legend: 'Luchtdruk (hPa)',
    icon: 'mdi-gauge',
    title: 'Luchtdruk op dit moment',
    unit: 'hPa'
  },
  windSpeed: {
    property: 'windSpeed',
    name: 'Windsnelheid',
    legend: 'Windsnelheid (km/u)',
    icon: 'mdi-weather-windy',
    title: 'Windsnelheid op dit moment',
    unit: 'km/u'
  },
  humidity: {
    property: 'humidity',
    name: 'Luchtvochtigheid',
    legend: 'Luchtvochtigheid (%)',
    icon: 'mdi-water-percent',
    title: 'Luchtvochtigheid op dit moment',
    unit: '%'
  },
  wbgt: {
    property: 'wbgt',
    name: 'Gevoelstemperatuur (WBGT)',
    legend: 'Gevoelstemperatuur (°C)',
    icon: 'mdi-thermometer-lines',
    title: 'Gevoelstemperatuur (WBGT) op dit moment',
    unit: '°C'
  }
};

export { weatherProperties };
