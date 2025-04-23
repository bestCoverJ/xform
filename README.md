# xForm - Vue 3 表单组件库

xForm 是一个基于 Vue 3 和 Element Plus 的表单组件库，提供了 BaseCRUD、DataForm、DataTable 和 useFetch 等组件，帮助开发者快速构建企业级表单应用。

## 功能特性

- 开箱即用的表单组件
- 支持 CRUD 操作
- 内置数据请求封装
- 响应式表格组件
- 基于 Vue 3 Composition API

## 安装

```bash
npm install @coverj/xform
```

## 快速开始

```javascript
import { createApp } from 'vue'
import xForm from '@coverj/xform'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(xForm)
app.mount('#app')
```

## 组件文档

### BaseCRUD

基础CRUD组件，提供增删改查功能

### DataForm

表单组件，支持动态表单配置

### DataTable

表格组件，支持分页、排序、筛选

### useFetch

数据请求Hook，封装了常用请求方法

## 示例代码

### DataForm 示例
```vue
<template>
  <x-data-form :form-option="formConfig" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'

const formConfig = ref({
  columns: [
    { label: '用户名', prop: 'username', type: 'input', required: true },
    { label: '密码', prop: 'password', type: 'password', required: true },
    { label: '角色', prop: 'role', type: 'select', options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]}
  ]
})

const handleSubmit = (formData) => {
  console.log('表单提交数据:', formData)
}
</script>
```

### BaseCRUD 示例
```vue
<template>
  <x-base-crud
    :fetch="fetchApi"
    :crud-option="crudConfig"
  />
</template>

<script setup>
import { ref } from 'vue'

const crudConfig = ref({
  inline: true,
  gutter: 20,
  option: {
    crud: {
      lazy: false,
    },
  },
  column: [
    {
      type: "input",
      prop: "username",
      label: "用户名",
      placeholder: "请输入用户名",
      span: 8,
    },
    {
      type: "number",
      prop: "age",
      label: "年龄",
      placeholder: "请输入年龄",
      span: 8,
    },
    {
      type: "select",
      prop: "gender",
      label: "性别",
      options: [
        { label: "男", value: "male" },
        { label: "女", value: "female" },
      ],
      span: 8,
    },
    {
      type: "textarea",
      prop: "description",
      label: "个人简介",
      placeholder: "请输入个人简介",
      span: 24,
    },
    {
      type: "date",
      prop: "joinDate",
      label: "入职日期",
      option: {
        format: "YYYY-MM-DD",
        valueFormat: "YYYY-MM-DD",
      },
      span: 8,
    },
    {
      type: "upload",
      prop: "files",
      label: "上传文件",
      option: {
        multiple: true,
        limit: 3,
      },
      span: 16,
    },
  ],
})

const fetchApi = {
  r: '/api/list',
  c: '/api/create',
  u: '/api/update',
  d: '/api/delete'
}
</script>
```

### DataTable 示例
```vue
<template>
  <x-data-table 
    :table-option="tableOption" 
    :table-data="tableData"
    :table-page="1"
    :table-size="10"
    @page-change="handlePageChange"
  />
</template>

<script setup>
import { ref } from 'vue'

const tableOption = ref({
    columns: [
      { prop: 'name', label: '姓名' },
      { prop: 'age', label: '年龄' },
      { prop: 'address', label: '地址' }
    ],
})

const tableData = ref([
  { name: '张三', age: 25, address: '北京市' },
  { name: '李四', age: 30, address: '上海市' }
])

const handlePageChange = (page) => {
  console.log('当前页码:', page)
  // 这里可以调用API获取新页数据
}
</script>
```

### useFetch 示例
```vue
<template>
  <div>
    <button @click="fetchData">获取数据</button>
    <div v-if="loading">加载中...</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup>
import { useFetch } from '@coverj/xform'

const { data, loading, error, onFetch: onGetList } = useFetch('/api/data')

const fetchData = async () => {
    try {
        await onGetList()
    } catch (e) {
        console.error('请求出错:', e)
    }
}
</script>
```

## 推荐IDE设置

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
