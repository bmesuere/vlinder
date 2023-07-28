<template>
  <div class="text-center">
    <v-toolbar variant="flat" color="white">
      <v-toolbar-title class="text-h5 ml-0 d-none d-sm-flex">{{ weatherProperties[selectedProperty].title }}</v-toolbar-title>
      <v-toolbar-title class="text-h5 ml-0 d-sm-none d-flex">{{ weatherProperties[selectedProperty].name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn-toggle v-model="selectedProperty" variant="outlined" divided mandatory="force" rounded="xl" density="compact">
        <v-btn v-for="p in allowedProperties" :key="p" :value="p">
          <v-icon size="large">{{ weatherProperties[p].icon }}</v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{ weatherProperties[p].name }}
          </v-tooltip>
        </v-btn>
      </v-btn-toggle>
    </v-toolbar>
    <div v-bind:id="mapId">
      <v-img
      v-once
      aspect-ratio="3"
      src=""
      lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAXCAYAAAC2/DnWAAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAEagAwAEAAAAAQAAABcAAAAAmGyLYAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAB+lJREFUWAndmOlu5NYRhYs72exF3S2PZjIBkkdwgLxBHiIPHeSPYwRBAsfGOIGsrfeVZLNzvsvhWBCktjwzAga5QHO5S92qU6fqFts7qtkX2MqytLquLUkSp916vbaqqqzf75vneXY4HMz3fff8Eur7LyEUrD8Fb0C4urqy1Wrl1Nvv93Z3d2f0Awg/3ieTyUuo72SGLyEZj35Kgyk0GHJ5eemeozA0PwhsI3BqAb/b7azb7bqxl7h8dmBgymazcYx5juLMb0Pj9vbWAhkfRZGFAqJtjHsKG9pSwBD7hFilcIM9rPnc7bOFEjlhOp3a9fW1o/l2u/2g61EM4PdYa9nF/M1ma0VROjaQP9oGeLAk8MVEgfTudmJFdXDgz2Yz54h27ue6e9r0o5IvdEf5xXJjf/32n/b7NyPrdlKrDjW6u/b64sL2+8K+++87G+Zdyzu5ZVnmGHHfgPliYavlSoautLa2ODwXKyr9xBQJc6zSglbRtg8ZMIY2Ho/dXPSaz+c2HA4tjuNmbauQm/m8y0cDg/iyLOxG3pstVnbWzy0MfCkKMJ4A2Vute56mNt2urZ9kVitnVALtNxevLRL91wq55XJpV7OFjbq5xUFt23Jn8/1PNs7HlsVvrazW5nuBHWBNfdSzSKO9yTcOMO1RFIX6PduIbQcB089SS7TvaDR6HgqPzPqZr48MnupaLhcKG+UEafrmq6FACZzirIFJsfLEVPmgEBjdIHWKB1FoSwH2r3fvbKoTZSbPyjobD3LzAk+5oiNWpFb6udV+zwKx53ikP7DZemM/XN852ULetpLDWsAK5JCyqm252lsqlpCjSM43NzdGiO7uhfUpm+6P/WrG4OXbydSsPlhHXpFert6Qro4pCMeT5JxECsoSu7yZ2cW4b1cC8+1gqDW1yxltHpnt1gLBtzyE+rVFYWbr/c4saMIkD1OwsJ1kxkrKa4GyUYie93tub04vcpBnvmVp7JyRxJFNFkv1eNIjtEiAXbx6dd/2k8/PBmazJjmu5amdFCtskHcslNFQFxqjWJuu2lByzJFCvljVeNaziViUR4kLJdbCBpQnHIgRTpv9QYYeZKgOm1LPaRDbviqtEyfNHoCgvQG/DScY62mfsjzojijPVtu95VliU+Wvy/nS/vTHP3yYfxIVDf58Jj4yU/s7TzG0VB5ZLOc2Gp9ZJuXxeqXE5xKhxrkDBMkPameKcxIv77XCIZS2f/vPjy4hjl51XS5iPuCQP6r3LJJljhXbWpVvdbRR1rXv724k52DZWeQcgMyKUFIjwbK3c4zm4wT2X622VhdiX1dMFLO//hVsQe7JHAN9WxacvxrZ4Kyn2C3c6bDZ7GV46RRp5zAQhoEtFlsBuXVAMSZd5fnafvhxYukhsoPyAezAq4QGNQvGTNY6mWQ0TPj39aX9tJjaQqFbFZWNBRCAFO9Z0tYuMK1lDfrScGhHJ2RvkGl+ZUOF3HjQ/zCvmXX6+uxQQsx8NreVlE+SWEdiU8T1+0qYaKLGPVZs31zPFXZ7u3jdl8Hhh3ETHpudAJWyF+cDV4uUYp2vdYCMMb4AqgWiCzMhWimkeM60J/KbesZ3z+QWAHKs1Rh3fqX6qZQBirqI76ter+fWMP6cdjKUHgoghh39pTiAQNtSRrYhBGMqFV7nX/Xl3aZs932SotihsAki3zriaMcUihqHAe9u72yUpELVs6wjxmleIfkkbuCW3S6HEba0FgTqF4Di7o5uyUIP+gJ3b2oc3tsPUSfgmZdfBAbBrTJQHEUiZXk8QaJLEp08aniaRnhgtHuWd/BqJBYhBxCRhdMwlLrnt8MzZzjH7GSxVuhs7a3YVGo+MnVzOag1ml3aMHJ6KfcAJjXT/cbpxvjZ2dlHFXonc0xrXHsnF2AcRmI84dJ4TtSnRFcfYzTuzIfS331/ZVuFEPUFjbWNoTqFlJMAhfdQth1lzE7jrANmvI+BOAWUGOe4Bl3mrJTzVpLdAN6EEnu0752OaPj+3T088/KLjLkvhzjFOP4OwGv9fuZoimdvLm9VbeoYTojtpigDnELV8UgFHEZgHOHDWu6ACnMSnVgEHDmm2+24nEKSBaxS8wCYD1I+Glcq1pYq3oZ5rtAMm5yj/ZkLO9mbhmwafQ50B7TretbFJd/Wyw9XtJs87OfrmS9hgIKqzkgxxoWaqM1JQeWZ6pjkOC1U+5QaJwnyqYCyjKMwILE/z+x30BiNvEHDEYBCnkA+H40AxVy+iVg/nW2s30tVIuiLW/sACnvlAg9dWMP8wWAg8JvD4inb3Ka6nDyV2qLtvROcASRgsiKsieWxNG2o2grkjmIYzgcjBrsjVp5vkyDA8EcUymEk8zCAH2CiPP0AhuH3jaCPd+4AA1h+EFkSN3IAnj2RQ2Me+6EvctGhleEmPHHxZMTxoOqypTdVLIIRFkbxE8sedpNbmrh+OPLUO/JhGgCwH8q2YfbYmqeMeaofGafGHtvjfp8nzx6//ebv8rISnmhPckv0vUFV1lNhlCruj/qYE7fUp4QqhovwFuk55d0f6CjO7sv8v3gOKdq++cs/rDsY66gsLMpTC7LQFsXG4p7K7dSzpf4n6Z/FFiT6NvFn9qYf29Bf28XxTkfrn9X/u0/yzpeIpKc4PcaqKlMVWavV0sVgpBBaKH5z/UdC5boQeLDH0+mxXukjUEntwHGtE6KTZ+6vhyaUvkQTP06n/wGLqsRia6DoWQAAAABJRU5ErkJggg=="
    />
    </div>
    <v-fade-transition>
      <div v-if="tooltipInfo.shown" class="text-left" :style="{width: '260px', 'z-index': '10', position: 'absolute', left: (tooltipInfo.x + 15) + 'px', top: (tooltipInfo.y - 45) + 'px'}">
        <TooltipCard :station="tooltipInfo.station" />
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { useVlinderStore } from '@/store/app';

import { useGtag } from 'vue-gtag-next';

import TooltipCard from './TooltipCard.vue';

import { weatherProperties as wp } from '../app/weatherProperties';
import { Measurement, Station } from '@/app/types';
import { D3StationsMap } from '@/app/d3/D3StationsMap';


const props = defineProps({
  mapId: {
    type: String,
    default: 'stationsMap'
  },
  dataLoaded: {
    type: Promise<[Station[], Measurement[]]>,
    required: true
  }
});
let map: D3StationsMap | undefined;
const weatherProperties = wp;
const allowedProperties = ['temp', 'rainVolume', 'windSpeed'];

const tooltipInfo = ref({ shown: false, station: null, x: 0, y: 0 });
const selectedProperty = ref('temp');

const vlinderStore = useVlinderStore();

const selectedStations = computed<Station[]>(() => vlinderStore.selectedStations);
const measurements = computed<Measurement[]>(() => vlinderStore.liveMeasurements);

onMounted(async () => {
  map = new D3StationsMap(`#${props.mapId}`, selectedProperty.value, selectedStations.value, tooltipInfo.value, toggleStation);
  const [s, m] = await props.dataLoaded;
  map.init(s, m);
});

// adds or removes a station to the list of selected stations
function toggleStation (stationId: string): void {
  const { event } = useGtag();
  event('station_toggle', { event_category: 'stations', value: stationId });
  vlinderStore.toggleStationById(stationId);
}

// when stations are selected or removed, update the D3 map
watch(selectedStations, () => {
  if (map) {
    map.updateSelectedStations();
  }
}, { deep: true });

// when a different property is selected, we have to manually update the D3 map
watch(selectedProperty, () => {
  const { event } = useGtag();
  event('property_change', { event_category: 'properties', value: selectedProperty.value });
  if (map) {
    map.updateProperty(selectedProperty.value);
  }
});

// when measurements are updated, we have to manually update the D3 map
watch(measurements, () => {
  if (map) {
    map.updateMeasurements(measurements.value);
  }
}, { deep: true });

</script>
