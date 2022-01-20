-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE area ADD COLUMN emoji TEXT;

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

CREATE TABLE areaTemp AS SELECT id, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, key FROM area;
DROP TABLE area;
ALTER TABLE areaTemp RENAME TO area;
