const express = require('express');
const multer = require('multer');
const {
  uploadVideo,
  getStatus,
  getResults,
  deleteJob,
} = require('../controllers/video.controller');
const { singleVideoUpload, maxUploadSize } = require('../middleware/upload.middleware');
const { ApplicationError } = require('../utils/errors');

const router = express.Router();

router.post('/upload', (req, res, next) => {
  singleVideoUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new ApplicationError('ファイルサイズが500MBを超えています。', {
            status: 413,
            code: 'FILE_TOO_LARGE',
            details: {
              maxUploadSize,
            },
          })
        );
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return next(
          new ApplicationError(
            '対応していないファイル形式です。MP4, MOV, AVIのいずれかをアップロードしてください。',
            {
              status: 400,
              code: 'INVALID_FILE_TYPE',
            }
          )
        );
      }
    } else if (err) {
      return next(err);
    }

    return uploadVideo(req, res, next);
  });
});

router.get('/:id/status', getStatus);
router.get('/:id/results', getResults);
router.delete('/:id', deleteJob);

module.exports = router;
