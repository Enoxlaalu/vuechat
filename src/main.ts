import { createApp } from 'vue'
import App from './App.vue'
import { vFocus } from './directives/vFocus'

const app = createApp(App)

// Регистрируем директиву глобально — доступна в любом компоненте как v-focus
app.directive('focus', vFocus)

app.mount('#app')
