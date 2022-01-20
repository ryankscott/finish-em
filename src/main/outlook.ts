import applescript from 'applescript'
import util from 'util'
const executeAppleScript = util.promisify(applescript.execString)
const log = require('electron-log')
export const getOutlookLink = async () => {
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
  const link = await executeAppleScript(script)
  if (!link) {
    log.error(`Failed to get Outlook link`)
  }
}

export const openOutlookLink = async (url: string) => {
  const script = `
      set the messageId to text 11 thru -1 of ${url}
      tell application "Microsoft Outlook"
          open message id messageId
          activate
      end tell
  `
  const link = await executeAppleScript(script)
  if (!link) {
    log.error(`Failed to open Outlook link`)
  }
}
