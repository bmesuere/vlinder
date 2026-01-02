import * as d3 from 'd3';

import { LandUse } from '../types';

export class D3LandUse {
  private readonly selector: string;
  private readonly landUse: LandUse[];

  // settings
  private readonly margin = { top: 5, right: 5, bottom: 20, left: 5 };
  private readonly width = 295;
  private readonly height = 127.5;

  private readonly waterColor = '#9ab5cd';
  private readonly pavedColor = '#efc7c8';
  private readonly greenColor = '#b4c49c';

  private readonly waterName = 'Water';
  private readonly pavedName = 'Verhard';
  private readonly greenName = 'Groen';

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
      .attr('style', 'color: black')
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`);

    const series = d3.stack()
      .keys(['water', 'paved', 'green'])
      // @ts-ignore D3 logic needs fix
      .value((d, key) => d.usage[key])(this.landUse)
      // @ts-ignore D3 logic needs fix
      .map(d => { d.forEach(v => { v.key = d.key; }); return d; });

    const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range([this.waterColor, this.pavedColor, this.greenColor])
      .unknown('#ccc');

    this.angle = d3.scaleLinear()
      // @ts-ignore D3 logic needs fix
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([3.05 / 8 * Math.PI, 4 / 8 * Math.PI]);

    this.radius = d3.scaleBand()
      // @ts-ignore D3 logic needs fix
      .domain(this.landUse.map(d => d.distance))
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.1);

    // @ts-ignore D3 logic needs fix
    const rAxis = g => g
      .call(d3.axisBottom(this.radius).tickSizeOuter(0).tickFormat(d => d + ' m'))
      // @ts-ignore D3 logic needs fix
      .call(g => g.selectAll('.domain').remove());

    // @ts-ignore D3 logic needs fix
    svg.append('g')
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', (d) => (color(d.key) as string))
      .selectAll('path')
      .data(d => d)
      .join('path')
      .attr('d', d => this.arc(d))
      .append('title')
      // @ts-ignore D3 logic needs fix
      .text(d => `${d3.format('.0%')(d.data.usage[d.key])} ${this[d.key + 'Name'].toLowerCase()} in een straal van ${d.data.distance}m rond het station`);

    svg.append('g')
      .call(rAxis);

    const legend = svg.append('g')
      .attr('transform', `translate(10, ${-1 * (this.height - this.margin.bottom) + 10})`);
    legend.append('text').attr('y', 12).text('Landgebruik');
    ['water', 'paved', 'green'].forEach((type, i) => {
      legend.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('y', (i + 2) * 14 - 9)
      // @ts-ignore D3 logic needs fix
        .attr('fill', this[type + 'Color']);
      legend.append('text')
        .attr('font-size', 11)
        .attr('x', 15)
        .attr('y', (i + 2) * 14)
      // @ts-ignore D3 logic needs fix
        .text(this[type + 'Name']);
    });
  }

  // @ts-ignore D3 logic needs fix
  private arc (d): string {
    // @ts-ignore D3 logic needs fix
    return d3.arc()
      // @ts-ignore D3 logic needs fix
      .innerRadius(this.radius(d.data.distance))
      // @ts-ignore D3 logic needs fix
      .outerRadius(this.radius(d.data.distance) + this.radius.bandwidth())
      .startAngle(this.angle(d[0]))
      .endAngle(this.angle(d[1]))();
  }
}
