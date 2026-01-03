import * as d3 from 'd3';

type ColorScale =
  | d3.ScaleSequential<string>
  | d3.ScaleOrdinal<string, string>
  | d3.ScaleLinear<number, string>
  | d3.ScaleQuantile<string>
  | d3.ScaleQuantize<string>
  | d3.ScaleThreshold<number, string>
  | d3.ScaleBand<string>;

interface LegendOptions {
  color: ColorScale;
  title: string;
  tickSize?: number;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  ticks?: number;
  tickFormat?: string | ((d: d3.NumberValue, i: number) => string);
  tickValues?: number[] | string[];
}

// adapted from https://observablehq.com/@d3/color-legend
export function legend ({
  color,
  title,
  tickSize = 6,
  width = 320,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
}: LegendOptions) {
  const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('overflow', 'visible')
    .style('display', 'block');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tickAdjust: (g: any) => any = (g) => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);

  // Use 'any' for x to avoid union hell with incompatible scale methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let x: any;

  // Continuous
  if ('interpolate' in color) {
    // d3.ScaleLinear
    const c = color as d3.ScaleLinear<number, string>;
    const n = Math.min(c.domain().length, c.range().length);

    x = c.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')

      .attr('xlink:href', ramp(c.copy().domain(d3.quantize(d3.interpolate(0, 1), n)) as unknown as (t: number) => string).toDataURL());
  }

  // Sequential
  else if ('interpolator' in color) {
    const c = color as d3.ScaleSequential<string>;
    const interpolator = c.interpolator();

    // Create a linear scale for the axis
    x = Object.assign(c.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
    { range () { return [marginLeft, width - marginRight]; } });

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(interpolator).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!('ticks' in x)) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(c.domain(), i / (n - 1))).filter(d => d !== undefined) as number[];
      }
      if (typeof tickFormat !== 'function') {
        tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat);
      }
    }
  }

  // Threshold
  else if ('invertExtent' in color) {
    const c = color as d3.ScaleThreshold<number, string> | d3.ScaleQuantile<string> | d3.ScaleQuantize<string>;
    const thresholds =
      (c as d3.ScaleQuantize<string>).thresholds ? (c as d3.ScaleQuantize<string>).thresholds() // scaleQuantize
        : (c as d3.ScaleQuantile<string>).quantiles ? (c as d3.ScaleQuantile<string>).quantiles() // scaleQuantile
          : c.domain(); // scaleThreshold

    const thresholdFormat =
      tickFormat === undefined ? (d: d3.NumberValue) => d
        : typeof tickFormat === 'string' ? d3.format(tickFormat)
          : tickFormat;

    x = d3.scaleLinear()
      .domain([-1, c.range().length - 1])
      .rangeRound([marginLeft, width - marginRight]);

    svg.append('g')
      .selectAll('rect')
      .data(color.range())
      .join('rect')
      .attr('x', (d, i) => x(i - 1))
      .attr('y', marginTop)
      .attr('width', (d, i) => x(i) - x(i - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', (d) => d as string);

    tickValues = d3.range(thresholds.length);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickFormat = ((i: any) => thresholdFormat(thresholds[i] as any, i)) as any;
  }

  // Ordinal
  else {
    const c = color as d3.ScaleOrdinal<string, string>;
    x = d3.scaleBand()
      .domain(c.domain())
      .rangeRound([marginLeft, width - marginRight]);

    svg.append('g')
      .selectAll('rect')
      .data(c.domain())
      .join('rect')
      .attr('x', (d) => x(d)!)
      .attr('y', marginTop)
      .attr('width', Math.max(0, x.bandwidth() - 1))
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', (d) => c(d));

    tickAdjust = () => {};
  }

  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x)
      .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tickFormat(typeof tickFormat === 'function' ? tickFormat as any : null)
      .tickSize(tickSize)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tickValues(tickValues as any))
    .call(tickAdjust)
    .call(g => g.select('.domain').remove())
    .call(g => g.append('text')
      .attr('x', marginLeft)
      .attr('y', marginTop + marginBottom - height - 6)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text(title));

  return svg.node();
}

export function swatches ({
  color,
  columns = null,
  format = (x: unknown) => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  id = 'swatches'
}: {
  color: ColorScale;
  columns?: string | null;
  format?: (x: unknown) => unknown;
  swatchSize?: number;
  swatchWidth?: number;
  swatchHeight?: number;
  marginLeft?: number;
  id?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const colorFn = color as any;

  if (columns !== null) {
    return `<div style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
  <style>

.${id}-item {
  break-inside: avoid;
  display: flex;
  align-items: center;
  padding-bottom: 1px;
}

.${id}-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - ${+swatchWidth}px - 0.5em);
}

.${id}-swatch {
  width: ${+swatchWidth}px;
  height: ${+swatchHeight}px;
  margin: 0 0.5em 0 0;
}

  </style>
  <div style="width: 100%; columns: ${columns};">${color.domain().map((value: unknown) => {
    const label = format(value) + "";
    return `<div class="${id}-item">
      <div class="${id}-swatch" style="background:${colorFn(value)};"></div>
      <div class="${id}-label" title="${label.replace(/["&]/g, entity)}">${document.createTextNode(label)}</div>
    </div>`;
  })}
  </div>
</div>`;
  }

  return `<div style="display: flex; align-items: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;">
  <style>

.${id} {
  display: inline-flex;
  align-items: center;
  margin-right: 1em;
}

.${id}::before {
  content: "";
  width: ${+swatchWidth}px;
  height: ${+swatchHeight}px;
  margin-right: 0.5em;
  background: var(--color);
}

  </style>
  <div>${color.domain().map((value: unknown) => `<span class="${id}" style="--color: ${(colorFn)(value)}">${document.createTextNode(format(value) as string)}</span>`)}</div>`;
}

function entity (character: string) {
  return `&#${character.charCodeAt(0).toString()};`;
}

function ramp (color: (t: number) => string, n = 256) {
  const canvas = d3.create('canvas').attr("width", n).attr("height", 1).node();
  if (!canvas) throw new Error("Canvas creation failed");
  const context = canvas.getContext('2d');
  if (!context) throw new Error("Canvas context creation failed");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, 1);
  }
  return canvas;
}
