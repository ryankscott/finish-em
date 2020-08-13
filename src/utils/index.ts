import * as chrono from 'chrono-node'
import { ItemType, Item, RenderingStrategy } from '../interfaces'
import RRule from 'rrule'

export const itemRegex = /^(TODO)|(NOTE)\s+/gi
export const dueTextRegex = /due:(\s*"[\s\S]*")|due:(\s*\S+)/gi
export const scheduledTextRegex = /scheduled:(\s*"[\s\S]*")|scheduled:(\s*\S+)/gi
export const projectTextRegex = /project:(\s*"[\s\S]*")|project:(\s*\S+)/gi
export const repeatTextRegex = /repeat:(\s*"[\s\S]*")|repeat:(\s*\S+)/gi

import emojiRegex from 'emoji-regex/text.js'
import { isToday, differenceInDays, isTomorrow, isYesterday, format, isAfter } from 'date-fns'

export const getItemTypeFromString = (text: string): 'TODO' | 'NOTE' => {
    const words = text.split(/\s+/)
    const itemType = words[0]
    const upperItemType = itemType.toUpperCase()
    if (upperItemType == 'NOTE') return 'NOTE'
    if (upperItemType == 'TODO') return 'TODO'
    return 'TODO'
}

export const capitaliseItemTypeFromString = (text: string): string => {
    const words = text.split(/\s+/)
    const t = words.shift().toUpperCase()
    words.unshift(t)
    return words.join(' ')
}
export const validateItemString = (text: string): boolean => {
    const matches = text.match(itemRegex)
    return (matches && matches.length) > 0
}

// TODO This should return some sort of error if the first word isn't NOTE or TODO
export const removeItemTypeFromString = (text: string): string => {
    if (!text) {
        return ''
    }
    if (!validateItemString(text)) {
        return null
    }
    const words = text.split(/\s+/)
    words.shift()
    return words.join(' ').trim()
}

export const extractDateFromString = (text: string): Date => {
    const dates = chrono.parse(text)
    return dates.length ? dates[0].ref : null
}

export const removeDateFromString = (text: string): string => {
    const dates = chrono.parse(text)
    if (dates.length == 0 || dates === undefined) {
        return text
    }
    const startString = text.slice(0, dates[0].index)
    const endString = text.slice(dates[0].index + dates[0].text.length)
    return (startString + endString).trim()
}

export const setEndOfContenteditable = (contentEditableElement): void => {
    let range, selection
    if (document.createRange) {
        //Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange() //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement) //Select the entire contents of the element with the range
        range.collapse(false) //collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection() //get the selection object (allows you to change selection)
        selection.removeAllRanges() //remove any selections already made
        selection.addRange(range) //make the range you have just created the visible selection
    }
}

export const formatRelativeDate = (date: Date): string => {
    if (!date) return ''
    if (isToday(date)) {
        return 'Today'
    } else if (isTomorrow(date)) {
        return 'Tomorrow'
    } else if (isYesterday(date)) {
        return 'Yesterday'
    } else if (differenceInDays(date, new Date()) < 7 && isAfter(date, new Date())) {
        return format(date, 'EEEE')
    } else {
        return format(date, 'do MMM y')
    }
}

export const capitaliseEachWordInString = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ')
}

export const hasEmoji = (input: string): boolean => {
    return emojiRegex.test(input)
}

export const getEmoji = (input: string): string => {
    const found = input.match(emojiRegex)
    return found ? found[0] : null
}

export const createShortProjectName = (input: string): string => {
    // If there's an emoji anywhere return the first one
    const emoji = getEmoji(input)
    if (emoji) return emoji

    const words = input.split(' ')
    // If there's only one word
    if (words.length == 1) {
        const word = words[0]

        // Return  the first two letters
        return word.slice(0, 2)
    }

    // Otherwise get the first letter of each word, and take the first two words
    const letters = words.map((w) => [...w][0]).slice(0, 2)
    // Join it back up and uppercase it
    return letters.join('').toUpperCase()
}

const getNumberAndSuffix = (i: number): string => {
    const j = i % 10,
        k = i % 100
    if (j == 1 && k != 11) {
        return i + 'st'
    }
    if (j == 2 && k != 12) {
        return i + 'nd'
    }
    if (j == 3 && k != 13) {
        return i + 'rd'
    }
    return i + 'th'
}

const dayToString = (i: number): string => {
    switch (i) {
        case 0:
            return 'Monday'
            break
        case 1:
            return 'Tuesday'
            break
        case 2:
            return 'Wednesday'
            break
        case 3:
            return 'Thursday'
            break
        case 4:
            return 'Friday'
            break
        case 5:
            return 'Saturday'
            break
        case 6:
            return 'Sunday'
            break

        default:
            break
    }
}

export const rruleToText = (input: RRule): string => {
    switch (input.options.freq) {
        case RRule.MONTHLY:
            const date = input.options.bymonthday[0]
            const dateString = getNumberAndSuffix(date)
            return dateString + ' of the month'
            break
        case RRule.WEEKLY:
            const day = input.options.byweekday[0]
            return 'every ' + dayToString(day)
        case RRule.DAILY:
            const d = input.options.byweekday
            if (d?.length > 0) {
                return input.toText()
            }
            return 'daily'
        default:
            return input.toText()
            break
    }
}

// TODO refactor me
export const filterItems = (
    input: Item,
    filterFunc: (i: ItemType) => boolean,
    rs: RenderingStrategy,
): Item => {
    if (rs == RenderingStrategy.All) {
        const f = Object.entries(input).filter((e) => {
            return filterFunc(e[1])
        })
        return Object.fromEntries(f)
    } else {
        const f1 = Object.entries(input).filter((e) => {
            return filterFunc(e[1]) && e[1].parentId == null
        })
        return Object.fromEntries(f1)
    }
}

export const convertItemToItemType = (input: Item): ItemType[] => {
    return Object.values(input)
}
export const capitaliseFirstLetter = (input: string): string => {
    return input.charAt(0).toUpperCase() + input.slice(1)
}

export const truncateString = (input: string, length: number): string => {
    if (input.length <= length) {
        return input
    }
    return input.slice(0, length - 1) + '...'
}
// TODO: Use a reduce
export const groupBy = (inputArray: {}[], groupingKey: string): {} => {
    const output = {}
    inputArray.map((i) => {
        return output.hasOwnProperty(i[groupingKey])
            ? output[i[groupingKey]].push(i)
            : (output[i[groupingKey]] = [i])
    })
    return output
}
