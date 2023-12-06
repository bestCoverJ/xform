import type { FormRules } from "element-plus";

export interface IformOption {
  inline?: boolean; // 是否行内展示
  items: Array<IformItems>; // 表单项
  rules: FormRules; // 表单校验
}

// 表单项附加设置类型
export interface IformItemOption {
  filterable?: boolean; // 是否开启表单项筛选
  clearable?: boolean; // 是否开启表单项清除
  multiple?: boolean; // 是否多选(选择框)
  disabledDate?: () => boolean; // 禁止选择的日期
  defaultValue?: string; // 日期框默认值
  format?: string; // 日期框显示日期格式化
  valueFormat?: string; // 日期框绑定日期格式化
  disabled?: boolean; // 是否禁用
  loading?: boolean; // 按钮是否加载
  type?: string; // 按钮类型
  event?: () => void; // 按钮点击事件
}

// 表单项类型
export interface IformItems {
  key: string; // 表单项绑定的值
  type: string; // 表单项的类型
  label?: string; // 表单项名称
  placeholder?: string; // 表单项占位
  option?: IformItemOption; // 表单项附加设置
  options?: Array<IselectOption>;
  text?: string; // 按钮项的文本
  icon?: any; // 按钮项的图标
}

// 选择框表单项类型
export interface IselectOption {
  value: any; // 值
  label: string; // 属性
}
