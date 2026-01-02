import * as d3 from 'd3';

type ColorScale =
  | d3.ScaleSequential<string>
  | d3.ScaleOrdinal<string, string>
  | d3.ScaleLinear<number, number>
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
  let tickAdjust = (g: any) => g.selectAll('.tick line').attr('y1', marginTop + marginBottom - height);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let x: any;

  // Continuous
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((color as any).interpolate) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = color as any; // Sequential or Linear
    const n = Math.min(c.domain().length, c.range().length);

    x = c.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(c.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else if ((color as any).interpolator) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = color as any; // Sequential
    x = Object.assign(c.copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
    { range () { return [marginLeft, width - marginRight]; } });

    svg.append('image')
      .attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', width - marginLeft - marginRight)
      .attr('height', height - marginTop - marginBottom)
      .attr('preserveAspectRatio', 'none')
      .attr('xlink:href', ramp(c.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tickValues = d3.range(n).map(i => d3.quantile(c.domain(), i / (n - 1) as any)) as any;
      }
      if (typeof tickFormat !== 'function') {
        tickFormat = d3.format(tickFormat === undefined ? ',f' : tickFormat);
      }
    }
  }

  // Threshold
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else if ((color as any).invertExtent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = color as any; // Threshold or Quantile or Quantize
    const thresholds =
      c.thresholds ? c.thresholds() // scaleQuantize
        : c.quantiles ? c.quantiles() // scaleQuantile
          : c.domain(); // scaleThreshold

    const thresholdFormat =
      tickFormat === undefined ? (d: unknown) => d
        : typeof tickFormat === 'string' ? d3.format(tickFormat)
          : tickFormat;

    x = d3.scaleLinear()
      .domain([-1, c.range().length - 1])
      .rangeRound([marginLeft, width - marginRight]);

    svg.append('g')
      .selectAll('rect')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .data(color.range() as any)
      .join('rect')
      .attr('x', (d, i) => x(i - 1))
      .attr('y', marginTop)
      .attr('width', (d, i) => x(i) - x(i - 1))
      .attr('height', height - marginTop - marginBottom)

      .attr('fill', (d) => d as string);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickValues = d3.range(thresholds.length) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tickFormat = ((i: any) => thresholdFormat(thresholds[i], i)) as any;
  }

  // Ordinal
  else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = color as any;
    x = d3.scaleBand()
      .domain(c.domain())
      .rangeRound([marginLeft, width - marginRight]);

    svg.append('g')
      .selectAll('rect')
      .data(c.domain())
      .join('rect')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('x', x as any)
      .attr('y', marginTop)
      .attr('width', Math.max(0, x.bandwidth() - 1))
      .attr('height', height - marginTop - marginBottom)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('fill', color as any);

    tickAdjust = () => { };
  }

  svg.append('g')
    .attr('transform', `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x)
      .ticks(ticks, typeof tickFormat === 'string' ? tickFormat : undefined)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tickFormat(typeof tickFormat === 'function' ? tickFormat as any : undefined)
      .tickSize(tickSize)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tickValues(tickValues as any))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .call(tickAdjust as any)
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const label = format(value) + "" as any;
    return `<div class="${id}-item">
      <div class="${id}-swatch" style="background:${color(value)};"></div>
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
  <div>${color.domain().map((value: unknown) => `<span class="${id}" style="--color: ${color(value)}">${document.createTextNode(format(value) as string)}</span>`)}</div>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function entity (character: any) {
  return `&#${character.charCodeAt(0).toString()};`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ramp (color: any, n = 256) {
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
