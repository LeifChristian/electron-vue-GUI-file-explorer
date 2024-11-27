import { type Plugin, defineConfig, loadEnv } from "vite";
import { rmSync } from "fs";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
// Use require for json import to avoid TS error
const pkg = require("./package.json");

rmSync("dist-electron", { recursive: true, force: true });
const sourcemap = !!process.env.VSCODE_DEBUG;
const isBuild = process.argv.slice(2).includes("build");

function loadEnvPlugin(): Plugin {
  return {
    name: "vite-plugin-load-env",
    config(config, env) {
      const root = config.root ?? process.cwd();
      const result = loadEnv(env.mode, root);
      delete result.VITE_DEV_SERVER_URL;
      
      // Handle esbuild config type safely
      if (typeof config.esbuild === 'object') {
        config.esbuild = config.esbuild || {};
        config.esbuild.define = {
          ...(config.esbuild.define || {}),
          ...Object.fromEntries(
            Object.entries(result).map(([key, val]) => [
              `process.env.${key}`,
              JSON.stringify(val),
            ])
          ),
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: "src/electron/main/main.ts",
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: "dist-electron/main",
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
          plugins: [loadEnvPlugin()],
        },
      },
      {
        entry: "src/electron/preload/preload.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: "dist-electron/preload",
            rollupOptions: {
              external: Object.keys(pkg.dependencies),
            },
          },
        },
      }
    ]),
    renderer(),
  ],
  server: {
    host: pkg.env?.VITE_DEV_SERVER_HOST,
    port: pkg.env?.VITE_DEV_SERVER_PORT,
  },
  base: "./",
});