<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';

import { useVlinderStore } from '@/stores';

import { Station } from '@/app/types';

export default defineComponent({
  name: 'StationSelector',
  setup (_props, _context) {
    const dialog = ref(false);
    const search = ref('');
    const activeStations = ref<string[]>([]);

    const vlinderStore = useVlinderStore();

    const stations = computed<Station[]>(() => vlinderStore.stations);
    const selectedStations = computed<Station[]>(() => vlinderStore.selectedStations);

    function filter (station: Station, query: string): boolean {
      const searchKey = station.city + station.given_name + station.name + station.sponsor + station.school;
      return searchKey.toLowerCase().includes(query.toLowerCase());
    }

    function selectStation (stations: string[]): void {
      const addedStations = stations.filter(s => !activeStations.value.includes(s));
      const removeStations = activeStations.value.filter(s => !stations.includes(s));
      addedStations.forEach(station => {
        vlinderStore.selectStationById(station);
      });
      removeStations.forEach(station => {
        vlinderStore.deselectStationById(station);
      });
    }

    watch(selectedStations, () => {
      console.log('watch triggered');
      activeStations.value = selectedStations.value.map(s => s.id);
    }, { deep: true });

    return {
      dialog,
      search,
      activeStations,
      stations,
      selectedStations,
      filter,
      selectStation
    };
  }
});
</script>

<template>
  <v-dialog v-model="dialog" scrollable max-width="500" transition="dialog-bottom-transition">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on">
        Selecteer stations
      </v-btn>
    </template>
    <v-card class="mx-auto" max-width="500">
      <v-card-title>
        <v-text-field v-model="search" label="Typ om te filteren" prepend-inner-icon="mdi-magnify" hide-details
          autofocus clearable>
        </v-text-field>

      </v-card-title>

      <v-card-text style="height: 300px;">
        <v-treeview v-on:update:active="selectStation" :items="stations" :search="search" :filter="filter"
          :active="activeStations" activatable hoverable multiple-active open-on-click>
          <template v-slot:label="{ item }">
            {{ item.city + " &middot; " + item.given_name }}
          </template>
          <template v-slot:prepend="{ active }">
            <v-icon>
              {{ active ? 'mdi-checkbox-outline' : 'mdi-checkbox-blank-outline' }}
            </v-icon>
          </template>
        </v-treeview>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">
          Sluiten
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
