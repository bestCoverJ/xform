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
    <x-form :form-option="formOption"></x-form>
  </div>
</template>

<style></style>
