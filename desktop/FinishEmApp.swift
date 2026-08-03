// Native macOS wrapper for finish-em. Compiled with swiftc into the app bundle's
// CFBundleExecutable, so macOS launches it as a normal app (no terminal window).
// It spawns the bundled Bun server binary as a hidden child process and hosts the
// web UI in a WKWebView window — no Chrome dependency.

import AppKit
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
	WKScriptMessageHandler
{
	let port = resolvePort()
	var window: NSWindow!
	var webView: WKWebView!
	var serverProcess: Process?

	// When FINISH_EM_REMOTE_URL is set the app is a thin shell over the deployed
	// Cloudflare Worker: no bundled server, no local database. Unset, it keeps
	// the original self-contained behaviour against a local server.
	let remoteURL: URL? = {
		guard let raw = ProcessInfo.processInfo.environment["FINISH_EM_REMOTE_URL"],
			  !raw.trimmingCharacters(in: .whitespaces).isEmpty,
			  let url = URL(string: raw.trimmingCharacters(in: .whitespaces)),
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

	func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
		true
	}

	// MARK: - Window & WebView

	func buildWindow() {
		let config = WKWebViewConfiguration()
		// The web UI posts its resolved theme here so the native titlebar can
		// match it; without this the titlebar follows the OS appearance and can
		// end up dark above a light app (or the reverse).
		config.userContentController.add(self, name: "appearance")
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
		window.center()
		window.setFrameAutosaveName("FinishEmMainWindow")
		window.contentView = webView
		window.makeKeyAndOrderFront(nil)
		NSApp.activate(ignoringOtherApps: true)
	}

	func loadApp() {
		webView.load(URLRequest(url: baseURL))
	}

	// MARK: - Appearance

	func userContentController(
		_ userContentController: WKUserContentController,
		didReceive message: WKScriptMessage
	) {
		guard message.name == "appearance", let theme = message.body as? String else { return }
		let appearance: NSAppearance? =
			theme == "dark"
			? NSAppearance(named: .darkAqua)
			: theme == "light" ? NSAppearance(named: .aqua) : nil
		guard let appearance else { return }
		window.appearance = appearance
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

	// Intercept ordinary link clicks/navigations to off-site URLs.
	func webView(
		_ webView: WKWebView,
		decidePolicyFor navigationAction: WKNavigationAction,
		decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
	) {
		let url = navigationAction.request.url
		if navigationAction.navigationType == .linkActivated, isExternal(url) {
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
			if isExternal(url) {
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
