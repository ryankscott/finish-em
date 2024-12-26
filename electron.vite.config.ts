import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["node-fetch", "open", "electron-store"],
      }),
    ],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    assetsInclude: ["**/*.md"],
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/"),
      },
    },
    plugins: [react()],
  },
});
