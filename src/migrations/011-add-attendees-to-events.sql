
-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE event ADD COLUMN location TEXT;
ALTER TABLE event ADD COLUMN attendees JSON;


-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

CREATE TABLE eventTemp AS SELECT id, title, description, startAt, endAt, allDay, calendarKey, createdAt, key FROM event;
DROP TABLE event;
ALTER TABLE eventTemp RENAME TO event;
