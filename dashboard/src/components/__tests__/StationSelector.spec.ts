import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import StationSelector from '../StationSelector.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('StationSelector', () => {
  it('renders station selector button with correct text', () => {
    const wrapper = mount(StationSelector, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
             // mocks and initial state if needed
             createSpy: vi.fn,
          })
        ],
      },
    })
    expect(wrapper.exists()).toBe(true)
    // Basic check that the button is rendered
    expect(wrapper.text()).toContain('Selecteer stations')
  })
})
