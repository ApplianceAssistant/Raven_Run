const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const winston = require('winston');
const { getDbConnection } = require('./db_connection');
const userRoutes = require('../api/users');
const dbTestRoute = require('../api/db-test');

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';
process.env.APP_ENV = ENV;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// CORS configuration for development
const corsOptions = {
  origin: ENV === 'development' 
    ? 'http://localhost:5000'  // Development
    : [process.env.PRODUCTION_URL, process.env.STAGING_URL], // Production/Staging
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Handle manifest.json
app.get('/src/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'manifest.json'));
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/db-test', dbTestRoute);

// Special handling for PHP endpoints
app.all('/api/*.php', (req, res) => {
  // Log the PHP request
  logger.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Instead of redirecting to production, serve the local PHP file
  const phpFile = path.join(__dirname, '..', req.path);
  logger.info(`Attempting to serve PHP file: ${phpFile}`);
  
  // Here we'll need to execute the PHP file
  // For now, let's respond with a message about the configuration needed
  res.status(500).json({
    error: 'PHP endpoint configuration required',
    message: 'To handle PHP files, you need to:',
    steps: [
      '1. Configure PHP in your development environment',
      '2. Set up PHP-FPM or similar to handle PHP requests',
      '3. Use a reverse proxy to forward PHP requests to your PHP handler'
    ]
  });
});

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    error: {
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    },
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${ENV} mode on port ${PORT}`);
});