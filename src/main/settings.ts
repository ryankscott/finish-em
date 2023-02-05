import Store, { Schema } from 'electron-store';

export interface StoreSchema {
  overrideDatabaseDirectory: string;
  cloudSync: {
    enabled: boolean;
    email: string;
    token: string;
  };
}
const settingsSchema: Schema<StoreSchema> = {
  overrideDatabaseDirectory: {
    type: 'string',
  },
  cloudSync: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      email: { type: 'string' },
      token: { type: 'string' },
    },
  },
};

export const store = new Store({
  name: 'settings',
  schema: settingsSchema,
  migrations: {
    '0.0.1': (store) => {
      store.set('overrideDatabaseDirectory', '');
    },
    '0.8.18': (store) => {
      store.set('cloudSync', {
        enabled: false,
        email: '',
        token: '',
      });
    },
  },
});
