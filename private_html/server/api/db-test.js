const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db_connection');

router.get('/', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release();
    res.json({ status: 'success', message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

module.exports = router;