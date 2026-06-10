import { defaultTheme, ThemeProvider } from "@inkjs/ui";
import { render } from "ink";

import { App } from "./App";
import { runCli } from "./cli";
import { createDirectApi } from "./direct-api";

const runTui = async () => {
	let appInstance: ReturnType<typeof render> | null = null;
	const api = createDirectApi();

	try {
		appInstance = render(
			<ThemeProvider theme={defaultTheme}>
				<App
					api={api}
					onQuit={() => {
						appInstance?.unmount();
					}}
				/>
			</ThemeProvider>,
		);

		await appInstance.waitUntilExit();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		process.stderr.write(`TUI error: ${message}\n`);
		process.exitCode = 1;
	}
};

const main = async () => {
	const args = process.argv.slice(2);
	const cliResult = await runCli(args);
	if (cliResult.handled) {
		process.exitCode = cliResult.exitCode;
		return;
	}

	await runTui();
};

void main();
