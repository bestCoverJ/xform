import { App } from "vue";
import xForm from "./components/xform";

const components = [xForm];

const install = (app: App) => {
  // 注册所有组件
  components.forEach((component) => {
    app.component(String(component.name), component);
  });
};

export default { install }