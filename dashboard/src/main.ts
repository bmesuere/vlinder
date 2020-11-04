import Vue from 'vue';
import App from './App.vue';
import VueGtag from 'vue-gtag';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';
import 'whatwg-fetch';

import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueGtag, {
  config: { id: 'UA-170459792-1' }
});

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app');
