import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    alias: ['/index.html'],
    name: 'Home',
    component: Dashboard,
    props: route => ({ urlStations: route.query.stations ? [route.query.stations].flat() : [] })
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

function patchRouterMethod (router: VueRouter, methodName: string) {
  // @ts-ignore
  router['old' + methodName] = router[methodName];
  // @ts-ignore
  router[methodName] = async function (location) {
    // @ts-ignore
    return router['old' + methodName](location).catch((error) => {
      if (error.name === 'NavigationDuplicated') {
        return this.currentRoute;
      }
      throw error;
    });
  };
}

patchRouterMethod(router, 'push');
patchRouterMethod(router, 'replace');

export default router;
