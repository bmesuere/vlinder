<template>
  <v-app>
    <v-app-bar app color="primary" dark dense>
      <v-toolbar-title>VLINDER</v-toolbar-title>

      <v-spacer />

      <v-btn href="http://vlinder.ugent.be" target="_blank" text >
        <span class="mr-2">VLINDER website</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container>
        <v-row>
          <v-col sm="12" md="10" offset-md="1">
            <StationsMap :stations="stations" :selectedStations="selectedStations" />
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="6" md="4" lg="3" v-for="s in selectedStations" :key="s.id" >
            <StationCard :station="s" :measurements="measurementsMap.get(s.id) || {}" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import StationsMap from './components/StationsMap.vue';
import StationCard from './components/StationCard.vue';
import { Station, Measurement } from './app/types';

@Component({
  components: {
    StationsMap, StationCard
  }
})
export default class App extends Vue {
  stations: Station[] = [];
  selectedStations: Station[] = [];
  measurementsMap: Map<string, Measurement> = new Map();

  created () {
    fetch('https://mooncake.ugent.be/api/stations')
      .then(r => r.json())
      .then((s: Station[]) => {
        this.stations = s;
        this.selectedStations.push(s[0], s[1]);
      });
    fetch('https://mooncake.ugent.be/api/measurements')
      .then(r => r.json())
      .then((ms: Measurement[]) => { this.measurementsMap = new Map(ms.map(m => [m.id, m])); });
  }
}
</script>
