import { createHttpApi } from "@/shared/http-api";

import { acknowledgeVersion } from "./change-version";

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
	// Mutations come back stamped with the change version they produced. Banking
	// it here stops ChangeWatcher from treating this client's own write as
	// someone else's and refetching everything a second time.
	const version = response.headers.get("X-Change-Version");
	if (version !== null) {
		const parsed = Number(version);
		if (Number.isFinite(parsed)) acknowledgeVersion(parsed);
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
