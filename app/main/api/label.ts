import { Label } from "../classes/label";

export const getLabels = (obj, ctx) => {
  return ctx.db
    .all("SELECT key, name, colour FROM label")
    .then(result => result.map(r => new Label(r.key, r.name, r.colour)));
};

// TODO: Not sure why this is an object for key
export const getLabel = (key, ctx) => {
  return ctx.db
    .get("SELECT key, name, colour FROM label WHERE key = $key", {
      $key: key.key
    })
    .then(result => {
      return new Label(result.key, result.name, result.colour);
    });
};

export const createLabel = (label, ctx) => {
  return ctx.db
    .run(
      "INSERT INTO label (key, name, colour ) VALUES (?, ?, ?)",
      label.key,
      label.name,
      label.colour
    )
    .then(result => {
      return result.changes
        ? getLabel({ key: label.key }, ctx)
        : new Error("Unable to create label");
    });
};

export const renameLabel = (label, ctx) => {
  return ctx.db
    .run(`UPDATE label SET name = $name WHERE key = $key`, {
      $key: label.key,
      $name: label.name
    })
    .then(result => {
      return result.changes
        ? getLabel({ key: label.key }, ctx)
        : new Error("Unable to rename label");
    });
};

export const recolourLabel = (label, ctx) => {
  return ctx.db
    .run("UPDATE label SET colour = $colour WHERE key = $key", {
      $key: label.key,
      $colour: label.colour
    })
    .then(result => {
      return result.changes
        ? getLabel({ key: label.key }, ctx)
        : new Error("Unable to recolour label");
    });
};

export const deleteLabel = (input, ctx) => {
  return ctx.db
    .run("DELETE FROM label WHERE key = $key", { $key: input.key })
    .then(result => {
      return result.changes
        ? input.key
        : new Error(`Unable to delete label with key ${input.key}`);
    });
};
