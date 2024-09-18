const express = require('express');
const cors = require('cors')
const path = require('path');
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
  app.use(express.static(path.join(__dirname, '..', '..', 'public_html')));
}

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/db-test', dbTestRoute);

// Catch-all handler for React app (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public_html', 'index.html'));
  });
}

// Enhanced database test route
app.get('/api/db-test', async (req, res) => {
  console.log('Received request for /api/db-test');
  try {
    console.log('Attempting to get database connection...');
    const connection = await getDbConnection();
    console.log('Database connection established');

    console.log('Executing test query...');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Query executed successfully:', rows);

    connection.release();
    res.json({ status: 'success', message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.toString() });
  }
});

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