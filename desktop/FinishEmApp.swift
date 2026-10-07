// Native macOS wrapper for finish-em. Compiled with swiftc into the app bundle's
// CFBundleExecutable, so macOS launches it as a normal app (no terminal window).
// It spawns the bundled Bun server binary as a hidden child process and hosts the
// web UI in a WKWebView window — no Chrome dependency.

import AppKit
import UserNotifications
import WebKit

let serverBinaryName = "finish-em-server"
let defaultPort = 5717

func resolvePort() -> Int {
	if let raw = ProcessInfo.processInfo.environment["FINISH_EM_PORT"],
		let value = Int(raw), value > 0
	{
		return value
	}
	return defaultPort
}

func logFileURL() -> URL {
	let home = FileManager.default.homeDirectoryForCurrentUser
	let dir = home.appendingPathComponent(".finish-em", isDirectory: true)
	try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
	return dir.appendingPathComponent("desktop-server.log")
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate,
	WKScriptMessageHandler, UNUserNotificationCenterDelegate
{
	// Notification actions that arrive before the web UI has loaded (for example
	// a "Done" tapped on a notification that relaunched the app). They run once
	// the page reports in through the "reminders" message.
	var pendingReminderActions: [(reminderId: Int, taskId: Int, action: String)] = []
	var webReady = false

	let port = resolvePort()
	var window: NSWindow!
	var webView: WKWebView!
	var serverProcess: Process?

	// With a remote URL the app is a thin shell over the deployed Cloudflare
	// Worker: no bundled server, no local database. Without one it keeps the
	// original self-contained behaviour against a local server.
	//
	// The URL is baked into Info.plist at build time (see
	// scripts/build-desktop-app.sh), so a built .app targets the Worker without
	// depending on ambient environment state. FINISH_EM_REMOTE_URL still wins
	// when set, as an escape hatch for pointing a build at a staging Worker or
	// forcing local mode with FINISH_EM_REMOTE_URL=""; it is deliberately not
	// how a normal build is configured.
	let remoteURL: URL? = {
		let env = ProcessInfo.processInfo.environment["FINISH_EM_REMOTE_URL"]
		let baked = Bundle.main.object(forInfoDictionaryKey: "FinishEmRemoteURL") as? String
		guard let raw = env ?? baked else { return nil }
		let trimmed = raw.trimmingCharacters(in: .whitespaces)
		guard !trimmed.isEmpty,
			  let url = URL(string: trimmed),
			  url.scheme != nil
		else { return nil }
		return url
	}()

	var isRemote: Bool { remoteURL != nil }

	var baseURL: URL { remoteURL ?? URL(string: "http://127.0.0.1:\(port)")! }
	var healthURL: URL { baseURL.appendingPathComponent("api/health") }

	var signalSources: [DispatchSourceSignal] = []

	func applicationDidFinishLaunching(_ notification: Notification) {
		installSignalHandlers()
		setUpNotifications()
		buildMenu()
		buildWindow()

		if isRemote {
			// Nothing to spawn or wait for; the Worker is already up.
			loadApp()
		} else if serverIsUp() {
			// A server is already running (e.g. a dev server). Reuse it.
			loadApp()
		} else {
			startServer()
			waitForServerThenLoad()
		}
	}

	func applicationWillTerminate(_ notification: Notification) {
		serverProcess?.terminate()
	}

	// Clean up the child server on signals too (SIGTERM/SIGINT), so a force-quit
	// or logout doesn't leak the server. applicationWillTerminate only fires for
	// a normal ⌘Q / NSApp.terminate, not for raw signals. DispatchSource handlers
	// run on a queue (async-signal-safe, unlike a C signal handler).
	func installSignalHandlers() {
		for sig in [SIGTERM, SIGINT] {
			signal(sig, SIG_IGN)
			let source = DispatchSource.makeSignalSource(signal: sig, queue: .main)
			source.setEventHandler { [weak self] in
				self?.serverProcess?.terminate()
				exit(0)
			}
			source.resume()
			signalSources.append(source)
		}
	}

	// Closing the window hides it; the app keeps running so the web UI can keep
	// the notification schedule current. Scheduled notifications are delivered
	// by macOS even after a full quit (⌘Q).
	func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
		false
	}

	func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool)
		-> Bool
	{
		if !flag { window.makeKeyAndOrderFront(nil) }
		return true
	}

	// MARK: - Window & WebView

	func buildWindow() {
		let config = WKWebViewConfiguration()
		// The web UI posts its resolved theme here so the native titlebar can
		// match it; without this the titlebar follows the OS appearance and can
		// end up dark above a light app (or the reverse).
		config.userContentController.add(self, name: "appearance")
		// The web UI posts its reminder list here so macOS can schedule them.
		config.userContentController.add(self, name: "reminders")
		webView = WKWebView(
			frame: NSRect(x: 0, y: 0, width: 1100, height: 800),
			configuration: config)
		webView.navigationDelegate = self
		webView.uiDelegate = self

		window = NSWindow(
			contentRect: NSRect(x: 0, y: 0, width: 1100, height: 800),
			styleMask: [.titled, .closable, .miniaturizable, .resizable],
			backing: .buffered,
			defer: false)
		window.title = "finish-em"
		window.isReleasedWhenClosed = false
		window.center()
		window.setFrameAutosaveName("FinishEmMainWindow")
		window.contentView = webView
		window.makeKeyAndOrderFront(nil)
		NSApp.activate(ignoringOtherApps: true)
	}

	func loadApp() {
		webReady = false
		webView.load(URLRequest(url: baseURL))
	}

	// MARK: - Appearance

	func userContentController(
		_ userContentController: WKUserContentController,
		didReceive message: WKScriptMessage
	) {
		if message.name == "reminders" {
			handleReminderSync(message.body)
			return
		}
		guard message.name == "appearance", let theme = message.body as? String else { return }
		let appearance: NSAppearance? =
			theme == "dark"
			? NSAppearance(named: .darkAqua)
			: theme == "light" ? NSAppearance(named: .aqua) : nil
		guard let appearance else { return }
		window.appearance = appearance
	}

	// MARK: - Reminder notifications

	static let reminderCategory = "REMINDER"
	static let idPrefix = "reminder-"
	// macOS keeps at most 64 pending requests per app; stay under it.
	static let maxScheduled = 60
	static let horizon: TimeInterval = 7 * 24 * 60 * 60

	func setUpNotifications() {
		let center = UNUserNotificationCenter.current()
		center.delegate = self
		let actions = [
			UNNotificationAction(identifier: "DONE", title: "Mark Done", options: []),
			UNNotificationAction(identifier: "SNOOZE_15", title: "Snooze 15 Minutes", options: []),
			UNNotificationAction(identifier: "SNOOZE_60", title: "Snooze 1 Hour", options: []),
			UNNotificationAction(identifier: "TOMORROW", title: "Tomorrow Morning", options: []),
		]
		center.setNotificationCategories([
			UNNotificationCategory(
				identifier: Self.reminderCategory, actions: actions, intentIdentifiers: [],
				options: [])
		])
		center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
	}

	struct SyncedReminder {
		let id: Int
		let taskId: Int
		let title: String
		let at: Date
		let fired: Bool

		// The time is part of the identifier, so a snoozed reminder is a new
		// notification rather than a replacement of the delivered one.
		var identifier: String {
			"\(AppDelegate.idPrefix)\(id)-\(Int(at.timeIntervalSince1970))"
		}
	}

	func parseSync(_ body: Any) -> (reminders: [SyncedReminder], missed: Int)? {
		guard let dict = body as? [String: Any],
			let list = dict["reminders"] as? [[String: Any]]
		else { return nil }
		let iso = ISO8601DateFormatter()
		iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
		let reminders = list.compactMap { item -> SyncedReminder? in
			guard let id = item["id"] as? Int,
				let taskId = item["taskId"] as? Int,
				let title = item["title"] as? String,
				let raw = item["at"] as? String,
				let at = iso.date(from: raw)
			else { return nil }
			return SyncedReminder(
				id: id, taskId: taskId, title: title, at: at,
				fired: item["fired"] as? Bool ?? false)
		}
		return (reminders, dict["missed"] as? Int ?? 0)
	}

	/// "sync" replaces the pending schedule with the page's full list and sets
	/// the Dock badge. "deliver" posts due reminders now, unless macOS already
	/// showed them from the schedule (for example while the app was quit).
	func handleReminderSync(_ body: Any) {
		guard let (reminders, missed) = parseSync(body) else { return }
		let isDeliver = (body as? [String: Any])?["kind"] as? String == "deliver"
		if !isDeliver {
			NSApp.dockTile.badgeLabel = missed > 0 ? String(missed) : nil
		}

		if !webReady {
			webReady = true
			flushPendingReminderActions()
		}

		let center = UNUserNotificationCenter.current()
		let now = Date()
		center.getDeliveredNotifications { delivered in
			let shown = Set(delivered.map(\.request.identifier))

			if isDeliver {
				for reminder in reminders where !shown.contains(reminder.identifier) {
					self.post(reminder, trigger: nil)
				}
				return
			}

			center.getPendingNotificationRequests { pending in
				let ours = pending.map(\.identifier).filter { $0.hasPrefix(Self.idPrefix) }
				center.removePendingNotificationRequests(withIdentifiers: ours)

				// Clear notifications for reminders that were acted on elsewhere.
				let live = Set(reminders.map(\.identifier))
				let stale = shown.filter { $0.hasPrefix(Self.idPrefix) && !live.contains($0) }
				center.removeDeliveredNotifications(withIdentifiers: Array(stale))

				let upcoming = reminders
					.filter { $0.at > now && $0.at < now.addingTimeInterval(Self.horizon) }
					.sorted { $0.at < $1.at }
					.prefix(Self.maxScheduled)
				for reminder in upcoming {
					self.post(reminder, trigger: self.trigger(for: reminder.at))
				}
			}
		}
	}

	func trigger(for date: Date) -> UNNotificationTrigger {
		let parts = Calendar.current.dateComponents(
			[.year, .month, .day, .hour, .minute, .second], from: date)
		return UNCalendarNotificationTrigger(dateMatching: parts, repeats: false)
	}

	func post(_ reminder: SyncedReminder, trigger: UNNotificationTrigger?) {
		let content = UNMutableNotificationContent()
		content.title = reminder.title
		content.body = "Reminder"
		content.sound = .default
		content.categoryIdentifier = Self.reminderCategory
		content.interruptionLevel = .timeSensitive
		content.userInfo = ["reminderId": reminder.id, "taskId": reminder.taskId]
		UNUserNotificationCenter.current().add(
			UNNotificationRequest(identifier: reminder.identifier, content: content, trigger: trigger))
	}

	// Show the banner even while the app is frontmost.
	func userNotificationCenter(
		_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
		withCompletionHandler completionHandler:
			@escaping (UNNotificationPresentationOptions) -> Void
	) {
		completionHandler([.banner, .list, .sound])
	}

	func userNotificationCenter(
		_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
		withCompletionHandler completionHandler: @escaping () -> Void
	) {
		let info = response.notification.request.content.userInfo
		defer { completionHandler() }
		guard let reminderId = info["reminderId"] as? Int,
			let taskId = info["taskId"] as? Int
		else { return }

		switch response.actionIdentifier {
		case "DONE", "SNOOZE_15", "SNOOZE_60", "TOMORROW":
			pendingReminderActions.append((reminderId, taskId, response.actionIdentifier))
			if webReady { flushPendingReminderActions() }
		default:
			// Clicked the notification itself: bring the app forward.
			window.makeKeyAndOrderFront(nil)
			NSApp.activate(ignoringOtherApps: true)
		}
	}

	// Actions run inside the page so they use its session cookie and its query
	// cache refreshes straight away.
	func flushPendingReminderActions() {
		let actions = pendingReminderActions
		pendingReminderActions.removeAll()
		for item in actions {
			let js =
				"window.finishEmNative?.reminderAction(\(item.reminderId), \(item.taskId), '\(item.action)')"
			webView.evaluateJavaScript(js, completionHandler: nil)
		}
	}

	// MARK: - External links

	// True for http(s) URLs that don't point at the app's own origin. These open
	// in the user's default browser rather than inside the WKWebView.
	//
	// This compares against baseURL's host rather than hardcoding localhost:
	// when running against the deployed Worker the app's own origin is a remote
	// host, and a localhost-only check would send every in-app navigation to
	// Safari.
	func isExternal(_ url: URL?) -> Bool {
		guard let url, let scheme = url.scheme?.lowercased() else { return false }
		guard scheme == "http" || scheme == "https" else { return false }
		guard let host = url.host?.lowercased() else { return false }

		if let ownHost = baseURL.host?.lowercased(), host == ownHost {
			return false
		}
		// Local mode reaches the same server by either name.
		if !isRemote {
			return host != "127.0.0.1" && host != "localhost"
		}
		return true
	}

	func openExternally(_ url: URL) {
		NSWorkspace.shared.open(url)
	}

	// True for custom-scheme URLs (e.g. claude://) that WKWebView can't render
	// itself and that must be handed off to the OS to dispatch to a registered
	// app handler.
	func isCustomScheme(_ url: URL?) -> Bool {
		guard let url, let scheme = url.scheme?.lowercased() else { return false }
		return !["http", "https", "file", "about", "blob", "data"].contains(scheme)
	}

	// Intercept ordinary link clicks/navigations to off-site URLs.
	func webView(
		_ webView: WKWebView,
		decidePolicyFor navigationAction: WKNavigationAction,
		decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
	) {
		let url = navigationAction.request.url
		if navigationAction.navigationType == .linkActivated,
			isExternal(url) || isCustomScheme(url)
		{
			openExternally(url!)
			decisionHandler(.cancel)
			return
		}
		decisionHandler(.allow)
	}

	// Handle target="_blank" / window.open links, which would otherwise be
	// dropped because a WKWebView has no place to put a new window.
	func webView(
		_ webView: WKWebView,
		createWebViewWith configuration: WKWebViewConfiguration,
		for navigationAction: WKNavigationAction,
		windowFeatures: WKWindowFeatures
	) -> WKWebView? {
		if let url = navigationAction.request.url {
			if isExternal(url) || isCustomScheme(url) {
				openExternally(url)
			} else {
				// Same-origin popup: load it in the main webview instead.
				webView.load(navigationAction.request)
			}
		}
		return nil
	}

	// MARK: - Server lifecycle

	func serverBinaryURL() -> URL? {
		guard let resourcePath = Bundle.main.resourcePath else { return nil }
		let url = URL(fileURLWithPath: resourcePath)
			.appendingPathComponent(serverBinaryName)
		return FileManager.default.isExecutableFile(atPath: url.path) ? url : nil
	}

	func startServer() {
		guard let binary = serverBinaryURL() else {
			showFatalAlert(
				"Could not find the bundled finish-em server (\(serverBinaryName)).")
			return
		}

		let resourcePath = Bundle.main.resourcePath ?? ""
		let webDist = URL(fileURLWithPath: resourcePath)
			.appendingPathComponent("web").path

		let process = Process()
		process.executableURL = binary
		var env = ProcessInfo.processInfo.environment
		env["PORT"] = String(port)
		env["WEB_DIST_PATH"] = webDist
		process.environment = env

		let logHandle = FileHandle(forWritingAtPath: logFileURL().path)
			?? {
				FileManager.default.createFile(atPath: logFileURL().path, contents: nil)
				return FileHandle(forWritingAtPath: logFileURL().path)
			}()
		if let logHandle {
			logHandle.seekToEndOfFile()
			process.standardOutput = logHandle
			process.standardError = logHandle
		}

		do {
			try process.run()
			serverProcess = process
		} catch {
			showFatalAlert("Failed to start the finish-em server: \(error.localizedDescription)")
		}
	}

	func serverIsUp() -> Bool {
		var request = URLRequest(url: healthURL)
		request.timeoutInterval = 1
		let semaphore = DispatchSemaphore(value: 0)
		var ok = false
		let task = URLSession.shared.dataTask(with: request) { _, response, _ in
			if let http = response as? HTTPURLResponse, http.statusCode < 500 {
				ok = true
			}
			semaphore.signal()
		}
		task.resume()
		_ = semaphore.wait(timeout: .now() + 1.5)
		return ok
	}

	func waitForServerThenLoad(attempt: Int = 0) {
		if serverIsUp() {
			loadApp()
			return
		}
		if attempt >= 50 {
			showFatalAlert(
				"The finish-em server did not start in time.\nSee ~/.finish-em/desktop-server.log")
			return
		}
		DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
			self?.waitForServerThenLoad(attempt: attempt + 1)
		}
	}

	// MARK: - Alerts

	func showFatalAlert(_ message: String) {
		let alert = NSAlert()
		alert.alertStyle = .critical
		alert.messageText = "finish-em"
		alert.informativeText = message
		alert.addButton(withTitle: "Quit")
		alert.runModal()
		NSApp.terminate(nil)
	}

	// MARK: - Menu (needed for ⌘C/⌘V/⌘Q to work inside the webview)

	func buildMenu() {
		let mainMenu = NSMenu()

		let appMenuItem = NSMenuItem()
		mainMenu.addItem(appMenuItem)
		let appMenu = NSMenu()
		appMenu.addItem(
			withTitle: "Quit finish-em", action: #selector(NSApplication.terminate(_:)),
			keyEquivalent: "q")
		appMenuItem.submenu = appMenu

		let editMenuItem = NSMenuItem()
		mainMenu.addItem(editMenuItem)
		let editMenu = NSMenu(title: "Edit")
		editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
		let redo = editMenu.addItem(
			withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "z")
		redo.keyEquivalentModifierMask = [.command, .shift]
		editMenu.addItem(NSMenuItem.separator())
		editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
		editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
		editMenu.addItem(
			withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
		editMenu.addItem(
			withTitle: "Select All", action: #selector(NSText.selectAll(_:)),
			keyEquivalent: "a")
		editMenuItem.submenu = editMenu

		NSApp.mainMenu = mainMenu
	}
}

let app = NSApplication.shared
app.setActivationPolicy(.regular)
let delegate = AppDelegate()
app.delegate = delegate
app.run()
