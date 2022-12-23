-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE item ADD COLUMN snoozedUntil TEXT;
INSERT INTO `view` (key, name, icon, type) VALUES
('be5dc7b5-e82a-4bc4-9da3-7fdf160f77f5', 'Snoozed', 'snooze', 'custom');

INSERT INTO viewOrder (viewKey, sortOrder)
VALUES
('be5dc7b5-e82a-4bc4-9da3-7fdf160f77f5', (SELECT MAX(sortOrder) + 1 FROM viewOrder));

-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------


