import { createHttpApi } from "@/shared/http-api";

/**
 * Set when any request comes back 401, so the shell can swap in the login
 * screen instead of surfacing a wall of failed queries.
 *
 * A 401 is expected occasionally rather than exceptional: iOS evicts storage
 * for infrequently-used sites, and rotating FINISH_EM_AUTH_SECRET invalidates
 * every existing cookie. Both should land the user on a password prompt, not a
 * broken app.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
	onUnauthorized = handler;
}

export const api = createHttpApi(async (input, init) => {
	const response = await fetch(input, {
		...init,
		credentials: "same-origin",
	});
	if (response.status === 401) {
		onUnauthorized?.();
	}
	return response;
});

export async function login(password: string): Promise<boolean> {
	const response = await fetch("/api/login", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ password }),
		credentials: "same-origin",
	});
	return response.ok;
}

/** Whether the API currently accepts us. Never throws; false means "log in". */
export async function checkSession(): Promise<boolean> {
	try {
		const response = await fetch("/api/session", {
			credentials: "same-origin",
		});
		return response.ok;
	} catch {
		return false;
	}
}
