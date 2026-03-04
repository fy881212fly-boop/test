const express = require('express');
const path = require('path');
const { createDb } = require('./db');
const { createRouter } = require('./routes');

function createApp(db) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/', createRouter(db));

  // Redirect root to recipes list
  app.get('/', (req, res) => res.redirect('/recipes'));

  return app;
}

if (require.main === module) {
  const db = createDb();
  const app = createApp(db);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Recipe app running on port ${PORT}`));
}

module.exports = { createApp };
