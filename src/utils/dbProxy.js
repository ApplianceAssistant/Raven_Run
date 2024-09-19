const axios = require('axios');

export async function dbQuery(query, params) {
  const response = await axios.post('/api/db-query', { query, params });
  return response.data;
}