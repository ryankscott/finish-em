-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

UPDATE component
SET parameters = json_set(parameters, "$.legacyFilter", json_extract(parameters, "$.filter"))
WHERE type = 'FilteredItemList';

UPDATE component
SET parameters = json_set(parameters, "$.filter", "")
WHERE type = 'FilteredItemList';

-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

UPDATE component
SET parameters = json_set(parameters, "$.filter", json_extract(parameters, "$.legacyFilter"))
WHERE type = 'FilteredItemList';

UPDATE component
SET parameters = json_set(parameters, "$.legacyFilter", "")
WHERE type = 'FilteredItemList';
