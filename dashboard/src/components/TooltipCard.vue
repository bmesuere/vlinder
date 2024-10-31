<template>
  <v-card rounded="lg" elevation=10>
    <v-list-item lines="two">
      <div class="text-overline" style="line-height: 1rem; font-size: 0.625rem !important;">
        {{ station.name }}
        <span v-if="(measurements as Measurement)['status'] == 'Offline'"> &middot; offline</span>
      </div>
      <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
      <v-list-item-subtitle style="white-space: nowrap; text-overflow: ellipsis; display: block;">
        <span title="school">
          <v-icon size="small" icon="mdi-school-outline"></v-icon>
          {{ station.school }}
        </span>
      </v-list-item-subtitle>
    </v-list-item>

    <v-list density="compact" class="mb-3">
      <v-row>
        <v-col cols="6" class="py-0 pr-0" v-for="p in activeProperties" :key="p.property">
          <v-list-item class="pr-0" style="min-height: 36px;">
            <v-list-item-subtitle :title="p.title" style="font-weight: 500;">
              <v-icon class='mr-1'>{{ p.icon }}</v-icon> {{ (measurements as Measurement)['status'] == "Offline" ? "-" :
                  (measurements as Measurement)[p.property as keyof Measurement]
              }} {{ p.unit }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-col>
      </v-row>
    </v-list>

  </v-card>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';

import { useVlinderStore } from '@/store/app';

import { Station, Measurement, WeatherProperty } from '@/app/types';
import { weatherProperties as wp } from '@/app/weatherProperties';

const props = defineProps({
  station: {
    type: Object as PropType<Station>,
    required: true
  }
});
const vlinderStore = useVlinderStore();

const measurements = computed<Measurement | {}>(() => {
  return (vlinderStore.liveMeasurements as Measurement[]).find(m => m.id === props.station.id) || {};
});

const activeProperties = computed<WeatherProperty[]>(() => {
  // filter the properties where the measurement is null
  return Object.values(wp)
    .filter((p: WeatherProperty) => (measurements.value as Measurement)[p.property as keyof Measurement] !== null);
});
</script>
