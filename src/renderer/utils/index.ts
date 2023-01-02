import * as chrono from 'chrono-node';
import {
  differenceInDays,
  format,
  isAfter,
  isToday,
  isTomorrow,
  isValid,
  isYesterday,
} from 'date-fns';
import emojiRegexText from 'emoji-regex';
import { RRule } from 'rrule';

export const itemRegex = /^(TODO|NOTE)\b/i;
export const dueTextRegex = /due:(\s*"[\s\S]*")|due:(\s*\S+)/gi;
export const scheduledTextRegex =
  /scheduled:(\s*"[\s\S]*")|scheduled:(\s*\S+)/gi;
export const projectTextRegex = /project:(\s*"[\s\S]*")|project:(\s*\S+)/gi;
export const repeatTextRegex = /repeat:(\s*"[\s\S]*")|repeat:(\s*\S+)/gi;
export const markdownLinkRegex =
  /\[([\w\s\d]+)\]\(((?:\/|https?:\/\/)[\w\d./?=#]+)\)/;
export const markdownBasicRegex = /[*_]{1,2}(\w*)[*_]{1,2}/;

export const capitaliseItemTypeFromString = (text: string): string => {
  const words = text.split(/\s+/);
  const firstWord = words.shift();
  if (firstWord) {
    firstWord.toUpperCase();
    words.unshift(firstWord);
  }
  return words.join(' ');
};
export const validateItemString = (text: string): boolean => {
  return itemRegex.test(text);
};

// TODO This should return some sort of error if the first word isn't NOTE or TODO
export const removeItemTypeFromString = (text: string): string => {
  if (!text) {
    return '';
  }
  if (!validateItemString(text)) {
    return text;
  }

  const words = text.split(/\s+/);
  words.shift();
  return words.join(' ').trim();
};

export const extractDateFromString = (text: string): Date | null => {
  const dates = chrono.parse(text);
  return dates.length ? dates[0].ref : null;
};

export const removeDateFromString = (text: string): string => {
  const dates = chrono.parse(text);
  if (dates.length === 0 || dates === undefined) {
    return text;
  }
  const startString = text.slice(0, dates[0].index);
  const endString = text.slice(dates[0].index + dates[0].text.length);
  return (startString + endString).trim();
};

export const setEndOfContenteditable = (
  contentEditableElement: Element
): void => {
  let range;
  let selection;
  if (document.createRange) {
    range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
    range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection(); // get the selection object (allows you to change selection)
    if (selection) {
      selection.removeAllRanges(); // remove any selections already made
      selection.addRange(range); // make the range you have just created the visible selection*/
    }
  }
};

export const formatRelativeDate = (date: Date): string => {
  if (!isValid(date)) return '';
  if (isToday(date)) {
    return 'Today';
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (differenceInDays(date, new Date()) < 7 && isAfter(date, new Date())) {
    return format(date, 'EEEE');
  }
  return format(date, 'do MMMM');
};

export const capitaliseEachWordInString = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
};

export const camelCaseToInitialCaps = (text: string): string => {
  return capitaliseEachWordInString(text.replace(/([a-z](?=[A-Z]))/g, '$1 '));
};

export const hasEmoji = (input: string): boolean => {
  return emojiRegexText().test(input);
};

export const getEmoji = (input: string): string | null => {
  if (!input) return null;
  const found = input.match(emojiRegexText());
  return found ? found[0] : null;
};

export const createShortSidebarItem = (input: string): string | null => {
  if (!input) return input;

  if (hasEmoji(input)) return getEmoji(input);

  const words = input.split(' ');
  // If there's only one word
  if (words.length === 1) {
    const word = words[0];

    // Return  the first two letters
    return word.slice(0, 2);
  }

  // Otherwise get the first letter of each word, and take the first two words
  const letters = words.map((w) => [...w][0]).slice(0, 2);
  // Join it back up and uppercase it
  return letters.join('').toUpperCase();
};

const getNumberAndSuffix = (i: number): string => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
};

export const dayToString = (day: number): string => {
  switch (day) {
    case 0:
      return 'Monday';
    case 1:
      return 'Tuesday';
    case 2:
      return 'Wednesday';
    case 3:
      return 'Thursday';
    case 4:
      return 'Friday';
    case 5:
      return 'Saturday';
    case 6:
      return 'Sunday';
    default:
      return 'Monday';
  }
};

export const rruleToText = (input: RRule): string => {
  switch (input.options.freq) {
    case RRule.MONTHLY: {
      const date = input.options.bymonthday[0];
      const dateString = getNumberAndSuffix(date);
      return `${dateString} of the month`;
    }
    case RRule.WEEKLY: {
      const formatter = new Intl.ListFormat('en', {
        style: 'long',
        type: 'conjunction',
      });
      const days = input.options.byweekday;
      const dayString = formatter.format(days.map((d) => dayToString(d)));
      return `every ${dayString}`;
    }
    case RRule.DAILY: {
      const d = input.options.byweekday;
      if (d?.length > 0) {
        return input.toText();
      }
      return 'daily';
    }
    default:
      return input.toText();
  }
};

export const capitaliseFirstLetter = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const truncateString = (input: string, length: number): string => {
  if (input.length <= length) {
    return input;
  }
  return `${input.slice(0, length - 1)}...`;
};

// TODO: Refactor me
export const convertToProperTzOffset = (inputTz: string): string => {
  const n = Number.parseFloat(inputTz);
  if (Number.isNaN(n)) return '0';

  const fraction = Math.abs(n % 1);
  const isNegative = n < 0;
  const intPart = Math.abs(Math.trunc(n));
  const fractionString = fraction === 0 ? '' : fraction * 60;

  /* Example conversions
   *  2 -> +02
   *  2.5 -> +0230
   *  -2 -> -02
   *  -2.5 -> -0230
   */
  if (intPart > 14 || intPart < -12) {
    throw new Error('Invalid timezone');
  }

  if (intPart < 10) {
    return isNegative
      ? `-0${intPart.toString()}${fractionString}`
      : `+0${intPart.toString()}${fractionString}`;
  }
  return isNegative
    ? `-${intPart.toString()}${fractionString}`
    : `+${intPart.toString()}${fractionString}`;
};

export const getProductName = (): string => {
  const adjective = [
    'Small',
    'Ergonomic',
    'Rustic',
    'Intelligent',
    'Gorgeous',
    'Incredible',
    'Fantastic',
    'Practical',
    'Sleek',
    'Awesome',
    'Generic',
    'Handcrafted',
    'Handmade',
    'Licensed',
    'Refined',
    'Unbranded',
    'Tasty',
  ];
  const material = [
    'Steel',
    'Wooden',
    'Concrete',
    'Plastic',
    'Cotton',
    'Granite',
    'Rubber',
    'Metal',
    'Soft',
    'Fresh',
    'Frozen',
  ];
  const product = [
    'Chair',
    'Car',
    'Computer',
    'Keyboard',
    'Mouse',
    'Bike',
    'Ball',
    'Gloves',
    'Pants',
    'Shirt',
    'Table',
    'Shoes',
    'Hat',
    'Towels',
    'Soap',
    'Tuna',
    'Chicken',
    'Fish',
    'Cheese',
    'Bacon',
    'Pizza',
    'Salad',
    'Sausages',
    'Chips',
  ];

  return `${adjective[Math.floor(Math.random() * adjective.length)]} ${
    material[Math.floor(Math.random() * material.length)]
  } ${product[Math.floor(Math.random() * product.length)]}`;
};

export const getProductDescription = (): string => {
  const description = [
    'Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support',
    'The automobile layout consists of a front-engine design, with transaxle-type transmissions mounted at the rear of the engine and four wheel drive',
    'New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016',
    'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality',
    'The Apollotech B340 is an affordable wireless mouse with reliable connectivity, 12 months battery life and modern design',
    'The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J',
    'The Football Is Good For Training And Recreational Purposes',
    'Carbonite web goalkeeper gloves are ergonomically designed to give easy fit',
    "Boston's most advanced compression wear technology increases muscle oxygenation, stabilizes active muscles",
    'New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart',
    'The beautiful range of Apple Naturalé that has an exciting mix of natural ingredients. With the Goodness of 100% Natural Ingredients',
    'Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals',
  ];

  return description[Math.floor(Math.random() * description.length)];
};

export const HTMLToPlainText = (html: string): string => {
  return html
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<script([\s\S]*?)<\/script>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '  *  ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/gi, '');
};

/*
export const useTraceUpdate = (props: never) => {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
};
*/
export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};
