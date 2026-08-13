<template>
  <v-card rounded="lg" elevation="5">
    <v-list-item lines="two">
      <div class="text-label-medium text-uppercase" style="line-height: 1rem; font-size: 0.625rem !important;">
        {{ station.name }}
        <span v-if="typedMeasurements['status'] == 'Offline'"> &middot; offline</span>
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
      <!--
        Two-up list of readings. On Vuetify 3 the tight layout came from
        cancelling the grid's column padding (py-0 pr-0) against the row's
        negative margins. Vuetify 4's grid has no padding/negative margins -
        spacing is a CSS `gap` on the row - so those utility classes are
        no-ops there and the default 24px gap would push the card ~50px
        taller. `gap="[12, 0]"` reproduces the old spacing: 12px between the
        two columns, nothing between the rows, and `my-n3` stands in for the
        -12px vertical margins Vuetify 3's row applied by itself.
      -->
      <v-row :gap="[12, 0]" class="my-n3">
        <v-col cols="6" v-for="p in activeProperties" :key="p.property">
          <v-list-item class="pr-0" style="min-height: 36px;">
            <v-list-item-subtitle :title="p.title" style="font-weight: 500;">
              <v-icon class='mr-1'>{{ p.icon }}</v-icon> {{ typedMeasurements['status'] == "Offline" ? "-" :
                  typedMeasurements[p.property as keyof Measurement]
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
</script>
