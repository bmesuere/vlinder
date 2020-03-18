import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from './pages/Home.vue'
import Dashboard from "./components/Dashboard";

Vue.use(VueRouter);

const routes = [
    {
        path: '/', redirect: '/dashboard'
    },
    {
        path: '/',
        name: 'root',
        component: Home,
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: Dashboard
            }
        ]
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
