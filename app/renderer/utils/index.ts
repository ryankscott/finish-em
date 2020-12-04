import * as chrono from 'chrono-node'
import { ItemType, Item, RenderingStrategy } from '../interfaces'
import RRule from 'rrule'

export const itemRegex = /^(TODO|NOTE)\b/i
export const dueTextRegex = /due:(\s*"[\s\S]*")|due:(\s*\S+)/gi
export const scheduledTextRegex = /scheduled:(\s*"[\s\S]*")|scheduled:(\s*\S+)/gi
export const projectTextRegex = /project:(\s*"[\s\S]*")|project:(\s*\S+)/gi
export const repeatTextRegex = /repeat:(\s*"[\s\S]*")|repeat:(\s*\S+)/gi
export const markdownLinkRegex = /\[([\w\s\d]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/
export const markdownBasicRegex = /[*_]{1,2}(\w*)[*_]{1,2}/

import er from 'emoji-regex'

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
  return itemRegex.test(text)
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
    return format(date, 'do MMMM')
  }
}

export const capitaliseEachWordInString = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

export const camelCaseToInitialCaps = (text: string): string => {
  return capitaliseEachWordInString(text.replace(/([a-z](?=[A-Z]))/g, '$1 '))
}

export const hasEmoji = (input: string): boolean => {
  return er().test(input)
}

export const getEmoji = (input: string): string => {
  const found = input.match(er())
  return found ? found[0] : null
}

export const createShortSidebarItem = (input: string): string => {
  if (!input) return input

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
    case 1:
      return 'Tuesday'
    case 2:
      return 'Wednesday'
    case 3:
      return 'Thursday'
    case 4:
      return 'Friday'
    case 5:
      return 'Saturday'
    case 6:
      return 'Sunday'
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

export const groupBy = (inputArray: {}[], groupingKey: string): {} => {
  return inputArray.reduce((acc, i, index) => {
    acc.hasOwnProperty(i[groupingKey]) ? acc[i[groupingKey]].push(i) : (acc[i[groupingKey]] = [i])
    return acc
  }, {})
}

// TODO: Refactor me
export const convertToProperTzOffset = (inputTz: string): string => {
  const n = Number.parseFloat(inputTz)
  if (Number.isNaN(n)) return '0'

  const fraction = Math.abs(n % 1)
  const isNegative = n < 0
  const intPart = Math.abs(Math.trunc(n))
  const fractionString = fraction == 0 ? '' : fraction * 60

  /* Example conversions
   *  2 -> +02
   *  2.5 -> +0230
   *  -2 -> -02
   *  -2.5 -> -0230
   */
  if (intPart > 14 || intPart < -12) {
    throw 'Invalid timezone'
  }

  if (intPart < 10) {
    return isNegative
      ? `-0${intPart.toString()}${fractionString}`
      : `+0${intPart.toString()}${fractionString}`
  }
  return isNegative
    ? `-${intPart.toString()}${fractionString}`
    : `+${intPart.toString()}${fractionString}`
}

// TODO: Refactor function
export function arrayIntersection<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x))
}
