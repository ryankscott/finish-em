import { b64urlDecode } from "@/server/push/web-push";
import { api } from "./api";
import { hasNativeReminders } from "./native-bridge";

export type PushSupport =
	/** The Mac app: macOS notifications through the Swift bridge instead. */
	| "native"
	/** iPhone/iPad Safari tab: push needs the Home Screen app. */
	| "needs-install"
	| "unsupported"
	| "supported";

function isIos() {
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
	);
}

function isStandalone() {
	return (
		window.matchMedia?.("(display-mode: standalone)").matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export function pushSupport(): PushSupport {
	if (hasNativeReminders()) return "native";
	const capable =
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		typeof Notification !== "undefined";
	if (!capable)
		return isIos() && !isStandalone() ? "needs-install" : "unsupported";
	if (isIos() && !isStandalone()) return "needs-install";
	return "supported";
}

export function registerServiceWorker() {
	if (pushSupport() === "native" || !("serviceWorker" in navigator)) return;
	navigator.serviceWorker.register("/sw.js").catch((err) => {
		console.error("Service worker registration failed:", err);
	});
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
	if (pushSupport() !== "supported") return null;
	const registration = await navigator.serviceWorker.getRegistration();
	return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Must run from a tap: iOS rejects permission requests made without one. */
export async function enablePush(): Promise<void> {
	const permission = await Notification.requestPermission();
	if (permission !== "granted") {
		throw new Error("Notifications were not allowed");
	}
	const { publicKey } = await api.getPushConfig();
	if (!publicKey) throw new Error("Push is not configured on the server");

	const registration = await navigator.serviceWorker.ready;
	const subscription =
		(await registration.pushManager.getSubscription()) ??
		(await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: b64urlDecode(publicKey),
		}));
	const json = subscription.toJSON();
	await api.subscribePush({
		endpoint: subscription.endpoint,
		keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
	});
}

export async function disablePush(): Promise<void> {
	const subscription = await currentPushSubscription();
	if (!subscription) return;
	await api.unsubscribePush(subscription.endpoint);
	await subscription.unsubscribe();
}

/**
 * Show a reminder through the service worker when there is one, with the same
 * tag the push uses, so a push and an open tab never double up.
 */
export async function showReminderNotification(
	reminderId: number,
	title: string,
): Promise<void> {
	if (
		typeof Notification === "undefined" ||
		Notification.permission !== "granted"
	) {
		return;
	}
	const options = { body: "Reminder", tag: `reminder-${reminderId}` };
	const registration =
		"serviceWorker" in navigator
			? await navigator.serviceWorker.getRegistration()
			: undefined;
	if (registration) {
		await registration.showNotification(title, options);
		return;
	}
	new Notification(title, options);
}
