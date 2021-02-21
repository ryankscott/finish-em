-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE label (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  colour TEXT,
  key TEXT NOT NULL UNIQUE
);


CREATE TABLE calendar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN,
  deleted BOOLEAN,
  lastUpdatedAt TEXT,
  deletedAt TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  enabled BOOLEAN,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE weeklyGoal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week TEXT,
  goal TEXT,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE reminder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT,
  deleted BOOLEAN,
  remindAt TEXT,
  itemKey TEXT,
  lastUpdatedAt TEXT,
  deletedAt TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(itemKey) REFERENCES item(key) ON DELETE CASCADE
);

CREATE TABLE event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  startAt TEXT,
  endAt TEXT,
  allDay BOOLEAN,
  calendarKey TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(calendarKey) REFERENCES calendar(key) ON DELETE CASCADE
);

CREATE TABLE area (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  deleted BOOLEAN,
  description TEXT,
  lastUpdatedAt TEXT,
  deletedAt TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE
);


CREATE TABLE areaOrder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  areaKey TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL,
  FOREIGN KEY(areaKey) REFERENCES area(key) ON DELETE CASCADE
);


CREATE TABLE project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  deleted BOOLEAN,
  description TEXT,
  lastUpdatedAt TEXT,
  deletedAt TEXT,
  createdAt TEXT,
  startAt TEXT,
  endAt TEXT,
  areaKey TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(areaKey) REFERENCES area(key) ON DELETE CASCADE
);

CREATE TABLE projectOrder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectKey TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL,
  FOREIGN KEY(projectKey) REFERENCES project(key) ON DELETE CASCADE
);


CREATE TABLE item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT, 
  text TEXT,
  deleted BOOLEAN,
  completed BOOLEAN,
  parentKey TEXT, 
  projectKey TEXT, 
  dueAt TEXT,
  scheduledAt TEXT,
  lastUpdatedAt TEXT,
  completedAt TEXT,
  createdAt TEXT,
  deletedAt TEXT,
  repeat TEXT,
  labelKey TEXT, 
  areaKey TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(projectKey) REFERENCES project(key) ON DELETE CASCADE,
  FOREIGN KEY(areaKey) REFERENCES area(key) ON DELETE CASCADE,
  FOREIGN KEY(labelKey) REFERENCES label(key) ON DELETE SET NULL
);

CREATE TABLE itemOrder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemKey TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL,
  FOREIGN KEY(itemKey) REFERENCES item(key) ON DELETE CASCADE
);

CREATE TABLE view (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  icon TEXT,
  type TEXT,
  deleted BOOLEAN,
  deletedAt TEXT,
  lastUpdatedAt TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE viewOrder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  viewKey TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL,
  FOREIGN KEY(viewKey) REFERENCES view(key) ON DELETE CASCADE
);

CREATE TABLE component (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  viewKey TEXT,
  location TEXT,
  type TEXT,
  parameters JSON,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(viewKey) REFERENCES view(key) ON DELETE CASCADE
);

CREATE TABLE componentOrder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  componentKey TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL,
  FOREIGN KEY(componentKey) REFERENCES component(key) ON DELETE CASCADE
);


-- INSERTS
INSERT INTO label (key, name, colour)
VALUES
    ('4702c2d3-bcda-40a2-bd34-e0db07578076', 'Blocked', '#FF0080'),
    ('5bd4d5ce-447f-45d5-a557-c8942bbfbae4', 'High Priority', '#EFB343'),
    ('a342c159-9691-4684-a109-156ba46c1ea4', 'Pending', '#43EFB3');

INSERT INTO feature (key, name, enabled) 
VALUES
    ('d6831b6f-6d48-4c1c-981b-5dd2816ce8c4', 'dragAndDrop', false ),
    ('debd2eec-1486-4a3b-8030-e22387a63feb', 'projectDates', false ),
    ('6e468413-d926-416e-a616-67cf1e4ee065', 'calendarIntegration', false ),
    ('b48f0b19-9a28-4275-a6a8-f92a0cec9e5f', 'dailyGoals', false );

INSERT INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt) 
VALUES
('0', 'Other', false, 'Default landing space for projects', null, null, null),
('1', 'Work', false, 'Default landing space for projects', null, null, null);

INSERT INTO areaOrder (areaKey, sortOrder) 
VALUES
('0', 0), 
('1', 1);

INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey)
VALUES
('0', 'Inbox', false, 'Default landing space for all items', '1970-01-01 00:00:00', null, '1970-01-01 00:00:00', null, null, '0');

INSERT INTO projectOrder (projectKey, sortOrder) 
VALUES
('0', 0); 

INSERT INTO `view` (key, name, icon, type) VALUES
('186943b1-b15e-4a24-93d0-2e37eb9af103', 'Unscheduled', 'due', 'custom'),
('4514f106-896f-4f39-9227-ad9c99ebd468', 'Trash', 'trash', 'custom'),
('ec9600f5-462b-4d9b-a1ca-db3a88473400', 'Completed', 'todoChecked', 'custom'),
('0524ccae-1005-4b75-80ca-f04691ad6431', 'Stale', 'stale', 'custom'),
('0', 'Inbox', 'inbox', 'default'),
('ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134', 'Daily Agenda', 'calendar', 'default'),
('6c40814f-8fad-40dc-9a96-0454149a9408', 'Weekly Agenda', 'weekly', 'default'),
('a6770550-ecc5-48a3-89eb-6b6a6aaea05d', 'Labels', 'label', 'custom');

INSERT INTO viewOrder (viewKey, sortOrder) 
VALUES
('186943b1-b15e-4a24-93d0-2e37eb9af103', 0),
('4514f106-896f-4f39-9227-ad9c99ebd468', 1), 
('ec9600f5-462b-4d9b-a1ca-db3a88473400', 2),
('0524ccae-1005-4b75-80ca-f04691ad6431', 3), 
('0', 4), 
('ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134', 5),
('6c40814f-8fad-40dc-9a96-0454149a9408', 6),
('a6770550-ecc5-48a3-89eb-6b6a6aaea05d', 7); 


-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------
DROP TABLE label;
DROP TABLE calendar;
DROP TABLE feature;
DROP TABLE weeklyGoal;
DROP TABLE reminder;
DROP TABLE event;
DROP TABLE area;
DROP TABLE areaOrder;
DROP TABLE project;
DROP TABLE projectOrder;
DROP TABLE item;
DROP TABLE itemOrder;
DROP TABLE view;
DROP TABLE viewOrder;
DROP TABLE component;
DROP TABLE componentOrder;

