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
  name TEXT,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  enabled BOOLEAN,
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
  startAt TEXT,
  endAt TEXT,
  description TEXT,
  allDay BOOLEAN,
  calendarKey TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(calendarKey) REFERENCES calendar(key) ON DELETE CASCADE
);

CREATE TABLE area (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
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
  name TEXT,
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


CREATE TABLE item(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT, 
  text TEXT,
  deleted BOOLEAN,
  completed BOOLEAN,
  parentKey TEXT, 
  projectKey TEXT, 
  dueDate TEXT,
  scheduledDate TEXT,
  lastUpdatedAt TEXT,
  completedAt TEXT,
  createdAt TEXT,
  deletedAt TEXT,
  repeat TEXT,
  labelKey TEXT, 
  areaKey TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(parentKey) REFERENCES item(key) ON DELETE CASCADE,
  FOREIGN KEY(projectKey) REFERENCES project(key) ON DELETE CASCADE,
  FOREIGN KEY(areaKey) REFERENCES area(key) ON DELETE CASCADE,
  FOREIGN KEY(labelKey) REFERENCES label(key) ON DELETE SET NULL
);


-- INSERTS
INSERT INTO label (key, name, colour)
VALUES
    ('4702c2d3-bcda-40a2-bd34-e0db07578076', 'Blocked', '#fe5e41'),
    ('5bd4d5ce-447f-45d5-a557-c8942bbfbae4', 'High Priority', '#f9df77'),
    ('a342c159-9691-4684-a109-156ba46c1ea4', 'Pending', '#59cd90');

INSERT INTO feature (key, name, enabled) 
VALUES
    ('d6831b6f-6d48-4c1c-981b-5dd2816ce8c4', 'dragAndDrop', false ),
    ('debd2eec-1486-4a3b-8030-e22387a63feb', 'projectDates', false ),
    ('6e468413-d926-416e-a616-67cf1e4ee065', 'calendarIntegration', false ),
    ('b48f0b19-9a28-4275-a6a8-f92a0cec9e5f', 'dailyGoals', false );

INSERT INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt) 
VALUES
('0', 'Other', false, 'Default landing space for projects', '1970-01-01 00:00:00', null, '1970-01-01 00:00:00'),
('1', 'Work', false, 'Default landing space for projects', '1970-01-01 00:00:00', null, '1970-01-01 00:00:00');

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


-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------
DROP TABLE label;
DROP TABLE calendar;
DROP TABLE feature;
DROP TABLE reminder;
DROP TABLE event;
DROP TABLE area;
DROP TABLE areaOrder;
DROP TABLE project;
DROP TABLE projectOrder;
DROP TABLE item;

