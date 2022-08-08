<script lang="ts">
import { computed, defineComponent, onMounted, PropType } from 'vue';

import { D3LandUse } from '@/app/d3/D3LandUse';
import { Station } from '@/app/types';

export default defineComponent({
  name: 'LandUseGraph',
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    }
  },
  setup (props, _context) {
    let graph: D3LandUse | undefined;

    const graphId = computed<string>(() => {
      return 'land_use_' + props.station.id;
    });

    onMounted(() => {
      graph = new D3LandUse(`#${graphId.value}`, props.station.landUse);
      graph.init();
    });

    return {
      graphId
    };
  }
});
</script>

<template>
  <div :id="graphId">
    <v-img
      aspect-ratio="2.3137254902"
      src=""
      lazy-src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAICAYAAAD0g6+qAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAFARIAAwAAAAEAAQAAARoABQAAAAEAAABKARsABQAAAAEAAABSASgAAwAAAAEAAgAAh2kABAAAAAEAAABaAAAAAAAAAEgAAAABAAAASAAAAAEAAqACAAQAAAABAAAAEqADAAQAAAABAAAACAAAAAAMC9jHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAABgklEQVQoFR2R2Y7UMBREjx0nzjJJjxCDhHji/78FCfEDPCEkpO6h6cTZvFAzD5bspFxV99h8//GtWGOwNER2rK0Y+wlM4npbuIw93reENZBTxlhpbcaaLI1lWWZymXG/7j8xsvh8+QrJE0vmkWZSzpR0SDxgKwuF95Dz3NnjH6wLdM0XfWt0/wlbZLLFjZgTpRQZJNZtw1WVDBxhCdyuN7ZjxTjoupZUdmkiKdZ0bc1xPHAmerV5Yewm5nnDN56UkuIrrUQIC87V1L5i3WdqWnr/iZIPGuc500rdgHuZJrkroX6lbZ85j/g+SgwBs2+006g0jWagsk5Y1NQ0nPGVI50azbMfATcMhb/rg9//Dj62nlozJ0GVAquzlclxRqWKhXkzyRrtzhKugv8sVh90VqOcT6b2QlHNwT+RYxKPXawilaDs9ztd32kvfvEQz6g2pxiqnWsVEvRPjYrZqesR4kjfdkSJYop60pNGw0ddfFtZ+02PUDdWeqOgQYwG+rqXsec/ZLXPWAALVrMAAAAASUVORK5CYII="
    />
  </div>
</template>
