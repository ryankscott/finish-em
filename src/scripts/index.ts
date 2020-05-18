const applescript = require('applescript')

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
module.exports = { getMailLink }
