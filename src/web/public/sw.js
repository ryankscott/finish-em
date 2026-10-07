// Service worker: shows Web Push reminders (iPhone home-screen app, desktop
// browsers) and handles taps on them. Plain JS so Vite copies it as-is to /sw.js.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
	event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
	let data = {};
	try {
		data = event.data ? event.data.json() : {};
	} catch {
		data = { title: "finish-em", body: event.data ? event.data.text() : "" };
	}
	const isReminder = typeof data.reminderId === "number";
	event.waitUntil(
		self.registration.showNotification(data.title || "finish-em", {
			body: data.body || "Reminder",
			// Same tag as the in-page notification, so an open tab and a push
			// for one reminder show one notification, not two.
			tag: data.tag,
			renotify: true,
			requireInteraction: isReminder,
			icon: "/logo192.png",
			badge: "/logo192.png",
			data,
			// iOS ignores actions; Chrome and Edge show them as buttons.
			actions: isReminder
				? [
						{ action: "done", title: "Mark Done" },
						{ action: "snooze", title: "Snooze 1 Hour" },
					]
				: [],
		}),
	);
});

function post(path, body) {
	return fetch(path, {
		method: "POST",
		credentials: "same-origin",
		headers: { "content-type": "application/json" },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

async function focusApp() {
	const windows = await self.clients.matchAll({
		type: "window",
		includeUncontrolled: true,
	});
	for (const client of windows) {
		if ("focus" in client) return client.focus();
	}
	return self.clients.openWindow("/today");
}

self.addEventListener("notificationclick", (event) => {
	const data = event.notification.data || {};
	event.notification.close();
	if (event.action === "done" && data.taskId) {
		event.waitUntil(post(`/api/tasks/${data.taskId}/complete`));
		return;
	}
	if (event.action === "snooze" && data.reminderId) {
		event.waitUntil(
			post(`/api/reminders/${data.reminderId}/snooze`, {
				preset: "custom",
				customMinutes: 60,
			}),
		);
		return;
	}
	event.waitUntil(focusApp());
});
