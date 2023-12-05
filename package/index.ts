import { App } from "vue";
import BaseForm from "./components/xform";

const components = [BaseForm];

const install = (app: App) => {
  // 注册所有组件
  components.forEach((component) => {
    app.component(String(component.name), component);
  });
};

export default { install }