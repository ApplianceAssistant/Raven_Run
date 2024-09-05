const mysql = require('mysql2/promise');
const dbConfig = require('../../private_html/db_config');

async function getDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Unable to connect to the database');
  }
}

module.exports = { getDbConnection };