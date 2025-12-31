import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "/noname-next/",
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "./src/core"),
      "@mods": path.resolve(__dirname, "./src/mods"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});
