import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		exclude: ["**/node_modules/**", "**/.pnpm-store/**"],
	},
});

export default config;
