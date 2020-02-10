import chrono from "chrono-node";
import { isBefore, formatDistanceToNow, parseISO, isValid } from "date-fns";

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
  }
};
