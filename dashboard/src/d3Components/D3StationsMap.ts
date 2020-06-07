import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { legend } from './Legend';

type weatherPropertyName = 'temp' | 'rainVolume' | 'windSpeed';

export class D3StationsMap {
  // arguments
  private readonly selector: string;
  private selectedProperty: weatherPropertyName = 'temp';

  // remote data
  // @ts-ignore
  private belgium: TopoJSON.Topology;
  // @ts-ignore
  private stations: Station[];
  // @ts-ignore
  private measurements: Measurement[];

  private measurementsMap: Map<string, Measurement> = new Map();

  public static readonly weatherProperties = {
    temp: { property: 'temp', name: 'Temperatuur', legend: 'Temperatuur (°C)', icon: 'mdi-thermometer', title: 'Temperatuur op dit moment' },
    rainVolume: { property: 'rainVolume', name: 'Neerslag', legend: 'Neerslag vandaag (l/m²)', icon: 'mdi-weather-rainy', title: 'Neerslag sinds middernacht' },
    windSpeed: { property: 'windSpeed', name: 'Windsnelheid', legend: 'Windsnelheid (km/u)', icon: 'mdi-weather-windy', title: 'Windsnelheid op dit moment' }
  };

  // settings
  private readonly margin = { top: 5, right: 5, bottom: 50, left: 5 };
  private readonly width = 900;
  private readonly height = 420;

  // D3 internals
  // @ts-ignore
  private stationDots: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, Station, SVGGElement, unknown>;
  // @ts-ignore
  private colorScale: d3.ScaleSequential<string>;
  // @ts-ignore
  private legend: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  constructor (selector: string, selectedProperty = 'temp') {
    this.selector = selector;
    this.setProperty(selectedProperty);
  }

  async fetchData () {
    // fetch data
    const belgium = fetch('https://raw.githubusercontent.com/bmesuere/belgium-topojson/master/belgium.json')
      .then(r => r.json());
    const stations = fetch('https://mooncake.ugent.be/api/stations')
      .then(r => r.json());
    const measurements = fetch('https://mooncake.ugent.be/api/measurements')
      .then(r => r.json());

    this.belgium = await belgium as TopoJSON.Topology;
    this.stations = await stations as [Station];
    this.measurements = await measurements as [Measurement];

    // prepare data
    this.measurementsMap = new Map(this.measurements.map(m => [m.id, m]));
    // @ts-ignore
    this.belgium.objects.municipalities.geometries = this.belgium.objects.municipalities.geometries.filter(d => d.properties.reg_nis !== '03000');
  }

  async init () {
    await this.fetchData();

    this.colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(this.measurements, d => d[this.selectedProperty]) as [number, number]);

    // fit the map for what we want to show

    const projection = d3.geoMercator()
      .fitExtent(
        [
          [this.margin.left, this.margin.top],
          [this.width - this.margin.right, this.height - this.margin.bottom]
        // @ts-ignore
        ], topojson.feature(this.belgium, this.belgium.objects.municipalities));

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(this.selector).append('svg')
      .attr('viewBox', `0, 0, ${this.width}, ${this.height}`);

    // draw muni's
    svg.append('g')
      .selectAll('.muni')
      // @ts-ignore
      .data(topojson.feature(this.belgium, this.belgium.objects.municipalities).features)
      .join('path')
      .attr('class', 'muni')
      .attr('fill', '#eeeeee')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      // @ts-ignore
      .attr('d', path)
      .append('title')
      // @ts-ignore
      .text(d => d?.properties?.name_nl);

    // draw stations
    this.stationDots = svg.append('g')
      .selectAll('.station')
      .data(this.stations)
      .join('circle')
      .attr('class', 'station')
      .attr('r', d => this.measurementsMap.get(d.id)?.status === 'Ok' ? 4 : 1)
      .attr('fill-opacity', d => this.measurementsMap.get(d.id)?.status === 'Ok' ? 0.7 : 1)
      .attr('fill', d => {
        const m = this.measurementsMap.get(d.id);
        return m?.status === 'Ok' ? this.colorScale(m[this.selectedProperty]) : 'black';
      })
      // @ts-ignore
      .attr('cx', d => projection([d.coordinates.longitude, d.coordinates.latitude])[0])
      // @ts-ignore
      .attr('cy', d => projection([d.coordinates.longitude, d.coordinates.latitude])[1]);
    this.stationDots.append('title')
      .text(d => `${d.given_name} - ${d.city}`);

    this.legend = svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.top - 40})`);
    // @ts-ignore
    this.legend.append(() => legend({ color: this.colorScale, title: D3StationsMap.weatherProperties[this.selectedProperty].legend, width: 200, tickSize: -10, ticks: 4 }));
  }

  setProperty (property: string) {
    this.selectedProperty = (D3StationsMap.weatherProperties.hasOwnProperty(property) ? property : 'temp') as weatherPropertyName;
  }

  updateProperty (property: string) {
    this.setProperty(property);
    this.update();
  }

  update () {
    this.legend.html('');
    this.colorScale.domain(d3.extent(this.measurements, d => d[this.selectedProperty]) as [number, number]);
    // @ts-ignore
    this.legend.append(() => legend({ color: this.colorScale, title: D3StationsMap.weatherProperties[this.selectedProperty].legend, width: 200, tickSize: -10, ticks: 4 }));
    this.stationDots.transition()
      .attr('r', (d: Station) => this.measurementsMap.get(d.id)?.status === 'Ok' ? 4 : 1)
      .attr('fill-opacity', (d: Station) => this.measurementsMap.get(d.id)?.status === 'Ok' ? 0.7 : 1)
      .attr('fill', (d: Station) => {
        const m = this.measurementsMap.get(d.id);
        return m?.status === 'Ok' ? this.colorScale(m[this.selectedProperty]) : 'black';
      });
  }
}

interface Station {
  city: string;
  coordinates: { latitude: number; longitude: number };
  given_name: string;
  id: string;
  measurements: string;
  name: string;
}
interface Measurement {
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
