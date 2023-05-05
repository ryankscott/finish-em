import Store from 'electron-store';

const settingsSchema = {
  overrideDatabaseDirectory: {
    type: 'string',
  },
};

export const store = new Store({
  name: 'settings',
  schema: settingsSchema,
  migrations: {
    '0.0.1': (store) => {
      store.set('overrideDatabaseDirectory', '');
    },
  },
});
