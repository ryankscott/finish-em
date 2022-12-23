-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

UPDATE project SET startAt = null WHERE startAt = '';
UPDATE project SET endAt = null WHERE endAt = '';
UPDATE project SET deletedAt = null WHERE deletedAt = '';
UPDATE project SET createdAt = null WHERE createdAt = '';
UPDATE project SET lastUpdatedAt = null WHERE lastUpdatedAt = '';

-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------


