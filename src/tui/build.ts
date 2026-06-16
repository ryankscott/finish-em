/**
 * Build script for the standalone finish-em TUI binary.
 *
 * Two-step process:
 *   1. Bundle src/cli.ts into a single JS file, using a plugin to stub
 *      ink's optional react-devtools-core dependency.
 *   2. Compile the bundle into a standalone Bun binary.
 *
 * Bun 1.x's Bun.build() ignores `outfile`; we use `outdir` + `naming` to
 * control where the intermediate bundle lands.  The compile step also produces
 * a binary named after the entry-point, so we rename it afterwards.
 */

import fs from "node:fs";
import path from "node:path";

const target = (Bun.argv[2] ?? "bun-darwin-arm64") as Parameters<
	typeof Bun.build
>[0]["target"];
const outfile = Bun.argv[3] ?? "dist/finish-em";

const bundleDir = path.resolve("dist");
const bundleName = ".finish-em-bundle.js";
const bundlePath = path.join(bundleDir, bundleName);

// Step 1: Bundle with plugins (no compile).
fs.mkdirSync(bundleDir, { recursive: true });

const bundleResult = await Bun.build({
	entrypoints: ["src/cli.ts"],
	outdir: bundleDir,
	naming: bundleName,
	target: "bun",
	plugins: [
		{
			name: "stub-react-devtools-core",
			setup(build) {
				// ink's devtools.js has a static `import devtools from 'react-devtools-core'`
				// which is only used when process.env.DEV === 'true'. Redirect to a
				// virtual stub so the binary doesn't require the real package at runtime.
				build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
					path: "react-devtools-core",
					namespace: "stub",
				}));
				build.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
					contents:
						"export default {}; export const connectToDevTools = () => {};",
					loader: "js",
				}));
			},
		},
	],
});

if (!bundleResult.success) {
	for (const log of bundleResult.logs) {
		console.error(log);
	}
	process.exit(1);
}

if (!fs.existsSync(bundlePath)) {
	console.error("Bundle was not written to", bundlePath);
	process.exit(1);
}

// Step 2: Compile the bundle into a standalone binary.
// Bun.build({ compile: true }) ignores outfile — the binary is placed next to
// the entry-point and named after it (without extension).
const compileResult = await Bun.build({
	entrypoints: [bundlePath],
	compile: true,
	target,
});

if (!compileResult.success) {
	for (const log of compileResult.logs) {
		console.error(log);
	}
	process.exit(1);
}

// The compiled binary lands in cwd as ".finish-em-bundle" (no ext).
const compiledBinaryPath = path.resolve(path.basename(bundleName, ".js"));
const resolvedOutfile = path.resolve(outfile);

if (compiledBinaryPath !== resolvedOutfile) {
	if (fs.existsSync(resolvedOutfile)) {
		fs.unlinkSync(resolvedOutfile);
	}
	fs.renameSync(compiledBinaryPath, resolvedOutfile);
}

// Clean up intermediate bundle.
fs.unlinkSync(bundlePath);

console.log(`Built ${outfile} (${target})`);
