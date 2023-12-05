<script setup>
import xForm from "../package/components/xform/index.vue";

const formOption = {
  items: [
    {
      key: "test",
      type: "input",
      label: "123",
    },
  ],
};
</script>

<template>
  <div style="height: 120px; width: 120px">
    <xForm :form-option="formOption"></xForm>
  </div>
</template>

<style></style>
