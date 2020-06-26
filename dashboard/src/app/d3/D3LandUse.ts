import * as d3 from 'd3';

import { LandUse } from '../types';

export class D3LandUse {
  private readonly selector: string;
  private readonly landUse: LandUse[];

  // settings
  private readonly margin = { top: 5, right: 5, bottom: 20, left: 5 };
  private readonly width = 295;
  private readonly height = 127.5;

  private angle!: number[] & d3.ScaleLinear<number, number>;
  private radius!: string[] & d3.ScaleBand<string>;

  constructor (selector: string, landUse: LandUse[]) {
    this.selector = selector;
    this.landUse = landUse;
  }

  init () {
    const svg = d3.select(this.selector)
      .html('')
      .append('svg')
      .attr('viewBox', `0, 0, ${this.width}, ${this.height}`)
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`);

    const series = d3.stack()
      .keys(['water', 'paved', 'green'])
      // @ts-ignore
      .value((d, key) => d.usage[key])(this.landUse)
      // @ts-ignore
      .map(d => { d.forEach(v => { v.key = d.key; }); return d; });

    const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(['#9ab5cd', '#efc7c8', '#b4c49c'])
      .unknown('#ccc');

    this.angle = d3.scaleLinear()
      // @ts-ignore
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([3 / 8 * Math.PI, 4 / 8 * Math.PI]);

    this.radius = d3.scaleBand()
      // @ts-ignore
      .domain(this.landUse.map(d => d.distance))
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.1);

    // @ts-ignore
    const rAxis = g => g
      .call(d3.axisBottom(this.radius).tickSizeOuter(0).tickFormat(d => d + ' m'))
      // @ts-ignore
      .call(g => g.selectAll('.domain').remove());

    // @ts-ignore
    svg.append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', d => color(d.key))
      .selectAll('path')
      .data(d => d)
      .join('path')
      .attr('d', d => this.arc(d))
      .append('title')
      // @ts-ignore
      .text(d => `${d.data.distance} ${d.key} ${d.data.usage[d.key]}`);

    svg.append('g')
      .call(rAxis);
  }

  // @ts-ignore
  private arc (d): string {
    // @ts-ignore
    return d3.arc()
      // @ts-ignore
      .innerRadius(this.radius(d.data.distance))
      // @ts-ignore
      .outerRadius(this.radius(d.data.distance) + this.radius.bandwidth())
      .startAngle(this.angle(d[0]))
      .endAngle(this.angle(d[1]))();
  }
}
