import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import LandUseGraph from '../LandUseGraph.vue'
import { Station } from '@/app/types'

// Mock D3LandUse class
const { mockInit } = vi.hoisted(() => {
  return {
    mockInit: vi.fn()
  }
})

vi.mock('@/app/d3/D3LandUse', () => {
  return {
    D3LandUse: class {
      constructor() {}
      init = mockInit
    }
  }
})

describe('LandUseGraph', () => {
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
    landUse: [
      { distance: 100, usage: { water: 10, paved: 20, green: 70 } },
      { distance: 200, usage: { water: 20, paved: 30, green: 50 } }
    ]
  }

  it('renders correctly', () => {
    const wrapper = mount(LandUseGraph, {
      props: {
        station: station
      },
      global: {
        stubs: {
          'v-img': true
        }
      }
    })

    expect(wrapper.find(`#land_use_${station.id}`).exists()).toBe(true)
    expect(mockInit).toHaveBeenCalled()
  })
})
