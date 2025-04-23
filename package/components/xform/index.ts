import { App } from 'vue'
import DataForm from './crud/DataForm.tsx'
import BaseCRUD from './crud/BaseCRUD.tsx'
import DataTable from './crud/DataTable.tsx'
import { useFetch, useFormFetch } from './hooks/useFetch.ts'

const components = [DataForm, BaseCRUD, DataTable]

const install = (app: App) => {
  components.forEach(component => {
    app.component(String(component.name), component)
  })
  return app
}

export {
  DataForm,
  BaseCRUD,
  DataTable,
  useFetch,
  useFormFetch,
  install
}