<template>
  <v-card :loading="loading" v-show="hasData">
    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-title class="mb-1">{{ weatherProperty.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ weatherProperty.unit }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <div :id="consolidatedGraphId" class="mt-n3">
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { D3Graph } from '../app/d3/D3Graph';
import { Station, Measurement, WeatherProperty } from '../app/types';

@Component
export default class GraphCard extends Vue {
  @Prop() readonly weatherProperty!: WeatherProperty;
  @Prop() readonly graphId!: string;
  @Prop({ type: Boolean }) readonly updateLegendColors!: boolean;
  @Prop() tooltipPosition!: { timestamp: number; i: number }

  graph: D3Graph | undefined;

  wbgtStations = ['vlinder02', 'vlinder73', 'vlinder74', 'vlinder75', 'vlinder76'];

  mounted () {
    this.graph = new D3Graph(`#${this.consolidatedGraphId}`, this.weatherProperty, this.selectedStations, this.tooltipPosition);
    this.graph.init();
  }

  get measurements (): Measurement[][] {
    return this.$store.state.historicMeasurements;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  get loading (): boolean {
    return this.$store.state.loadingHistoricMeasurements;
  }

  get consolidatedGraphId (): string {
    return this.graphId || 'weather_graph_' + this.weatherProperty.property;
  }

  get tooltipI (): number {
    return this.tooltipPosition.i;
  }

  get hasData (): boolean {
    if (this.weatherProperty.property === 'wbgt') {
      // return this.selectedStations.some(s => s.hasWbgt);
      return this.selectedStations.some(s => this.wbgtStations.includes(s.name));
    }
    return true;
  }

  // when measurements are updated, we have to manually update the D3 map
  @Watch('measurements')
  measurementsChanged () {
    if (this.graph) {
      this.graph.updateData(this.$store.getters.historicData(this.weatherProperty.property));
      if (this.updateLegendColors) {
        this.$store.dispatch('setLegendColors', this.graph.getLegendColors());
      }
    }
  }

  @Watch('tooltipI')
  tooltipMoved () {
    if (this.graph) {
      this.graph.updateTooltip();
    }
  }
}
</script>
