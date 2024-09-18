const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');
console.warn("getDbConnection: ", getDbConnection);
router.get('/', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.release(); // Release the connection back to the pool
    res.json({ status: 'success', message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('database connection test failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

module.exports = router;