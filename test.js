let applescript = require('applescript')
let util = require('util')
// let runAppleScriptAsync = require('run-applescript')

const executeAppleScript = util.promisify(applescript.execString)

const getAllRecurringEventsByInterval = (interval) => {
  return `
     set theStartDate to (current date) - (${interval * 10} * days)
     set theEndDate to (theStartDate) + (10 * days)
     set output to {}
     tell application "Calendar"
     tell calendar "ryan.scott@contentful.com"
         set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than or equal to theEndDate and recurrence is not equal to "")
         repeat with e in allEvents
           try
             copy{(uid of e)} to end of output
           end try
         end repeat
       end tell
     end tell
     return output
   `
}

const getAllRecurringEvents = `
     set theStartDate to (current date) - (180 * days)
     set theEndDate to (theStartDate) + (10 * days)
     set output to {}
     tell application "Calendar"
     tell calendar "ryan.scott@contentful.com"
         set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than or equal to theEndDate and recurrence is not equal to "")
         repeat with e in allEvents
           try
             copy{(uid of e)} to end of output
           end try
         end repeat
       end tell
     end tell
     return output
   `

const getEventIdsForWeek = `
        set theStartDate to current date
        set hours of theStartDate to 0
        set minutes of theStartDate to 0
        set seconds of theStartDate to 0
        set theEndDate to theStartDate + (7 * days) - 1 
        set output to {}
        tell application "Calendar"
          tell calendar "ryan.scott@contentful.com"
            set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than theEndDate)
            repeat with e in allEvents
              try
                copy{(uid of e)} to end of output
              end try
            end repeat
          end tell
        end tell
        return output
        `

const getFullEventsForWeek = ` 
set theStartDate to current date
set hours of theStartDate to 0
set minutes of theStartDate to 0
set seconds of theStartDate to 0
set theEndDate to theStartDate + (7 * days) - 1
set output to {}
tell application "Calendar"
	tell calendar "ryan.scott@contentful.com"
		set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than theEndDate)
		repeat with e in allEvents
			set startDate to (start date of e)
			set endDate to (end date of e)
			set attendeesOutput to {}
			repeat with a in (attendees of e)
				copy {(display name of a), (email of a)} to end of attendeesOutput
			end repeat
			copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (status of e), (allday event of e), (location of e), (time to GMT) / hours, attendeesOutput, (recurrence of e)} to end of output
		end repeat
	end tell
end tell
return output`

const getEventById = (id) => {
  return `
set output to {}
tell application "Calendar"
  tell calendar "ryan.scott@contentful.com"
    set e to first event where its uid = "${id}"
    set startDate to (start date of e)
    set endDate to (end date of e)
    set attendeesOutput to {}
    repeat with a in (attendees of e)
      copy {(display name of a), (email of a)} to end of attendeesOutput
    end repeat
    copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (status of e), (allday event of e), (location of e), (time to GMT) / hours, attendeesOutput, (recurrence of e)} to end of output
  end tell
end tell
return output
`
}

const getRecurringEventsInOneGo = async () => {
  console.time('one-go')
  console.log(`Getting all recurring events in one go`)
  const ed = await executeAppleScript(getAllRecurringEvents)
  if (ed) {
    console.log(`Got all events`)
    console.timeEnd('one-go')
  } else {
    console.log(`Failed to get events`)
    console.timeEnd('one-go')
  }
}

const getRecurringEventsInIntervals = async () => {
  console.time('intervals')
  console.log(`Getting all recurring events in intervals`)
  for (let index = 0; index < 18; index++) {
    console.log(`Getting batch: ${index} / 18`)
    const recurringEvents = await executeAppleScript(getAllRecurringEventsByInterval(index))
    if (recurringEvents) {
      console.log(`Successfully got batch ${index}`)
    } else {
      console.log(`Failed to get batch ${index}`)
    }
  }
  console.log('Got all recurring events in intervals')
  console.timeEnd('intervals')
}

const getEventsInOneGo = async () => {
  console.time('one-go')
  console.log(`Getting all events in one go`)
  const ed = await executeAppleScript(getFullEventsForWeek)
  if (ed) {
    console.log(`Got all events`)
    console.timeEnd('one-go')
  } else {
    console.log(`Failed to get events`)
    console.timeEnd('one-go')
  }
}

const getEventsIncrementally = async () => {
  console.time('incrementally')
  console.log(`Getting events incrementally`)
  const ed1 = await executeAppleScript(getEventIdsForWeek)
  const eventDetails = ed1[0]
  for (let index = 0; index < eventDetails.length; index++) {
    try {
      const details = await executeAppleScript(getEventById(eventDetails[index]))
      if (details) {
        console.log(`Got event #${index}`)
      } else {
        console.log(`Failed to get event #${index}`)
      }
    } catch (err) {
      console.log(`Failed to get events by ids - ${err}`)
      return
    }
  }
  console.log(`Got events incrementally`)
  console.timeEnd('incrementally')
}

const main = async () => {
  await getRecurringEventsInOneGo()
  await getRecurringEventsInIntervals()
}

main()
