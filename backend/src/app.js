const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const { jwtStrategy } = require('./config/passport');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const app = express();
app.disable('etag');

// set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// enable CORS for the web app and API
app.use(cors({ origin: true, optionsSuccessStatus: 200, credentials: true }));
app.options('*', cors({ origin: true, optionsSuccessStatus: 200, credentials: true }));

// parse request bodies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());
app.use(compression());

// health check for Railway and uptime monitoring
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'vexa-api' }));

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// API responses must not be cached: clients need fresh friend lists and messages.
app.use('/api/v1', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API routes
app.use('/api/v1', routes);

// Dedicated owner control panel; its API is independently protected server-side.
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Serve the Persian web app from the same Railway service
app.use(express.static(path.join(__dirname, '../public'), { index: 'index.html' }));

// send back a 404 error for unknown routes
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert errors to ApiError
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
