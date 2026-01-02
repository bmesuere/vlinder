import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import TooltipCard from '../TooltipCard.vue'
import { Station, Measurement } from '@/app/types'

const vuetify = createVuetify({
  components,
  directives,
})

describe('TooltipCard', () => {
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
    const wrapper = mount(TooltipCard, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            initialState: {
              vlinder: {
                liveMeasurements: [measurement]
              }
            },
            createSpy: vi.fn,
          })
        ],
      },
      props: {
        station: station
      }
    })

    expect(wrapper.text()).toContain(station.city)
    expect(wrapper.text()).toContain(station.given_name)
    expect(wrapper.text()).toContain(station.school)
    // Check for measurement data
    expect(wrapper.text()).toContain('22.5') // temp
  })
})
