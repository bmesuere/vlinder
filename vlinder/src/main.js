import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import {BootstrapVue, IconsPlugin, BootstrapVueIcons } from 'bootstrap-vue'
import { Datetime } from 'vue-datetime'
import VueSidebarMenu from 'vue-sidebar-menu'

import '../scss/custom.scss';
import "circular-std";
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import 'vue-datetime/dist/vue-datetime.min.css'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'

Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.use(BootstrapVueIcons);
Vue.use(VueSidebarMenu);
Vue.use(Datetime);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
