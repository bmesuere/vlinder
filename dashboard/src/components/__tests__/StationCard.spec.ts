import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import StationCard from '../StationCard.vue'
import { Station, Measurement } from '@/app/types'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock LandUseGraph to avoid D3 issues in simple unit test
const LandUseGraphStub = {
  template: '<div>LandUseGraph</div>',
  props: ['station']
}

// Mock vue-gtag-next
vi.mock('vue-gtag-next', () => ({
  useGtag: () => ({
    event: vi.fn()
  })
}))

describe('StationCard', () => {
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

  it('renders station information correctly', () => {
    const wrapper = mount(StationCard, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            initialState: {
              vlinder: {
                liveMeasurements: [measurement],
                selectedStations: [station]
              }
            },
            createSpy: vi.fn,
          })
        ],
        stubs: {
          LandUseGraph: LandUseGraphStub
        }
      },
      props: {
        station: station
      }
    })

    expect(wrapper.text()).toContain(station.city)
    expect(wrapper.text()).toContain(station.given_name)
    expect(wrapper.text()).toContain(station.school)

    // Check if measurement data is displayed
    // "Temperature" is usually localized or just "Temperature" depending on config,
    // but the component iterates activeProperties.
    // Based on code: {{ p.name }} ... {{ value }} {{ p.unit }}
    // We assume default weatherProperties are imported.
    // Since we didn't mock weatherProperties, it uses the real one.
    // Let's just check for the value.
    expect(wrapper.text()).toContain('22.5') // temp
  })

  it('emits remove event when close button is clicked', async () => {
    const wrapper = mount(StationCard, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
             initialState: {
                vlinder: {
                    liveMeasurements: []
                }
             },
             createSpy: vi.fn,
          })
        ],
        stubs: {
            LandUseGraph: LandUseGraphStub
        }
      },
      props: {
        station: station
      }
    })

    // Find the close button
    const closeBtn = wrapper.find('.close')
    expect(closeBtn.exists()).toBe(true)

    await closeBtn.trigger('click')

    // Check if store action was called
    // Since we use createTestingPinia, actions are spies.
    // We can access the store and check.
    // However, the component calls `vlinderStore.deselectStationById(props.station.id)`
    // We can't easily access the store instance inside the test unless we import it.

    // But we know it works if no error is thrown.
    // Ideally we should import useVlinderStore and check the spy.

    // Let's import the store to check
    const { useVlinderStore } = await import('@/store/app')
    const vlinderStore = useVlinderStore()
    expect(vlinderStore.deselectStationById).toHaveBeenCalledWith(station.id)
  })
})
