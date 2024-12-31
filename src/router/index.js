import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AllNotesView from '../views/AllNotesView.vue' // 确保导入了 AllNotesView

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/all-notes',
      name: 'all-notes',
      component: AllNotesView
    }
  ]
})

export default router