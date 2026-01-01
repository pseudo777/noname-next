import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [tailwindcss(), svelte()],
//   base: "/noname-next/",

//   resolve: {
//     alias: {
//       "@core": path.resolve(__dirname, "./src/core"),
//       "@mods": path.resolve(__dirname, "./src/mods"),
//       "@assets": path.resolve(__dirname, "./src/assets"),
//       $lib: path.resolve("./src/lib"),
//     },
//   },
// });
export default defineConfig(({ command }) => {
  // 判断当前是在开发环境还是生产打包
  const isDev = command === "serve";

  return {
    plugins: [tailwindcss(), svelte()],

    // 🌟 改动 2: 智能 Base 路径
    // 如果是开发环境 (bun dev)，用 '/'
    // 如果是打包环境 (bun run build)，用 '/noname-next/' (替换成你的仓库名)
    base: isDev ? "/" : "/noname-next/",

    resolve: {
      alias: {
        "@core": path.resolve(__dirname, "./src/core"),
        "@mods": path.resolve(__dirname, "./src/mods"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        $lib: path.resolve("./src/lib"), // 确保 shadcn 需要的 alias 也在
      },
    },
  };
});
