import { loadFiles } from "@graphql-tools/load-files";
// import { exec } from "child_process";
import { ApolloServer } from "@apollo/server";
import path from "path";
import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";
import { GRAPHQL_PORT, SECRET } from "../consts";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDatabase } from "./database/index";
import { UserDatabase } from "./database/index";
import resolvers from "./resolvers";
import jwt from "jsonwebtoken";
import pino from "pino";
import { GraphQLError } from "graphql";
const log = pino({
  transport: {
    target: "pino-pretty",
  },
});

const isDev =
  process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";
log.info(`Running in ${isDev ? "development" : "production"}`);

let appDb: AppDatabase;
let userDb: UserDatabase;

const determineAppDatabasePath = (): string => {
  // TODO: Work out where to put this in nodejs
  return "./databases/finish_em.db";
};

const determineUserDatabasePath = (): string => {
  // TODO: Work out where to put this in nodejs
  return "./databases/user.db";
};

const appDbConfig = {
  client: "sqlite3",
  connection: {
    filename: determineAppDatabasePath(),
  },
  useNullAsDefault: true,
};

const userDbConfig = {
  client: "sqlite3",
  connection: {
    filename: determineUserDatabasePath(),
  },
  useNullAsDefault: true,
};

appDb = new AppDatabase(appDbConfig);
userDb = new UserDatabase(userDbConfig);

// interface AppContext {
//   user: { key: string; email: string };
// }

let server: ApolloServer;
/* Use Apollo Server */
const startApolloServer = async () => {
  const schemasPath = path.join(__dirname, "./schemas/");

  log.info(`Loading schemas from: ${schemasPath}`);
  try {
    const typeDefs = await loadFiles(`${schemasPath}*.graphql`);
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    try {
      const { url } = await startStandaloneServer(server, {
        listen: { port: GRAPHQL_PORT },
        context: async ({ req }) => {
          const dataSources = {
            userDb,
            appDb,
          };
          //@ts-ignore
          const operationName = req?.body?.operationName;
          if (operationName == "CreateUser" || operationName == "LoginUser") {
            return { dataSources };
          }
          const authHeader = req.headers.authorization || "";
          const token = authHeader.split(" ")[1];

          if (token) {
            if (Array.isArray(token)) {
              throw new GraphQLError("Invalid token");
            }
            // @ts-ignore
            const payload: {
              user: { key: string; email: string };
              iat: number;
              exp: number;
            } = jwt.verify(token, SECRET);
            if (!payload) {
              throw new GraphQLError(
                "You must be logged in to query this schema"
              );
            }
            // Use the users database for requests
            const { user } = payload;
            const appDbConfig = {
              client: "sqlite3",
              connection: {
                filename: `./databases/${user.key}.db`,
              },
              useNullAsDefault: true,
            };
            try {
              appDb = new AppDatabase(appDbConfig);
            } catch (e) {
              log.error(`Failed to create database - ${e}`);
              throw new GraphQLError("Failed to create database for user");
            }

            return { user, dataSources: { userDb, appDb } };
          }
          throw new GraphQLError("You must be logged in to query this schema");
        },
      });

      if (url) {
        log.info(`🚀 Server ready at ${url}`);
      }
    } catch (err) {
      log.error(`😢 Server startup failed listening: ${err}`);
      return;
    }
  } catch (err) {
    log.error(`😢 Server startup failed: ${err}`);
  }
};

const runUserMigrations = async (dbPath: string) => {
  log.info(`Loading database at: ${dbPath}`);

  const userDb = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await userDb.run("PRAGMA foreign_keys=on");
  const userMigrationsPath = path.join(__dirname, "./migrations/user");

  log.info(`Loading migrations at: ${userMigrationsPath}`);
  try {
    await userDb.migrate({
      migrationsPath: userMigrationsPath,
    });
  } catch (e) {
    log.error({ error: e }, "Failed to migrate");
  }
};

export const runAppMigrations = async (dbPath: string) => {
  log.info(`Loading database at: ${dbPath}`);

  const appDb = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await appDb.run("PRAGMA foreign_keys=on");
  const appMigrationsPath = path.join(__dirname, "./migrations");

  log.info(`Loading migrations at: ${appMigrationsPath}`);
  try {
    await appDb.migrate({
      migrationsPath: appMigrationsPath,
    });
  } catch (e) {
    log.error({ error: e }, "Failed to migrate");
  }

  log.info("App migrations complete");
};

// const backup = async () => {
//   const databasePath = determineAppDatabasePath();
//   exec(`sqlite3 ${databasePath} .dump`, (error, stdout, stderr) => {
//     if (error) {
//       console.log(stderr);
//       log.error(`Failed to dump - ${stderr}`);
//       return;
//     }
//     const dump = stdout;
//     console.log(dump.length);
//   });

//   log.info("Dump complete");
//   return;
// };

const startApp = async () => {
  // await backup();

  await runUserMigrations(determineUserDatabasePath());

  await startApolloServer();
};

startApp();
