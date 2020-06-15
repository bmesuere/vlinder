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
          <v-col sm="12" md="10" offset-md="1">
            <StationsMap :dataLoaded="initialDataLoaded" />
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="6" md="4" lg="3" v-for="s in selectedStations" :key="s.id" >
            <StationCard :station="s" />
          </v-col>
        </v-row>
        <v-toolbar-title class="mt-3">Afgelopen 24u</v-toolbar-title>
        <v-row>
          <v-col sm="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.temp"/>
          </v-col>
          <v-col sm="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.rainVolume"/>
          </v-col>
          <v-col sm="12" md="6" lg="4" >
            <GraphCard :weatherProperty="weatherProperties.windSpeed"/>
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

  get weatherProperties () {
    return weatherProperties;
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
