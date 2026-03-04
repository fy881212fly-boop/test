const Database = require('better-sqlite3');
const path = require('path');

function createDb(dbPath) {
  const db = new Database(dbPath || path.join(__dirname, '..', 'recipes.db'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL
    )
  `);
  return db;
}

module.exports = { createDb };
