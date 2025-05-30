import { defineConfig } from "vite";
import path, { join } from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Unocss from 'unocss/vite'
import { presetUno } from 'unocss'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command == "build";
  return {
    publicPath: "/",
    plugins: [
      vue(),
      vueJsx(),
      Unocss({
        presets: [
          presetUno(),
        ],
      })
    ],
    // 设置别名
    resolve: {
      alias: {
        "@/package": join(__dirname, "./package/"),
      },
      extensions: [".vue", ".js", ".json", ".ts", ".tsx"], //使用别名省略的后缀名
    },
    build: {
      // outDir: "lib", //输出文件名称
      lib: {
        entry: join(__dirname, "./package/index.ts"), //指定组件编译入口文件
        name: "xform",
        fileName: (format) => `xform.${format}.js`, // 打包后的文件名
      }, //库编译模式配置
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ["vue", "element-plus"],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            vue: "vue",
            "element-plus": "element-plus",
          },
        },
      }, // rollup打包配置
    },
    server: {
      port: '8080'
    }
  };
});
