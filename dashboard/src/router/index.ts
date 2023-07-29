// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Dashboard.vue'),
        props: (route: { query: { stations: any } }) => ({ urlStations: route.query.stations ? [route.query.stations].flat() : [] }),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory("/dashboard/"),
  routes,
})

export default router
