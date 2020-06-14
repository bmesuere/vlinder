import * as d3 from 'd3';
import { multiFormat } from './TimeFormatter';

import { Station, WeatherProperty, MeasurementSeries } from '../types';

export class D3Graph {
  private readonly selector: string;
  private readonly selectedStations: Station[];
  private readonly property: WeatherProperty;

  // data
  private measurements!: MeasurementSeries;

  // settings
  private readonly margin = { top: 5, right: 30, bottom: 30, left: 40 };
  private readonly width = 400;
  private readonly height = 250;

  // svg stuff
  private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private x!: d3.ScaleTime<number, number>;
  private y!: d3.ScaleLinear<number, number>;
  private color!: d3.ScaleOrdinal<string, string>;
  private line!: d3.Line<[number, number]>;
  private xAxis!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private yAxis!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private lines!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

  constructor (selector: string, property: WeatherProperty, selectedStations: Station[]) {
    this.selector = selector;
    this.property = property;
    this.selectedStations = selectedStations;
  }

  init () {
    this.svg = d3.select(this.selector)
      .html('')
      .append('svg')
      .attr('viewBox', `0, 0, ${this.width}, ${this.height}`);

    this.x = d3.scaleTime()
      .range([this.margin.left, this.width - this.margin.right]);

    this.y = d3.scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.line = d3.line()
      .curve(d3.curveMonotoneX)
      // @ts-ignore
      .defined(d => !isNaN(d))
      .x((d, i) => this.x(Date.parse(this.measurements.timestamps[i])))
      // @ts-ignore
      .y(d => this.y(d));

    this.lines = this.svg.append('g')
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round');

    this.xAxis = this.svg.append('g')
      .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
      // @ts-ignore
      .call(d3.axisBottom(this.x).ticks(this.width / 80).tickFormat(multiFormat));

    this.yAxis = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},0)`)
      .call(d3.axisLeft(this.y));
  }

  updateData (measurements: MeasurementSeries) {
    this.measurements = measurements;
    this.update();
  }

  private update () {
    if (!this.svg) return;
    if (this.measurements.timestamps.length === 0) return;

    // update scales
    this.x.domain(d3.extent(this.measurements.timestamps, d => Date.parse(d)) as [number, number]);
    this.y.domain([d3.min(this.measurements.series, d => d3.min(d.values)) as number, d3.max(this.measurements.series, d => d3.max(d.values)) as number]).nice();

    // redraw axes
    // @ts-ignore
    this.xAxis.transition().call(d3.axisBottom(this.x).ticks(this.width / 80).tickFormat(multiFormat));
    this.yAxis.transition().call(d3.axisLeft(this.y).ticks(5));

    // redraw lines
    this.lines.selectAll('path')
      // @ts-ignore
      .data(this.measurements.series, d => d.stationId)
      .join('path')
      .transition()
      // @ts-ignore
      .attr('d', d => this.line(d.values))
      .attr('stroke', d => this.color(d.stationId));
  }
}
