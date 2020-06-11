<template>
  <v-card>
    <v-btn fab absolute right x-small elevation="3" class="mr-n2 mt-1" v-on:click="removeFromList">
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-img
      :src="require('../assets/maps/' + station.name + '.png')"
    />

    <v-list-item three-line>
      <v-list-item-content>
        <div class="overline mb-2">{{ station.name }}</div>
        <v-list-item-title class="mb-1">{{ station.given_name }}</v-list-item-title>
        <v-list-item-subtitle>{{ station.city }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list dense subheader>
      <v-list-item v-for="p in weatherProperties" :key="p.property">
        <v-list-item-subtitle><v-icon class='pr-1'>{{ p.icon }}</v-icon> {{ p.name }}</v-list-item-subtitle>
        <v-list-item-title class="text-right">{{ measurements[p.property] }} {{ p.unit }}</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Station } from '../app/types';
import { weatherProperties as wp } from '../app/weatherProperties';

@Component
export default class StationCard extends Vue {
  @Prop() station!: Station
  @Prop() measurements!: any

  weatherProperties = wp;

  removeFromList () {
    this.$store.dispatch('deselectStationById', this.station.id);
  }
}
</script>
