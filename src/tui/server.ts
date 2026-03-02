import { spawn } from "node:child_process"

type ServerHandle = {
	stop: () => Promise<void>
	startedServer: boolean
}

const wait = (ms: number) => new Promise<void>((resolve) => {
	setTimeout(resolve, ms)
})

const trimLog = (value: string, maxChars = 4_000): string => {
	if (value.length <= maxChars) {
		return value
	}
	return value.slice(value.length - maxChars)
}

const isServerReady = async (baseUrl: string): Promise<boolean> => {
	try {
		const normalizedBaseUrl = baseUrl.replace(/\/$/, "")
		for (const path of ["/api/settings", "/api/projects", "/"]) {
			try {
				const response = await fetch(`${normalizedBaseUrl}${path}`)
				if (response.status < 500) {
					return true
				}
			} catch {
				continue
			}
		}
		return false
	} catch {
		return false
	}
}

const waitForServer = async (input: {
	baseUrl: string
	timeoutMs: number
	hasExited: () => boolean
}): Promise<"ready" | "exited" | "timeout"> => {
	const startedAt = Date.now()
	while (Date.now() - startedAt < input.timeoutMs) {
		if (await isServerReady(input.baseUrl)) {
			return "ready"
		}

		if (input.hasExited()) {
			return "exited"
		}
		await wait(500)
	}
	return "timeout"
}

export const ensureServerRunning = async (
	baseUrl: string,
	autoStart: boolean,
	cwd?: string,
): Promise<ServerHandle> => {
	if (await isServerReady(baseUrl)) {
		return {
			startedServer: false,
			stop: async () => {},
		}
	}

	if (!autoStart) {
		throw new Error("API server is not running and auto-start is disabled")
	}

	let processExited = false
	let exitCode: number | null = null
	let signalCode: NodeJS.Signals | null = null
	let capturedLogs = ""

	const child = spawn("bun", ["run", "dev"], {
		cwd,
		stdio: ["ignore", "pipe", "pipe"],
		shell: process.platform === "win32",
	})

	child.stdout?.on("data", (chunk: Buffer | string) => {
		capturedLogs = trimLog(`${capturedLogs}${chunk.toString()}`)
	})

	child.stderr?.on("data", (chunk: Buffer | string) => {
		capturedLogs = trimLog(`${capturedLogs}${chunk.toString()}`)
	})

	child.once("exit", (code, signal) => {
		processExited = true
		exitCode = code
		signalCode = signal
	})

	const timeoutMs = Number(process.env.TUI_SERVER_START_TIMEOUT_MS ?? "45000")
	const waitResult = await waitForServer({
		baseUrl,
		timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 45_000,
		hasExited: () => processExited,
	})

	if (waitResult !== "ready") {
		if (!child.killed) {
			child.kill("SIGTERM")
		}

		const exitSummary = processExited
			? `dev server process exited early (code=${exitCode ?? "null"}, signal=${signalCode ?? "null"})`
			: `timed out after ${timeoutMs}ms waiting for API server readiness`

		const logSummary = capturedLogs.trim().length > 0
			? `\n--- dev server output ---\n${capturedLogs.trim()}\n--- end output ---`
			: ""

		throw new Error(`${exitSummary}${logSummary}`)
	}

	return {
		startedServer: true,
		stop: async () => {
			if (child.killed) {
				return
			}

			await new Promise<void>((resolve) => {
				let settled = false

				const finalize = () => {
					if (settled) {
						return
					}
					settled = true
					resolve()
				}

				child.once("exit", finalize)
				child.kill("SIGTERM")

				setTimeout(() => {
					if (!settled) {
						child.kill("SIGKILL")
						finalize()
					}
				}, 2_000)
			})
		},
	}
}
