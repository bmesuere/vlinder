import * as d3 from 'd3';

import { Station, Measurement, MeasurementSeries } from '../types';
import { weatherProperties } from '../weatherProperties';

export class D3TempGraph {
  private readonly selector: string;
  private readonly selectedStations: Station[];

  constructor (selector: string, selectedStations: Station[]) {
    this.selector = selector;
    this.selectedStations = selectedStations;
  }

  init () {
    //
  }

  updateData (measurements: MeasurementSeries) {
    console.log(measurements);
  }
}
