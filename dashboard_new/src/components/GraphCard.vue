<template>
  <v-card :loading="loading" v-show="hasData">
    <v-list-item lines="two">
      <v-list-item-content>
        <v-list-item-title class="mb-0">{{ weatherProperty.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ weatherProperty.unit }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <div :id="consolidatedGraphId" class="mt-n3">
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, watch } from 'vue';

import { useVlinderStore } from '@/store/app';

import { D3Graph } from '@/app/d3/D3Graph';
import { Station, Measurement, WeatherProperty, WeatherPropertyName } from '@/app/types';

const props = defineProps({
  weatherProperty: {
    type: Object as PropType<WeatherProperty>,
    required: true
  },
  graphId: {
    type: String
  },
  updateLegendColors: {
    type: Boolean
  },
  tooltipPosition: {
    type: Object as PropType<{ timestamp: number; i: number }>,
    default: () => ({ i: -1, timestamp: -1 })
  }
});

let graph: D3Graph | undefined;
const wbgtStations = ['vlinder02', 'vlinder73', 'vlinder74', 'vlinder75', 'vlinder76'];

const vlinderStore = useVlinderStore();

const measurements = computed<Measurement[][]>(() => {
  return vlinderStore.historicMeasurements;
});

const selectedStations = computed<Station[]>(() => {
  return vlinderStore.selectedStations;
});

const loading = computed<boolean>(() => {
  return vlinderStore.loadingHistoricMeasurements;
});

const consolidatedGraphId = computed<string>(() => {
  return props.graphId || 'weather_graph_' + props.weatherProperty.property;
});

const tooltipI = computed<number>(() => {
  return props.tooltipPosition.i;
});

const hasData = computed<boolean>(() => {
  if (props.weatherProperty.property === 'wbgt') {
    return selectedStations.value.some(s => wbgtStations.includes(s.name));
  }
  return true;
});

onMounted(() => {
  graph = new D3Graph(`#${consolidatedGraphId.value}`, props.weatherProperty, selectedStations.value, props.tooltipPosition);
  graph.init();
});

// when measurements are updated, we have to manually update the D3 map
watch(measurements, () => {
  if (graph) {
    graph.updateData(vlinderStore.historicData(props.weatherProperty.property as WeatherPropertyName));
    if (props.updateLegendColors) {
      vlinderStore.setLegendColors(graph.getLegendColors());
    }
  }
}, { deep: true });

watch(tooltipI, () => {
  if (graph) {
    graph.updateTooltip();
  }
}, { deep: true });
</script>
