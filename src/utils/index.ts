import chrono from 'chrono-node'
import { isAfter, format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { ItemType, ProjectType } from '../interfaces'
import { Uuid } from '@typed/uuid'
import RRule from 'rrule'

export const itemRegex = new RegExp('^(TODO)|(NOTE)s*.*', 'gi')

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

// TODO This should return some sort of error if the first word isn't NOTE or TODO
export const removeItemTypeFromString = (text: string): string => {
    if (!text) {
        return ''
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

export const validateItemString = (text: string): boolean => {
    const matches = text.match(itemRegex)
    return (matches && matches.length) > 0
}

// Removes key from object without mutating original object
export const removeByKey = (
    object: Record<string, any>,
    deleteKey: string,
): Record<string, any> => {
    return Object.keys(object)
        .filter((key) => key !== deleteKey)
        .reduce((result, current) => {
            result[current] = object[current]
            return result
        }, {})
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
    } else if (isThisWeek(date) && isAfter(date, new Date())) {
        return format(date, 'EEEE')
    } else {
        return format(date, 'd/M/yyyy')
    }
}

export const getItemById = (id: Uuid, items: ItemType[]): ItemType => {
    return items.find((i) => i.id == id)
}
export const getItemIndexById = (id: Uuid, items: ItemType[]): number => {
    return items.findIndex((i) => i.id == id)
}

export const getSubtasksFromTasks = (
    items: ItemType[],
    allItems: ItemType[],
): ItemType[] => {
    const itemsWithSubtasks = items.filter(
        (i) => i.children && i.children.length > 0,
    )
    const subtasks = itemsWithSubtasks.map((i) =>
        i.children.flatMap((x) => getItemById(x, allItems)),
    )
    return subtasks.flat()
}

export const getTasksAndSubtasks = (
    items: ItemType[],
    filter: (_: ItemType) => boolean,
): ItemType[] => {
    const filteredItems = items.filter(filter)
    const subtasks = getSubtasksFromTasks(filteredItems, items)
    return [...filteredItems, ...subtasks]
}

export const capitaliseEachWordInString = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ')
}

export const getProjectById = (
    id: Uuid,
    projects: ProjectType[],
): ProjectType => {
    return projects.find((i) => i.id == id)
}

export const getProjectNameById = (
    id: Uuid,
    projects: ProjectType[],
): string => {
    const p = projects.find((i) => i.id == id)
    return p ? p.name : 'Inbox'
}

export const getFirstLetterFromEachWord = (input: string): string => {
    const words = input.split(' ')
    if (words.length == 1) return input.slice(0, 2)
    const letters = words.map((w) => w[0])
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
        case 3:
            return 'Friday'
            break
        case 3:
            return 'Saturday'
            break
        case 3:
            return 'Sunday'
            break

        default:
            break
    }
}

export const rruleToText = (input: RRule): string => {
    console.log(input)
    switch (input.options.freq) {
        case RRule.MONTHLY:
            const date = input.options.bymonthday[0]
            const dateString = getNumberAndSuffix(date)
            return dateString + ' of the month'
            break
        case RRule.WEEKLY:
            const day = input.options.byweekday[0]
            return 'every ' + dayToString(day)
        default:
            return input.toText()
            break
    }
}
