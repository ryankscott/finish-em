import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { loadFiles } from "@graphql-tools/load-files";
import { GraphQLError } from "graphql";
import * as sqlite from "sqlite";
import * as sqlite3 from "sqlite3";
import { GRAPHQL_PORT, SECRET, USER_GQL_OPERATIONS } from "../consts";
import { AppDatabase, UserDatabase } from "./database/index";
import resolvers from "./resolvers";
const logger = require("./logger");
var bodyParser = require("body-parser");
var cors = require("cors");
var http = require("http");
import express = require("express");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
import path = require("path");

const isDev =
  process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";
logger.log({
  level: "debug",
  message: `Running in ${isDev ? "development" : "production"}`,
});

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
const app = express();

app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

const httpServer = http.createServer(app);
appDb = new AppDatabase(appDbConfig);
userDb = new UserDatabase(userDbConfig);

/* Use Apollo Server */
const startApolloServer = async () => {
  const schemasPath = path.join(__dirname, "./schemas/");

  logger.info(`Loading schemas from: ${schemasPath}`);
  try {
    const typeDefs = await loadFiles(`${schemasPath}*.graphql`);
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();

    app.post("/upload", async (req, res) => {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
      }

      const { key } = req.body;
      const backupFile = req.files.file;
      const uploadPath = path.join(__dirname, `../databases/${key}.db`);

      if (Array.isArray(backupFile)) {
        logger.error("Multiple files sent for backup");
        return res.status(400).send("Bad request - multiple files uploaded");
      }

      try {
        await backupFile.mv(uploadPath);
        logger.info(`Successfully moved backup with key - ${key}`);
        return res.status(200).send("OK");
      } catch (err) {
        logger.error(`Failed to move file - ${err}`);
        return res.status(500).send("Internal server error");
      }
    });

    app.use(
      "/",
      cors(),
      bodyParser.json({ limit: "50mb" }),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const dataSources = {
            userDb,
            appDb,
          };
          //@ts-ignore
          const operationName = req?.body?.operationName;
          if (USER_GQL_OPERATIONS.includes(operationName)) {
            return { dataSources };
          }
          const token = req.headers.authorization || "";

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
              logger.error(`Failed to create database - ${e}`);
              throw new GraphQLError("Failed to create database for user");
            }

            return { user, dataSources: { userDb, appDb } };
          }
          throw new GraphQLError("You must be logged in to query this schema");
        },
      })
    );

    await new Promise<void>((resolve) =>
      httpServer.listen({ port: GRAPHQL_PORT }, resolve)
    );
    logger.info(`🚀 Server ready at http://localhost:${GRAPHQL_PORT}/`);
  } catch (err) {
    logger.error(`😢 Server startup failed listening: ${err}`);
    return;
  }
};

const runUserMigrations = async (dbPath: string) => {
  logger.info(`Loading database at: ${dbPath}`);

  const userDb = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await userDb.run("PRAGMA foreign_keys=on");
  const userMigrationsPath = path.join(__dirname, "./migrations/user");

  logger.info(`Loading migrations at: ${userMigrationsPath}`);
  try {
    await userDb.migrate({
      migrationsPath: userMigrationsPath,
    });
  } catch (e) {
    logger.error(`Failed to migrate - ${e.message}`);
  }
};

export const runAppMigrations = async (dbPath: string) => {
  logger.info(`Loading database at: ${dbPath}`);

  const appDb = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await appDb.run("PRAGMA foreign_keys=on");
  const appMigrationsPath = path.join(__dirname, "./migrations");

  logger.info(`Loading migrations at: ${appMigrationsPath}`);
  try {
    await appDb.migrate({
      migrationsPath: appMigrationsPath,
    });
  } catch (e) {
    logger.error(`Failed to migrate - ${e.message}`);
  }

  logger.info("App migrations complete");
};

const startApp = async () => {
  await runUserMigrations(determineUserDatabasePath());

  await startApolloServer();
};

startApp();
