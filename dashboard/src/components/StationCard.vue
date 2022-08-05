<template>
  <v-card>
    <v-btn fab absolute right x-small elevation="3" class="mr-n3 mt-1" v-on:click="removeFromList">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-carousel
      hide-delimiters
      height="auto"
      dark
      show-arrows-on-hover
    >
      <v-carousel-item>
        <v-img
          aspect-ratio="2.3137254902"
          :src="mapUrl"
          lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAICAYAAAD0g6+qAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAAqACAAQAAAABAAAAEqADAAQAAAABAAAACAAAAAAMC9jHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABgklEQVQoFR2R2Y7UMBREjx0nzjJJjxCDhHji/78FCfEDPCEkpO6h6cTZvFAzD5bspFxV99h8//GtWGOwNER2rK0Y+wlM4npbuIw93reENZBTxlhpbcaaLI1lWWZymXG/7j8xsvh8+QrJE0vmkWZSzpR0SDxgKwuF95Dz3NnjH6wLdM0XfWt0/wlbZLLFjZgTpRQZJNZtw1WVDBxhCdyuN7ZjxTjoupZUdmkiKdZ0bc1xPHAmerV5Yewm5nnDN56UkuIrrUQIC87V1L5i3WdqWnr/iZIPGuc500rdgHuZJrkroX6lbZ85j/g+SgwBs2+006g0jWagsk5Y1NQ0nPGVI50azbMfATcMhb/rg9//Dj62nlozJ0GVAquzlclxRqWKhXkzyRrtzhKugv8sVh90VqOcT6b2QlHNwT+RYxKPXawilaDs9ztd32kvfvEQz6g2pxiqnWsVEvRPjYrZqesR4kjfdkSJYop60pNGw0ddfFtZ+02PUDdWeqOgQYwG+rqXsec/ZLXPWAALVrMAAAAASUVORK5CYII="
        />
      </v-carousel-item>
      <v-carousel-item>
        <LandUseGraph :station="station" />
      </v-carousel-item>

      <v-carousel-item>
        <v-img
          aspect-ratio="2.3137254902"
          :src="sponsorUrl"
          lazy-src="data:image/png;base64,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"
        />
      </v-carousel-item>
    </v-carousel>

    <v-list-item three-line>
      <v-list-item-content class="pb-1">
        <div class="text-overline font-weight-regular mb-2" style="line-height: 1rem; font-size: 0.625rem !important;">{{ station.name }}</div>
        <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span title="Betrokken school">
            <v-icon small>mdi-school-outline</v-icon>
            {{ station.school }}
          </span>
          <br>
          <span title="Sponsor" style="display: inline-block" class="mt-1">
            <v-icon small>mdi-heart-outline</v-icon>
            <span v-if="station.sponsor !== ''" >
              {{ station.sponsor }}
            </span>
            <a v-else hfref="mailto:vlinder@ugent.be">
              Dit station sponsoren?
            </a>
          </span>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list dense subheader>
      <v-list-item v-for="p in activeProperties" :key="p.property">
        <v-list-item-subtitle :title="p.name"><v-icon class='pr-1'>{{ p.icon }}</v-icon> {{ p.name }}</v-list-item-subtitle>
        <v-list-item-title class="text-right">{{ measurements['status'] == "Offline" ? "-" : measurements[p.property] }} {{ p.unit }}</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { mapStores } from 'pinia';

import { useVlinderStore } from '@/stores';

import LandUseGraph from './LandUseGraph.vue';

import { Station, Measurement, WeatherProperty } from '../app/types';
import { weatherProperties as wp } from '../app/weatherProperties';

@Component({
  components: { LandUseGraph },
  computed: {
    ...mapStores(useVlinderStore)
  }
})
export default class StationCard extends Vue {
  @Prop() station!: Station;
  vlinderStore: any;

  removeFromList ():void {
    this.$gtag.event('station_deselect', { event_category: 'stations', value: this.station.id });
    this.vlinderStore.deselectStationById(this.station.id);
  }

  get mapUrl (): string {
    return `./img/maps/${this.station.name}.png`;
  }

  get sponsorUrl (): string {
    return `./img/sponsors/${this.station.name}.png`;
  }

  get measurements (): Measurement | {} {
    return (this.vlinderStore.liveMeasurements as Measurement[]).find(m => m.id === this.station.id) || {};
  }

  get activeProperties (): WeatherProperty[] {
    // filter the properties where the measurement is null
    return Object.values(wp)
      // @ts-ignore
      .filter((p: WeatherProperty) => this.measurements[p.property as any] !== null);
  }
}
</script>

<style>
  .v-window__prev, .v-window__next {
    top: calc(100% - 50px);
  }
</style>
