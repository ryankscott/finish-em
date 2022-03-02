
-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

UPDATE view SET name = (SELECT name from project WHERE key = view.key )
WHERE EXISTS (SELECT name FROM project WHERE key = view.key);

DELETE from feature WHERE key = 'd6831b6f-6d48-4c1c-981b-5dd2816ce8c4';

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

INSERT INTO feature (name, enabled, key) VALUES ('dragAndDrop', 0, 'd6831b6f-6d48-4c1c-981b-5dd2816ce8c4');
