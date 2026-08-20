import { fileURLToPath, URL } from "node:url";
import { defineConfig, type UserConfig } from "vite";

/** Vitest reads a `test` block that Vite's own config type does not declare. */
type ConfigWithTest = UserConfig & {
	test?: {
		environment?: string;
		exclude?: string[];
	};
};

const config: ConfigWithTest = {
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		exclude: ["**/node_modules/**", "**/.pnpm-store/**"],
	},
};

export default defineConfig(config);
