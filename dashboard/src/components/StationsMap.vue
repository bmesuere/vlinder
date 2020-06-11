<template>
  <div class="text-center">
    <v-toolbar flat>
      <v-toolbar-title>{{ weatherProperties[selectedProperty].title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="selectedProperty" mandatory>
        <v-tooltip bottom v-for="p in weatherProperties" :key="p.property">
          <template v-slot:activator="{ on }">
            <v-btn :value="p.property" v-on="on">
              <v-icon>{{ p.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ p.name }}</span>
        </v-tooltip>
      </v-btn-toggle>
    </v-toolbar>
    <div v-bind:id="mapId">
      <v-img
      aspect-ratio="2.1428571429"
      src=""
      lazy-src="data:image/png;base64,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"
    />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { weatherProperties as wp } from '../app/weatherProperties';

import { D3StationsMap } from '../app/d3/D3StationsMap';
import { Station, Measurement } from '../app/types';

@Component
export default class StationsMap extends Vue {
  @Prop({ default: 'stationsMap' }) readonly mapId!: string;
  @Prop() readonly dataLoaded!: Promise<[Station[], Measurement[]]>;

  weatherProperties = wp;
  map: D3StationsMap | undefined;
  selectedProperty = 'temp';

  async mounted () {
    this.map = new D3StationsMap(`#${this.mapId}`, this.selectedProperty, this.selectedStations, this.toggleStation);
    const [s, m] = await this.dataLoaded;
    this.map.init(s, m);
  }

  // adds or removes a station to the list of selected stations
  toggleStation (stationId: string) {
    this.$store.dispatch('toggleStationById', stationId);
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  get stations (): Station[] {
    return this.$store.state.stations;
  }

  get measurements (): Measurement[] {
    return this.$store.state.liveMeasurements;
  }

  // when stations are added or removed, update the D3 map
  @Watch('selectedStations')
  selectedStationsChanged () {
    if (this.map) {
      this.map.updateSelectedStations();
    }
  }

  // when a different property is selected, we have to manually update the D3 map
  @Watch('selectedProperty')
  selectedPropertyChanged () {
    if (this.map) {
      this.map.updateProperty(this.selectedProperty);
    }
  }

  // when measurements are updated, we have to manually update the D3 map
  @Watch('measurements')
  measurementsChanged () {
    if (this.map) {
      this.map.updateMeasurements(this.measurements);
    }
  }
}
</script>
