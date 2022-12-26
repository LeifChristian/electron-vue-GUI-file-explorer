import { type Plugin, defineConfig, loadEnv } from "vite";
import { rmSync } from "fs";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";
import pkg from "./package.json";

rmSync("dist-electron", { recursive: true, force: true });
const sourcemap = !!process.env.VSCODE_DEBUG;
// const isBuild = process.argv.slice(2).includes("build");
const isBuild = false

// https://vitejs.dev/config/

function loadEnvPlugin(): Plugin {
  return {
    name: "vite-plugin-load-env",
    config(config, env) {
      const root = config.root ?? process.cwd();
      const result = loadEnv(env.mode, root);
      // Remove the vite-plugin-electron injected env.
      delete result.VITE_DEV_SERVER_URL;
      config.esbuild ??= {};
      config.esbuild.define = {
        ...config.esbuild.define,
        ...Object.fromEntries(
          Object.entries(result).map(([key, val]) => [
            `process.env.${key}`,
            JSON.stringify(val),
          ])
        ),
      };
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: "src/electron/main/main.ts",
        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(
              /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
            );
          } else {
            options.startup();
          }
        },
        vite: {
          build: {
            sourcemap,
            minify: false,
            outDir: "src/electron/main",
            rollupOptions: {
              // external: Object.keys(pkg.dependencies),
            },
          },
          plugins: [loadEnvPlugin()],
        },
      },
    ]),
  ],
  base: "./",
});
