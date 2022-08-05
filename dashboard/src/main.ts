import Vue from 'vue';
import App from './App.vue';
import { createPinia, PiniaVuePlugin } from 'pinia';
import VueGtag from 'vue-gtag';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import 'whatwg-fetch';

import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();

Vue.use(VueGtag, {
  config: { id: 'UA-170459792-1' }
}, router);

new Vue({
  vuetify,
  pinia,
  store,
  router,
  render: h => h(App)
}).$mount('#app');
