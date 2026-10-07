import { useState } from "react";

import { Button } from "@/components/ui/button";

import { hasNativeReminders } from "../lib/native-bridge";

function browserPermission() {
	return typeof Notification === "undefined" ? null : Notification.permission;
}

/**
 * Where reminder notifications come from on this device, and the control to
 * turn them on. Safari and the iPhone home-screen app only grant permission
 * from a tap, so this is a button rather than a request on load.
 */
export function NotificationSettings() {
	const [permission, setPermission] = useState(browserPermission);

	if (hasNativeReminders()) {
		return (
			<p className="text-sm text-muted">
				The Mac app delivers reminders as macOS notifications, even when it is
				quit. Change alerts and sounds in System Settings → Notifications →
				finish-em.
			</p>
		);
	}

	if (permission === null) {
		return (
			<p className="text-sm text-muted">
				This browser cannot show notifications. Reminders appear in the app only
				while it is open.
			</p>
		);
	}

	if (permission === "granted") {
		return (
			<p className="text-sm text-muted">
				Notifications are on for this browser.
			</p>
		);
	}

	if (permission === "denied") {
		return (
			<p className="text-sm text-muted">
				Notifications are blocked. Allow them for this site in your browser's
				site settings, then reload.
			</p>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm text-muted">
				Turn on notifications so reminders reach you outside this tab.
			</span>
			<Button
				size="sm"
				onClick={() =>
					Notification.requestPermission()
						.then(setPermission)
						.catch(() => {})
				}
			>
				Turn on
			</Button>
		</div>
	);
}
