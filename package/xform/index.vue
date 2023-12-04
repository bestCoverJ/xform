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
          v-if="formItem.type === 'input'"
          v-model="formData[formItem.key]"
          :placeholder="formItem.placeholder"
        ></el-input>
        <el-input
          v-if="formItem.type === 'textarea'"
          type="textarea"
          v-model="formData[formItem.key]"
          :placeholder="formItem.placeholder"
          :row="formItem.option.row || 2"
        ></el-input>
        <el-select
          v-if="formItem.type === 'select'"
          v-model="formData[formItem.key]"
          :placeholder="formItem.placeholder"
          :filterable="formItem.option.filterable || false"
          :clearable="formItem.option.clearable || true"
          :multiple="formItem.option.multiple || false"
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
          v-if="formItem.type === 'date'"
          v-model="formData[formItem.key]"
          :type="formItem.type"
          :placeholder="formItem.placeholder"
          :disabled-date="formItem.option.disabledDate"
          :default-value="formItem.option.defaultValue"
          :format="formItem.option.format"
          :value-format="formItem.option.valueFormat"
        ></el-date-picker>
        <el-date-picker
          v-if="formItem.type === 'datetime'"
          v-model="formData[formItem.key]"
          :type="formItem.type"
          :placeholder="formItem.placeholder"
          :disabled-date="formItem.option.disabledDate"
          :default-value="formItem.option.defaultValue"
          :format="formItem.option.format"
          :value-format="formItem.option.valueFormat"
        ></el-date-picker>
        <el-date-picker
          v-if="formItem.type === 'daterange'"
          v-model="formData[formItem.key]"
          :type="formItem.type"
          :placeholder="formItem.placeholder"
          :disabled-date="formItem.option.disabledDate"
          :default-value="formItem.option.defaultValue"
          :start-placeholder="formItem.option.startPlaceholder || '开始时间'"
          :end-placeholder="formItem.option.endPlaceholder || '结束时间'"
          :format="formItem.option.format"
          :value-format="formItem.option.valueFormat"
        ></el-date-picker>
        <el-button
          type="primary"
          v-if="formItem.type === 'submit'"
          @click="submitForm"
          :icon="formItem.icon"
          :disabled="formItem.option?.disabled"
          :loading="formItem.option?.loading"
        >
          {{ formItem.text }}
        </el-button>
        <el-button
          :type="formItem.option?.type"
          v-if="formItem.type === 'button'"
          @click="formItem.option?.event"
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

<script setup>
import { ref } from "vue";
const formRef = ref();
const props = defineProps({
  formOption: {
    type: Object,
    default: () => {},
    required: true,
  },
});
const formData = ref({});
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((vaild, fields) => {
    if (vaild) {
      emit("submitForm", formData.value);
    }
  });
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
