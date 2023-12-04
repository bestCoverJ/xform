import BaseForm from "./xform/index.vue";

const components = [BaseForm];

const install = (App, option) => {
  // 注册所有组件
  components.forEach((component) => {
    App.component(component.name, component);
  });
};

export default { install };
