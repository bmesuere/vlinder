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

import { D3StationsMap } from '../d3Components/D3StationsMap';
import { Station } from '../app/types';

@Component
export default class StationsMap extends Vue {
  @Prop({ default: 'stationsMap' }) readonly mapId!: string
  @Prop() readonly stations!: Station[]
  @Prop() readonly selectedStations!: Station[]

  weatherProperties = wp;
  map: D3StationsMap | undefined;
  selectedProperty = 'temp';

  mounted () {
    this.map = new D3StationsMap(`#${this.mapId}`, this.selectedProperty, {
      selectStation: this.selectStation
    });
    this.map.init();
  }

  // adds a station to the list of list of selected stations
  selectStation (stationId: string) {
    const station = this.stations.find(s => s.id === stationId);
    if (station && !this.selectedStations.includes(station)) {
      this.selectedStations.push(station);
    }
  }

  // when a different property is selected, we have to manually update the D3 map
  @Watch('selectedProperty')
  selectedPropertyChanged (value: string, oldValue: string) {
    if (this.map) {
      this.map.updateProperty(this.selectedProperty);
    }
  }
}
</script>
