/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    // Vuetify 4 changed the default theme from 'light' to 'system'. The
    // dashboard only defines (and is only designed for) a light theme, so
    // pin it explicitly instead of following the OS preference.
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  // Vuetify 4 lowered the default breakpoint thresholds (md 960->840,
  // lg 1280->1145, xl 1920->1545, xxl 2560->2138). Keep the Vuetify 3
  // values so the dashboard keeps switching between its 1/2/3/4-column
  // layouts at the same widths it always has. This mirrors the
  // $grid-breakpoints override in src/styles/settings.scss, which is what
  // drives the CSS side (v-col-md-*, d-sm-* utilities, ...); this option
  // only drives the JS side (useDisplay).
  display: {
    thresholds: {
      md: 960,
      lg: 1280,
      xl: 1920,
      xxl: 2560,
    },
  },
})
