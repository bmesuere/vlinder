<template>
  <v-card>
    <v-img
      :src="require('../assets/vlinder01.png')"
    />

    <v-list-item three-line>
      <v-list-item-content>
        <div class="overline mb-2">{{ station.name }}</div>
        <v-list-item-title class="mb-1">{{ station.given_name }}</v-list-item-title>
        <v-list-item-subtitle>{{ station.city }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list dense subheader>
      <v-list-item>
        <v-list-item-subtitle><v-icon class='pr-1'>mdi-thermometer</v-icon> Temperatuur</v-list-item-subtitle>
        <v-list-item-title class="text-right">28.3 °C</v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-subtitle><v-icon class='pr-1'>mdi-weather-rainy</v-icon> Neerslag</v-list-item-subtitle>
        <v-list-item-title class="text-right">7 l/m²</v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-subtitle><v-icon class='pr-1'>mdi-weather-windy</v-icon> Windsnelheid</v-list-item-subtitle>
        <v-list-item-title class="text-right">45 km/u</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Station } from '../app/types';

@Component
export default class StationCard extends Vue {
  @Prop() station!: Station

  mounted () {
    //
  }
}
</script>
