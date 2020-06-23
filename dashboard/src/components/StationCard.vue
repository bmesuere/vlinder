<template>
  <v-card>
    <v-btn fab absolute right x-small elevation="3" class="mr-n3 mt-1" v-on:click="removeFromList">
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-img
      aspect-ratio="2.3137254902"
      :src="imgUrl"
      lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAICAYAAAD0g6+qAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAAqACAAQAAAABAAAAEqADAAQAAAABAAAACAAAAAAMC9jHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABgklEQVQoFR2R2Y7UMBREjx0nzjJJjxCDhHji/78FCfEDPCEkpO6h6cTZvFAzD5bspFxV99h8//GtWGOwNER2rK0Y+wlM4npbuIw93reENZBTxlhpbcaaLI1lWWZymXG/7j8xsvh8+QrJE0vmkWZSzpR0SDxgKwuF95Dz3NnjH6wLdM0XfWt0/wlbZLLFjZgTpRQZJNZtw1WVDBxhCdyuN7ZjxTjoupZUdmkiKdZ0bc1xPHAmerV5Yewm5nnDN56UkuIrrUQIC87V1L5i3WdqWnr/iZIPGuc500rdgHuZJrkroX6lbZ85j/g+SgwBs2+006g0jWagsk5Y1NQ0nPGVI50azbMfATcMhb/rg9//Dj62nlozJ0GVAquzlclxRqWKhXkzyRrtzhKugv8sVh90VqOcT6b2QlHNwT+RYxKPXawilaDs9ztd32kvfvEQz6g2pxiqnWsVEvRPjYrZqesR4kjfdkSJYop60pNGw0ddfFtZ+02PUDdWeqOgQYwG+rqXsec/ZLXPWAALVrMAAAAASUVORK5CYII="
    />

    <v-list-item three-line>
      <v-list-item-content>
        <div class="text-overline font-weight-regular mb-2" style="line-height: 1rem; font-size: 0.625rem !important;">{{ station.name }}</div>
        <v-list-item-title class="mb-1">{{ station.city }} &middot; {{ station.given_name }}</v-list-item-title>
        <v-list-item-subtitle title="sponsor">
          <v-icon small>mdi-heart-outline</v-icon>
          {{ station.sponsor }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list dense subheader>
      <v-list-item v-for="p in weatherProperties" :key="p.property">
        <v-list-item-subtitle :title="p.name"><v-icon class='pr-1'>{{ p.icon }}</v-icon> {{ p.name }}</v-list-item-subtitle>
        <v-list-item-title class="text-right">{{ measurements['status'] == "Offline" ? "-" : measurements[p.property] }} {{ p.unit }}</v-list-item-title>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Station, Measurement } from '../app/types';
import { weatherProperties as wp } from '../app/weatherProperties';

@Component
export default class StationCard extends Vue {
  @Prop() station!: Station

  weatherProperties = wp;

  removeFromList () {
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.$gtag.event('station_deselect', { event_category: 'stations', value: this.station.id });
    this.$store.dispatch('deselectStationById', this.station.id);
  }

  get imgUrl () {
    return `./img/maps/${this.station.name}.png`;
  }

  get measurements (): Measurement | {} {
    return (this.$store.state.liveMeasurements as Measurement[]).find(m => m.id === this.station.id) || {};
  }
}
</script>
