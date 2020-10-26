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

    <v-main>
      <v-container>
        <v-alert type="error" outlined v-if="isError">
          Er ging iets fout bij het ophalen van de meetgegevens. Probeer het later opnieuw.
        </v-alert>
        <v-row>
          <v-col cols="12">
            <StationsMap :dataLoaded="initialDataLoaded" />
          </v-col>
        </v-row>
        <StationSelector />
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="3" v-for="s in selectedStations" :key="s.id" >
            <StationCard :station="s" />
          </v-col>
        </v-row>
        <v-toolbar-title class="mt-3 text-h5">Afgelopen 24u</v-toolbar-title>
        <v-banner sticky app class="chip-banner" color="white">
          <v-chip small label close dark v-for="s in selectedStations" :key="s.id" class="ma-1" :color="legendColors[s.id]" v-on:click:close="removeFromList(s.id)">
            {{ s.city }} &middot; {{ s.given_name }}
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
    </v-main>
    <v-footer padless>
      <v-card class="flex blue-grey darken-4" flat tile >
        <v-card-title class="white--text text-body-2 px-8">
          &copy; {{ new Date().getFullYear() }} Universiteit Gent &middot; v{{ version }}
          <v-spacer></v-spacer>
          <v-btn class="mx-4" dark icon href="https://app.swaggerhub.com/apis-docs/bmesuere/VLINDER/" target="_blank">
            <v-icon size="24px">mdi-api</v-icon>
          </v-btn>
          <v-btn class="mx-4" dark icon href="https://github.com/bmesuere/vlinder" target="_blank">
            <v-icon size="24px">mdi-github</v-icon>
          </v-btn>
          <v-btn class="mx-4" dark icon href="https://twitter.com/VLINDER_project" target="_blank">
            <v-icon size="24px">mdi-twitter</v-icon>
          </v-btn>
        </v-card-title>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

import GraphCard from './components/GraphCard.vue';
import StationCard from './components/StationCard.vue';
import StationSelector from './components/StationSelector.vue';
import StationsMap from './components/StationsMap.vue';

import { weatherProperties } from './app/weatherProperties';
import { Station, Measurement } from './app/types';

@Component({
  components: {
    GraphCard, StationCard, StationSelector, StationsMap
  }
})
export default class App extends Vue {
  private resolveDataLoaded!: Function;
  version = '1.0.2'
  initialDataLoaded = new Promise((resolve) => { this.resolveDataLoaded = resolve; });
  tooltipPosition = { timestamp: -1, i: -1 };

  created (): void {
    // fetch data a first time
    const stationsPromise = this.$store.dispatch('fetchStations');
    stationsPromise.then(() => {
      const stationsFromStorage = JSON.parse(window.localStorage.getItem('selectedStations') || '[]') as string[];
      if (stationsFromStorage.length > 0) {
        stationsFromStorage.forEach(s => {
          this.$store.dispatch('selectStationById', s);
        });
      } else {
        this.$store.dispatch('selectStationById', 'zZ6ZeSg11dJ5zp5GrNwNck9A');
        this.$store.dispatch('selectStationById', 'Do5lLMfezIdmUCzzsE0IwIbE');
        this.$store.dispatch('selectStationById', 'XeIIA97QzN5xxk6AvdzAPquY');
      }
    });
    const measurementsPromise: Promise<Measurement[]> = this.$store.dispatch('fetchMeasurements');

    Promise.all([stationsPromise, measurementsPromise])
      .then((d) => { this.resolveDataLoaded(d); });

    this.scheduleFetch('fetchMeasurements');
    this.scheduleFetch('fetchHistoricMeasurements');
  }

  scheduleFetch (fetch: string): void {
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.scheduleFetch(fetch);
        this.$store.dispatch(fetch);
      });
    }, 60000);
  }

  removeFromList (id: string): void {
    this.$gtag.event('station_deselect', { event_category: 'stations', value: id });
    this.$store.dispatch('deselectStationById', id);
  }

  // eslint-disable-next-line
  get weatherProperties () {
    return weatherProperties;
  }

  get legendColors (): String[] {
    return this.$store.state.legendColors;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  get isError (): boolean {
    return this.$store.state.isStationsError || this.$store.state.isMeasurementsError;
  }

  // when the selected stations are changed, update the historic measurements
  // might eventually move to another component
  @Watch('selectedStations')
  selectedPropertyChanged (): void {
    this.$store.dispatch('fetchHistoricMeasurements');
    window.localStorage.setItem('selectedStations', JSON.stringify(this.selectedStations.map(s => s.id)));
  }
}
</script>

<style>
  .chip-banner .v-banner__wrapper {
    padding: 0 !important;
  }
</style>
