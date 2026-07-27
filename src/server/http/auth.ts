/**
 * Single-user password gate.
 *
 * Inert unless FINISH_EM_AUTH_SECRET is set, so local dev and the test suite
 * stay open and nothing has to know about auth to exercise the API. In
 * production the secret is set as a Cloudflare secret and every route except
 * the exemptions below requires a credential.
 *
 * The token is sha256(secret): stateless, no session store, no expiry.
 * Revocation is rotating the secret. That is the right trade for one user --
 * a session table would be infrastructure protecting nothing extra.
 *
 * Two ways to present it:
 *   Cookie: fe_session=<token>    browsers, set by POST /api/login
 *   Authorization: Bearer <token> scripts, Raycast, curl
 */

import type { Context, MiddlewareHandler } from "hono";

export const SESSION_COOKIE = "fe_session";

/** 400 days -- the practical ceiling browsers honour for a persistent cookie. */
const COOKIE_MAX_AGE = 34_560_000;

export async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Length-independent comparison. Both sides are fixed-length hex digests, so
 * the early length check leaks nothing an attacker does not already know.
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

function readCookie(header: string | undefined, name: string): string | null {
	if (!header) return null;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) return rest.join("=");
	}
	return null;
}

function presentedToken(req: Request): string | null {
	const authorization = req.headers.get("authorization");
	if (authorization?.toLowerCase().startsWith("bearer ")) {
		return authorization.slice(7).trim();
	}
	return readCookie(req.headers.get("cookie") ?? undefined, SESSION_COOKIE);
}

export function sessionCookie(token: string, secure: boolean): string {
	// Secure is omitted on http://localhost, where browsers reject Secure
	// cookies -- otherwise logging in against a local wrangler dev server would
	// silently never persist a session.
	const attrs = [
		`${SESSION_COOKIE}=${token}`,
		"HttpOnly",
		"SameSite=Lax",
		"Path=/",
		`Max-Age=${COOKIE_MAX_AGE}`,
	];
	if (secure) attrs.push("Secure");
	return attrs.join("; ");
}

export function clearedSessionCookie(): string {
	return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

/**
 * Routes reachable without a credential.
 *
 * /api/docs and /api/openapi.json are deliberately NOT exempt. On loopback an
 * open API explorer was harmless; on the public internet it publishes the
 * entire surface to anyone who finds the URL.
 */
function isExempt(path: string, method: string): boolean {
	if (path === "/api/health") return true;
	if (path === "/api/login" && method === "POST") return true;
	// Logout only clears a cookie. Gating it would mean a client holding a stale
	// or rotated token could never clear it, and forcing a logout is a nuisance
	// rather than a disclosure.
	if (path === "/api/logout" && method === "POST") return true;
	// Static assets and the SPA shell must load so the login screen can render.
	return !path.startsWith("/api/");
}

export function createAuthMiddleware(
	getSecret: (c: Context) => string | undefined,
): MiddlewareHandler {
	return async (c, next) => {
		const secret = getSecret(c);

		if (!secret) {
			return next();
		}

		if (isExempt(c.req.path, c.req.method)) {
			return next();
		}

		const presented = presentedToken(c.req.raw);
		if (!presented) {
			return c.json({ error: "Authentication required" }, 401);
		}

		const expected = await sha256Hex(secret);
		if (!timingSafeEqual(presented, expected)) {
			return c.json({ error: "Invalid credentials" }, 401);
		}

		return next();
	};
}
