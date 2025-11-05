const express = require('express');
const videoRoutes = require('./routes/video.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { ensureStorageDirectories } = require('./utils/storage');

const app = express();

ensureStorageDirectories();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/videos', videoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
