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

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
	let port = resolvePort()
	var window: NSWindow!
	var webView: WKWebView!
	var serverProcess: Process?

	var baseURL: URL { URL(string: "http://127.0.0.1:\(port)")! }
	var healthURL: URL { baseURL.appendingPathComponent("api/settings") }

	var signalSources: [DispatchSourceSignal] = []

	func applicationDidFinishLaunching(_ notification: Notification) {
		installSignalHandlers()
		buildMenu()
		buildWindow()

		if serverIsUp() {
			// A server is already running (e.g. TUI or dev server). Reuse it.
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
		webView = WKWebView(
			frame: NSRect(x: 0, y: 0, width: 1100, height: 800),
			configuration: config)
		webView.navigationDelegate = self

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
