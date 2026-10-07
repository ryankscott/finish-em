import { describe, expect, it } from "bun:test";

import {
	b64urlDecode,
	b64urlEncode,
	encryptPayload,
	generateVapidKeys,
	hkdf,
	sendWebPush,
	vapidJwt,
} from "./web-push";

const enc = new TextEncoder();

/** A browser-side subscription: what PushManager.subscribe would hand back. */
async function makeSubscriber() {
	const pair = (await crypto.subtle.generateKey(
		{ name: "ECDH", namedCurve: "P-256" },
		true,
		["deriveBits"],
	)) as CryptoKeyPair;
	const pub = new Uint8Array(
		(await crypto.subtle.exportKey("raw", pair.publicKey)) as ArrayBuffer,
	);
	const auth = crypto.getRandomValues(new Uint8Array(16));
	return {
		privateKey: pair.privateKey,
		publicBytes: pub,
		authBytes: auth,
		keys: { p256dh: b64urlEncode(pub), auth: b64urlEncode(auth) },
	};
}

/** The browser's half of RFC 8291, to prove the sender's output decrypts. */
async function decrypt(
	body: Uint8Array,
	subscriber: Awaited<ReturnType<typeof makeSubscriber>>,
) {
	const salt = body.slice(0, 16);
	const idLen = body[20] ?? 0;
	const asPublic = body.slice(21, 21 + idLen);
	const ciphertext = body.slice(21 + idLen);

	const asKey = await crypto.subtle.importKey(
		"raw",
		asPublic,
		{ name: "ECDH", namedCurve: "P-256" },
		false,
		[],
	);
	const shared = new Uint8Array(
		await crypto.subtle.deriveBits(
			{ name: "ECDH", public: asKey },
			subscriber.privateKey,
			256,
		),
	);
	const info = new Uint8Array([
		...enc.encode("WebPush: info\0"),
		...subscriber.publicBytes,
		...asPublic,
	]);
	const ikm = await hkdf(subscriber.authBytes, shared, info, 32);
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
		"decrypt",
	]);
	const plain = new Uint8Array(
		await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: nonce },
			key,
			ciphertext,
		),
	);
	expect(plain.at(-1)).toBe(2);
	return new TextDecoder().decode(plain.slice(0, -1));
}

describe("web push", () => {
	it("round-trips base64url", () => {
		const bytes = new Uint8Array([0, 250, 251, 255, 62, 63]);
		expect(b64urlDecode(b64urlEncode(bytes))).toEqual(bytes);
		expect(b64urlEncode(bytes)).not.toMatch(/[+/=]/);
	});

	it("encrypts a payload the subscriber can decrypt", async () => {
		const subscriber = await makeSubscriber();
		const body = await encryptPayload(subscriber.keys, enc.encode('{"hi":1}'));
		expect(new DataView(body.buffer).getUint32(16)).toBe(4096);
		expect(await decrypt(body, subscriber)).toBe('{"hi":1}');
	});

	it("signs a VAPID JWT that verifies with the public key", async () => {
		const keys = await generateVapidKeys();
		const config = { ...keys, subject: "mailto:test@example.com" };
		const jwt = await vapidJwt("https://web.push.apple.com", config, 1_000);
		const [header, claims, sig] = jwt.split(".") as [string, string, string];

		expect(JSON.parse(new TextDecoder().decode(b64urlDecode(claims)))).toEqual({
			aud: "https://web.push.apple.com",
			exp: 1_000 + 12 * 3600,
			sub: "mailto:test@example.com",
		});

		const pub = await crypto.subtle.importKey(
			"raw",
			b64urlDecode(keys.publicKey),
			{ name: "ECDSA", namedCurve: "P-256" },
			false,
			["verify"],
		);
		const valid = await crypto.subtle.verify(
			{ name: "ECDSA", hash: "SHA-256" },
			pub,
			b64urlDecode(sig),
			enc.encode(`${header}.${claims}`),
		);
		expect(valid).toBe(true);
	});

	it("sends with VAPID and aes128gcm headers and reports gone endpoints", async () => {
		const subscriber = await makeSubscriber();
		const keys = await generateVapidKeys();
		const calls: { url: string; init: RequestInit }[] = [];
		const fetchImpl = (async (url: string, init: RequestInit) => {
			calls.push({ url, init });
			return new Response(null, { status: 410 });
		}) as unknown as typeof fetch;

		const result = await sendWebPush(
			{ endpoint: "https://push.example.com/abc", ...subscriber.keys },
			{ title: "Call vet" },
			{ ...keys, subject: "mailto:a@b.c" },
			{ fetchImpl },
		);

		expect(result).toEqual({ ok: false, status: 410, gone: true });
		const headers = calls[0]?.init.headers as Record<string, string>;
		expect(headers["content-encoding"]).toBe("aes128gcm");
		expect(headers.authorization).toStartWith("vapid t=");
		expect(headers.authorization).toEndWith(`k=${keys.publicKey}`);
		expect(await decrypt(calls[0]?.init.body as Uint8Array, subscriber)).toBe(
			'{"title":"Call vet"}',
		);
	});
});
