<template>
  <div class="base-descriptions">
    <el-dialog
      v-model="dialogVisible"
      :title="props.title"
      :width="props.width || '70%'"
      append-to-body
      modal-class="base-descriptions"
      v-bind="$attrs"
      draggable
      overflow
    >
      <el-descriptions
        class="rounded-lg overflow-hidden"
        border
        :column="props.column"
        size="large"
      >
        <el-descriptions-item
          v-for="(header, hKey) in props.header"
          :key="hKey"
          :label="header"
          min-width="150"
        >
          <span>
            {{ props.data[hKey] || "--" }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <div class="base-descriptions-content">
        <slot></slot>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<script setup>
import { ref, watchEffect } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  header: {
    type: Object,
    default: () => {},
  },
  witdh: {
    type: [String, Number],
    default: "70%",
  },
  // 项目id和数据id是否相同
  isSameId: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {},
  },
  column: {
    type: [Number, String],
    default: 2,
  },
  relType: {
    type: [Number, String],
    default: 0,
  },
});

watchEffect(
  () => {
    dialogVisible.value = props.visible;
  },
  { flush: "post" }
);

const dialogVisible = ref(props.visible);

const emit = defineEmits(["update:visible"]);
watchEffect(() => {
  emit("update:visible", dialogVisible.value);
});
</script>
<style scoped>
.base-descriptions .base-descriptions-content {
  margin-top: 16px;
}
</style>
