<template>
  <v-card rounded="lg">
    <v-btn position="absolute"  right="0" size="x-small" elevation="3" class="close mr-n3 mt-1" v-on:click="removeFromList" icon="mdi-close">
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

      <v-carousel-item>
        <v-img
          aspect-ratio="2.3137254902"
          :src="sponsorUrl"
          lazy-src="data:image/png;base64,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"
        />
      </v-carousel-item>
    </v-carousel>

    <v-list-item lines="three" class="pb-0">
      <div class="text-overline" style="line-height: 1rem; font-size: 0.625rem !important;">
        {{ station.name }}
        <span v-if="(measurements as Measurement)['status'] == 'Offline'"> &middot; offline</span>
      </div>
      <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
      <v-list-item-subtitle>
        <span title="Betrokken school">
          <v-icon size="small" icon="mdi-school-outline" class="mr-1"></v-icon>
          <span>{{ station.school }}</span>
        </span>
        <br>
        <span title="Sponsor" style="display: inline-block" class="mt-1">
          <v-icon size="small" icon="mdi-heart-outline" class="mr-1"></v-icon>
          <span v-if="station.sponsor !== ''" >
            {{ station.sponsor }}
          </span>
          <a v-else href="mailto:vlinder@ugent.be">
            Dit station sponsoren?
          </a>
        </span>
      </v-list-item-subtitle>
    </v-list-item>

    <v-list density="compact">
      <v-list-item v-for="p in activeProperties" :key="p.property" class="pb-0 pt-0">
        <v-list-item-subtitle :title="p.title" class="font-weight-medium" style="font-size: .8125rem"><v-icon size="large" class='mr-1' :icon="p.icon"></v-icon> {{ p.name }}</v-list-item-subtitle>
        <template v-slot:append>
          <v-list-item-title class="font-weight-medium" style="font-size: .8125rem">
            {{
              (measurements as Measurement)['status'] === 'Offline'
                ? '-'
                : (measurements as Measurement)[p.property as keyof Measurement] ?? '-'
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
const sponsorUrl = computed<string>(() => `./img/sponsors/${props.station.name}.png`);
const measurements = computed<Measurement | {}>(() => {
  return (vlinderStore.liveMeasurements as Measurement[]).find(m => m.id === props.station.id) || {};
});
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
