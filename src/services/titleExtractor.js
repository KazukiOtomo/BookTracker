const sanitizeText = (input) =>
  input
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const detectLanguage = (text) => {
  // Naive language detection based on character range
  if (/[ぁ-んァ-ン一-龠]/.test(text)) {
    return 'ja';
  }
  return 'en';
};

const calculateConfidence = (words) => {
  if (!words || words.length === 0) {
    return 0;
  }
  const total = words.reduce((sum, word) => sum + (word.confidence || 0), 0);
  return Number((total / words.length).toFixed(2));
};

const extractBookTitleCandidates = (ocrPayload) => {
  const { text, words } = ocrPayload;
  const lines = sanitizeText(text || '');

  const candidates = lines
    .filter((line) => line.length >= 3)
    .map((line) => ({
      text: line,
      confidence: calculateConfidence(words),
      language: detectLanguage(line),
    }));

  if (candidates.length === 0 && text) {
    candidates.push({
      text,
      confidence: calculateConfidence(words),
      language: detectLanguage(text),
    });
  }

  return candidates;
};

module.exports = {
  extractBookTitleCandidates,
};
