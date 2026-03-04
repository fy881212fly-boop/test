const express = require('express');

function createRouter(db) {
  const router = express.Router();

  // List all recipes
  router.get('/recipes', (req, res) => {
    const recipes = db.prepare('SELECT * FROM recipes').all();
    res.render('index', { recipes });
  });

  // Show form to create a new recipe
  router.get('/recipes/new', (req, res) => {
    res.render('new');
  });

  // Create a new recipe
  router.post('/recipes', (req, res) => {
    const { title, ingredients, instructions } = req.body;
    const stmt = db.prepare(
      'INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)'
    );
    const result = stmt.run(title, ingredients, instructions);
    res.redirect('/recipes/' + result.lastInsertRowid);
  });

  // Show a single recipe
  router.get('/recipes/:id', (req, res) => {
    const recipe = db
      .prepare('SELECT * FROM recipes WHERE id = ?')
      .get(req.params.id);
    if (!recipe) {
      return res.status(404).render('404', { message: 'Recipe not found' });
    }
    res.render('show', { recipe });
  });

  // Delete a recipe
  router.delete('/recipes/:id', (req, res) => {
    const result = db
      .prepare('DELETE FROM recipes WHERE id = ?')
      .run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted' });
  });

  return router;
}

module.exports = { createRouter };
