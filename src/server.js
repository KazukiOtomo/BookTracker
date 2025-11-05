require('dotenv').config();
const app = require('./app');
const { logger } = require('./utils/logger');
const { ensureStorageDirectories } = require('./utils/storage');

const port = process.env.PORT || 3000;

ensureStorageDirectories();

if (require.main === module) {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}

module.exports = app;
