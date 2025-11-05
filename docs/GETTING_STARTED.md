# BookTracker アプリケーション起動ガイド

## 🚀 クイックスタート

### Dockerで起動（推奨）

```bash
# 1. コンテナをビルド・起動
docker-compose up -d

# 2. ブラウザでアクセス
# http://localhost:3000
```

### ローカル環境で起動

```bash
# 1. 依存関係をインストール
npm install

# 2. アプリケーションを起動
npm start

# または開発モード（ファイル変更で自動再起動）
npm run dev
```

## 📡 利用可能なエンドポイント

アプリケーションが起動したら、以下のエンドポイントが利用できます：

### ルート - API情報

```bash
curl http://localhost:3000
```

**レスポンス例:**

```json
{
  "message": "BookTracker API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "books": "/api/books",
    "videos": "/api/videos"
  }
}
```

### ヘルスチェック

```bash
curl http://localhost:3000/health
```

**レスポンス例:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-05T06:55:41.863Z",
  "uptime": 23.981424969
}
```

### 書籍API（未実装）

```bash
curl http://localhost:3000/api/books
```

**レスポンス例:**

```json
{
  "message": "書籍一覧（未実装）",
  "books": []
}
```

### 動画処理API（未実装）

```bash
curl http://localhost:3000/api/videos
```

**レスポンス例:**

```json
{
  "message": "動画処理（未実装）"
}
```

## 🔧 よく使うコマンド

### Docker環境

```bash
# アプリの起動
docker-compose up -d

# ログを表示（リアルタイム）
docker-compose logs -f app

# コンテナの状態確認
docker-compose ps

# コンテナ内でコマンド実行
docker-compose exec app npm test
docker-compose exec app npm run lint

# コンテナ内にシェルで入る
docker-compose exec app sh

# コンテナの停止
docker-compose stop

# コンテナの停止と削除
docker-compose down

# データベースも含めて完全削除
docker-compose down -v
```

### ローカル環境

```bash
# アプリの起動
npm start

# 開発モード（ファイル変更で自動再起動）
npm run dev

# テスト実行
npm test

# テスト（watch モード）
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# リント
npm run lint

# リント（自動修正）
npm run lint:fix

# フォーマット
npm run format
```

## 🌐 ブラウザでアクセス

アプリケーションが起動したら、以下のURLでアクセスできます：

- **API情報**: http://localhost:3000
- **ヘルスチェック**: http://localhost:3000/health
- **書籍API**: http://localhost:3000/api/books
- **動画API**: http://localhost:3000/api/videos

## 🗄️ データベース接続

PostgreSQLデータベースは自動的に起動します：

- **ホスト**: localhost
- **ポート**: 5432
- **ユーザー名**: booktracker
- **パスワード**: booktracker
- **データベース名**: booktracker

### データベースに直接接続

```bash
# Docker環境
docker-compose exec db psql -U booktracker -d booktracker

# ローカル環境（PostgreSQL CLIがインストールされている場合）
psql -h localhost -p 5432 -U booktracker -d booktracker
```

## 📝 開発の進め方

現在、基本的なExpressサーバーが実装されています。次のステップ：

1. **データベースモデルの定義** - PostgreSQLのテーブル設計
2. **書籍API実装** - CRUD操作の実装
3. **動画アップロード機能** - ファイルアップロードとOCR処理
4. **フロントエンド実装** - UIの作成

詳細な仕様は `specs/video-book-management.md` を参照してください。

## 🐛 トラブルシューティング

### ポート3000が既に使用されている

```bash
# 使用中のプロセスを確認
lsof -i :3000

# または docker-compose.yml でポート番号を変更
ports:
  - "3001:3000"
```

### データベースに接続できない

```bash
# データベースコンテナのログを確認
docker-compose logs db

# コンテナを再起動
docker-compose restart db
```

### node_modulesの問題

```bash
# Docker環境
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# ローカル環境
rm -rf node_modules package-lock.json
npm install
```

## 📚 参考情報

- [プロジェクト憲章](../memory/constitution.md)
- [機能仕様書](../specs/video-book-management.md)
- [Docker環境詳細](DOCKER.md)
