<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>VLINDER</v-toolbar-title>

      <v-spacer />

      <v-btn href="http://vlinder.ugent.be" target="_blank" text >
        <span class="mr-2">VLINDER website</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row>
          <v-col cols="12" md="10" offset-md="1">
            <StationsMap :dataLoaded="initialDataLoaded" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="s in selectedStations" :key="s.id" >
            <StationCard :station="s" />
          </v-col>
        </v-row>
        <v-toolbar-title class="mt-3">Afgelopen 24u</v-toolbar-title>
        <v-banner sticky app>
          <v-chip small label close dark v-for="s in selectedStations" :key="s.id" class="ml-2 mr-2" :color="legendColors[s.id]" v-on:click:close="removeFromList(s.id)">
            {{ s.given_name }}
          </v-chip>
        </v-banner>
        <v-row>
          <v-col cols="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.temp" :tooltipPosition="tooltipPosition" updateLegendColors />
          </v-col>
          <v-col cols="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.rainVolume" :tooltipPosition="tooltipPosition"/>
          </v-col>
          <v-col cols="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.pressure" :tooltipPosition="tooltipPosition"/>
          </v-col>
          <v-col cols="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.windSpeed" :tooltipPosition="tooltipPosition"/>
          </v-col>
          <v-col cols="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.humidity" :tooltipPosition="tooltipPosition"/>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import StationsMap from './components/StationsMap.vue';
import StationCard from './components/StationCard.vue';
import GraphCard from './components/GraphCard.vue';

import { weatherProperties } from './app/weatherProperties';
import { Station, Measurement } from './app/types';

@Component({
  components: {
    StationsMap, StationCard, GraphCard
  }
})
export default class App extends Vue {
  private resolveDataLoaded!: Function;
  initialDataLoaded = new Promise((resolve) => { this.resolveDataLoaded = resolve; });
  tooltipPosition = { timestamp: -1, i: -1 };

  created () {
    // fetch data a first time
    const stationsPromise = this.$store.dispatch('fetchStations');
    stationsPromise.then(() => {
      this.$store.dispatch('selectStationById', 'zZ6ZeSg11dJ5zp5GrNwNck9A');
      this.$store.dispatch('selectStationById', 'Do5lLMfezIdmUCzzsE0IwIbE');
      this.$store.dispatch('selectStationById', 'XeIIA97QzN5xxk6AvdzAPquY');
    });
    const measurementsPromise: Promise<Measurement[]> = this.$store.dispatch('fetchMeasurements');

    Promise.all([stationsPromise, measurementsPromise])
      .then((d) => { this.resolveDataLoaded(d); });

    this.scheduleFetch('fetchMeasurements');
    this.scheduleFetch('fetchHistoricMeasurements');
  }

  scheduleFetch (fetch: string) {
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.scheduleFetch(fetch);
        this.$store.dispatch(fetch);
      });
    }, 60000);
  }

  removeFromList (id: string) {
    this.$store.dispatch('deselectStationById', id);
  }

  get weatherProperties () {
    return weatherProperties;
  }

  get legendColors () {
    return this.$store.state.legendColors;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  // when the selected stations are changed, update the historic measurements
  // might eventually move to another component
  @Watch('selectedStations')
  selectedPropertyChanged () {
    this.$store.dispatch('fetchHistoricMeasurements');
  }
}
</script>
