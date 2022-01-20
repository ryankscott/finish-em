
-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------


CREATE TABLE itemOrderTemp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemKey TEXT NOT NULL,
  componentKey TEXT NOT NULL,
  sortOrder INTEGER NOT NULL
);
DROP TABLE itemOrder;
ALTER TABLE itemOrderTemp RENAME TO itemOrder;
CREATE UNIQUE INDEX IF NOT EXISTS component_item ON itemOrder (itemKey, componentKey);
CREATE INDEX IF NOT EXISTS component_itemOrder ON itemOrder (componentKey);

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------


CREATE TABLE itemOrderTemp AS SELECT id, itemKey, sortOrder FROM itemOrder;
DROP TABLE itemOrder;
ALTER TABLE itemOrderTemp RENAME TO itemOrder;

