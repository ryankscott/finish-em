import chrono from "chrono-node";
import { isAfter, format, isToday, isTomorrow, isThisWeek } from "date-fns";

export const itemRegex = new RegExp("^(TODO)|(NOTE)s*.*", "gi");

export const getItemTypeFromString = text => {
  const words = text.split(" ");
  const itemType = words[0];
  return itemType.toUpperCase();
};

export const capitaliseItemTypeFromString = text => {
  const words = text.split(" ");
  const t = words.shift().toUpperCase();
  words.unshift(t);
  return words.join(" ");
};

export const removeItemTypeFromString = text => {
  const words = text.split(" ");
  words.shift();
  return words.join(" ").trim();
};

export const extractDateFromString = text => {
  const dates = chrono.parse(text);
  return dates.length ? dates[0].ref : null;
};

export const removeDateFromString = text => {
  const dates = chrono.parse(text);
  if (dates.length == 0 || dates === undefined) {
    return text;
  }
  const startString = text.slice(0, dates[0].index);
  const endString = text.slice(dates[0].index + dates[0].text.length);
  return (startString + endString).trim();
};

// TODO: Think about tags etc.
export const validateItemString = text => {
  const matches = text.match(itemRegex);
  return (matches && matches.length) > 0;
};

// Removes key from object without mutating original object
export const removeByKey = (object, deleteKey) => {
  return Object.keys(object)
    .filter(key => key !== deleteKey)
    .reduce((result, current) => {
      result[current] = object[current];
      return result;
    }, {});
};

// Thanks https://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
export const setEndOfContenteditable = contentEditableElement => {
  var range, selection;
  if (document.createRange) {
    //Firefox, Chrome, Opera, Safari, IE 9+
    range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
    range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection(); //get the selection object (allows you to change selection)
    selection.removeAllRanges(); //remove any selections already made
    selection.addRange(range); //make the range you have just created the visible selection
  } else if (document.selection) {
    //IE 8 and lower
    range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
    range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
    range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
    range.select(); //Select the range (make it the visible selection
  }
};

export const formatRelativeDate = date => {
  if (isToday(date)) {
    return "Today";
  } else if (isTomorrow(date)) {
    return "Tomorrow";
  } else if (isThisWeek(date) && isAfter(date, new Date())) {
    return format(date, "EEE");
  } else {
    return format(date, "d/M/yyyy");
  }
};

export const getItemById = (id, items) => {
  return items.find(i => i.id == id);
};

export const getSubtasksFromTasks = (items, allItems) => {
  const itemsWithSubtasks = items.filter(i => (i.children && i.children.length > 0));
  const subtasks = itemsWithSubtasks.map(i =>
    i.children.flatMap(x => getItemById(x, allItems))
  );
  return subtasks.flat();
};

export const getTasksAndSubtasks = (items, filter) => {
  const filteredItems = items.filter(filter);
  const subtasks = getSubtasksFromTasks(filteredItems, items);
  return [...filteredItems, ...subtasks];
};

export const capitaliseEachWordInString = text => {
  return text
    .toLowerCase()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");
};
