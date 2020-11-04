<template>
  <v-dialog
    v-model="dialog"
    scrollable
    max-width="500"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="primary"
        dark
        v-bind="attrs"
        v-on="on"
      >
        Selecteer stations
      </v-btn>
    </template>
    <v-card class="mx-auto" max-width="500">
      <v-card-title><v-text-field
        v-model="search" label="Typ om te filteren" prepend-inner-icon="mdi-magnify"
        hide-details
        autofocus
        clearable
      >
      </v-text-field>

      </v-card-title>

      <v-card-text style="height: 300px;">
        <v-treeview
          v-on:update:active="selectStation"
          :items="stations"
          :search="search"
          :filter="filter"
          :active="activeStations"
          activatable
          hoverable
          multiple-active
          open-on-click
        >
          <template v-slot:label="{ item }">
            {{ item.city + " &middot; " + item.given_name }}
          </template>
          <template v-slot:prepend="{ active }">
            <v-icon >
              {{ active ? 'mdi-check-box-outline' : 'mdi-checkbox-blank-outline' }}
            </v-icon>
          </template>
        </v-treeview>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          text
          @click="dialog = false"
        >
          Sluiten
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';

import { Station } from '../app/types';

@Component
export default class StationSelector extends Vue {
  dialog = false;
  search = '';
  activeStations: string[] = [];

  filter (station: Station, query: string): boolean {
    const searchKey = station.city + station.given_name + station.name + station.sponsor + station.school;
    return searchKey.toLowerCase().includes(query.toLowerCase());
  }

  selectStation (stations: string[]): void {
    const addedStations = stations.filter(s => !this.activeStations.includes(s));
    const removeStations = this.activeStations.filter(s => !stations.includes(s));
    addedStations.forEach(station => {
      this.$store.dispatch('selectStationById', station);
    });
    removeStations.forEach(station => {
      this.$store.dispatch('deselectStationById', station);
    });
  }

  get stations (): Station[] {
    return this.$store.state.stations;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  @Watch('selectedStations')
  selectedStationsChanged (): void {
    this.activeStations = this.selectedStations.map(d => d.id);
  }
}
</script>
