const axios = require('axios');

async function dbQuery(query, params) {
  try {
    const response = await axios.post('/api/db-query', { query, params });
    return response.data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { dbQuery };