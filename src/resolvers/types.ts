import { AppDatabase, UserDatabase } from "../database";

export type Context = {
  dataSources: {
    appDb: AppDatabase;
    userDb: UserDatabase;
  };
};
