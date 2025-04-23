import {
  defineComponent,
  ref,
  computed,
  watchEffect,
  shallowRef,
  defineExpose,
} from "vue";
import { ElButton, ElDialog } from "element-plus";
import DataForm from "./DataForm.tsx";
import DataTable from "./DataTable.tsx";
import Description from "./Description.vue";
import { useFetch, useFormFetch } from "../hooks/useFetch.ts";
import { Plus } from "@element-plus/icons-vue";

const BaseCRUD = defineComponent({
  name: "BaseCRUD",
  props: {
    // 用于查询数据的异步函数
    fetch: {
      type: Object,
      default: () => {},
    },
    // 额外传递参数
    params: {
      type: Object,
      default: () => {},
    },
    crudOption: {
      type: Object,
      default: () => {},
      required: true,
    },
  },
  emits: ["changeForm"],
  setup(props, { emit, expose }) {
    const tablePage = ref(1);
    const tableLimit = ref(10);

    const params = computed(() => {
      return {
        ...props?.params,
        pageNum: tablePage.value,
        pageSize: tableLimit.value,
      };
    });

    const {
      data: tableData,
      total: tableTotal,
      loading: tableLoading,
      onFetch: onGetList,
    } = useFetch(props?.fetch?.r, params.value, null, false, {
      ...props.crudOption?.option?.fetch,
    });

    const getList = () => {
      onGetList(params.value);
    };

    const isInit = shallowRef(false);
    watchEffect(() => {
      // 判断是否手动初始化查询数据
      if (props?.crudOption?.option?.crud?.lazy) {
        if (isInit.value) {
          getList();
        }
      } else {
        getList();
      }
    });
    const initCrud = () => {
      isInit.value = true;
    };

    const reset = () => {
      tablePage.value = 1;
      tableLimit.value = 10;
      getList();
    };

    const { onFetch: onAdd } = useFormFetch(props?.fetch?.c);
    const { onFetch: onUpdate } = useFormFetch(props?.fetch?.u);
    const { onFetch: onDel } = useFormFetch(props?.fetch?.d);

    // 表格配置
    const tableOption = computed(() => {
      if (props.crudOption?.column?.length) {
        return {
          ...props.crudOption,
          column: [
            ...props.crudOption.column?.map((table) => {
              return {
                ...table,
                ...table?.option?.table,
              };
            }),
            props?.crudOption?.option?.readOnly
              ? {
                  isNotTableShow: true,
                }
              : {
                  type: "operate",
                  label: "操作",
                  width: "155",
                  role: props.crudOption?.option?.table?.role,
                  operate: ["view", "edit", "del"],
                  option: {
                    fixed: "right",
                  },
                },
          ],
        };
      }
      return {};
    });
    // 表格内表单
    const tableFormOption = computed(() => {
      if (props.crudOption?.column?.length) {
        return {
          ...props.crudOption,
          option: {
            ...props?.crudOption?.option?.form,
          },
          column: [
            ...props.crudOption.column?.filter((form) => {
              // update: 忽略 index 表格列
              if (!form?.formHidden && form?.type !== "index") {
                return {
                  ...form,
                  ...form?.option?.form,
                };
              }
            }),
            {
              type: "buttonGroup",
              buttons: [
                {
                  prop: "search",
                  color: "primary",
                  option: {
                    ...props?.crudOption?.option?.crud,
                  },
                  type: "submit",
                  label: "确定",
                },
                {
                  prop: "reset",
                  type: "button",
                  label: "取消",
                  event: (prop, form) => handleClose(),
                },
              ],
              span: 24,
              style: "text-align: right; width: 100%;",
            },
          ],
        };
      }
      return {};
    });

    /**
     *  表格查看详情
     */
    const dialogVisible3 = ref(false);
    const descHeader = computed(() => {
      if (props.crudOption?.column?.length) {
        let obj = {};
        props.crudOption.column.map((item) => {
          obj[item.prop] = item.label;
        });
        return obj;
      }
      return {};
    });
    const descData = ref({});
    const onTableView = async (row) => {
      if (props?.crudOption?.data?.view) {
        // 异步获取返回参数
        const data = await props?.crudOption?.data?.view(row);
        descData.value = {
          ...data,
        };
      } else {
        descData.value = {
          ...row,
        };
      }

      dialogVisible3.value = true;
    };

    /**
     *  表格编辑内容
     */
    const dialogVisible2 = ref(false);
    // 判断是新增还是修改
    const dialogType = ref(false);
    const tableFormData = ref({});

    const onChangeForm = (formData) => {
      emit("changeForm", formData);
    };

    const onTableEdit = async (row) => {
      if (props?.crudOption?.data?.edit) {
        // 异步获取返回参数
        const data = await props?.crudOption?.data?.edit(row);
        tableFormData.value = JSON.parse(
          JSON.stringify({
            // 需要返回一个数据对象
            ...data,
          })
        );
      } else {
        tableFormData.value = JSON.parse(
          JSON.stringify({
            ...row,
          })
        );
      }
      dialogType.value = false;
      dialogVisible2.value = true;
    };
    const formParams = computed(() => {
      return {
        ...props?.params,
        ...tableFormData.value,
      };
    });
    const onFormSubmit = async () => {
      // 判断是新增还是编辑
      if (dialogType.value) {
        if (props?.crudOption?.event?.add) {
          // 异步等待新增接口
          await props.crudOption.event.add(tableFormData.value);
        } else {
          await onAdd(formParams.value);
        }
      } else {
        if (props?.crudOption?.event?.edit) {
          await props.crudOption.event.edit(tableFormData.value);
        } else {
          await onUpdate(formParams.value);
        }
      }
      // 关闭弹窗，刷新数据
      dialogVisible2.value = false;
      reset();
    };

    /**
     *  表格新增
     */
    const onTableAdd = () => {
      tableFormData.value = {};
      dialogType.value = true;
      dialogVisible2.value = true;
    };

    /**
     *  表格删除
     */
    const onTableDel = async (row) => {
      if (props?.crudOption?.event?.delete) {
        await props.crudOption.event.delete(row);
      } else {
        await onDel(row.id);
        reset();
      }
    };

    const handleClose = () => {
      tableFormData.value = {};
      dialogVisible2.value = false;
    };

    const onTablePageChange = ({ limit, page }) => {
      tableLimit.value = limit;
      tablePage.value = page;
    };

    const renderView = () => {
      if (dialogVisible3.value) {
        return (
          <Description
            v-model:visible={dialogVisible3.value}
            title="查看详情"
            width="70%"
            header={descHeader.value}
            data={descData.value}
            relType={props?.crudOption?.option?.relType}
          ></Description>
        );
      }
    };

    const renderEdit = () => {
      if (dialogVisible2.value) {
        return (
          <ElDialog
            v-model={dialogVisible2.value}
            title={dialogType.value ? "新增内容" : "编辑内容"}
            before-close={handleClose}
          >
            <DataForm
              v-model={tableFormData.value}
              formOption={tableFormOption.value}
              onSubmit={onFormSubmit}
              onUpdate:modelValue={onChangeForm}
            ></DataForm>
          </ElDialog>
        );
      }
    };

    expose({ fetch: getList, reset, initCrud, onTableAdd });

    return () => (
      <div className="base-crud flex flex-col gap-4 w-full">
        <div>
          {props.crudOption?.option?.form?.role !== false &&
          !props.crudOption?.option?.readOnly &&
          props?.crudOption?.option?.crud?.add !== "hidden" ? (
            <ElButton type="primary" icon={Plus} onClick={onTableAdd}>
              新增
            </ElButton>
          ) : null}
        </div>
        {/* 数据展示表格 */}
        <DataTable
          tableOption={tableOption.value}
          tableData={tableData.value}
          tableTotal={tableTotal.value}
          tableLoading={tableLoading.value}
          tablePage={tablePage.value}
          tableLimit={tableLimit.value}
          onView={onTableView}
          onEdit={onTableEdit}
          onDel={(row) => onTableDel(row)}
          onPageChange={onTablePageChange}
        ></DataTable>
        {/* 查看详情弹框 */}
        {renderView()}

        {/* 编辑内容弹框 */}
        {renderEdit()}
      </div>
    );
  },
});

export default BaseCRUD;
