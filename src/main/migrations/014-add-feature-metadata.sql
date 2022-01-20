
-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE feature ADD COLUMN metadata JSON;


-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

CREATE TABLE featureTemp AS SELECT id, name, enabled, key FROM feature;
DROP TABLE event;
ALTER TABLE featureTemp RENAME TO feature;
