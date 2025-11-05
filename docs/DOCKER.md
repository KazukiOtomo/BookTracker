# Docker環境構築ガイド

## 概要

BookTrackerプロジェクトをDockerで実行するためのガイドです。

## 必要な環境

- Docker Desktop（macOS/Windows）
- Docker Engine（Linux）
- Docker Compose

## 構成

### サービス

| サービス名 | イメージ           | ポート | 説明                    |
| ---------- | ------------------ | ------ | ----------------------- |
| app        | booktracker-app    | 3000   | Node.jsアプリケーション |
| db         | postgres:16-alpine | 5432   | PostgreSQLデータベース  |

### インストール済みツール

アプリケーションコンテナには以下がプリインストールされています：

- Node.js 20
- FFmpeg（動画処理用）
- Tesseract OCR（日本語・英語対応）

## 使い方

### 初回起動

```bash
# リポジトリをクローン
git clone https://github.com/KazukiOtomo/BookTracker.git
cd BookTracker

# コンテナのビルドと起動
docker compose up -d

# ログを確認（テスト結果が表示されます）
docker compose logs app
```

### 日常的な操作

```bash
# コンテナの起動
docker compose up -d

# コンテナの停止
docker compose stop

# コンテナの停止と削除
docker compose down

# データベースを含めて完全に削除
docker compose down -v

# コンテナの状態確認
docker compose ps

# ログの確認
docker compose logs -f app    # アプリのログ
docker compose logs -f db     # データベースのログ
```

### 開発作業

```bash
# コンテナ内でシェルを開く
docker compose exec app sh

# コンテナ内でテストを実行
docker compose exec app npm test

# コンテナ内で個別のコマンドを実行
docker compose exec app npm run lint

# イメージの再ビルド（Dockerfileを変更した場合）
docker compose build --no-cache
docker compose up -d
```

### データベースアクセス

```bash
# PostgreSQLコンテナに接続
docker compose exec db psql -U booktracker -d booktracker

# データベースのバックアップ
docker compose exec db pg_dump -U booktracker booktracker > backup.sql

# データベースのリストア
cat backup.sql | docker compose exec -T db psql -U booktracker -d booktracker
```

## 環境変数

`docker-compose.yml`で以下の環境変数が設定されています：

### アプリケーション（app）

- `NODE_ENV`: 環境モード（development/production）
- `DATABASE_URL`: PostgreSQL接続URL

### データベース（db）

- `POSTGRES_USER`: データベースユーザー名
- `POSTGRES_PASSWORD`: データベースパスワード
- `POSTGRES_DB`: データベース名

必要に応じて`.env`ファイルを作成してカスタマイズできます。

## トラブルシューティング

### ポートが既に使用されている

```bash
# ポートを使用しているプロセスを確認（macOS/Linux）
lsof -i :3000
lsof -i :5432

# docker-compose.ymlでポート番号を変更
ports:
  - "3001:3000"  # ホストの3001をコンテナの3000にマッピング
```

### コンテナのビルドが失敗する

```bash
# Dockerのビルドキャッシュをクリア
docker builder prune -f

# キャッシュなしでビルド
docker compose build --no-cache
```

### データベースが起動しない

```bash
# ボリュームを削除して再作成
docker compose down -v
docker compose up -d
```

### node_modulesの問題

```bash
# コンテナ内でnode_modulesを再インストール
docker compose exec app npm ci
```

## ボリューム

### 永続化データ

- `postgres_data`: PostgreSQLのデータディレクトリ

### マウントされるディレクトリ

- `.:/app`: プロジェクトルート（コード変更がすぐ反映されます）
- `/app/node_modules`: node_modulesは独立したボリューム
- `./uploads:/app/uploads`: アップロードファイル用ディレクトリ

## 本番環境での利用

本番環境で使用する場合は、以下の変更を検討してください：

1. `NODE_ENV=production`に変更
2. データベースのパスワードを強固なものに変更
3. `.env`ファイルで機密情報を管理
4. ボリュームマウントの設定を見直し
5. セキュリティグループやファイアウォールの設定

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
- [Node.js Dockerイメージ](https://hub.docker.com/_/node)
- [PostgreSQL Dockerイメージ](https://hub.docker.com/_/postgres)
