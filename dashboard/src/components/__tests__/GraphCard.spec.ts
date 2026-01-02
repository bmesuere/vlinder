import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import GraphCard from '../GraphCard.vue'
import { WeatherProperty } from '@/app/types'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock D3Graph class
vi.mock('@/app/d3/D3Graph', () => {
  return {
    D3Graph: class {
      constructor() {}
      init() {}
      updateData() {}
      getLegendColors() { return [] }
      updateTooltip() {}
    }
  }
})

describe('GraphCard', () => {
  const weatherProperty: WeatherProperty = {
    property: 'temp',
    name: 'Temperature',
    unit: '°C',
    icon: 'mdi-thermometer',
    title: 'Temperature'
  }

  it('renders correctly', () => {
    const wrapper = mount(GraphCard, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
          })
        ],
      },
      props: {
        weatherProperty: weatherProperty
      }
    })

    expect(wrapper.text()).toContain('Temperature')
    expect(wrapper.text()).toContain('°C')
    expect(wrapper.find(`#weather_graph_temp`).exists()).toBe(true)
  })
})
