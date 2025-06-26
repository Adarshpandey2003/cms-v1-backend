// backend/server.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const logger  = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const authRoutes        = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const documentRoutes    = require('./routes/documents');
const commentRoutes     = require('./routes/comments');

const app = express();

// — Disable ETags so clients always get a 200 + full body
app.disable('etag');

// — Prevent any caching on all routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(cors());
app.use(logger);
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ message: 'CMS API running' }));

// Mount routers
app.use('/api/auth',        authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents',   documentRoutes);
app.use('/api/comments',    commentRoutes);
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);
// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
