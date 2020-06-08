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
            <StationsMap />
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="3" v-for="s in stations" :key="s.id" >
            <StationCard :station="s" />
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
import { Station } from './app/types';

@Component({
  components: {
    StationsMap, StationCard
  }
})
export default class App extends Vue {
  stations: Station[] = [];

  mounted () {
    fetch('https://mooncake.ugent.be/api/stations')
      .then(r => r.json())
      .then(s => { this.stations.push(s[0]); });
  }
}
</script>
