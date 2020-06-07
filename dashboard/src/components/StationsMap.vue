<template>
  <div>
    <div v-bind:id="mapId"></div>
    <v-btn-toggle v-model="weatherProperty" mandatory>
      <v-tooltip top v-for="p in weatherProperties" :key="p.property">
        <template v-slot:activator="{ on }">
          <v-btn :value="p.property" v-on="on">
            <v-icon>{{ p.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ p.name }}</span>
      </v-tooltip>
    </v-btn-toggle>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import { D3StationsMap } from '../d3Components/D3StationsMap';

@Component
export default class StationsMap extends Vue {
  @Prop({ default: 'stationsMap' }) mapId!: string

  weatherProperties = D3StationsMap.weatherProperties;
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
