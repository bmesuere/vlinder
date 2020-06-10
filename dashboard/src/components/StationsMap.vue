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
    <div v-bind:id="mapId"></div>
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
  @Prop() readonly stations!: Station[];
  @Prop() readonly measurements!: Measurement[];
  @Prop() readonly selectedStations!: Station[];
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
    const station = this.stations.find(s => s.id === stationId);
    if (station) {
      if (this.selectedStations.includes(station)) {
        // remove the station from the list
        this.selectedStations.splice(this.selectedStations.indexOf(station), 1);
      } else {
        this.selectedStations.push(station);
      }
    }
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
