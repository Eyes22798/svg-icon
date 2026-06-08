import { createApp } from 'vue'
import App from './App.vue'
import SvgIcon from '@eyes22798/svg-icon'

const app = createApp(App)
app.component('svg-icon', SvgIcon)
app.mount('#app')
