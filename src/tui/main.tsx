import { render } from "ink"

import { App } from "./App"
import { startMcpHttpServer } from "./mcp-http-server"
import { createMcpApi } from "./mcp-api"

const parseArgs = () => {
	const args = process.argv.slice(2)
	let mcpHost = process.env.FINISH_EM_MCP_HOST ?? "127.0.0.1"
	let mcpPort = Number.parseInt(process.env.FINISH_EM_MCP_PORT ?? "5173", 10)
	let enableMcp = true
	let headlessMcp = false

	for (const arg of args) {
		if (arg.startsWith("--mcp-host=")) {
			mcpHost = arg.slice("--mcp-host=".length)
		} else if (arg.startsWith("--mcp-port=")) {
			mcpPort = Number.parseInt(arg.slice("--mcp-port=".length), 10)
		} else if (arg === "--no-mcp") {
			enableMcp = false
		} else if (arg === "--headless-mcp") {
			headlessMcp = true
		}
	}

	if (!Number.isFinite(mcpPort) || mcpPort <= 0) {
		throw new Error("Invalid MCP port: expected a positive integer")
	}

	return { mcpHost, mcpPort, enableMcp, headlessMcp }
}

const main = async () => {
	const { mcpHost, mcpPort, enableMcp, headlessMcp } = parseArgs()
	let appInstance: ReturnType<typeof render> | null = null
	let mcpHandle: Awaited<ReturnType<typeof startMcpHttpServer>> | null = null

	const api = createMcpApi()

	try {
		if (enableMcp) {
			mcpHandle = await startMcpHttpServer({ host: mcpHost, port: mcpPort })
			process.stdout.write(`MCP server listening at ${mcpHandle.url}\n`)
		}

		if (headlessMcp) {
			await new Promise<void>(() => {})
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
		if (mcpHandle) {
			await mcpHandle.stop()
		}
	}
}

void main()
