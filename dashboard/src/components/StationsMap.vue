<template>
  <div>
    <div v-bind:id="mapId"></div>
    <v-btn-toggle v-model="weatherProperty" mandatory>
      <v-btn value="temp">
        <v-icon>mdi-thermometer</v-icon>
      </v-btn>
      <v-btn value="rainVolume">
        <v-icon>mdi-weather-rainy</v-icon>
      </v-btn>
      <v-btn value="windSpeed">
        <v-icon>mdi-weather-windy</v-icon>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import { D3StationsMap } from '../d3Components/D3StationsMap';

@Component
export default class StationsMap extends Vue {
  @Prop({ default: 'stationsMap' }) mapId!: string

  map: D3StationsMap | undefined;
  weatherProperty = 'temp';

  mounted () {
    this.map = new D3StationsMap(`#${this.mapId}`, this.weatherProperty);
    this.map.init();
  }

  @Watch('weatherProperty')
  weatherPropertyChanged (value: string, oldValue: string) {
    if (this.map) {
      this.map.updateProperty(this.weatherProperty);
    }
  }
}
</script>
