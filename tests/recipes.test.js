const request = require('supertest');
const Database = require('better-sqlite3');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');

function createTestDb() {
  // Use an in-memory SQLite database for tests
  return createDb(':memory:');
}

describe('Recipe API', () => {
  let app;
  let db;

  beforeEach(() => {
    db = createTestDb();
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('GET /recipes', () => {
    it('returns 200 and lists recipes', async () => {
      const res = await request(app).get('/recipes');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /recipes', () => {
    it('creates a new recipe and redirects to it', async () => {
      const res = await request(app)
        .post('/recipes')
        .send('title=Pasta&ingredients=Noodles%2C+sauce&instructions=Boil+and+serve')
        .set('Content-Type', 'application/x-www-form-urlencoded');
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/\/recipes\/\d+/);
    });
  });

  describe('GET /recipes/:id', () => {
    it('returns 200 for an existing recipe', async () => {
      const stmt = db.prepare(
        'INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Test Recipe', 'Flour', 'Mix and bake');
      const res = await request(app).get('/recipes/' + result.lastInsertRowid);
      expect(res.status).toBe(200);
    });

    it('returns 404 for a non-existent recipe', async () => {
      const res = await request(app).get('/recipes/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /recipes/:id', () => {
    it('deletes a recipe and returns 200', async () => {
      const stmt = db.prepare(
        'INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)'
      );
      const result = stmt.run('To Delete', 'Ingredient', 'Step 1');
      const id = result.lastInsertRowid;

      const res = await request(app).delete('/recipes/' + id);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Recipe deleted');
    });

    it('returns 404 when deleting a non-existent recipe', async () => {
      const res = await request(app).delete('/recipes/9999');
      expect(res.status).toBe(404);
    });

    it('returns 404 when fetching a deleted recipe', async () => {
      const stmt = db.prepare(
        'INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)'
      );
      const result = stmt.run('Will Be Deleted', 'Something', 'Do it');
      const id = result.lastInsertRowid;

      // Delete the recipe
      await request(app).delete('/recipes/' + id);

      // Now fetching it should return 404
      const res = await request(app).get('/recipes/' + id);
      expect(res.status).toBe(404);
    });
  });
});
