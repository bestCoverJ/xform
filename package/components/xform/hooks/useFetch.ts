import { ref, onMounted, shallowRef, Ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface FetchOptions {
  isTreeData?: boolean;
  id?: string;
  pid?: string;
  isJson?: boolean;
}

interface FetchResponse {
  code: number;
  msg?: string;
  rows?: any[];
  data?: any;
  total?: number;
}

interface UseFetchReturn {
  data: Ref<any>;
  initData: Ref<any>;
  total: Ref<number>;
  error: Ref<any>;
  loading: Ref<boolean>;
  reset: () => Promise<any>;
  onFetch: (fetchParams?: any) => Promise<any>;
  reload: (fetchParams?: any) => Promise<any>;
}

interface UseFormFetchReturn {
  data: Ref<any>;
  error: Ref<any>;
  loading: Ref<boolean>;
  onFetch: (fetchParams?: any) => Promise<any>;
}

/**
 * 使用fetch函数封装钩子，用于数据的获取、加载状态的管理以及错误处理。
 */
export function useFetch(
  fetchFunc: (params: any) => Promise<FetchResponse>,
  params: Record<string, any> = {},
  callback: ((data: any) => void) | null = null,
  immediate: boolean = true,
  obj: FetchOptions = { isTreeData: false }
): UseFetchReturn {
  // 初始化数据、总数、错误和加载状态的引用
  const data = ref(null);
  const initData = shallowRef(null);
  const total = shallowRef(0);
  const error = ref(null);
  const loading = shallowRef(false);
  const isFrist = shallowRef(true);
  // 用于存储参数的浅拷贝
  const cloneParams = shallowRef({});

  /**
   * 执行请求的函数。
   *
   * @param {Object} fetchParams - 请求时的参数。
   * @returns {Promise} 返回一个Promise，用于处理请求的结果。
   */
  const onFetch = (fetchParams) => {
    return new Promise((reslove, reject) => {
      // 设置加载状态为true
      loading.value = true;
      const params = obj?.isJson ? JSON.stringify(obj) : fetchParams;
      // 发起请求
      fetchFunc(params)
        .then((res) => {
          // 请求成功处理
          if (res.code === 200) {
            // 判断是否为树形数据并处理
            // 判断数据是否为树形结构
            if (obj?.isTreeData) {
              data.value = handleTree(res.rows, obj.id, obj.pid);
            } else {
              data.value = res?.rows || res?.data || res;
            }
            // 是否读取json格式数据
            if (obj?.isJson) {
              const d = res?.rows || res?.data || res;
              data.value = JSON.parse(d);
            }
            total.value = res.total || 0;

            if (isFrist.value) {
              initData.value = JSON.parse(JSON.stringify(data.value));
            }
            // 如果存在回调函数，则调用之
            if (callback) {
              callback(data.value);
            }
          } else {
            data.value = {};
          }

          isFrist.value = false;
          reslove(res);
        })
        .catch((err) => {
          // 请求失败处理
          error.value = err;
          reject(err);
        })
        .finally(() => {
          // 请求完成后设置加载状态为false
          setTimeout(() => {
            loading.value = false;
          }, 200);
        });
    });
  };

  /**
   * 重新加载数据的方法。
   *
   * @param {Object} fetchParams - 请求时的参数，可选。
   */
  const reload = (fetchParams = null) => {
    let params = fetchParams ? fetchParams : cloneParams.value;
    return onFetch(params);
  };

  /**
   * 重置数据的方法，使用初始参数重新请求数据。
   */
  const reset = () => {
    return onFetch(cloneParams.value);
  };

  // 组件挂载后处理
  onMounted(() => {
    cloneParams.value = params;
    // 如果立即加载设置为true，则立即请求数据
    if (immediate) {
      return onFetch(params);
    }
  });

  // 返回相关状态和方法
  return {
    data,
    initData,
    total,
    error,
    loading,
    reset,
    onFetch,
    reload,
  };
}

/**
 * 用于form提交而发起请求的 hooks。
 */
export function useFormFetch(
  fetchFunc: (params: any) => Promise<FetchResponse>,
  showMessage: boolean = true
): UseFormFetchReturn {
  // 初始化数据状态
  const data = ref(null);
  // 初始化总数状态
  const total = ref(0);
  // 初始化错误状态
  const error = ref(null);
  // 初始化加载状态
  const loading = ref(false);

  /**
   * 发起请求的函数。
   *
   * @param {Object} fetchParams - 请求参数。
   * @returns {Promise} 返回一个 Promise 对象，用于处理请求的结果。
   */
  const onFetch = (fetchParams) => {
    return new Promise((resolve, reject) => {
      // 设置加载状态为 true
      loading.value = true;
      // 调用提供的请求函数，并处理结果
      fetchFunc(fetchParams)
        .then((res) => {
          // 根据响应码决定显示成功或失败消息
          if (res.code === 200) {
            if (showMessage) {
              ElMessage({
                type: "success",
                message: res.msg || "操作成功",
              });
            }
            // 更新数据状态
            data.value = res.data || res.rows || {};
          } else {
            if (showMessage) {
              ElMessage({
                type: "warning",
                message: res.msg || "操作失败",
              });
            }
          }
          // 解析并返回响应对象
          resolve(res);
        })
        .catch((err) => {
          // 请求失败时，更新错误状态并拒绝 Promise
          reject(err);
          error.value = err;
        })
        .finally(() => {
          // 请求结束后，延迟设置加载状态为 false
          setTimeout(() => {
            loading.value = false;
          }, 200);
        });
    });
  };

  // 返回包含数据、错误、加载状态和请求函数的对象
  return {
    data,
    error,
    loading,
    onFetch,
  };
}

/**
 * 将扁平数组转换为树形结构
 * @param {Array} data 原始数据
 * @param {string} idKey 节点ID字段名
 * @param {string} parentKey 父节点ID字段名
 * @param {string} childrenKey 子节点字段名，默认为'children'
 * @returns {Array} 树形结构数据
 */
function handleTree(
  data: any[],
  idKey: string = 'id',
  parentKey: string = 'parentId',
  childrenKey: string = 'children'
): any[] {
  if (!Array.isArray(data)) {
    return []
  }

  // 创建ID到节点的映射
  const map = new Map()
  data.forEach(item => {
    map.set(item[idKey], item)
  })

  const tree = []
  data.forEach(item => {
    const parent = map.get(item[parentKey])
    if (parent) {
      // 如果找到父节点，则将当前节点添加到父节点的children中
      if (!parent[childrenKey]) {
        parent[childrenKey] = []
      }
      parent[childrenKey].push(item)
    } else if (!item[parentKey]) {
      // 如果没有parentKey或找不到父节点，则作为根节点
      tree.push(item)
    }
  })

  return tree
}
