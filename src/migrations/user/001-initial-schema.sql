-- --------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  createdAt TEXT,
  deletedAt TEXT,
  deleted BOOLEAN,
  key TEXT NOT NULL UNIQUE
);




-- --------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE user;
