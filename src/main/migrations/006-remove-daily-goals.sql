
-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------


DELETE from feature WHERE key = 'b48f0b19-9a28-4275-a6a8-f92a0cec9e5f';

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

INSERT INTO feature (name, enabled, key) VALUES ('dailyGoals', 0, 'b48f0b19-9a28-4275-a6a8-f92a0cec9e5f');