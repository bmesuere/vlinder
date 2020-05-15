import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import {BootstrapVue, IconsPlugin, BootstrapVueIcons } from 'bootstrap-vue'
import { Datetime } from 'vue-datetime'
import VueSidebarMenu from 'vue-sidebar-menu'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle, faAd, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import '../scss/custom.scss';
import "circular-std";
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import 'vue-datetime/dist/vue-datetime.min.css'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'
import * as d3  from 'd3'

Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.use(BootstrapVueIcons);
Vue.use(VueSidebarMenu);
Vue.use(Datetime);

library.add(faTachometerAlt)
library.add(faExclamationTriangle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

d3.timeFormatDefaultLocale(

    {
        "dateTime": "%a %e %B %Y %T",
        "date": "%d-%m-%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
        "shortDays": ["zo", "ma", "di", "wo", "do", "vr", "za"],
        "months": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
        "shortMonths": ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
    }
);
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
