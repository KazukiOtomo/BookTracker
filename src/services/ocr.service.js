const Tesseract = require('tesseract.js');
const { logger } = require('../utils/logger');

const normalizeConfidence = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  const normalized = value > 1 ? value / 100 : value;
  return Math.min(Math.max(normalized, 0), 1);
};

const recognizeFrame = async (frame) => {
  if (process.env.SKIP_TESSERACT === 'true') {
    return {
      frameNumber: frame.frameNumber,
      text: 'Sample Book Title',
      confidence: 0.9,
      language: 'ja',
      words: [
        {
          text: 'Sample',
          confidence: 0.92,
          bbox: {},
        },
        {
          text: 'Book',
          confidence: 0.88,
          bbox: {},
        },
        {
          text: 'Title',
          confidence: 0.9,
          bbox: {},
        },
      ],
    };
  }

  const result = await Tesseract.recognize(frame.path, 'jpn+eng', {
    logger: (message) => logger.debug('Tesseract progress', message),
  });

  const { data } = result;
  const combinedText = data?.text ? data.text.trim() : '';

  return {
    frameNumber: frame.frameNumber,
    text: combinedText,
    confidence: normalizeConfidence(data?.confidence),
    language: data?.language || 'unknown',
    words: (data?.words || []).map((word) => ({
      text: word.text,
      confidence: normalizeConfidence(word.confidence),
      bbox: word.bbox,
    })),
  };
};

module.exports = {
  recognizeFrame,
};
