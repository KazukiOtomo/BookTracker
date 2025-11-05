const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { frameDir } = require('../utils/storage');
const { logger } = require('../utils/logger');

const defaultOptions = {
  intervalSeconds: 1,
  maxFrames: 15,
};

const extractFrames = (filepath, options = {}) =>
  new Promise((resolve, reject) => {
    const mergedOptions = { ...defaultOptions, ...options };

    if (process.env.SKIP_FFMPEG === 'true') {
      logger.warn('SKIP_FFMPEG flag enabled. Returning stub frame list.');
      return resolve([
        {
          frameNumber: 0,
          path: filepath,
          originalPath: filepath,
          isStub: true,
        },
      ]);
    }

    const baseName = path.parse(filepath).name;
    const pattern = `${baseName}-%04d.png`;
    const createdFrames = [];

    ffmpeg(filepath)
      .on('filenames', (filenames) => {
        filenames.forEach((filename, index) => {
          const framePath = path.join(frameDir, filename);
          createdFrames.push({
            frameNumber: index,
            path: framePath,
            originalPath: filepath,
          });
        });
      })
      .on('end', () => {
        logger.info('Frame extraction completed', {
          totalFrames: createdFrames.length,
        });
        resolve(createdFrames);
      })
      .on('error', (error) => {
        logger.error('Frame extraction failed', { error: error.message });
        reject(error);
      })
      .screenshots({
        folder: frameDir,
        filename: pattern,
        count: mergedOptions.maxFrames,
      });

    return null;
  });

const cleanupFrames = (frames) => {
  frames.forEach((frame) => {
    try {
      if (frame.path !== frame.originalPath && fs.existsSync(frame.path)) {
        fs.unlinkSync(frame.path);
      }
    } catch (error) {
      logger.warn('Failed to cleanup frame file', { error: error.message });
    }
  });
};

module.exports = {
  extractFrames,
  cleanupFrames,
};
