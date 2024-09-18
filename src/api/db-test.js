const express = require('express');
const router = express.Router();
const { dbQuery } = require('../utils/dbProxy');

router.get('/', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT 1 as test');
    res.json({ status: 'success', message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

module.exports = router;