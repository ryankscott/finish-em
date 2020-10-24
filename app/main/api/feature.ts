import Feature from "../classes/feature";

export const getFeatures = (obj, ctx) => {
  return ctx.db
    .all("SELECT key, name, enabled FROM feature")
    .then((result) => result.map((r) => new Feature(r.key, r.name, r.enabled)));
};

export const getFeature = (key: { key: string }, ctx) => {
  return ctx.db
    .get("SELECT key, name, enabled FROM feature WHERE key = $key", {
      $key: key.key,
    })
    .then((result) => {
      return new Feature(result.key, result.name, result.enabled);
    });
};

export const setFeature = (data: { key: string; enabled: boolean }, ctx) => {
  return ctx.db
    .run("UPDATE feature SET enabled = $enabled WHERE key = $key", {
      $enabled: data.enabled,
      $key: data.key,
    })
    .then((result) => {
      return result.changes
        ? getFeature({ key: data.key }, ctx)
        : new Error("Unable to create feature");
    });
};

export const createFeature = (
  feature: { key: string; name: string; enabled: boolean },
  ctx
) => {
  return ctx.db
    .run(
      "INSERT INTO feature (key, name, enabled) VALUES (?, ?, ?)",
      feature.key,
      feature.name,
      feature.enabled
    )
    .then((result) => {
      return result.changes
        ? getFeature({ key: feature.key }, ctx)
        : new Error("Unable to create feature");
    });
};
