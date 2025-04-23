<script setup>
import { ref } from "vue";
import { BaseCRUD } from "../package/components/xform/index.ts";

// 临时数据存储
const tempData = ref([
  {
    id: 1,
    username: "张三",
    age: 25,
    description: "前端开发工程师",
    gender: "male",
    joinDate: "2022-01-15",
    files: [],
  },
  {
    id: 2,
    username: "李四",
    age: 30,
    description: "后端开发工程师",
    gender: "male",
    joinDate: "2021-05-20",
    files: [],
  },
]);

const crudOption = ref({
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
});

// 模拟API请求
const fetch = {
  r: async (params) => {
    console.log("查询参数:", params);
    // 模拟分页查询
    const start = (params.pageNum - 1) * params.pageSize;
    const end = start + params.pageSize;
    return {
      code: 200,
      rows: tempData.value.slice(start, end),
      total: tempData.value.length,
    };
  },
  c: async (params) => {
    console.log("新增参数:", params);
    // 模拟新增
    const newItem = {
      ...params,
      id: Date.now(),
    };
    tempData.value.push(newItem);
    return { code: 200 };
  },
  u: async (params) => {
    console.log("更新参数:", params);
    // 模拟更新
    const index = tempData.value.findIndex((item) => item.id === params.id);
    if (index !== -1) {
      tempData.value[index] = { ...tempData.value[index], ...params };
    }
    return { code: 200 };
  },
  d: async (id) => {
    console.log("删除ID:", id);
    // 模拟删除
    tempData.value = tempData.value.filter((item) => item.id !== id);
    return { code: 200 };
  },
};
</script>

<template>
  <div style="padding: 20px">
    <BaseCRUD :crud-option="crudOption" :fetch="fetch" />
  </div>
</template>

<style scoped></style>
