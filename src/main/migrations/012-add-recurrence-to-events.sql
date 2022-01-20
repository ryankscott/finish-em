-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE event ADD COLUMN recurrence TEXT;



-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

CREATE TABLE eventTemp AS SELECT id, title, description, startAt, endAt, allDay, calendarKey, createdAt, location, attendees, key FROM event;
DROP TABLE event;
ALTER TABLE eventTemp RENAME TO event;
