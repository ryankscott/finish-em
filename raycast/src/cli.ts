import { exec } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

let binaryPath: string | null = null;

async function getBinaryPath(): Promise<string> {
	if (binaryPath) return binaryPath;

	// Try to find Bun binary
	const bunPaths = [
		`${homedir()}/.bun/bin/bun`,
		`/usr/local/bin/bun`,
		`/opt/homebrew/bin/bun`,
	];

	for (const bunPath of bunPaths) {
		if (existsSync(bunPath)) {
			binaryPath = bunPath;
			return binaryPath;
		}
	}

	throw new Error(`Bun binary not found. Checked: ${bunPaths.join(", ")}`);
}

export async function runCli<T>(
	args: string,
	env?: Record<string, string>,
): Promise<T> {
	const bunPath = await getBinaryPath();
	const home = homedir();
	const finishEmDir = `${home}/Code/finish-em`;
	const finishEmPath = `${finishEmDir}/src/cli.ts`;

	try {
		const { stdout, stderr } = await execAsync(
			`"${bunPath}" "${finishEmPath}" ${args}`,
			{
				env: {
					...process.env,
					...env,
				},
				cwd: finishEmDir,
			},
		);

		if (!stdout.trim()) {
			throw new Error(stderr || "finish-em returned no output");
		}

		return JSON.parse(stdout) as T;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		throw error;
	}
}
