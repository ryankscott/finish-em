/**
 * Web Push sender (RFC 8291 payload encryption + RFC 8292 VAPID) on WebCrypto
 * alone, so it runs unchanged in workerd and Bun with no dependency.
 */

export type VapidConfig = {
	/** base64url, uncompressed P-256 point (65 bytes). Shared with browsers. */
	publicKey: string;
	/** base64url, the 32-byte private scalar. A secret. */
	privateKey: string;
	/** "mailto:..." or an https URL, so a push service can contact the sender. */
	subject: string;
};

export type PushSubscriptionKeys = {
	endpoint: string;
	p256dh: string;
	auth: string;
};

const enc = new TextEncoder();

/** Byte arrays backed by a plain ArrayBuffer, which WebCrypto's types require. */
type Bytes = Uint8Array<ArrayBuffer>;

export function b64urlEncode(bytes: Uint8Array): string {
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(text: string): Bytes {
	const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
	const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
	return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function concat(...parts: Bytes[]): Bytes {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let offset = 0;
	for (const p of parts) {
		out.set(p, offset);
		offset += p.length;
	}
	return out;
}

async function hmac(key: Bytes, data: Bytes): Promise<Bytes> {
	const k = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

/** HKDF with a single output block, which covers every length used here. */
export async function hkdf(
	salt: Bytes,
	ikm: Bytes,
	info: Bytes,
	length: number,
): Promise<Bytes> {
	const prk = await hmac(salt, ikm);
	const okm = await hmac(prk, concat(info, new Uint8Array([1])));
	return okm.slice(0, length);
}

function privateJwk(config: VapidConfig): JsonWebKey {
	const pub = b64urlDecode(config.publicKey);
	return {
		kty: "EC",
		crv: "P-256",
		x: b64urlEncode(pub.slice(1, 33)),
		y: b64urlEncode(pub.slice(33, 65)),
		d: config.privateKey,
		ext: true,
	};
}

export async function vapidJwt(
	audience: string,
	config: VapidConfig,
	nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
	const header = b64urlEncode(
		enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })),
	);
	const claims = b64urlEncode(
		enc.encode(
			JSON.stringify({
				aud: audience,
				exp: nowSeconds + 12 * 3600,
				sub: config.subject,
			}),
		),
	);
	const key = await crypto.subtle.importKey(
		"jwk",
		privateJwk(config),
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"],
	);
	// WebCrypto returns the raw r||s form that JWS ES256 expects.
	const signature = await crypto.subtle.sign(
		{ name: "ECDSA", hash: "SHA-256" },
		key,
		enc.encode(`${header}.${claims}`),
	);
	return `${header}.${claims}.${b64urlEncode(new Uint8Array(signature))}`;
}

/** RFC 8291 aes128gcm body: salt | record size | key id | ciphertext. */
export async function encryptPayload(
	subscription: Pick<PushSubscriptionKeys, "p256dh" | "auth">,
	payload: Bytes,
	salt = crypto.getRandomValues(new Uint8Array(16)),
): Promise<Bytes> {
	const uaPublic = b64urlDecode(subscription.p256dh);
	const authSecret = b64urlDecode(subscription.auth);

	const local = (await crypto.subtle.generateKey(
		{ name: "ECDH", namedCurve: "P-256" },
		true,
		["deriveBits"],
	)) as CryptoKeyPair;
	const asPublic = new Uint8Array(
		(await crypto.subtle.exportKey("raw", local.publicKey)) as ArrayBuffer,
	);
	const uaKey = await crypto.subtle.importKey(
		"raw",
		uaPublic,
		{ name: "ECDH", namedCurve: "P-256" },
		false,
		[],
	);
	const shared = new Uint8Array(
		await crypto.subtle.deriveBits(
			{ name: "ECDH", public: uaKey },
			local.privateKey,
			256,
		),
	);

	const ikm = await hkdf(
		authSecret,
		shared,
		concat(enc.encode("WebPush: info\0"), uaPublic, asPublic),
		32,
	);
	const cek = await hkdf(
		salt,
		ikm,
		enc.encode("Content-Encoding: aes128gcm\0"),
		16,
	);
	const nonce = await hkdf(
		salt,
		ikm,
		enc.encode("Content-Encoding: nonce\0"),
		12,
	);

	const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, [
		"encrypt",
	]);
	// 0x02 marks the last (and only) record.
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv: nonce },
			key,
			concat(payload, new Uint8Array([2])),
		),
	);

	const recordSize = new Uint8Array(4);
	new DataView(recordSize.buffer).setUint32(0, 4096);
	return concat(
		salt,
		recordSize,
		new Uint8Array([asPublic.length]),
		asPublic,
		ciphertext,
	);
}

export type PushResult = { ok: boolean; status: number; gone: boolean };

export async function sendWebPush(
	subscription: PushSubscriptionKeys,
	payload: unknown,
	config: VapidConfig,
	options: { ttlSeconds?: number; fetchImpl?: typeof fetch } = {},
): Promise<PushResult> {
	const audience = new URL(subscription.endpoint).origin;
	const jwt = await vapidJwt(audience, config);
	const body = await encryptPayload(
		subscription,
		enc.encode(JSON.stringify(payload)),
	);
	const res = await (options.fetchImpl ?? fetch)(subscription.endpoint, {
		method: "POST",
		headers: {
			authorization: `vapid t=${jwt}, k=${config.publicKey}`,
			"content-encoding": "aes128gcm",
			"content-type": "application/octet-stream",
			ttl: String(options.ttlSeconds ?? 24 * 3600),
			urgency: "high",
		},
		body,
	});
	return {
		ok: res.ok,
		status: res.status,
		gone: res.status === 404 || res.status === 410,
	};
}

export async function generateVapidKeys(): Promise<{
	publicKey: string;
	privateKey: string;
}> {
	const pair = (await crypto.subtle.generateKey(
		{ name: "ECDSA", namedCurve: "P-256" },
		true,
		["sign", "verify"],
	)) as CryptoKeyPair;
	const pub = new Uint8Array(
		(await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer,
	);
	const jwk = (await crypto.subtle.exportKey(
		"jwk",
		pair.privateKey,
	)) as JsonWebKey;
	return { publicKey: b64urlEncode(pub), privateKey: jwk.d as string };
}
