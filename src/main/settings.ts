import Store from 'electron-store';
const settingsSchema = {
  overrideDatabaseDirectory: {
    type: 'string',
  },
  cloudSync: {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      url: { type: 'string' },
    },
  },
};

export const store = new Store({
  name: 'settings',
  schema: settingsSchema,
  migrations: {
    '0.0.1': (store) => {
      store.set('overrideDatabaseDirectory', '');
      store.set('cloudSync', {
        enabled: 'true',
        url: 'http://localhost:8089',
      });
    },
  },
});
