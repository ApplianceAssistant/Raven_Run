const express = require('express');
const cors = require('cors')
const path = require('path');
const userRoutes = require('./api/users');
const dbTestRoute = require('./api/db-test');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://crowtours.com'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

// Logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/db-test', dbTestRoute);  // Changed from '/db-test.js' to '/api/db-test'

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});