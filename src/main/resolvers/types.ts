import AppDatabase from 'main/database';

export type Context = {
  dataSources: {
    apolloDb: AppDatabase;
  };
};
