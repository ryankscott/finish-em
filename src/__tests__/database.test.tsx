import path from 'path';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import fs from 'fs';
import AppDatabase from '../main/database';

const testKnexConfig = {
  client: 'sqlite3',
  connection: {
    filename: './test.db',
    useNullAsDefault: true,
    debug: true,
  },
};

const testDb = new AppDatabase(testKnexConfig);

beforeAll(async () => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

  const migrationDB = await sqlite.open({
    filename: './test.db',
    driver: sqlite3.Database,
  });
  await migrationDB.run('PRAGMA foreign_keys=on');
  const migrationsPath = path.join(__dirname, '../../src/main/migrations');

  await migrationDB.migrate({
    migrationsPath,
  });
});

afterAll(async () => {
  fs.unlink('./test.db', (err) => {
    if (err) throw err;
  });
});

describe('Views', () => {
  it('should create a view', async () => {
    const expectedView = {
      id: 10,
      key: 'test',
      name: 'this is a test',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: null,
      deleted: 0,
      type: 'area',
      icon: 'cat',
    };
    const newView = await testDb.createView(
      'test',
      'this is a test',
      'cat',
      'area'
    );
    expect(newView).toEqual(expectedView);
  });
});
