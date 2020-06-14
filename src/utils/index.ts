import chrono from 'chrono-node'
import { ItemType, Item, RenderingStrategy } from '../interfaces'
import RRule from 'rrule'

import * as ic from '../assets/icons'
export const itemRegex = new RegExp('^((TODO)|(NOTE))', 'gi')
import emojiRegex from 'emoji-regex/text.js'
import {
    parseISO,
    isToday,
    isThisWeek,
    isThisMonth,
    isPast,
    endOfDay,
    differenceInDays,
    isTomorrow,
    isYesterday,
    format,
    isAfter,
} from 'date-fns'

export const getItemTypeFromString = (text: string): 'TODO' | 'NOTE' => {
    const words = text.split(' ')
    const itemType = words[0]
    const upperItemType = itemType.toUpperCase()
    if (upperItemType == 'NOTE') return 'NOTE'
    if (upperItemType == 'TODO') return 'TODO'
    return 'TODO'
}

export const capitaliseItemTypeFromString = (text: string): string => {
    const words = text.split(' ')
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
    const words = text.split(' ')
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

// Thanks https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
//

//From: http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
const voidNodeTags = [
    'AREA',
    'BASE',
    'BR',
    'COL',
    'EMBED',
    'HR',
    'IMG',
    'INPUT',
    'KEYGEN',
    'LINK',
    'MENUITEM',
    'META',
    'PARAM',
    'SOURCE',
    'TRACK',
    'WBR',
    'BASEFONT',
    'BGSOUND',
    'FRAME',
    'ISINDEX',
]

//Basic idea from: https://stackoverflow.com/questions/19790442/test-if-an-element-can-contain-text
const canContainText = (node: Node): boolean => {
    if (node.nodeType == 1) {
        //is an element node
        return !voidNodeTags.includes(node.nodeName)
    } else {
        //is not an element node
        return false
    }
}

const getLastChildElement = (el: Node): ChildNode => {
    let lc = el.lastChild
    while (lc && lc.nodeType != 1) {
        if (lc.previousSibling) lc = lc.previousSibling
        else break
    }
    return lc
}

// Based on Nico Burns's answer
export const setEndOfContenteditable = (contentEditableElement): void => {
    while (
        getLastChildElement(contentEditableElement) &&
        canContainText(getLastChildElement(contentEditableElement))
    ) {
        contentEditableElement = getLastChildElement(contentEditableElement)
    }

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
    if (isToday(date)) {
        return 'Today'
    } else if (isTomorrow(date)) {
        return 'Tomorrow'
    } else if (isYesterday(date)) {
        return 'Yesterday'
    } else if (differenceInDays(date, new Date()) < 7 && isAfter(date, new Date())) {
        return format(date, 'EEEE')
    } else {
        return format(date, 'd/M/yyyy')
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

export const iconMapping = {
    close: (w, h, c) => ic.close(w, h, c),
    expand: (w, h, c) => ic.expanded(w, h, c),
    collapse: (w, h, c) => ic.collapsed(w, h, c),
    help: (w, h, c) => ic.help(w, h, c),
    repeat: (w, h, c) => ic.repeat(w, h, c),
    due: (w, h, c) => ic.due(w, h, c),
    scheduled: (w, h, c) => ic.scheduled(w, h, c),
    note: (w, h, c) => ic.note(w, h, c),
    add: (w, h, c) => ic.add(w, h, c),
    todoUnchecked: (w, h, c) => ic.todoUnchecked(w, h, c),
    todoChecked: (w, h, c) => ic.todoChecked(w, h, c),
    trash: (w, h, c) => ic.trash(w, h, c),
    trashSweep: (w, h, c) => ic.trashSweep(w, h, c),
    hide: (w, h, c) => ic.hide(w, h, c),
    show: (w, h, c) => ic.show(w, h, c),
    sort: (w, h, c) => ic.sort(w, h, c),
    sortDirection: (w, h, c) => ic.sortDirection(w, h, c),
    inbox: (w, h, c) => ic.inbox(w, h, c),
    calendar: (w, h, c) => ic.calendar(w, h, c),
    slideLeft: (w, h, c) => ic.slideLeft(w, h, c),
    slideRight: (w, h, c) => ic.slideRight(w, h, c),
    upLevel: (w, h, c) => ic.upLevel(w, h, c),
    back: (w, h, c) => ic.back(w, h, c),
    forward: (w, h, c) => ic.forward(w, h, c),
    settings: (w, h, c) => ic.settings(w, h, c),
    subtask: (w, h, c) => ic.subtask(w, h, c),
    more: (w, h, c) => ic.more(w, h, c),
    flag: (w, h, c) => ic.flag(w, h, c),
    trashPermanent: (w, h, c) => ic.trashPermanent(w, h, c),
    stale: (w, h, c) => ic.stale(w, h, c),
    label: (w, h, c) => ic.label(w, h, c),
    edit: (w, h, c) => ic.edit(w, h, c),
    colour: (w, h, c) => ic.colour(w, h, c),
    expandAll: (w, h, c) => ic.expandAll(w, h, c),
    collapseAll: (w, h, c) => ic.collapseAll(w, h, c),
}

// Filtrex options

const overdue = (dueDate: string): boolean => {
    return isPast(endOfDay(parseISO(dueDate)))
}
const today = (d: string): boolean => {
    return isToday(parseISO(d))
}

const thisWeek = (d: string): boolean => {
    return isThisWeek(parseISO(d))
}

const thisMonth = (d: string): boolean => {
    return isThisMonth(parseISO(d))
}

const daysFromToday = (a: string): number => {
    return differenceInDays(parseISO(a), new Date())
}

export const filtrexOptions = {
    extraFunctions: { overdue, today, thisWeek, thisMonth, daysFromToday },
}
