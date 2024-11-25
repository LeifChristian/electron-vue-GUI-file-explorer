"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const fs_1 = require("fs");
const plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
const vite_plugin_electron_1 = __importDefault(require("vite-plugin-electron"));
const vite_plugin_electron_renderer_1 = __importDefault(require("vite-plugin-electron-renderer"));
// Use require for json import to avoid TS error
const pkg = require("./package.json");
(0, fs_1.rmSync)("dist-electron", { recursive: true, force: true });
const sourcemap = !!process.env.VSCODE_DEBUG;
const isBuild = process.argv.slice(2).includes("build");
function loadEnvPlugin() {
    return {
        name: "vite-plugin-load-env",
        config(config, env) {
            const root = config.root ?? process.cwd();
            const result = (0, vite_1.loadEnv)(env.mode, root);
            delete result.VITE_DEV_SERVER_URL;
            // Handle esbuild config type safely
            if (typeof config.esbuild === 'object') {
                config.esbuild = config.esbuild || {};
                config.esbuild.define = {
                    ...(config.esbuild.define || {}),
                    ...Object.fromEntries(Object.entries(result).map(([key, val]) => [
                        `process.env.${key}`,
                        JSON.stringify(val),
                    ])),
                };
            }
        },
    };
}
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, vite_plugin_electron_1.default)([
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
        (0, vite_plugin_electron_renderer_1.default)(),
    ],
    server: {
        host: pkg.env?.VITE_DEV_SERVER_HOST,
        port: pkg.env?.VITE_DEV_SERVER_PORT,
    },
    base: "./",
});
//# sourceMappingURL=vite.config.js.map