class ApplicationError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_SERVER_ERROR', details } = {}) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  ApplicationError,
};
