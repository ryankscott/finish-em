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
  itemId INTEGER,
  lastUpdatedAt TEXT,
  deletedAt TEXT,
  createdAt TEXT,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(itemId) REFERENCES item(id) ON DELETE CASCADE
);

CREATE TABLE event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  start TEXT,
  end TEXT,
  description TEXT,
  allDay BOOLEAN,
  calendarId INTEGER,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(calendarId) REFERENCES calendar(id) ON DELETE CASCADE
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
  areaId INTEGER,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(areaId) REFERENCES area(id) ON DELETE CASCADE
);


CREATE TABLE item(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT, 
  text TEXT,
  deleted BOOLEAN,
  completed BOOLEAN,
  parentId INTEGER, 
  projectId INTEGER, 
  dueDate TEXT,
  scheduledDate TEXT,
  lastUpdatedAt TEXT,
  completedAt TEXT,
  createdAt TEXT,
  deletedAt TEXT,
  repeat TEXT,
  labelId INTEGER, 
  areaId INTEGER,
  key TEXT NOT NULL UNIQUE,
  FOREIGN KEY(parentId) REFERENCES item(id) ON DELETE CASCADE,
  FOREIGN KEY(projectId) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY(areaId) REFERENCES area(id) ON DELETE CASCADE,
  FOREIGN KEY(labelId) REFERENCES label(id) ON DELETE SET NULL
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



-- --------------------------------------------------------------------------------
-- Down 
--------------------------------------------------------------------------------
DROP TABLE label;
DROP TABLE calendar;
DROP TABLE feature;
DROP TABLE reminder;
DROP TABLE event;
DROP TABLE area;
DROP TABLE project;
DROP TABLE item;


