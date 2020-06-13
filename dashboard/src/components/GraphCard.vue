<template>
  <v-card>
    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-title class="mb-1">{{ weatherProperty.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ weatherProperty.unit }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <div :id="consolidatedGraphId">
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

  graph: D3Graph | undefined;

  mounted () {
    this.graph = new D3Graph(`#${this.consolidatedGraphId}`, this.weatherProperty, this.selectedStations);
    this.graph.init();
  }

  get measurements (): Measurement[][] {
    return this.$store.state.historicMeasurements;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  get consolidatedGraphId (): string {
    return this.graphId || 'weather_graph_' + this.weatherProperty.property;
  }

  // when measurements are updated, we have to manually update the D3 map
  @Watch('measurements')
  measurementsChanged () {
    if (this.graph) {
      this.graph.updateData(this.$store.getters.historicData(this.weatherProperty.property));
    }
  }
}
</script>
