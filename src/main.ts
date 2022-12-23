import { loadFiles } from '@graphql-tools/load-files';
import { ApolloServer } from 'apollo-server';
import path from 'path';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import { GRAPHQL_PORT } from '../consts';
import AppDatabase from './database';
import resolvers from './resolvers';
import pino from 'pino'
const log = pino({
  transport: {
    target: 'pino-pretty'
  },
})


const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
log.info(`Running in ${isDev ? 'development' : 'production'}`);

let server: ApolloServer;
let apolloDb: AppDatabase;

const determineDatabasePath = (): string => {
  // TODO: Work out where to put this in nodejs
  return './finish_em.db'
};

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: determineDatabasePath(),
  },
  useNullAsDefault: true,
};

apolloDb = new AppDatabase(knexConfig);


/* Use Apollo Server */
const startApolloServer = async () => {
  const schemasPath = path.join(__dirname, './schemas/')


  log.info(`Loading schemas from: ${schemasPath}`);
  try {
    const typeDefs = await loadFiles(`${schemasPath}*.graphql`);
    server = new ApolloServer({
      typeDefs,
      resolvers,
      dataSources: () => ({ apolloDb }),
    });

    try {
      const { url } = await server.listen(GRAPHQL_PORT);
      if (url) {
        log.info(`🚀 Server ready at ${url}`);
      }
    } catch (err) {
      log.error(`😢 Server startup failed listening: ${err}`);
      return
    }
  } catch (err) {
    log.error(`😢 Server startup failed: ${err}`);
  }
};

const runMigrations = async () => {
  const databasePath = determineDatabasePath();
  log.info(`Loading database at: ${databasePath}`);

  const db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys=on');
  const migrationsPath =     path.join(__dirname, './migrations')

  log.info(`Loading migrations at: ${migrationsPath}`);
  try {
    await db.migrate({
      migrationsPath,
    });
  } catch (e) {
    log.error({ error: e }, 'Failed to migrate');
  }

  log.info('Migrations complete');
  return;
};


const startApp = async () => {
  await runMigrations();

  await startApolloServer();


};

startApp();
