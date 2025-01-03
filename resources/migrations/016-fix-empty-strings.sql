-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

UPDATE item
SET dueAt = null
WHERE dueAt = '';

UPDATE item
SET scheduledAt = null
WHERE scheduledAt = '';

UPDATE item
SET lastUpdatedAt = null
WHERE lastUpdatedAt = '';

UPDATE item
SET completedAt = null
WHERE completedAt = '';

UPDATE item
SET createdAt = null
WHERE createdAt = '';

UPDATE item
SET createdAt = null
WHERE createdAt = '';

UPDATE item
SET deletedAt = null
WHERE deletedAt = '';

UPDATE item
SET parentKey = null
WHERE parentKey = '';

UPDATE item
SET projectKey = null
WHERE projectKey = '';

UPDATE item
SET repeat = null
WHERE repeat = '';

UPDATE item
SET labelKey = null
WHERE labelKey = '';

UPDATE item
SET areaKey = null
WHERE areaKey = '';


-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
