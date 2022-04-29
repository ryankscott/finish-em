const { SQLDataSource } = require('datasource-sql');

const MINUTE = 60;

class AppDatabase extends SQLDataSource {
  getAreas() {
    return this.knex.select('*').from('area');
  }
}

module.exports = AppDatabase;
