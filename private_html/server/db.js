const mysql = require('mysql2/promise');
const path = require('path');
const dbConfig = require('../db_config');

console.warn("dbConfig: ", dbConfig);
const pool = mysql.createPool(dbConfig);

async function getDbConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Unable to connect to the database');
  }
}

module.exports = { getDbConnection };