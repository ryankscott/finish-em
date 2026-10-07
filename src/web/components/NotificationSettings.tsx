import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { api } from "../lib/api";
import {
	currentPushSubscription,
	disablePush,
	enablePush,
	pushSupport,
} from "../lib/push";

type State = "loading" | "off" | "on" | "blocked";

function Note({ children }: { children: React.ReactNode }) {
	return <p className="text-sm text-muted">{children}</p>;
}

/**
 * Where reminder notifications come from on this device, and the control to
 * turn them on. iOS only grants permission from a tap, so this is a button
 * rather than a request on load.
 */
export function NotificationSettings() {
	const support = pushSupport();
	const [state, setState] = useState<State>("loading");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (support !== "supported") return;
		if (Notification.permission === "denied") {
			setState("blocked");
			return;
		}
		currentPushSubscription()
			.then((sub) => setState(sub ? "on" : "off"))
			.catch(() => setState("off"));
	}, [support]);

	if (support === "native") {
		return (
			<Note>
				The Mac app delivers reminders as macOS notifications, even when it is
				quit. Change alerts and sounds in System Settings → Notifications →
				finish-em.
			</Note>
		);
	}
	if (support === "needs-install") {
		return (
			<Note>
				To get reminders on this iPhone, open finish-em in Safari, tap Share →
				Add to Home Screen, then open it from the Home Screen and come back
				here.
			</Note>
		);
	}
	if (support === "unsupported") {
		return (
			<Note>
				This browser cannot receive push notifications. Reminders appear in the
				app only while it is open.
			</Note>
		);
	}
	if (state === "blocked") {
		return (
			<Note>
				Notifications are blocked. Allow them for this site in your browser or
				iPhone settings, then reload.
			</Note>
		);
	}

	const run = (fn: () => Promise<void>) => {
		setBusy(true);
		fn()
			.catch((err: Error) => toast.error(err.message))
			.finally(() => setBusy(false));
	};

	return (
		<div className="flex flex-col gap-2">
			<Note>
				{state === "on"
					? "Push notifications are on for this device. Reminders arrive even when the app is closed."
					: "Turn on push notifications so reminders reach this device even when the app is closed."}
			</Note>
			<div className="flex items-center gap-2">
				{state === "on" ? (
					<>
						<Button
							size="sm"
							variant="outline"
							disabled={busy}
							onClick={() =>
								run(async () => {
									const { sent } = await api.testPush();
									toast.success(
										sent > 0
											? "Test notification sent"
											: "No device accepted the test",
									);
								})
							}
						>
							Send test notification
						</Button>
						<Button
							size="sm"
							variant="ghost"
							disabled={busy}
							onClick={() =>
								run(async () => {
									await disablePush();
									setState("off");
								})
							}
						>
							Turn off
						</Button>
					</>
				) : (
					<Button
						size="sm"
						disabled={busy || state === "loading"}
						onClick={() =>
							run(async () => {
								await enablePush();
								setState("on");
								toast.success("Push notifications on");
							})
						}
					>
						Turn on
					</Button>
				)}
			</div>
		</div>
	);
}
