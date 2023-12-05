
<template>
  <v-dialog v-model="dialog" scrollable max-width="500" transition="slide-y-reverse-transition">
    <template v-slot:activator="{ props }">
      <v-btn class="mr-0" variant="tonal" rounded="xl" color="primary" size="large" v-bind="props">
        <v-icon left dark>mdi-magnify</v-icon>
        <span class="d-none d-sm-inline">Selecteer stations</span>
      </v-btn>
    </template>

    <v-card rounded="lg" class="mx-auto" max-width="500" min-width="500">
      <v-card-title>
        <v-text-field v-model="search" label="Typ om te filteren" prepend-inner-icon="mdi-magnify" variant="underlined" color="primary" hide-details
          autofocus clearable>
        </v-text-field>

      </v-card-title>

      <v-card-text style="height: 300px;">
        <v-list lines="two" select-strategy="classic" active-color="primary" v-model:selected="activeStations" v-on:update:selected="selectStation">

          <v-list-item v-for="station in filteredStations" :value="station.id">
            <template v-slot:prepend="{ isActive }">
              <v-list-item-action start>
                <v-checkbox-btn :model-value="isActive"></v-checkbox-btn>
              </v-list-item-action>
            </template>
            <v-list-item-title>
              {{ station.city + " &middot; " + station.given_name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <span v-if="station.sponsor !== ''" title="sponsor">
                {{ station.sponsor }}
                &middot;
              </span>
              <span title="school">
                {{ station.school }}
              </span>
            </v-list-item-subtitle>
          </v-list-item>

        </v-list>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="flex-row-reverse">
        <v-btn color="blue darken-1" @click="dialog = false" rounded="xl">
          Sluiten
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useVlinderStore } from '@/store/app';

import { Station } from '@/app/types';

const dialog = ref(false);
const search = ref('');
const activeStations = ref<string[]>([]);

const vlinderStore = useVlinderStore();

const stations = computed<Station[]>(() => vlinderStore.stations);
const selectedStations = computed<Station[]>(() => vlinderStore.selectedStations);

const filteredStations = computed<Station[]>(() => {
  return stations.value.filter(s => filter(s, search.value));
});

function filter (station: Station, query: string): boolean {
  const searchKey = station.city + station.given_name + station.name + station.sponsor + station.school;
  return searchKey.toLowerCase().includes((query|| "").toLowerCase());
}

function selectStation (): void {
  const selectedIds = selectedStations.value.map(s => s.id);
  const activeIds = activeStations.value as string[];
  const removeStations = selectedIds.filter(s => !activeIds.includes(s));
  const addedStations = activeIds.filter(s => !selectedIds.includes(s));
  addedStations.forEach(station => {
    vlinderStore.selectStationById(station);
  });
  removeStations.forEach(station => {
    vlinderStore.deselectStationById(station);
  });
}

watch(selectedStations, () => {
  activeStations.value = selectedStations.value.map(s => s.id);
}, { deep: true });

</script>
