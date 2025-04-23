/**
 * DataForm Disabled fileUpload
 * Author: CoverJ
 * Version: 1.0.0
 * */

import { defineComponent, nextTick, ref, watchEffect } from "vue";
import {
  ElRow,
  ElCol,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElAutocomplete,
  ElDatePicker,
  ElTreeSelect,
  ElSelect,
  ElSelectV2,
  ElMention,
  ElCascader,
  ElUpload,
  ElMessage,
  ElText,
} from "element-plus";
import { DefineComponent } from 'vue';

interface FormItemOption {
  type?: string;
  prop?: string;
  label?: string;
  span?: number;
  colStyle?: string;
  itemStyle?: string;
  placeholder?: string;
  style?: string;
  options?: any[];
  option?: {
    clearable?: boolean;
    collapseTags?: boolean;
    props?: {
      label?: string;
      value?: string;
    };
    type?: string;
    format?: string;
    valueFormat?: string;
    showCheckbox?: boolean;
    multiple?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    url?: string;
    params?: Record<string, any>;
    name?: string;
    id?: string;
    extra?: Record<string, any>;
    fetch?: (params: any) => Promise<any>;
    del?: (id: string) => Promise<any>;
    role?: boolean;
    hidden?: boolean;
  };
  onChange?: (formData: any, changeFn: (data: any) => void) => void;
  fetch?: (query: string, cb: (data: any[]) => void) => void;
  buttons?: FormItemOption[];
  color?: string;
  event?: (prop: string, formData: any) => void;
}

interface FormOption {
  modelValue?: Record<string, any>;
  formOption: {
    column: FormItemOption[];
    rules?: Record<string, any>;
    inline?: boolean;
    gutter?: number;
    option?: {
      role?: boolean;
      readOnly?: boolean;
      disabled?: boolean;
      upload?: {
        url?: string;
        fileType?: string[];
        fetch?: (params: any) => Promise<any>;
        del?: (id: string) => Promise<any>;
      };
    };
  };
}

const DataForm: DefineComponent<FormOption> = defineComponent({
  name: "DataForm",
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
    formOption: {
      type: Object,
      default: () => {},
      required: true,
    },
  },
  emits: ["submit", "reset", "change", "update:modelValue"],
  setup(props, { emit }) {
    const formRef = ref(null);
    // 使用传入的数据进行双向绑定，需要重新拷贝，否则v-model绑定的值会直接修改原值
    const formData = ref(JSON.parse(JSON.stringify(props.modelValue)));

    watchEffect(() => {
      formData.value = JSON.parse(JSON.stringify(props.modelValue));
    });

    const Form = () => {
      const role =
        typeof props?.formOption?.option?.role === "boolean"
          ? props?.formOption?.option?.role
          : true;
      return (
        <ElForm
          ref={formRef}
          model={formData}
          rules={props.formOption?.rules}
          inline={props.formOption?.inline}
          disabled={!role}
          {...props.formOption?.option}
        >
          {props.formOption?.inline ? renderInlineForm() : renderForm()}
        </ElForm>
      );
    };

    const renderInlineForm = () => {
      return (
        <ElRow gutter={props.formOption?.gutter || 20}>
          {props.formOption?.column?.map((formItem) => {
            return (
              <ElCol
                span={formItem?.span || 8}
                style={formItem?.colStyle || ""}
              >
                <ElFormItem
                  label={formItem?.label}
                  prop={formItem.prop}
                  style={formItem?.itemStyle || "width: 100%;"}
                >
                  {renderFormItem(formItem)}
                </ElFormItem>
              </ElCol>
            );
          })}
        </ElRow>
      );
    };

    const renderForm = () => {
      return props.formOption?.column?.map((formItem) => {
        return (
          <ElRow gutter={props.formOption?.gutter || 20}>
            <ElCol
              span={props.formOption?.inline ? formItem?.span || 8 : 24}
              style={formItem?.colStyle || ""}
            >
              <ElFormItem
                label={formItem?.label}
                prop={formItem.prop}
                style={formItem?.itemStyle || "width: 100%;"}
              >
                {renderFormItem(formItem)}
              </ElFormItem>
            </ElCol>
          </ElRow>
        );
      });
    };

    const changeFormData = (data) => {
      formData.value = {
        ...formData.value,
        ...data,
      };
    };
    const renderFormItem = (formItem) => {
      const onFormItemChange = (formItem) => {
        if (formItem.onChange) {
          formItem.onChange(formData.value, changeFormData);
        }
        emit("update:modelValue", formData.value);
      };

      const defaultFileType = [
        "png",
        "jpg",
        "gif",
        "jpeg",
        "pdf",
        "webp",
        "mp4",
      ];
      const onUploadChange = async (formItem, uploadFile, uploadFiles) => {
        const fileType =
          props.formOption?.option?.upload?.fileType || defaultFileType;

        const fileName = uploadFile?.name.split(".");
        const fileExt = fileName[fileName.length - 1];
        const isTypeOk = fileType.indexOf(fileExt) >= 0;

        if (!isTypeOk) {
          await nextTick(() => {
            formData.value[formItem.prop].shift(-1);
          });
          return ElMessage({
            type: "warning",
            message: `文件格式不正确, 请上传${fileType.join("/")}格式文件!`,
          });
        }

        const isLt = uploadFile.size / 1024 / 1024 < 100;
        if (!isLt) {
          await nextTick(() => {
            formData.value[formItem.prop].shift();
          });
          return ElMessage({
            type: "warning",
            message: "上传文件大小不能超过 100 MB!",
          });
        } else {
          let params = {
            ...formItem?.option?.params,
            file: uploadFile.raw,
          };

          try {
            const fetch =
              formItem.option?.fetch ||
              props.formOption?.option?.upload?.fetch ||
              null;

            if (fetch) {
              const res = await fetch(params);
              if (res?.code === 200) {
                // 添加文件额外信息并移除默认添加的文件信息
                formData.value[formItem.prop] = formData.value[
                  formItem.prop
                ].map((file) => {
                  if (
                    file[formItem?.option?.name || "name"] === uploadFile.name
                  ) {
                    return {
                      ...file,
                      ...formItem?.option?.extra,
                      [formItem?.option?.name || "name"]: uploadFile.name,
                      [formItem?.option?.id || "fileId"]: res.data.id,
                    };
                  } else {
                    return file;
                  }
                });
                ElMessage({ type: "success", message: res?.msg });
              } else {
                ElMessage({ type: "error", message: res?.msg });
              }
            }
          } catch (e) {
            console.error(e);
          }
          emit("update:modelValue", formData.value);
        }
      };

      const onUploadRemove = async (formItem, uploadFile, uploadFiles) => {
        if (formData.value[formItem.prop]?.length) {
          const index = formData.value[formItem.prop].findIndex(
            (item) => item[formItem?.option?.name || "name"] === uploadFile.name
          );

          const del =
            formItem.option?.del ||
            props.formOption?.option?.upload?.del ||
            null;
          if (del) {
            try {
              await del(
                formData.value[formItem.prop][index][
                  formItem?.option?.id || "fileId"
                ]
              );
            } catch (e) {
              console.error(e);
            }
          }

          formData.value[formItem.prop] = formData.value[formItem.prop].filter(
            (item) => item[formItem?.option?.name || "name"] !== uploadFile.name
          );
          emit("update:modelValue", formData.value);
        }
      };

      if (formItem.type === "input") {
        return (
          <ElInput
            v-model={formData.value[formItem.prop]}
            placeholder={formItem?.placeholder || `请输入${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          ></ElInput>
        );
      } else if (formItem.type === "number") {
        return (
          <ElInputNumber
            v-model={formData.value[formItem.prop]}
            placeholder={formItem?.placeholder || `请输入${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          ></ElInputNumber>
        );
      } else if (formItem.type === "textarea") {
        return (
          <ElInput
            type="textarea"
            v-model={formData.value[formItem.prop]}
            placeholder={formItem?.placeholder || `请输入${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            rows={formItem?.rows || 2}
            {...formItem?.option}
          ></ElInput>
        );
      } else if (formItem.type === "select") {
        return (
          <ElSelect
            v-model={formData.value[formItem.prop]}
            placeholder={formItem?.placeholder || `请选择${formItem?.label}`}
            clearable={formItem.option?.clearable || true}
            collapse-tags={true}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          >
            {formItem?.options?.length
              ? formItem?.options?.map((option) => {
                  // 支持使用配置 props 对象来改变指向选项 option 的 label/value key
                  const labelName = "label";
                  const valueName = "value";
                  return (
                    <ElOption
                      label={
                        option[formItem?.option?.props?.label || labelName]
                      }
                      value={
                        option[formItem?.option?.props?.value || valueName]
                      }
                    ></ElOption>
                  );
                })
              : null}
          </ElSelect>
        );
      } else if (formItem.type === "selectv2") {
        return (
          <ElSelectV2
            v-model={formData.value[formItem.prop]}
            options={formItem?.options}
            placeholder={formItem?.placeholder || `请输入${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            {...formItem?.option}
          ></ElSelectV2>
        );
      } else if (formItem.type === "autocomplete") {
        return (
          <ElAutocomplete
            v-model={formData.value[formItem.prop]}
            fetch-suggestions={formItem?.fetch}
            placeholder={formItem?.placeholder || `请输入${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          ></ElAutocomplete>
        );
      } else if (
        formItem.type === "date" ||
        formItem.type === "datetime" ||
        formItem.type === "daterange"
      ) {
        return (
          <ElDatePicker
            v-model={formData.value[formItem.prop]}
            type={formItem.option?.type || formItem.type}
            placeholder={formItem?.placeholder || `请选择${formItem?.label}`}
            format={formItem.option?.format || "YYYY-MM-DD HH:mm:ss"}
            value-format={formItem.option?.valueFormat || "YYYY-MM-DD HH:mm:ss"}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          ></ElDatePicker>
        );
      } else if (formItem.type === "tree") {
        return (
          <ElTreeSelect
            v-model={formData.value[formItem.prop]}
            data={formItem.options}
            show-checkbox={formItem.option?.showCheckbox || true}
            multiple={formItem.option?.multiple || true}
            clearable={formItem.option?.clearable || true}
            collapse-tags={formItem.option?.collapseTags || true}
            style={formItem?.style || "width: 100%;"}
            onChange={() => onFormItemChange(formItem)}
            read-only={
              props?.formOption?.option?.readOnly || formItem?.option?.readOnly
            }
            disabled={
              props?.formOption?.option?.disabled || formItem?.option?.disabled
            }
            {...formItem?.option}
          ></ElTreeSelect>
        );
      } else if (formItem.type === "treeselect") {
        return (
          <ElTreeSelect
            v-model={formData.value[formItem.prop]}
            data={formItem?.options || []}
            placeholder={formItem?.placeholder || `请选择${formItem?.label}`}
            onChange={() => onFormItemChange(formItem)}
            style={formItem?.style || "width: 100%;"}
            props={formItem?.option?.props || {}}
            {...formItem?.option}
          ></ElTreeSelect>
        );
      } else if (formItem.type === "cascader") {
        return (
          <ElCascader
            v-model={formData.value[formItem.prop]}
            options={formItem?.options || []}
            props={formItem?.option?.props || {}}
            onChange={() => onFormItemChange(formItem)}
            placeholder={formItem?.placeholder || `请选择${formItem?.label}`}
            style={formItem?.style || "width: 100%;"}
            {...formItem?.option}
          ></ElCascader>
        );
      } else if (formItem.type === "mention") {
        return (
          <ElMention
            v-model={formData.value[formItem.prop]}
            options={formItem?.options || []}
            placeholder={
              formItem?.placeholder ||
              `使用 @ 提及${formItem?.label}，多个用户之间用空格隔开`
            }
            onSelect={() => onFormItemChange(formItem)}
            {...formItem?.option}
          ></ElMention>
        );
      } else if (formItem.type === "upload") {
        const action =
          formItem?.option?.url || props.formOption?.option?.upload?.url || "";
        return (
          <ElUpload
            action={action}
            v-model:file-list={formData.value[formItem.prop]}
            onChange={(uploadFile, uploadFiles) =>
              onUploadChange(formItem, uploadFile, uploadFiles)
            }
            onRemove={(uploadFile, uploadFiles) =>
              onUploadRemove(formItem, uploadFile, uploadFiles)
            }
            {...formItem?.option}
          >
            {{
              default: () => {
                return <ElButton type="primary">文件上传</ElButton>;
              },
              tip: () => {
                const fileType =
                  props.formOption?.option?.upload?.fileType || defaultFileType;
                return (
                  <ElText className="ml-4">
                    支持文件格式{fileType.join(",")}
                  </ElText>
                );
              },
            }}
          </ElUpload>
        );
      } else if (formItem.type === "button") {
        renderButton(formItem);
      } else if (formItem.type === "buttonGroup") {
        return (
          <div
            className="base-form-button-group"
            style={formItem?.style || "width: 100%;"}
            {...formItem?.option}
          >
            {formItem.buttons?.map((button) => {
              return renderButton(button);
            })}
          </div>
        );
      }
    };

    const renderButton = (formItem) => {
      const role =
        typeof formItem?.option?.role === "boolean"
          ? formItem?.option?.role
          : true;
      // 判断按钮是否隐藏
      const isShow = !formItem?.option?.hidden;
      return role && isShow ? (
        <ElButton
          type={formItem.color}
          onClick={() => onClickButton(formItem)}
          {...formItem?.option}
        >
          {formItem?.label}
        </ElButton>
      ) : null;
    };

    const onClickButton = async ({ prop, type, event }) => {
      if (type === "submit") {
        if (!formRef.value) return;
        await formRef.value?.validate((valid, fields) => {
          if (valid) {
            if (event) {
              event(prop, formData.value);
            }
            emit("update:modelValue", formData.value);
            emit("submit", formData.value);
          }
        });
      } else if (type === "reset") {
        formRef.value?.resetFields();
        if (event) {
          event(prop, formData.value);
        }
        emit("reset");
      } else {
        event(prop, formData.value);
      }
    };

    return () => (
      <div class="base-data-form">
        <Form></Form>
      </div>
    );
  },
});

export default DataForm;
