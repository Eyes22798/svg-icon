import Vue from 'vue'
import App from './App.vue'
import SvgIcon from '@eyes22798/svg-icon'

Vue.config.productionTip = false
Vue.use(SvgIcon)

new Vue({
  render: h => h(App),
}).$mount('#app')
