import * as d3 from 'd3';

import { LandUse } from '../types';

interface LandUseSeries extends d3.Series<LandUse, string> {
  key: string;
}

export class D3LandUse {
  private readonly selector: string;
  private readonly landUse: LandUse[];

  // settings
  private readonly margin = { top: 5, right: 5, bottom: 20, left: 5 };
  private readonly width = 295;
  private readonly height = 127.5;

  private readonly colors: Record<string, string> = {
    water: '#9ab5cd',
    paved: '#efc7c8',
    green: '#b4c49c'
  };

  private readonly names: Record<string, string> = {
    water: 'Water',
    paved: 'Verhard',
    green: 'Groen'
  };

  private angle!: d3.ScaleLinear<number, number>;
  private radius!: d3.ScaleBand<number>;

  constructor (selector: string, landUse: LandUse[]) {
    this.selector = selector;
    this.landUse = landUse;
  }

  init () {
    const svg = d3.select(this.selector)
      .html('')
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('style', 'color: black')
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`);

    const seriesRaw = d3.stack<LandUse>()
      .keys(['water', 'paved', 'green'])
      .value((d, key) => d.usage[key as keyof LandUse['usage']])(this.landUse);

    const series: LandUseSeries[] = seriesRaw.map(d => {
      // We extend the series with the key property for easier access
      return Object.assign(d, { key: d.key });
    });

    const color = d3.scaleOrdinal<string>()
      .domain(series.map(d => d.key))
      .range([this.colors.water, this.colors.paved, this.colors.green])
      .unknown('#ccc');

    this.angle = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1])) as number])
      .range([3.05 / 8 * Math.PI, 4 / 8 * Math.PI]);

    this.radius = d3.scaleBand<number>()
      .domain(this.landUse.map(d => d.distance))
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.1);

    const rAxis = (g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>) => g
      .call(d3.axisBottom(this.radius).tickSizeOuter(0).tickFormat(d => d + ' m'))
      .call(g => g.selectAll('.domain').remove());

    // Re-doing the series mapping to attach key to points for easier access in leaf nodes
    const seriesWithKey = seriesRaw.map(d => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      d.forEach((p: any) => { p.key = d.key; });
      return Object.assign(d, { key: d.key });
    });

    const gMain = svg.append('g').attr('transform', `translate(0, ${this.height - this.margin.bottom})`);

    gMain.append('g')
      .selectAll('g')
      .data(seriesWithKey)
      .join('g')
      .attr('fill', (d) => (color(d.key) as string))
      .selectAll('path')
      .data(d => d)
      .join('path')
      .attr('d', d => this.arc(d))
      .append('title')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .text((d: any) => `${d3.format('.0%')(d.data.usage[d.key])} ${this.names[d.key].toLowerCase()} in een straal van ${d.data.distance}m rond het station`);

    gMain.append('g')
      .call(rAxis);

    const legend = gMain.append('g')
      .attr('transform', `translate(10, ${-1 * (this.height - this.margin.bottom) + 10})`);
    legend.append('text').attr('y', 12).text('Landgebruik');
    ['water', 'paved', 'green'].forEach((type, i) => {
      legend.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('y', (i + 2) * 14 - 9)
        .attr('fill', this.colors[type]);
      legend.append('text')
        .attr('font-size', 11)
        .attr('x', 15)
        .attr('y', (i + 2) * 14)
        .text(this.names[type]);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private arc (d: any): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generator = d3.arc<any>()
      .innerRadius(this.radius(d.data.distance) as number)
      .outerRadius((this.radius(d.data.distance) as number) + this.radius.bandwidth())
      .startAngle(this.angle(d[0]))
      .endAngle(this.angle(d[1]));

    return generator(d) || '';
  }
}
