# クイックスタートガイド

このガイドでは、BookTrackerの主要な機能を実際に使ってみる手順を説明します。

## 前提条件

- Node.js 18.x 以上がインストール済み
- SQLiteまたはPostgreSQLが利用可能
- FFmpegがシステムにインストール済み（動画処理用）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. データベースの初期化

```bash
# Prisma マイグレーション実行
npx prisma migrate dev --name init

# Prisma Clientの生成
npx prisma generate
```

### 3. 環境変数の設定

`.env` ファイルを作成:

```env
# データベース接続
DATABASE_URL="file:./dev.db"

# サーバー設定
PORT=3000
NODE_ENV=development

# アップロード設定
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=524288000  # 500MB

# OCR設定
OCR_LANGUAGE="jpn+eng"
OCR_MIN_CONFIDENCE=0.7
```

### 4. サーバー起動

```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

---

## 統合テストシナリオ

### シナリオ 1: 動画から書籍を認識して登録

#### ステップ 1: 動画をアップロード

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@test-bookshelf.mp4"
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "test-bookshelf.mp4",
    "status": "pending",
    "createdAt": "2025-11-05T10:30:00.000Z"
  },
  "message": "動画のアップロードが完了しました。処理を開始します。"
}
```

#### ステップ 2: 処理状況を確認（ポーリング）

```bash
# 5秒ごとに実行
curl http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/status
```

**処理完了時の応答**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "progress": {
      "frameCount": 100,
      "processedFrames": 100,
      "percentage": 100
    },
    "updatedAt": "2025-11-05T10:35:00.000Z"
  }
}
```

#### ステップ 3: OCR結果を取得

```bash
curl "http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/results?minConfidence=0.8"
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "totalResults": 15,
    "results": [
      {
        "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
        "frameNumber": 42,
        "recognizedText": "ハリー・ポッターと賢者の石",
        "confidenceScore": 0.92,
        "language": "ja"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-b234-56789abcdef0",
        "frameNumber": 78,
        "recognizedText": "吾輩は猫である",
        "confidenceScore": 0.88,
        "language": "ja"
      }
    ]
  }
}
```

#### ステップ 4: 書籍を登録

OCR結果を確認後、書籍を登録:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ハリー・ポッターと賢者の石",
    "author": "J.K.ローリング",
    "category": "ファンタジー",
    "recognitionSource": "550e8400-e29b-41d4-a716-446655440000",
    "confidenceScore": 0.92
  }'
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "title": "ハリー・ポッターと賢者の石",
    "author": "J.K.ローリング",
    "status": "available",
    "createdAt": "2025-11-05T11:00:00.000Z"
  },
  "message": "書籍を登録しました。"
}
```

---

### シナリオ 2: 書籍の貸出と返却

#### ステップ 1: 書籍を検索

```bash
curl "http://localhost:3000/api/books?search=ハリー"
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
        "title": "ハリー・ポッターと賢者の石",
        "author": "J.K.ローリング",
        "status": "available"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 1
    }
  }
}
```

#### ステップ 2: 書籍を貸し出す

```bash
curl -X POST http://localhost:3000/api/loans \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "borrowerName": "山田太郎",
    "borrowerContact": "yamada@example.com"
  }'
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
    "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "borrowerName": "山田太郎",
    "loanDate": "2025-11-05T10:00:00.000Z",
    "dueDate": "2025-11-19T10:00:00.000Z",
    "status": "loaned"
  },
  "message": "書籍を貸し出しました。"
}
```

#### ステップ 3: 貸出状況を確認

```bash
curl http://localhost:3000/api/books/b1c2d3e4-f5a6-7890-b123-456789abcdef
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "title": "ハリー・ポッターと賢者の石",
    "status": "loaned",
    "currentLoan": {
      "borrowerName": "山田太郎",
      "dueDate": "2025-11-19T10:00:00.000Z"
    }
  }
}
```

#### ステップ 4: 書籍を返却

```bash
curl -X PATCH http://localhost:3000/api/loans/c1d2e3f4-a5b6-7890-c123-456789abcdef/return \
  -H "Content-Type: application/json" \
  -d '{}'
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
    "status": "returned",
    "returnDate": "2025-11-10T15:30:00.000Z",
    "wasOverdue": false
  },
  "message": "書籍を返却しました。"
}
```

---

### シナリオ 3: 延滞管理

#### ステップ 1: 延滞書籍の確認

```bash
curl http://localhost:3000/api/loans/overdue
```

**期待される応答**:

```json
{
  "success": true,
  "data": {
    "overdueLoans": [
      {
        "id": "d1e2f3a4-b5c6-7890-d123-456789abcdef",
        "book": {
          "title": "吾輩は猫である",
          "author": "夏目漱石"
        },
        "borrowerName": "鈴木一郎",
        "borrowerContact": "suzuki@example.com",
        "dueDate": "2025-10-15T10:00:00.000Z",
        "daysOverdue": 21,
        "status": "overdue"
      }
    ],
    "pagination": {
      "total": 1
    }
  }
}
```

---

## テストデータの投入

開発・テスト用のサンプルデータを投入:

```bash
npm run seed
```

これにより以下が作成されます:

- 書籍10冊
- 貸出記録5件（うち2件は延滞）
- 動画処理ジョブ2件

---

## トラブルシューティング

### 問題: FFmpegが見つからない

**症状**: 動画アップロード時に `FFmpeg not found` エラー

**解決策**:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# https://ffmpeg.org/download.html からダウンロード
```

### 問題: OCR認識精度が低い

**症状**: 日本語タイトルが正しく認識されない

**解決策**:

1. Tesseractの日本語データをインストール:

   ```bash
   # macOS
   brew install tesseract-lang

   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr-jpn
   ```

2. 動画の品質を確認（解像度720p以上推奨）

3. `.env` の `OCR_MIN_CONFIDENCE` を調整（0.6 - 0.8）

### 問題: データベースマイグレーションエラー

**症状**: `prisma migrate` が失敗する

**解決策**:

```bash
# 既存のマイグレーションをリセット
npx prisma migrate reset

# 再度マイグレーション実行
npx prisma migrate dev
```

---

## 次のステップ

1. **UI実装**: フロントエンドの開発
2. **認証機能**: ユーザーログイン機能の追加
3. **通知機能**: 返却期限リマインダー
4. **レポート機能**: 貸出統計の可視化

## 参考リンク

- [Prismaドキュメント](https://www.prisma.io/docs)
- [Tesseract.jsドキュメント](https://tesseract.projectnaptha.com/)
- [FFmpegドキュメント](https://ffmpeg.org/documentation.html)
