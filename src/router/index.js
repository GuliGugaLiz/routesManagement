import Vue from 'vue'
import Router from 'vue-router'
import RoutesManagement from '@/components/RM'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RoutesManagement',
      component: RoutesManagement
    }
  ]
})
