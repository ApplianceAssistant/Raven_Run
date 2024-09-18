const express = require('express');
const router = express.Router();
const { dbQuery } = require('../utils/dbProxy');

// GET a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT id, username, email FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE a user
router.put('/:id', async (req, res) => {
  try {
    const { username, email } = req.body;
    const db = await getDbConnection();
    const [result] = await db.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, req.params.id]
    );
    await db.release();
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ id: req.params.id, username, email });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await db.release();
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = await getDbConnection();
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    await db.end();
    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;