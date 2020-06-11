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
            <StationsMap :measurements="measurements" :dataLoaded="initialDataLoaded" />
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
  measurements: Measurement[] = [];
  measurementsMap: Map<string, Measurement> = new Map();
  private resolveDataLoaded!: Function;
  initialDataLoaded = new Promise((resolve) => { this.resolveDataLoaded = resolve; });

  created () {
    // fetch data a first time
    const stationsPromise = this.$store.dispatch('fetchStations');
    stationsPromise.then(() => {
      this.$store.dispatch('selectStationById', 'zZ6ZeSg11dJ5zp5GrNwNck9A');
      this.$store.dispatch('selectStationById', 'Do5lLMfezIdmUCzzsE0IwIbE');
      this.$store.dispatch('selectStationById', 'XeIIA97QzN5xxk6AvdzAPquY');
    });
    const measurementsPromise = this.fetchMeasurements();
    Promise.all([stationsPromise, measurementsPromise])
      .then((d) => { this.resolveDataLoaded(d); });
    setInterval(this.fetchMeasurements, 60000);
  }

  get selectedStations (): Station[] {
    return this.$store.state.selectedStations;
  }

  get stations (): Station[] {
    return this.$store.state.stations;
  }

  async fetchMeasurements (): Promise<Measurement[]> {
    return fetch('https://mooncake.ugent.be/api/measurements')
      .then(r => r.json())
      .then((ms: Measurement[]) => {
        this.measurements = ms;
        this.measurementsMap = new Map(ms.map(m => [m.id, m]));
        return ms;
      });
  }
}
</script>
