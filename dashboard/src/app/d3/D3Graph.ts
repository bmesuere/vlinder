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
  private numericTimestamps: number[] = [];

  // settings
  private readonly margin = { top: 15, right: 35, bottom: 30, left: 45 };
  private readonly width = 400;
  private readonly height = 250;

  // svg stuff
  private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  private x!: d3.ScaleTime<number, number>;
  private y!: d3.ScaleLinear<number, number>;
  private color!: d3.ScaleOrdinal<string, string>;
  private line!: d3.Line<number>;
  private xAxis!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  private yAxis!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  private lines!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  private bisector!: (array: ArrayLike<number>, x: number, lo?: number | undefined, hi?: number | undefined) => number;
  private mouseG!: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
  private mouseDots!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGCircleElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;
  private mouseLabels!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGTextElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;
  private mouseBGLabels!: d3.Selection<Element | d3.EnterElement | Document | Window | SVGTextElement | null, { stationId: string; values: number[] }, SVGGElement, unknown>;
  private mouseLine!: d3.Selection<SVGLineElement, unknown, HTMLElement, unknown>;
  private timeLabel!: d3.Selection<SVGTextElement, unknown, HTMLElement, unknown>;

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
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.x = d3.scaleTime()
      .range([this.margin.left, this.width - this.margin.right]);

    this.y = d3.scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.line = d3.line<number>()
      .curve(d3.curveMonotoneX)
      .defined(d => !(isNaN(d) || d === null))
      .x((d, i) => this.x(this.numericTimestamps[i]))
      .y(d => this.y(d));

    this.lines = this.svg.append('g')
      .attr('fill', 'none')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round');

    this.xAxis = this.svg.append('g')
      .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.x).ticks(this.width / 80).tickFormat(d => multiFormat(d as Date | d3.NumberValue)));

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

    // D3 bisector on numeric timestamps
    this.bisector = d3.bisector<number, number>((d) => d).left;

    this.svg.on('touchmove mousemove', (event) => {
      if (!this.measurements) { return; }
      const { timestamp, i } = this.bisect(d3.pointer(event, this.svg.node() as SVGSVGElement)[0]);
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
    this.numericTimestamps = this.measurements.timestamps.map(t => Date.parse(t));
    this.update();
  }

  getLegendColors () {
    const result: Record<string, string> = {};
    this.measurements.series.forEach(s => {
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
        .attr('cx', () => this.x(this.numericTimestamps[this.numericTimestamps.length - 1]))
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
        .text(multiFormat(timestamp as unknown as Date))
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

    const filteredSeries = this.measurements.series.filter(s => s.values[0] !== null);

    // update scales
    this.x.domain(d3.extent(this.numericTimestamps) as [number, number]);
    this.y.domain([d3.min(filteredSeries, d => d3.min(d.values)) as number, d3.max(filteredSeries, d => d3.max(d.values)) as number]).nice();

    // this is done to force the color scale to assign the same color to old stations and a new color to new stations
    // even if they don't have data for this property
    this.measurements.series.forEach(s => {
      this.color(s.stationId);
    });

    // redraw axes
    this.xAxis.transition().call(d3.axisBottom(this.x).ticks(this.width / 80).tickFormat(d => multiFormat(d as Date | d3.NumberValue)));
    this.yAxis.transition().call(d3.axisLeft(this.y).ticks(5));

    // redraw lines
    this.lines.selectAll('path')
      .data(filteredSeries, d => (d as { stationId: string; values: number[] }).stationId)
      .join('path')
      .transition()
      .attr('d', d => this.line(d.values))
      .attr('stroke', d => this.color(d.stationId));

    this.mouseDots = this.mouseG.selectAll('.mouseover-dot')
      .data(filteredSeries, d => (d as { stationId: string; values: number[] }).stationId)
      .join('circle')
      .attr('class', 'mouseover-dot')
      .attr('r', 3)
      .attr('cx', () => this.x(this.numericTimestamps[this.numericTimestamps.length - 1]))
      .attr('cy', d => this.y(d.values[d.values.length - 1]))
      .style('fill', d => this.color(d.stationId));

    this.mouseBGLabels = this.mouseG.selectAll('.mouseover-BGlabels')
      .data(filteredSeries, d => (d as { stationId: string; values: number[] }).stationId)
      .join('text')
      .attr('class', 'mouseover-BGlabels')
      .attr('x', this.labelxPos())
      .attr('y', d => this.labelyPos(d))
      .text(d => d.values[d.values.length - 1])
      .style('font-size', 'small')
      .style('stroke', 'white')
      .style('stroke-width', 3);

    this.mouseLabels = this.mouseG.selectAll('.mouseover-labels')
      .data(filteredSeries, d => (d as { stationId: string; values: number[] }).stationId)
      .join('text')
      .attr('class', 'mouseover-labels')
      .attr('x', this.labelxPos())
      .attr('y', d => this.labelyPos(d))
      .text(d => d.values[d.values.length - 1])
      .style('font-size', 'small')
      .style('fill', d => this.color(d.stationId));
  }

  private labelxPos (timestamp?: number) {
    timestamp = timestamp || this.numericTimestamps[this.numericTimestamps.length - 1];
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
    const index = this.bisector(this.numericTimestamps, date.valueOf(), 1);
    const a = this.numericTimestamps[index - 1];
    const b = this.numericTimestamps[index];

    // Compare numeric timestamp values
    if (date.valueOf() - a > b - date.valueOf()) {
      return { timestamp: b, i: index };
    } else {
      return { timestamp: a, i: index - 1 };
    }
  }
}
