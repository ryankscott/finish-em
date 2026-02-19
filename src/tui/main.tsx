import { render } from "ink"

import { createApi } from "./api"
import { createDirectApi } from "./direct-api"
import { App } from "./App"
import { ensureServerRunning } from "./server"

const parseArgs = () => {
	const args = process.argv.slice(2)
	let apiUrl = process.env.TUI_API_URL ?? "http://localhost:3000"
	let autoStart = true
	// Default to embedded mode so the standalone binary works out of the box.
	// Pass --mode=server to connect to an existing HTTP server instead.
	let mode: "embedded" | "server" = "embedded"

	for (const arg of args) {
		if (arg.startsWith("--api-url=")) {
			apiUrl = arg.slice("--api-url=".length)
		} else if (arg === "--no-auto-start") {
			autoStart = false
		} else if (arg === "--mode=server") {
			mode = "server"
		} else if (arg === "--mode=embedded") {
			mode = "embedded"
		}
	}

	return { apiUrl, autoStart, mode }
}

const main = async () => {
	const { apiUrl, autoStart, mode } = parseArgs()
	let appInstance: ReturnType<typeof render> | null = null

	if (mode === "embedded") {
		// Embedded mode: call the data layer directly. No HTTP server needed.
		const api = createDirectApi()
		try {
			appInstance = render(
				<App
					api={api}
					onQuit={() => {
						appInstance?.unmount()
					}}
				/>,
			)
			await appInstance.waitUntilExit()
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			process.stderr.write(`TUI error: ${message}\n`)
			process.exitCode = 1
		}
		return
	}

	// Server mode: connect to an external HTTP API server (dev workflow).
	const api = createApi(apiUrl)
	let serverHandle: Awaited<ReturnType<typeof ensureServerRunning>> | null = null

	try {
		serverHandle = await ensureServerRunning(apiUrl, autoStart, process.cwd())
		if (serverHandle.startedServer) {
			process.stdout.write("Started local server via pnpm dev\n")
		}

		appInstance = render(
			<App
				api={api}
				onQuit={() => {
					appInstance?.unmount()
				}}
			/>,
		)

		await appInstance.waitUntilExit()
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		process.stderr.write(`TUI error: ${message}\n`)
		process.exitCode = 1
	} finally {
		if (serverHandle) {
			await serverHandle.stop()
		}
	}
}

void main()
