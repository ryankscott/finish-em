-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE project ADD COLUMN emoji TEXT;

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

CREATE TABLE projectTemp AS SELECT id, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey, key FROM project;
DROP TABLE project;
ALTER TABLE projectTemp RENAME TO project;
