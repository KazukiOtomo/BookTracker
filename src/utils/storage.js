const fs = require('fs');
const path = require('path');

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const frameDir = process.env.FRAME_DIR || path.join(process.cwd(), 'tmp/frames');

const ensureDirectory = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
};

const ensureStorageDirectories = () => {
  ensureDirectory(uploadDir);
  ensureDirectory(frameDir);
};

module.exports = {
  uploadDir,
  frameDir,
  ensureStorageDirectories,
};
