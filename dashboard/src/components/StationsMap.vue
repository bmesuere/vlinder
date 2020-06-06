<template>
  <div v-bind:id="mapId"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import { StationsMap } from '../d3Components/StationsMap';

export default Vue.extend({
  name: 'StationsMap',
  props: {
    mapId: {
      type: String,
      default: 'stationsMap'
    }
  },

  data: () => ({
    //
  }),
  mounted: function () {
    const map = new StationsMap(`#${this.mapId}`);
    map.init();
  }
});
</script>
