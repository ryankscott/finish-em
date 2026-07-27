import { getPreferenceValues } from "@raycast/api";

/**
 * HTTP client for the finish-em API.
 *
 * This used to shell out to `bun src/cli.ts`, which required a local checkout,
 * a local Bun, and the TUI. All three are gone: the TUI was removed and the
 * backend is a Cloudflare Worker. Talking to the API over HTTP also means the
 * extension works from anywhere rather than only when a local server happens
 * to be running.
 */

type Preferences = {
	apiUrl: string;
	authToken?: string;
};

function config() {
	const prefs = getPreferenceValues<Preferences>();
	const baseUrl = prefs.apiUrl.replace(/\/+$/, "");
	const headers: Record<string, string> = {
		"content-type": "application/json",
	};
	// Raycast does not read your shell profile, so the token has to come from
	// extension preferences rather than the environment.
	if (prefs.authToken?.trim()) {
		headers.authorization = `Bearer ${prefs.authToken.trim()}`;
	}
	return { baseUrl, headers };
}

export async function apiRequest<T>(
	method: string,
	path: string,
	body?: unknown,
): Promise<T> {
	const { baseUrl, headers } = config();
	const response = await fetch(`${baseUrl}${path}`, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	if (response.status === 401) {
		throw new Error(
			"Unauthorized. Set the auth token in the finish-em extension preferences.",
		);
	}

	const text = await response.text();
	const parsed = text ? JSON.parse(text) : null;

	if (!response.ok) {
		const message =
			parsed && typeof parsed === "object" && "error" in parsed
				? String((parsed as { error: unknown }).error)
				: `Request failed with status ${response.status}`;
		throw new Error(message);
	}

	return parsed as T;
}

export const apiGet = <T>(path: string) => apiRequest<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) =>
	apiRequest<T>("POST", path, body);
