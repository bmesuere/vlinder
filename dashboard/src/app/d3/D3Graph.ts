import * as d3 from 'd3';
import { multiFormat } from './TimeFormatter';

import { Station, WeatherProperty, MeasurementSeries } from '../types';

export class D3Graph {
  private readonly selector: string;
  private readonly selectedStations: Station[];
  private readonly property: WeatherProperty;
  private tooltipPosition: { timestamp: number; i: number };

  // data
  private measurements!: MeasurementSeries;

  // settings
  private readonly margin = { top: 15, right: 35, bottom: 30, left: 40 };
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
  private mouseLabels!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGTextElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;
  private mouseBGLabels!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGTextElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;
  private mouseLine!: d3.Selection<SVGLineElement, unknown, HTMLElement, any>;
  private timeLabel!: d3.Selection<SVGTextElement, unknown, HTMLElement, any>;

  constructor (selector: string, property: WeatherProperty, selectedStations: Station[], tooltipPosition: { timestamp: number; i: number }) {
    this.selector = selector;
    this.property = property;
    this.selectedStations = selectedStations;
    this.tooltipPosition = tooltipPosition;
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
    this.mouseLine = this.mouseG.append('line')
      .attr('class', 'mouseover-line')
      .attr('y1', this.y.range()[0])
      .attr('y2', this.y.range()[1] - 20)
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    this.timeLabel = this.mouseG.append('text')
      .attr('class', 'mouseover-time')
      .attr('y', -5 + this.y.range()[1])
      .attr('text-anchor', 'end')
      .style('font-size', 'small')
      .style('opacity', '0');

    this.bisector = d3.bisector((d: string) => Date.parse(d)).left;

    this.svg.on('touchmove mousemove', () => {
      if (!this.measurements) { return; }
      const { timestamp, i } = this.bisect(d3.mouse(this.svg.node() as SVGSVGElement)[0]);
      this.tooltipPosition.timestamp = timestamp;
      this.tooltipPosition.i = i;
    });
    this.svg.on('touchend mouseleave', () => {
      this.tooltipPosition.timestamp = -1;
      this.tooltipPosition.i = -1;
    });
  }

  updateData (measurements: MeasurementSeries) {
    this.measurements = measurements;
    this.update();
  }

  getLegendColors () {
    const result = {};
    this.measurements.series.forEach(s => {
      // @ts-ignore
      result[s.stationId] = this.color(s.stationId);
    });
    return result;
  }

  updateTooltip () {
    if (!this.measurements || this.measurements.series.length === 0) { return; }
    const { timestamp, i } = this.tooltipPosition;
    if (i === -1) {
      this.timeLabel.style('opacity', 0);
      this.mouseLine.style('opacity', 0);
      this.mouseDots
        .attr('r', 3)
        .attr('cx', () => this.x(Date.parse(this.measurements.timestamps[this.measurements.timestamps.length - 1])))
        .attr('cy', d => this.y(d.values[d.values.length - 1]));
      this.mouseBGLabels
        .attr('x', this.labelxPos())
        .attr('y', d => this.labelyPos(d))
        .text(d => d.values[d.values.length - 1]);
      this.mouseLabels
        .attr('x', this.labelxPos())
        .attr('y', d => this.labelyPos(d))
        .text(d => d.values[d.values.length - 1]);
    } else {
      this.mouseLine
        .style('opacity', 1)
        .attr('x1', this.x(timestamp))
        .attr('x2', this.x(timestamp));
      this.timeLabel
        // @ts-ignore
        .text(multiFormat(timestamp))
        .attr('x', -5 + this.x(timestamp))
        .style('opacity', 1);
      this.mouseDots
        .attr('r', 4)
        .attr('cx', this.x(timestamp))
        .attr('cy', d => this.y(d.values[i]));
      this.mouseBGLabels
        .attr('x', this.labelxPos(timestamp))
        .attr('y', d => this.labelyPos(d, i))
        .text(d => d.values[i]);
      this.mouseLabels
        .attr('x', this.labelxPos(timestamp))
        .attr('y', d => this.labelyPos(d, i))
        .text(d => d.values[i]);
    }
  }

  private update () {
    if (!this.svg) return;
    if (!this.measurements) return;

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

    this.mouseBGLabels = this.mouseG.selectAll('.mouseover-BGlabels')
      // @ts-ignore
      .data(this.measurements.series, d => d.stationId)
      .join('text')
      .attr('class', 'mouseover-BGlabels')
      .attr('x', this.labelxPos())
      .attr('y', d => this.labelyPos(d))
      .text(d => d.values[d.values.length - 1])
      .style('font-size', 'small')
      .style('stroke', 'white')
      .style('stroke-width', 3);

    this.mouseLabels = this.mouseG.selectAll('.mouseover-labels')
      // @ts-ignore
      .data(this.measurements.series, d => d.stationId)
      .join('text')
      .attr('class', 'mouseover-labels')
      .attr('x', this.labelxPos())
      .attr('y', d => this.labelyPos(d))
      .text(d => d.values[d.values.length - 1])
      .style('font-size', 'small')
      .style('fill', d => this.color(d.stationId));
  }

  private labelxPos (timestamp?: number) {
    timestamp = timestamp || Date.parse(this.measurements.timestamps[this.measurements.timestamps.length - 1]);
    return 5 + this.x(timestamp);
  }

  private labelyPos (d: {values: number[]}, i?: number) {
    let offset = -5;
    if (i === undefined) {
      i = d.values.length - 1;
      offset = 4.5;
    }
    return offset + this.y(d.values[i]);
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
