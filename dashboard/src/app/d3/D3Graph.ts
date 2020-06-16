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
  private bisector!: (array: ArrayLike<string>, x: unknown, lo?: number | undefined, hi?: number | undefined) => number;
  private mouseG!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private mouseDots!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;

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

    this.mouseG = this.svg.append('g').attr('class', 'mouse-over');
    const mouseLine = this.mouseG.append('line') // this is the black vertical line to follow mouse
      .attr('class', 'mouseover-line')
      .attr('y1', this.y.range()[0])
      .attr('y2', this.y.range()[1])
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    this.bisector = d3.bisector((d: string) => Date.parse(d)).left;

    this.svg.on('touchmove mousemove', () => {
      const { timestamp, i } = this.bisect(d3.mouse(this.svg.node() as SVGSVGElement)[0]);
      mouseLine
        .style('opacity', 1)
        .attr('x1', this.x(timestamp))
        .attr('x2', this.x(timestamp));
      this.mouseDots
        .attr('r', 4)
        .attr('cx', this.x(timestamp))
        .attr('cy', d => this.y(d.values[i]));
    });
    this.svg.on('touchend mouseleave', () => {
      mouseLine.style('opacity', 0);
      this.mouseDots
        .attr('r', 3)
        .attr('cx', () => this.x(Date.parse(this.measurements.timestamps[this.measurements.timestamps.length - 1])))
        .attr('cy', d => this.y(d.values[d.values.length - 1]));
    });
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

    this.mouseDots = this.mouseG.selectAll('.mouseover-dot')
      // @ts-ignore
      .data(this.measurements.series, d => d.stationId)
      .join('circle')
      .attr('class', 'mouseover-dot')
      .attr('r', 3)
      .attr('cx', () => this.x(Date.parse(this.measurements.timestamps[this.measurements.timestamps.length - 1])))
      .attr('cy', d => this.y(d.values[d.values.length - 1]))
      .style('fill', d => this.color(d.stationId));
  }

  private bisect (mx: number): {timestamp: number; i: number} {
    if (!this.measurements) {
      return { timestamp: 0, i: 0 };
    }
    const date = this.x.invert(mx);
    const index = this.bisector(this.measurements.timestamps, date, 1);
    const a = Date.parse(this.measurements.timestamps[index - 1]);
    const b = Date.parse(this.measurements.timestamps[index]);
    // @ts-ignore
    if (date - a > b - date) {
      return { timestamp: b, i: index };
    } else {
      return { timestamp: a, i: index - 1 };
    }
  }
}
