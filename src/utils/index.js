// TODO: What about leading space
export const getItemTypeFromString = text => {
  const words = text.split(" ");
  const itemType = words[0];
  return itemType;
};

export const getItemTextFromString = text => {
  const words = text.split(" ");
  const itemText = words.slice(1).join(" ");
  return itemText;
};

// TODO: Think about tags etc.
export const validateItemString = text => {
  const regex = /^\**\s*TODO|NOTE/;
  const matches = text.match(regex);
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
