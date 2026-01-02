import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import StationsMap from '../StationsMap.vue'
import { Station, Measurement } from '@/app/types'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock D3StationsMap class
const { mockInit, mockUpdateProperty, mockUpdateSelectedStations, mockUpdateMeasurements } = vi.hoisted(() => {
  return {
    mockInit: vi.fn(),
    mockUpdateProperty: vi.fn(),
    mockUpdateSelectedStations: vi.fn(),
    mockUpdateMeasurements: vi.fn()
  }
})

vi.mock('@/app/d3/D3StationsMap', () => {
  return {
    D3StationsMap: class {
      constructor() {}
      init = mockInit
      updateProperty = mockUpdateProperty
      updateSelectedStations = mockUpdateSelectedStations
      updateMeasurements = mockUpdateMeasurements
    }
  }
})

// Mock vue-gtag-next
vi.mock('vue-gtag-next', () => ({
  useGtag: () => ({
    event: vi.fn()
  })
}))

describe('StationsMap', () => {
  const station: Station = {
    id: '1',
    name: 'vlinder01',
    city: 'Ghent',
    given_name: 'City Station',
    school: 'Test School',
    lat: 51.05,
    lon: 3.71,
    coordinates: [3.71, 51.05],
    status: 'Online',
    temp: 20,
    humidity: 50,
    pressure: 1013,
  }

  const measurement: Measurement = {
    id: '1',
    time: '2023-10-27T10:00:00Z',
    temp: 22.5,
    humidity: 60,
    pressure: 1015,
    status: 'Online',
    wind_speed: 10,
    wind_direction: 180,
    wind_gust: 15,
    rain_intensity: 0,
    rain_volume: 0,
    uv: 1,
    illuminance: 1000,
    radiation: 100,
  }

  it('renders and initializes map', async () => {
    const dataLoadedPromise = Promise.resolve([[station], [measurement]] as [Station[], Measurement[]])

    const wrapper = mount(StationsMap, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            initialState: {
              vlinder: {
                liveMeasurements: [measurement],
                selectedStations: []
              }
            },
            createSpy: vi.fn,
          })
        ],
        stubs: {
          'v-img': true,
          'TooltipCard': true
        }
      },
      props: {
        dataLoaded: dataLoadedPromise
      }
    })

    await flushPromises()

    expect(wrapper.find('#stationsMap').exists()).toBe(true)
    expect(mockInit).toHaveBeenCalled()
  })
})
