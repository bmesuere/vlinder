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

// Mock fetch for topology
const mockTopology = { objects: { municipalities: {}, provinces: {} } }
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockTopology)
  })
) as unknown as typeof fetch

describe('StationsMap', () => {
  const station: Station = {
    id: '1',
    name: 'vlinder01',
    city: 'Ghent',
    given_name: 'City Station',
    school: 'Test School',
    coordinates: {
      longitude: 3.71,
      latitude: 51.05
    },
    measurements: 'https://example.com/measurements',
    landUse: [],
  }

  const measurement: Measurement = {
    id: '1',
    time: '2023-10-27T10:00:00Z',
    temp: 22.5,
    humidity: 60,
    pressure: 1015,
    status: 'Online',
    windSpeed: 10,
    windDirection: 180,
    windGust: 15,
    rainIntensity: 0,
    rainVolume: 0,
    station: 'https://example.com/station',
    measurements: 'https://example.com/measurements',
    wbgt: 18.0
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
    // Verify init called with correct arguments
    expect(mockInit).toHaveBeenCalledWith([station], [measurement], mockTopology)
  })
})
