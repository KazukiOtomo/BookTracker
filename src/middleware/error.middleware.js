const { logger } = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || '予期しないエラーが発生しました。',
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  logger.error(err.message || 'Unhandled error', {
    status,
    code: err.code,
    stack: err.stack,
  });

  res.status(status).json(response);
};

const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '指定されたリソースが見つかりません。',
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
