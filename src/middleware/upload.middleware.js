const path = require('path');
const multer = require('multer');
const { uploadDir } = require('../utils/storage');

const allowedMimeTypes = {
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
};

const maxUploadSize = 524_288_000; // 500MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || `.${allowedMimeTypes[file.mimetype] || 'bin'}`;
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext.toLowerCase()}`;
    cb(null, safeName);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxUploadSize },
});

const singleVideoUpload = upload.single('video');

module.exports = {
  singleVideoUpload,
  allowedVideoMimeTypes: Object.keys(allowedMimeTypes),
  maxUploadSize,
};
