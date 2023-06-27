import Vue from 'vue';
import App from './App.vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueGtag from 'vue-gtag';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import 'whatwg-fetch';

import router from './router';

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

Vue.use(VueGtag, {
  config: { id: 'G-YY7WRV394E' }
}, router);

new Vue({
  vuetify,
  pinia,
  router,
  render: h => h(App)
}).$mount('#app');
