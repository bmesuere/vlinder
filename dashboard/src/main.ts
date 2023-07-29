/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

import VueGtag from "vue-gtag-next";

import router from '@/router'

const app = createApp(App)

registerPlugins(app)

app.use(VueGtag, {
  property: { id: 'G-YY7WRV394E' },
})

app.use(router)

app.mount('#app')
