import { defineComponent, ref, watchEffect } from "vue";
import { ElLink, ElTable, ElTableColumn, ElPagination } from "element-plus";

const DataTable = defineComponent({
  props: {
    tableLoading: {
      type: Boolean,
      default: false,
    },
    tableOption: {
      type: Object,
      default: () => {},
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    tablePage: {
      type: Number,
      default: 1,
    },
    tableLimit: {
      type: Number,
      default: 10,
    },
    tableTotal: {
      type: Number,
      default: 0,
    },
    tableSizes: {
      type: Array,
      default: () => {
        return [3, 5, 10, 30];
      },
    },
  },
  emits: ["view", "edit", "del", "pageChange"],
  setup(props, { emit, expose }) {
    const getLinkName = (operate) => {
      switch (operate) {
        case "view":
          return "查看";
        case "edit":
          return "编辑";
        case "del":
          return "删除";
        default:
          return "--";
      }
    };
    const Table = () => {
      return (
        <div
          className="base-data-table-wrapper w-full relative"
          v-loading={props.tableLoading}
        >
          <ElTable
            show-overflow-tooltip
            data={props.tableData}
            style="width: 100%"
            stripe
            {...props.tableOption?.option}
          >
            {props.tableOption?.column?.map((col) => {
              if (!col?.isNotTableShow) {
                return (
                  <ElTableColumn
                    type={col?.type}
                    label={col?.label}
                    width={col?.width}
                    minWidth={col?.minWidth}
                    align={col?.align || "center"}
                    {...col?.option}
                  >
                    {{
                      default: ({ row, column, $index }) => (
                        <div className="base-data-table-column">
                          {col?.render
                            ? col.render(col, { row, column, $index })
                            : renderColumn(col, { row, column, $index })}
                        </div>
                      ),
                    }}
                  </ElTableColumn>
                );
              }
            })}
          </ElTable>
        </div>
      );
    };

    const renderLink = (operate, row) => {
      return (
        <ElLink
          type={operate === "del" ? "danger" : "primary"}
          underline={false}
          onClick={() => onLinkClick(operate, row)}
        >
          {getLinkName(operate)}
        </ElLink>
      );
    };

    const renderColumn = (col, { row, column, $index }) => {
      if (col.type === "operate") {
        return (
          <div className="base-data-table-operate flex flex-row justify-center gap-4">
            {col?.operate?.map((operate) => {
              // 当操作为编辑或删除时，根据权限判断渲染
              if (operate === "edit" || operate === "del") {
                const { role = true } = col;
                return role ? renderLink(operate, row) : null;
              }
              return renderLink(operate, row);
            })}
          </div>
        );
      } else if (col.type === "index") {
        return <span>{$index + 1}</span>;
      } else {
        return <span>{row[col.prop] || "--"}</span>;
      }
    };

    const onLinkClick = (operate, row = null) => {
      if (operate === "view") {
        emit("view", row);
      } else if (operate === "edit") {
        emit("edit", row);
      } else if (operate === "del") {
        emit("del", row);
      } else if (operate === "pageChange") {
        emit("pageChange", { limit: row.pageSize, page: row.currentPage });
      }
    };

    const tablePage = ref(props.tablePage);
    const tableLimit = ref(props.tableLimit);

    watchEffect(() => {
      tablePage.value = props.tablePage;
      tableLimit.value = props.tableLimit;
    });

    const onPaginationChange = (currentPage, pageSize) => {
      onLinkClick("pageChange", { currentPage, pageSize });
    };
    const Pagination = () => {
      return (
        <div className="mt-4 flex flex-row justify-end">
          <ElPagination
            v-model:current-page={tablePage.value}
            v-model:page-size={tableLimit.value}
            layout={
              props.tableOption?.option?.layout ||
              "total, sizes, prev, pager, next, jumper"
            }
            pageSizes={props?.tableSizes}
            total={props?.tableTotal}
            onChange={(currentPage, pageSize) =>
              onPaginationChange(currentPage, pageSize)
            }
            background
          ></ElPagination>
        </div>
      );
    };

    const reset = () => {
      tablePage.value = props.tablePage;
      tableLimit.value = props.tableLimit;

      // 当前页面为1时，page并未修改，不会触发change事件，需要手动触发
      // 当前 页面*个数 大于total时，page会强制被修改到1，会第二次触发
      // 要避免二次触发，可在表单点击查询按钮时将页数设置为1
      if (tablePage.value === 1) {
        onPaginationChange(tablePage.value, tableLimit.value);
      }
    };

    expose({ reset });

    return () => (
      <div className="base-data-table w-full">
        <Table />
        <Pagination />
      </div>
    );
  },
});

export default DataTable;
