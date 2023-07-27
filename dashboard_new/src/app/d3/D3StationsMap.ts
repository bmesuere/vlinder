/* eslint-disable */
// @ts-nocheck
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

import { Station, Measurement, WeatherPropertyName } from '../types';
import { weatherProperties } from '../weatherProperties';
import { legend } from './Legend';

export class D3StationsMap {
  // arguments
  private readonly selector: string;
  private selectedProperty: WeatherPropertyName = 'temp';
  private readonly selectedStations: Station[];
  private readonly tooltipInfo: { station: Station, shown: boolean, x: number, y: number };
  private readonly toggleCallback: Function;

  private loading = true;

  // remote data
  private belgium!: TopoJSON.Topology;
  private stations!: Station[];
  private measurements!: Measurement[];

  private measurementsMap: Map<string, Measurement> = new Map();

  // settings
  private readonly margin = { top: 5, right: 10, bottom: 50, left: 10 };
  private readonly width = 900;
  private readonly height = 300;

  // D3 internals
  private stationDots!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, Station, SVGGElement, unknown>;
  private colorScale!: d3.ScaleSequential<string>;
  private legend!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  constructor (selector: string, selectedProperty = 'temp', selectedStations: Station[], tooltipInfo, toggleStationCallback: Function) {
    this.selector = selector;
    this.setProperty(selectedProperty);
    this.selectedStations = selectedStations;
    this.tooltipInfo = tooltipInfo;
    this.toggleCallback = toggleStationCallback;
  }

  async prepareData (stations: Station[], measurements: Measurement[]) {
    // fetch data
    const belgium = fetch('./belgium.topo.json')
      .then(r => r.json());

    this.belgium = await belgium as TopoJSON.Topology;
    // only draw the vlinder stations on the map
    this.stations = stations.filter(s => s.name.startsWith('vlinder'));
    this.measurements = measurements;

    // prepare data
    this.measurementsMap = new Map(this.measurements.map(m => [m.id, m]));
  }

  async init (stations: Station[], measurements: Measurement[]) {
    await this.prepareData(stations, measurements);

    this.colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(this.measurements.filter(d => d.status === "Ok"), d => d[this.selectedProperty]) as [number, number]);

    // fit the map for what we want to show
    const projection = d3.geoMercator()
      .fitExtent(
        [
          [this.margin.left, this.margin.top],
          [this.width - this.margin.right, this.height - this.margin.bottom]
        ], topojson.feature(this.belgium, this.belgium.objects.municipalities));

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(this.selector)
      .html("")
      .append('svg')
      .attr('viewBox', `0, 0, ${this.width}, ${this.height}`);

    // draw muni's
    svg.append('g')
      .selectAll('.muni')
      .data(topojson.feature(this.belgium, this.belgium.objects.municipalities).features)
      .join('path')
      .attr('class', 'muni d-none d-sm-inline')
      .attr('fill', '#e5e5e5')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', path)
      .append('title')
      .text(d => d?.properties?.name_nl);

    // draw provinces
    svg.append('g')
      .selectAll('.province-bg')
      .data(topojson.feature(this.belgium, this.belgium.objects.provinces).features)
      .join('path')
      .attr('class', 'province-bg d-sm-none')
      .attr('fill', '#e5e5e5')
      .attr('stroke', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);

    // draw provinces
    svg.append('g')
      .selectAll('.province')
      .data(topojson.feature(this.belgium, this.belgium.objects.provinces).features)
      .join('path')
      .attr('class', 'province')
      .attr('fill', 'none')
      .attr('stroke', '#bbbbbb')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);

    // draw stations
    this.stationDots = svg.append('g')
      .selectAll('.station')
      .data(this.stations)
      .join('circle')
      .attr('class', 'station')
      .attr('id', d => 'station-' + d.id)
      .attr('cx', d => projection([d.coordinates.longitude, d.coordinates.latitude])[0])
      .attr('cy', d => projection([d.coordinates.longitude, d.coordinates.latitude])[1])
      .style('cursor', 'pointer')
      .on('mouseenter', (event, datum) => {
        d3.select('#station-' + datum.id)
          .attr('fill-opacity', 1)
          .attr('r', 5);
        this.tooltip(datum, event.pageX, event.pageY);
      })
      .on('mouseleave', (event, datum) => {
        d3.select('#station-' + datum.id)
          .attr('r', d => this.stationRadius(d as Station))
          .attr('fill-opacity', d => this.stationFillOpacity(d as Station));
        this.tooltip(null);
      })
      .on('click', (event, datum) => { this.toggleCallback(datum.id); });

    this.legend = svg.append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.top - 40})`);

    this.loading = false;
    this.update();
  }

  private tooltip (station: Station | null, x?: number, y?: number) {
    if (station) {
      this.tooltipInfo.station = station;
      this.tooltipInfo.x = x;
      this.tooltipInfo.y = y;
      this.tooltipInfo.shown = true;
    } else {
      this.tooltipInfo.shown = false;
    }
  }

  private setProperty (property: string) {
    this.selectedProperty = (weatherProperties.hasOwnProperty(property) ? property : 'temp') as WeatherPropertyName;
  }

  updateProperty (property: string) {
    this.setProperty(property);
    this.update();
  }

  updateSelectedStations () {
    this.update();
  }

  updateMeasurements (measurements: Measurement[]) {
    this.measurements = measurements;
    this.measurementsMap = new Map(this.measurements.map(m => [m.id, m]));
    this.update();
  }

  private update () {
    if (this.loading) return;

    this.legend.html('');
    this.colorScale.domain(d3.extent(this.measurements.filter(d => d.status === "Ok"), d => d[this.selectedProperty]) as [number, number]);
    this.legend.append(() => legend({ color: this.colorScale, title: weatherProperties[this.selectedProperty].legend, width: 200, tickSize: -10, ticks: 4 }));
    this.stationDots.transition()
      .attr('r', d => this.stationRadius(d))
      .attr('stroke', d => this.isSelectedStation(d) ? this.stationColor(d) : 'none')
      .attr('stroke-width', d => this.isSelectedStation(d) ? 4 : 0)
      .attr('fill-opacity', d => this.stationFillOpacity(d))
      .attr('fill', d => this.isSelectedStation(d) ? 'white' : this.stationColor(d));
  }

  private isSelectedStation (station: Station): boolean {
    return this.selectedStations.map(s => s.id).includes(station.id);
  }

  private stationRadius (station: Station): number {
    if (this.measurementsMap.get(station.id)?.status !== 'Ok') {
      return 2;
    }
    if (this.isSelectedStation(station)) {
      return 5;
    }
    return 4;
  }

  private stationColor (station: Station): string {
    const m = this.measurementsMap.get(station.id);
    return m?.status === 'Ok' ? this.colorScale(m[this.selectedProperty]) : 'black';
  }

  private stationFillOpacity (station: Station): number {
    return this.measurementsMap.get(station.id)?.status === 'Ok' ? 0.7 : 1;
  }
}
