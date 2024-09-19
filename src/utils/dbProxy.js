const axios = require('axios');

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://crowtours.com/api' 
  : 'http://localhost:5000/api';

async function dbQuery(query, params) {
  try {
    const response = await axios.post(`${API_URL}/db-query`, { query, params });
    return response.data;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { dbQuery };