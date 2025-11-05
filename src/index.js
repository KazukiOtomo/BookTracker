const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供（uploads フォルダ）
app.use('/uploads', express.static('uploads'));

// ルート
app.get('/', (req, res) => {
  res.json({
    message: 'BookTracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      books: '/api/books',
      videos: '/api/videos',
    },
  });
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 書籍API（プレースホルダー）
app.get('/api/books', (req, res) => {
  res.json({
    message: '書籍一覧（未実装）',
    books: [],
  });
});

// 動画アップロードAPI（プレースホルダー）
app.get('/api/videos', (req, res) => {
  res.json({
    message: '動画処理（未実装）',
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BookTracker server is running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;
