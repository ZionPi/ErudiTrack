import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AllNotesView from '../views/AllNotesView.vue' 
import ListManager from '../views/ListManager.vue'
import SvgToggleView from '../components/SvgToggleView.vue'
import PdfViewer from '../components/PdfViewer.vue' 
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
    },
    {
      path: '/list-manager',
      name: 'ListManager',
      component: ListManager
    },
    {
      path: '/svg-view',
      name: 'SvgToggleView',
      component: SvgToggleView
    },
    {
      path: '/pdf-viewer', 
      name: 'pdf-viewer',
      component: PdfViewer 
    }
  ]
})

export default router