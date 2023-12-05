import { App } from 'vue'
import xForm from './index.vue'

xForm.install = (app: App) => {
  app.component(String(xForm.name), xForm)
  return app
}

export default xForm;