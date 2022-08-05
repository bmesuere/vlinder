<template>
  <v-container>
    <v-alert type="error" outlined v-if="isError">
      Er ging iets fout bij het ophalen van de meetgegevens. Probeer het later opnieuw.
    </v-alert>
    <v-row>
      <v-col cols="12">
        <StationsMap :dataLoaded="initialDataLoaded" />
      </v-col>
    </v-row>
    <v-toolbar class="mt-n4" flat>
      <v-toolbar-title class="text-h5 ml-n4">Geselecteerde stations</v-toolbar-title>
      <v-spacer></v-spacer>
      <StationSelector />
    </v-toolbar>
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
      <v-col cols="12" md="6" lg="4" >
        <GraphCard :weatherProperty="weatherProperties.wbgt" :tooltipPosition="tooltipPosition"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { mapStores } from 'pinia';

import { useVlinderStore } from '@/stores';

import GraphCard from '../components/GraphCard.vue';
import StationCard from '../components/StationCard.vue';
import StationSelector from '../components/StationSelector.vue';
import StationsMap from '../components/StationsMap.vue';

import { weatherProperties } from '../app/weatherProperties';
import { Station, Measurement } from '../app/types';

@Component({
  components: {
    GraphCard, StationCard, StationSelector, StationsMap
  },
  computed: {
    ...mapStores(useVlinderStore)
  }
})
export default class Dashboard extends Vue {
  @Prop() urlStations!: string[];

  private resolveDataLoaded!: Function;
  initialDataLoaded = new Promise((resolve) => { this.resolveDataLoaded = resolve; });
  tooltipPosition = { timestamp: -1, i: -1 };
  vlinderStore: any;

  created (): void {
    // fetch data a first time
    const stationsPromise = this.vlinderStore.fetchStations();
    stationsPromise.then(() => {
      const stationsFromStorage = JSON.parse(window.localStorage.getItem('selectedStations') || '[]') as string[];
      if (this.urlStations.length > 0) {
        this.urlStations.forEach(s => {
          this.vlinderStore.selectStationByName(s);
        });
      } else if (stationsFromStorage.length > 0) {
        stationsFromStorage.forEach(s => {
          this.vlinderStore.selectStationById(s);
        });
      } else {
        this.vlinderStore.selectStationById('zZ6ZeSg11dJ5zp5GrNwNck9A');
        this.vlinderStore.selectStationById('Do5lLMfezIdmUCzzsE0IwIbE');
        this.vlinderStore.selectStationById('XeIIA97QzN5xxk6AvdzAPquY');
      }
    });
    const measurementsPromise: Promise<Measurement[]> = this.vlinderStore.fetchMeasurements();

    Promise.all([stationsPromise, measurementsPromise])
      .then((d) => { this.resolveDataLoaded(d); });

    this.scheduleFetch(this.vlinderStore.fetchMeasurement);
    this.scheduleFetch(this.vlinderStore.fetchHistoricMeasurements);
  }

  scheduleFetch (fetch: Function): void {
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.scheduleFetch(fetch);
        fetch();
      });
    }, 60000);
  }

  removeFromList (id: string): void {
    this.$gtag.event('station_deselect', { event_category: 'stations', value: id });
    this.vlinderStore.deselectStationById(id);
  }

  // eslint-disable-next-line
  get weatherProperties () {
    return weatherProperties;
  }

  get legendColors (): String[] {
    return this.vlinderStore.legendColors;
  }

  get selectedStations (): Station[] {
    return this.vlinderStore.selectedStations;
  }

  get isError (): boolean {
    return this.vlinderStore.isStationsError || this.vlinderStore.isMeasurementsError;
  }

  // when the selected stations are changed, update the historic measurements
  // might eventually move to another component
  @Watch('selectedStations')
  async selectedPropertyChanged (): Promise<void> {
    this.vlinderStore.fetchHistoricMeasurements();

    // set the query parameter
    const query = Object.assign({}, this.$route.query);
    query.stations = this.selectedStations.map(s => s.name);
    await this.$router.replace({ query });

    // set the history in local storage
    window.localStorage.setItem('selectedStations', JSON.stringify(this.selectedStations.map(s => s.id)));
  }
}
</script>

<style>
  .chip-banner .v-banner__wrapper {
    padding: 0 !important;
  }
</style>
