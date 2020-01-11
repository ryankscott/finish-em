import chrono from "chrono-node";

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

export const extractDateFromString = text => {
  const dates = chrono.parse(text);
  return dates.length ? dates[0].ref : null;
};

export const removeDateFromString = text => {
  const dates = chrono.parse(text);
  if (dates.length == 0) {
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
