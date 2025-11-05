const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  if (meta) {
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(meta)}`;
  }
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
};

const logger = {
  info(message, meta) {
    // eslint-disable-next-line no-console
    console.log(formatMessage('info', message, meta));
  },
  warn(message, meta) {
    // eslint-disable-next-line no-console
    console.warn(formatMessage('warn', message, meta));
  },
  error(message, meta) {
    // eslint-disable-next-line no-console
    console.error(formatMessage('error', message, meta));
  },
  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, meta));
    }
  },
};

module.exports = { logger };
