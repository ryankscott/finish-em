-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- Projects
WITH sortedProjectOrders as (
SELECT
 projectKey,
 ROW_NUMBER() OVER (ORDER BY sortOrder) - 1 as newOrder
 FROM projectOrder
)
UPDATE projectOrder
SET sortOrder = (SELECT newOrder
                  FROM sortedProjectOrders
                  WHERE projectKey = projectOrder.projectKey);


-- Components
WITH sortedComponentOrders as (
SELECT
 componentKey,
 ROW_NUMBER() OVER (ORDER BY sortOrder) - 1 as newOrder
 FROM componentOrder
)
UPDATE componentOrder
SET sortOrder = (SELECT newOrder
                  FROM sortedComponentOrders
                  WHERE componentKey = componentOrder.componentKey);


-- Views
WITH sortedViewOrders as (
SELECT
 viewKey,
 ROW_NUMBER() OVER (ORDER BY sortOrder) - 1 as newOrder
 FROM viewOrder
)
UPDATE viewOrder
SET sortOrder = (SELECT newOrder
                  FROM sortedViewOrders
                  WHERE viewKey = viewOrder.viewKey);

-- Areas
WITH sortedAreaOrders as (
SELECT
 areaKey,
 ROW_NUMBER() OVER (ORDER BY sortOrder) - 1 as newOrder
 FROM areaOrder
)
UPDATE areaOrder
SET sortOrder = (SELECT newOrder
                  FROM sortedAreaOrders
                  WHERE areaKey = areaOrder.areaKey);

-- Items
WITH sortedItemOrders as (
SELECT
 itemKey,
 componentKey,
 ROW_NUMBER() OVER (PARTITION BY componentKey ORDER BY sortOrder) - 1 as newOrder
 FROM itemOrder
)
UPDATE itemOrder
SET sortOrder = (SELECT newOrder
                  FROM sortedItemOrders
                  WHERE itemKey = itemOrder.itemKey AND componentKey = itemOrder.componentKey);

-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
