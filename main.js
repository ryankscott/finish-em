const { ipcMain, app, net, BrowserWindow, globalShortcut } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const applescript = require('applescript')
const semver = require('semver')

let mainWindow, quickAddWindow
const getMailLink = () => {
    const script = `
    tell application "Mail"
		set theSelection to selection
		set theMessage to item 1 of theSelection
		set theSubject to subject of theMessage
		set theSender to sender of theMessage
		set theID to message id of theMessage
		set theLink to "message://%3c" & theID & "%3e"
        set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
        set the clipboard to theItem
		return theItem
	end tell
`
    applescript.execString(script, (err, rtn) => {
        if (err) {
            console.log(err)
        }
    })
}

// TODO: Also need to implement a handler for Outlook to open the URIs
const getOutlookLink = () => {
    const script = `
    tell application "Microsoft Outlook"    
    set theSelection to selection
    set theMessage to item 1 of theSelection
    set theSubject to subject of theMessage
    set theSender to sender of theMessage
    set theID to message id of theMessage
    set theLink to "outlook://" & theID
    set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
    set the clipboard to theItem
    return theItem
end tell
`
    applescript.execString(script, (err, rtn) => {
        if (err) {
            console.log(err)
        }
    })
}

const openOutlookLink = (url) => {
    const script = `
	set the messageId to text 11 thru -1 of ${url}
	tell application "Microsoft Outlook"	
        open message id messageId
        activate
	end tell
`
    applescript.execString(script, (err, rtn) => {
        if (err) {
            console.log(err)
        }
    })
}

const checkForNewVersion = () => {
    const releasesURL = ' https://api.github.com/repos/ryankscott/finish-em/releases'

    const request = net.request(releasesURL)
    request.on('response', (response) => {
        let rawData = ''
        response.on('data', (chunk) => {
            rawData += chunk
        })
        response.on('end', () => {
            try {
                const response = JSON.parse(rawData)
                // Get rid of draft versions and get the last published
                const sortedReleases = response
                    .filter((r) => r.draft == false)
                    .sort((a, b) => b.published_at - a.published_at)
                // Get the semver of the release
                const latestRelease = sortedReleases[0]
                // If there's a new version
                if (semver.gt(latestRelease.name, app.getVersion())) {
                    const macRelease = latestRelease.assets.find((a) => a.name.endsWith('.dmg'))
                    // Send an event to the front-end to push a notification
                    mainWindow.webContents.send('new-version', {
                        version: latestRelease.name,
                        publishedAt: latestRelease.published_at,
                        downloadUrl: macRelease.browser_download_url,
                        releaseURL: latestRelease.html_url,
                        releaseNotes: latestRelease.body,
                    })
                }
            } catch (e) {
                console.error(e.message)
            }
        })
    })
    request.end()
}

function createQuickAddWindow() {
    quickAddWindow = new BrowserWindow({
        width: 580,
        transparent: true,
        frame: false,
        focused: true,
        resizable: false,
        movable: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname + '/preload.js'),
        },
    })

    quickAddWindow.loadURL(
        isDev ? 'http://localhost:1234?quickAdd' : `file://${__dirname}/build/index.html?quickAdd`,
    )
    // Open dev tools
    // quickAddWindow.webContents.openDevTools()

    // On closing derefernce
    quickAddWindow.on('closed', () => {
        quickAddWindow = null
    })
}

function createMainWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 850,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname + '/preload.js'),
        },
    })

    // Load the index.html of the app.
    mainWindow.loadURL(
        isDev ? 'http://localhost:1234?main' : `file://${__dirname}/build/index.html?main`,
    )

    // Open dev tools
    // mainWindow.webContents.openDevTools();

    // On closing derefernce
    // TODO: Change to an array for multi-window support
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    const handleRedirect = (e, url) => {
        if (url != mainWindow.getURL()) {
            e.preventDefault()
            require('electron').shell.openExternal(url)
        }
    }

    mainWindow.webContents.on('will-navigate', handleRedirect)
    mainWindow.webContents.on('new-window', handleRedirect)
}

app.on('ready', () => {
    createMainWindow()
    globalShortcut.register('Command+Shift+N', createQuickAddWindow)
    globalShortcut.register('Command+Shift+M', getMailLink)
    globalShortcut.register('Command+Shift+O', getOutlookLink)
    checkForNewVersion()
    setInterval(checkForNewVersion, 1000 * 60 * 60 * 24)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
    globalShortcut.unregisterAll()
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createMainWindow()
    }
})

ipcMain.on('close-quickadd', (event, arg) => {
    if (quickAddWindow) {
        quickAddWindow.close()
    }
})

ipcMain.on('open-outlook-link', (event, arg) => {
    openOutlookLink(arg.url)
})

// This is to send events between quick add and main window
ipcMain.on('create-task', (event, arg) => {
    mainWindow.webContents.send('create-task', arg)
})
