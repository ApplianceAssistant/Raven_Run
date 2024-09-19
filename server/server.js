const express = require('express');
const cors = require('cors')
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const { getDbConnection } = require('./db_connection');
const userRoutes = require('./api/users');
const dbTestRoute = require('./api/db-test');

const app = express();
const PORT = process.env.PORT || 5000; 

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://crowtours.com']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..')));
}

// API routes with logging
app.use('/api', (req, res, next) => {
  console.log('API request:', req.path);
  next();
});
app.use('/api/users', userRoutes);
app.use('/api/db-test', dbTestRoute);

// Enhanced logging middleware for all routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// New route for database queries
app.post('/api/db-query', async (req, res) => {
  const { query, params } = req.body;
  try {
    const connection = await getDbConnection();
    const [results] = await connection.execute(query, params);
    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all handler for React app (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.toString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});