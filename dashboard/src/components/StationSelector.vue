<template>
  <v-card class="mx-auto" max-width="500">
    <v-text-field
      v-model="search" label="Filter stations" prepend-inner-icon="mdi-magnify"
      hide-details
      autofocus
      clearable
    >
    </v-text-field>
    <v-card-text>
      <v-treeview
        :items="stations"
        :search="search"
        :filter="filter"
        activatable
        hoverable
        multiple-active
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
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import { Station } from '../app/types';

@Component
export default class StationSelector extends Vue {
  search = '';

  filter (station: Station, query: string) {
    const searchKey = station.city + station.given_name + station.name + station.sponsor + station.school;
    return searchKey.toLowerCase().includes(query.toLowerCase());
  }

  get stations (): Station[] {
    return this.$store.state.stations;
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }
}
</script>
