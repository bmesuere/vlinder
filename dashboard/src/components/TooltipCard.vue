<template>
  <v-card elevation=10>
    <v-list-item two-line>
      <v-list-item-content class="pb-2">
        <div class="text-overline font-weight-regular mb-1" style="line-height: 1rem; font-size: 0.625rem !important;">{{ station.name }}</div>
        <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span v-if="station.sponsor !== ''" title="sponsor">
            <v-icon small>mdi-heart-outline</v-icon>
            {{ station.sponsor }}
            &middot;
          </span>
          <span title="school">
            <v-icon small>mdi-school-outline</v-icon>
            {{ station.school }}
          </span>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list subheader class="px-2">
      <v-row dense>
      <v-col cols="6" class="pa-0" v-for="p in activeProperties" :key="p.property">
        <v-list-item dense class="px-2" style="min-height: 36px;">
            <v-list-item-subtitle :title="p.name"><v-icon class='pr-1'>{{ p.icon }}</v-icon> {{ measurements['status'] == "Offline" ? "-" : measurements[p.property] }} {{ p.unit }}</v-list-item-subtitle>
        </v-list-item>
      </v-col>
      </v-row>
    </v-list>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Station, Measurement, WeatherProperty } from '../app/types';
import { weatherProperties as wp } from '../app/weatherProperties';

@Component
export default class TooltipCard extends Vue {
  @Prop() station!: Station;

  get measurements (): Measurement | {} {
    return (this.$store.state.liveMeasurements as Measurement[]).find(m => m.id === this.station.id) || {};
  }

  get activeProperties (): WeatherProperty[] {
    // filter the properties where the measurement is null
    return Object.values(wp)
      // @ts-ignore
      .filter((p: WeatherProperty) => this.measurements[p.property as any] !== null);
  }
}
</script>
