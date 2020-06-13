<template>
  <v-card>
    <v-list-item two-line>
      <v-list-item-content>
        <v-list-item-title class="mb-1">Temperatuur</v-list-item-title>
        <v-list-item-subtitle>°C</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <div v-bind:id="tempGraphId">
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { D3TempGraph } from '../app/d3/D3TempGraph';
import { Station, Measurement } from '../app/types';

@Component
export default class TempGraphCard extends Vue {
  @Prop({ default: 'tempGraph' }) readonly tempGraphId!: string;

  graph: D3TempGraph | undefined;

  mounted () {
    this.graph = new D3TempGraph(`#${this.tempGraphId}`, this.selectedStations);
    this.graph.init();
  }

  get measurements (): Measurement[][] {
    return this.$store.state.historicMeasurements;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  // when measurements are updated, we have to manually update the D3 map
  @Watch('measurements')
  measurementsChanged () {
    if (this.graph) {
      this.graph.updateData(this.$store.getters.tempData);
    }
  }
}
</script>
