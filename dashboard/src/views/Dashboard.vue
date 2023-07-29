<template>
  <v-container>
    <v-alert type="error" variant='outlined' v-if="isError">
      Er ging iets fout bij het ophalen van de meetgegevens. Probeer het later opnieuw.
    </v-alert>

    <v-row>
      <v-col cols="12">
        <StationsMap :dataLoaded="initialDataLoaded as any" />
      </v-col>
    </v-row>

    <v-toolbar class="mt-n4" variant="flat" color="white">
      <v-toolbar-title class="text-h5 ml-0">Geselecteerde stations</v-toolbar-title>
      <v-spacer></v-spacer>
      <StationSelector />
    </v-toolbar>

    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="s in selectedStations" :key="s.id" >
        <StationCard :station="s" />
      </v-col>
    </v-row>

    <v-toolbar-title class="mt-5 text-h5">Afgelopen 24u</v-toolbar-title>

    <v-banner sticky class="chip-banner" color="white" style="top:40px; z-index:10;">
      <v-chip size="small" label closable v-for="s in selectedStations" :key="s.id" class="ma-1" :color="legendColors[s.id]" v-on:click:close="removeFromList(s.id)">
        {{ s.city }} &middot; {{ s.given_name }}
      </v-chip>
    </v-banner>

    <v-row class="mt-4">
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

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useVlinderStore } from '@/store/app';

import GraphCard from '@/components/GraphCard.vue';
import StationSelector from '@/components/StationSelector.vue';
import StationCard from '@/components/StationCard.vue';
import StationsMap from '@/components/StationsMap.vue';

import { useGtag } from 'vue-gtag-next';

import { weatherProperties as wp } from '../app/weatherProperties';

import { Measurement } from '@/app/types';

const props = defineProps({
  urlStations: {
      type: Array<string>,
      default: () => []
    }
});

const vlinderStore = useVlinderStore();
const router = useRouter();
const route = useRoute();

let resolveDataLoaded : Function;
const initialDataLoaded = ref(new Promise((resolve) => { resolveDataLoaded = resolve; }));
const tooltipPosition = ref({ timestamp: -1, i: -1 });

const weatherProperties = computed(() => {
  return wp;
});

const legendColors = computed(() => {
  return vlinderStore.legendColors;
});

const selectedStations = computed(() => {
  return vlinderStore.selectedStations;
});

const isError = computed(() => {
  return vlinderStore.isStationsError || vlinderStore.isMeasurementsError;
});

const stationsFromStorage = JSON.parse(window.localStorage.getItem('selectedStations') || '[]') as string[];
// fetch data a first time
const stationsPromise = vlinderStore.fetchStations();

stationsPromise.then(() => {
  let stationsSelected = false;
  if (props.urlStations.length > 0) {
    props.urlStations.forEach(s => {
      const wasAdded = vlinderStore.selectStationByName(s);
      stationsSelected ||= wasAdded;
    });
  }
  if (!stationsSelected && stationsFromStorage.length > 0) {
    stationsFromStorage.forEach(s => {
      const wasAdded = vlinderStore.selectStationById(s);
      stationsSelected ||= wasAdded;
    });
  }
  if (!stationsSelected) {
    vlinderStore.selectStationById('zZ6ZeSg11dJ5zp5GrNwNck9A');
    vlinderStore.selectStationById('Do5lLMfezIdmUCzzsE0IwIbE');
    vlinderStore.selectStationById('XeIIA97QzN5xxk6AvdzAPquY');
  }
});

const measurementsPromise: Promise<Measurement[]> = vlinderStore.fetchMeasurements();

Promise.all([stationsPromise, measurementsPromise])
  .then((d) => { resolveDataLoaded(d); });

scheduleFetch(vlinderStore.fetchMeasurements);
scheduleFetch(vlinderStore.fetchHistoricMeasurements);

watch(selectedStations, async () => {
  vlinderStore.fetchHistoricMeasurements();

  // set the query parameter
  const query = Object.assign({}, route.query);
  query.stations = selectedStations.value.map(s => s.name);
  await router.replace({ query });

  // set the history in local storage
  window.localStorage.setItem('selectedStations', JSON.stringify(selectedStations.value.map(s => s.id)));
}, { deep: true });

function scheduleFetch(f: Function): void {
  setTimeout(() => {
    requestAnimationFrame(() => {
      scheduleFetch(f);
      f();
    });
  }, 60000);
}
function removeFromList (id: string): void {
  const { event } = useGtag()
  event('station_deselect', { event_category: 'stations', value: id });
  vlinderStore.deselectStationById(id);
}
</script>
