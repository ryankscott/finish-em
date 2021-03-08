-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

INSERT INTO view (name, icon, type, deleted, createdAt, key) 
SELECT a.name, '', 'area', false, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), a.key 
FROM area a
INNER JOIN view v on a.key = v.key
WHERE v.key IS NULL;

INSERT INTO viewOrder (viewKey, sortOrder) 
SELECT key, 
        (SELECT COALESCE(MAX(sortOrder),0) from viewOrder) + ROW_NUMBER() OVER(ORDER BY vo.sortOrder) 
FROM view v
LEFT JOIN viewOrder vo
ON v.key = vo.viewKey 
WHERE vo.viewKey IS NULL; 

INSERT INTO areaOrder (areaKey, sortOrder) 
SELECT key, 
        (SELECT COALESCE(MAX(sortOrder),0) from areaOrder) + ROW_NUMBER() OVER(ORDER BY ao.sortOrder) 
FROM area a
LEFT JOIN areaOrder ao
ON a.key = ao.areaKey 
WHERE ao.areaKey IS NULL; 

-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------

DELETE from view WHERE key IN (SELECT key from area)
DELETE from viewOrder WHERE viewKey IN (SELECT key from area)
