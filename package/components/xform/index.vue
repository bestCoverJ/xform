<template>
  <div class="base-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="props.formOption.rules"
      :inline="props.formOption.inline"
    >
      <el-form-item
        v-for="formItem in props.formOption.items"
        :key="formItem.key"
        :label="formItem.label"
        :prop="formItem.key"
      >
        <el-input
          v-if="formItem.type === 'input' || formItem.type === 'textarea'"
          :type="formItem.type"
          v-model="formData[formItem.key]"
          :placeholder="formItem?.placeholder"
        ></el-input>
        <el-select
          v-if="formItem.type === 'select'"
          v-model="formData[formItem.key]"
          :placeholder="formItem?.placeholder"
          :filterable="formItem.option?.filterable || false"
          :clearable="formItem.option?.clearable || true"
          :multiple="formItem.option?.multiple || false"
          collapse-tags
        >
          <el-option
            v-for="option in formItem.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
        <el-date-picker
          v-if="
            formItem.type === 'date' ||
            formItem.type === 'datetime' ||
            formItem.type === 'daterange'
          "
          v-model="formData[formItem.key]"
          :type="formItem.type"
          :placeholder="formItem?.placeholder"
          :disabled-date="formItem.option?.disabledDate"
          :default-value="formItem.option?.defaultValue"
          :format="formItem.option?.format"
          :value-format="formItem.option?.valueFormat"
        ></el-date-picker>
        <el-button
          v-if="
            formItem.type === 'button' ||
            formItem.type === 'submit' ||
            formItem.type === 'reset'
          "
          :type="formItem.option?.type"
          @click="onButtonClick(formItem.option?.type, formItem.option?.event)"
          :icon="formItem.icon"
          :disabled="formItem.option?.disabled"
          :loading="formItem.option?.loading"
        >
          {{ formItem.text }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "x-form",
});
</script>
<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import type { IformOption } from "./type";
import { ref, watch } from "vue";
const formData = ref({});

interface PrposType {
  formOption: IformOption;
}
const props = defineProps<PrposType>();

const formRef = ref<FormInstance>();
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((vaild, fields) => {
    if (vaild) {
      emit("submitForm", formData.value);
    }
  });
};
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

const onButtonClick = (
  type: string | undefined,
  event: Function | undefined
) => {
  if (type === "submit") {
    submitForm();
  } else if (type === "reset") {
    resetForm();
  } else {
    if (event) {
      event();
    }
  }
};

watch(
  () => formData.value,
  (newVal) => {
    emit("changeForm", newVal);
  },
  { deep: true }
);

const emit = defineEmits(["submitForm", "changeForm"]);
</script>
<style>
.base-form .el-form .el-form-item {
  margin-right: 16px;
}
</style>
