<template>
  <v-card rounded="lg">
    <v-btn position="absolute" size="x-small" elevation="3" class="close mr-n3 mt-1 right-0" @click="removeFromList" icon="mdi-close">
    </v-btn>
    <v-carousel
      hide-delimiters
      height="auto"
      show-arrows="hover"
      theme="dark"
    >
      <v-carousel-item>
        <v-img
          aspect-ratio="2.3137254902"
          :src="mapUrl"
          lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAICAYAAAD0g6+qAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAAqACAAQAAAABAAAAEqADAAQAAAABAAAACAAAAAAMC9jHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABgklEQVQoFR2R2Y7UMBREjx0nzjJJjxCDhHji/78FCfEDPCEkpO6h6cTZvFAzD5bspFxV99h8//GtWGOwNER2rK0Y+wlM4npbuIw93reENZBTxlhpbcaaLI1lWWZymXG/7j8xsvh8+QrJE0vmkWZSzpR0SDxgKwuF95Dz3NnjH6wLdM0XfWt0/wlbZLLFjZgTpRQZJNZtw1WVDBxhCdyuN7ZjxTjoupZUdmkiKdZ0bc1xPHAmerV5Yewm5nnDN56UkuIrrUQIC87V1L5i3WdqWnr/iZIPGuc500rdgHuZJrkroX6lbZ85j/g+SgwBs2+006g0jWagsk5Y1NQ0nPGVI50azbMfATcMhb/rg9//Dj62nlozJ0GVAquzlclxRqWKhXkzyRrtzhKugv8sVh90VqOcT6b2QlHNwT+RYxKPXawilaDs9ztd32kvfvEQz6g2pxiqnWsVEvRPjYrZqesR4kjfdkSJYop60pNGw0ddfFtZ+02PUDdWeqOgQYwG+rqXsec/ZLXPWAALVrMAAAAASUVORK5CYII="
        />
      </v-carousel-item>
      <v-carousel-item>
        <LandUseGraph :station="station" />
      </v-carousel-item>

    </v-carousel>

    <v-list-item lines="three" class="pb-0">
      <div class="text-overline" style="line-height: 1rem; font-size: 0.625rem !important;">
        {{ station.name }}
        <span v-if="typedMeasurements['status'] == 'Offline'"> &middot; offline</span>
      </div>
      <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
      <v-list-item-subtitle>
        <span title="Betrokken school">
          <v-icon size="small" icon="mdi-school-outline" class="mr-1"></v-icon>
          <span>{{ station.school }}</span>
        </span>
      </v-list-item-subtitle>
    </v-list-item>

    <v-list density="compact">
      <v-list-item v-for="p in activeProperties" :key="p.property" class="pb-0 pt-0">
        <v-list-item-subtitle :title="p.title" class="font-weight-medium" style="font-size: .8125rem"><v-icon size="large" class='mr-1' :icon="p.icon"></v-icon> {{ p.name }}</v-list-item-subtitle>
        <template v-slot:append>
          <v-list-item-title class="font-weight-medium" style="font-size: .8125rem">
            {{
              typedMeasurements['status'] === 'Offline'
                ? '-'
                : typedMeasurements[p.property as keyof Measurement] ?? '-'
            }} {{ p.unit }}
          </v-list-item-title>
        </template>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<style>
  .v-window__controls {
    align-items: end !important;
  }
  .v-window__left, .v-window__right {
    margin-bottom: 12px;
    background-color: rgba(0,0,0,.3);
    color: white;
    width: 36px !important;
    height: 36px !important;
  }
  .v-btn.close {
    right: 16px;
    z-index: 1;
  }
  .right-0 {
    right: 0;
  }
  svg {
    display: block;
  }
</style>

<script setup lang="ts">
import { computed, PropType } from 'vue';

import { useVlinderStore } from '@/store/app';

import { useGtag } from 'vue-gtag-next';

import LandUseGraph from './LandUseGraph.vue';

import { Station, Measurement, WeatherProperty } from '@/app/types';
import { weatherProperties as wp } from '@/app/weatherProperties';

const props = defineProps({
  station: {
    type: Object as PropType<Station>,
    required: true
  }
});

const vlinderStore = useVlinderStore();

const mapUrl = computed<string>(() => `./img/maps/${props.station.name}.png`);
const measurements = computed<Measurement | Record<string, unknown>>(() => {
  return (vlinderStore.liveMeasurements as Measurement[]).find(m => m.id === props.station.id) || {};
});

const typedMeasurements = computed<Measurement | Record<string, unknown>>(() => {
    return measurements.value;
})

const activeProperties = computed<WeatherProperty[]>(() => {
  // filter the properties where the measurement is null
  return Object.values(wp)
    .filter((p: WeatherProperty) => (measurements.value as Measurement)[p.property as keyof Measurement] !== null);
});

function removeFromList() {
  const { event } = useGtag()
  event('station_deselect', { event_category: 'stations', value: props.station.id });
  vlinderStore.deselectStationById(props.station.id);
}
</script>
