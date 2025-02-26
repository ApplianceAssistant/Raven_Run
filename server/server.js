const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const winston = require('winston');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
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

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/* Debug middleware for CORS
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
}); */

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

// Get PHP server target from environment
const phpTarget = process.env.REACT_APP_URL;

logger.info({
  message: 'PHP proxy configuration',
  environment: process.env.NODE_ENV || 'development',
  phpTarget,
  timestamp: new Date().toISOString()
});

// Proxy PHP requests to Apache/PHP server
app.use(['*.php', '/server/**/*.php'], createProxyMiddleware({
  target: phpTarget,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: path => {
    // Log the path being processed
    logger.info({
      message: 'Processing PHP path',
      originalPath: path,
      environment: process.env.NODE_ENV || 'development',
      phpTarget,
      timestamp: new Date().toISOString()
    });
    return path;
  },
  onProxyReq: (proxyReq, req, res) => {
    // Detailed proxy request logging
    logger.info({
      message: 'PHP Proxy Request Details',
      stage: 'start',
      originalUrl: req.url,
      targetUrl: proxyReq.path,
      method: req.method,
      headers: req.headers,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Set PHP environment variables
    proxyReq.setHeader('X-Environment', process.env.NODE_ENV || 'development');
    proxyReq.setHeader('X-Base-URL', req.protocol + '://' + req.get('host'));
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log proxy response
    logger.info({
      message: 'PHP Proxy Response Details',
      stage: 'response',
      originalUrl: req.url,
      statusCode: proxyRes.statusCode,
      headers: proxyRes.headers,
      timestamp: new Date().toISOString()
    });
  },
  onError: (err, req, res) => {
    // Enhanced error logging
    logger.error({
      message: 'PHP Proxy Error Details',
      stage: 'error',
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
      },
      request: {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req.query
      },
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'PHP server error', details: err.message });
  }
}));


// Add catch-all logging middleware before the static files
app.use((req, res, next) => {
  logger.info({
    message: 'Incoming Request',
    stage: 'pre-static',
    url: req.url,
    method: req.method,
    headers: req.headers,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Catch-all route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
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