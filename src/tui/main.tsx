import { render } from "ink"

import { createApi } from "./api"
import { App } from "./App"
import { ensureServerRunning } from "./server"

const parseArgs = () => {
	const args = process.argv.slice(2)
	let apiUrl = process.env.TUI_API_URL ?? "http://localhost:3000"
	let autoStart = true

	for (const arg of args) {
		if (arg.startsWith("--api-url=")) {
			apiUrl = arg.slice("--api-url=".length)
		} else if (arg === "--no-auto-start") {
			autoStart = false
		}
	}

	return { apiUrl, autoStart }
}

const main = async () => {
	const { apiUrl, autoStart } = parseArgs()
	const api = createApi(apiUrl)
	let serverHandle: Awaited<ReturnType<typeof ensureServerRunning>> | null = null
	let appInstance: ReturnType<typeof render> | null = null

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
