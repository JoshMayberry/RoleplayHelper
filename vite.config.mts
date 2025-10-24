// Plugins
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Fonts from "unplugin-fonts/vite";
// Layouts plugin removed — layouts are handled manually now
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import tsconfigPaths from "vite-tsconfig-paths";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths({ loose: true }),
		// layouts plugin removed; use layout components directly in pages
		AutoImport({
			imports: [
				"vue",
				"vue-router",
				{
					pinia: ["defineStore", "storeToRefs"],
				},
			],
			dts: "src/generated/auto-imports.d.ts",
			eslintrc: {
				enabled: false,
			},
			vueTemplate: true,
		}),
		Components({
			dirs: [
				"src/app/components",
				"src/shared/components",
				"src/features/**/components",
			],
			dts: "src/generated/components.d.ts",
		}),
		Vue({
			template: { transformAssetUrls },
		}),
		Vuetify({
			autoImport: true,
			styles: {
				configFile: "src/app/styles/settings.scss",
			},
		}),
		Fonts({
			fontsource: {
				families: [
					{
						name: "Roboto",
						weights: [100, 300, 400, 500, 700, 900],
						styles: ["normal", "italic"],
					},
				],
			},
		}),
	],
	optimizeDeps: {
		exclude: ["vuetify", "vue-router"],
	},
	define: { "process.env": {} },
	resolve: {
		extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
	},
	server: {
		port: 3000,
		proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
	},
});
