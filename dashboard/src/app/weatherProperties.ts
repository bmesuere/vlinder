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
  windSpeed: {
    property: 'windSpeed',
    name: 'Windsnelheid',
    legend: 'Windsnelheid (km/u)',
    icon: 'mdi-weather-windy',
    title: 'Windsnelheid op dit moment',
    unit: 'km/u'
  }
};

export { weatherProperties };
