import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export class StationsMap {
  // arguments
  private readonly selector: string;
  private readonly selectedProperty: 'temp';

  // remote data
  private belgium: TopoJSON.Topology | undefined;
  private stations: Station[] | undefined;
  private measurements: Measurement[] | undefined;

  private measurementsMap: Map<string, Measurement> = new Map();

  private readonly properties = new Map([
    ['temp', { property: 'temp', name: 'Temperatuur', title: 'Temperatuur (°C)' }],
    ['rainVolume', { property: 'rainVolume', name: 'Neerslag', title: 'Neerslag vandaag (l/m²)' }],
    ['windSpeed', { property: 'windSpeed', name: 'Windsnelheid', title: 'Windsnelheid (km/u)' }],
    ['humidity', { property: 'humidity', name: 'Luchtvochtigheid', title: 'Luchtvochtigheid (%)' }]
  ]);

  // settings
  private readonly margin = { top: 10, right: 10, bottom: 40, left: 10 };
  private readonly width = 700;
  private readonly height = 400;

  constructor (selector: string, selectedProperty: 'temp' = 'temp') {
    this.selector = selector;
    this.selectedProperty = selectedProperty;
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

    // appease the type checker
    if (!this.measurements) return;
    if (!this.belgium) return;
    if (!this.stations) return;

    const color = d3.scaleSequential(d3.interpolateViridis)
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
      .attr('viewBox', `0, 0, ${this.width}, ${this.height}`)
      .style('width', this.width);

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
    svg.append('g')
      .selectAll('.station')
      .data(this.stations)
      .join('circle')
      .attr('class', 'station')
      .attr('r', d => this.measurementsMap.get(d.id)?.status === 'Ok' ? 4 : 1)
      .attr('fill-opacity', d => this.measurementsMap.get(d.id)?.status === 'Ok' ? 0.7 : 1)
      .attr('fill', d => {
        const m = this.measurementsMap.get(d.id);
        return m?.status === 'Ok' ? color(m[this.selectedProperty]) : 'black';
      })
      // @ts-ignore
      .attr('cx', d => projection([d.coordinates.longitude, d.coordinates.latitude])[0])
      // @ts-ignore
      .attr('cy', d => projection([d.coordinates.longitude, d.coordinates.latitude])[1])
      .append('title')
      .text(d => `${d.given_name} - ${d.city}`);

    /* svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.top - 40})`)
      .append(() => legend({ color, title: properties.get(selectedProperty).title, width: 200, tickSize: -10, ticks: 4 })); */
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
