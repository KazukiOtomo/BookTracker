# BookTracker

動画から書籍情報を自動認識し、蔵書管理を行うシステム

## 概要

BookTrackerは、書架を撮影した動画から書籍タイトルをOCR技術で自動認識し、蔵書の登録・管理・貸出管理を効率化するアプリケーションです。

## 主な機能

### 📹 動画からの書籍認識

- 動画ファイル（MP4, MOV, AVI）のアップロード
- 自動フレーム抽出とOCR処理
- 書籍タイトルの自動認識（日本語・英語対応）
- 認識結果の確認・編集機能

### 📚 蔵書管理

- 書籍情報の登録・編集・削除
- タイトル・著者・ISBNによる検索
- 重複登録の自動チェック
- カテゴリ分類

### 📅 貸出管理

- 貸出・返却の記録
- 返却期限の自動計算と管理
- 期限超過アラート
- 貸出履歴の確認

## 開発方針

このプロジェクトは[Spec-Kit](https://github.com/github/spec-kit)を使用した仕様駆動開発（SDD）で進めています。

### ワークフロー

1. **Constitution** - プロジェクト憲章の定義
2. **Specify** - 機能仕様の記述
3. **Plan** - 実装計画の策定
4. **Tasks** - タスク分解
5. **Implement** - 実装

## セットアップ

### ローカル環境

```bash
# 依存関係のインストール
npm install

# アプリケーションの起動
npm start

# 開発モード（ファイル変更で自動再起動）
npm run dev

# テスト実行
npm test

# リント実行
npm run lint

# フォーマット
npm run format
```

アプリケーションは http://localhost:3000 で起動します。

### Docker環境

```bash
# コンテナのビルドと起動
docker-compose up -d

# アプリケーションにアクセス
# http://localhost:3000

# APIエンドポイントを確認
curl http://localhost:3000

# ヘルスチェック
curl http://localhost:3000/health

# テストを実行
docker-compose exec app npm test

# コンテナ内でシェルを開く
docker-compose exec app sh

# ログを確認
docker-compose logs -f app

# コンテナを停止
docker-compose down

# データベースを含めて完全に削除
docker-compose down -v
```

**含まれるサービス:**

- `app`: Node.js アプリケーション（Tesseract OCR、FFmpeg含む）
  - ポート: 3000
  - エンドポイント: http://localhost:3000
- `db`: PostgreSQL データベース
  - ポート: 5432

**利用可能なAPIエンドポイント:**

- `GET /` - API情報
- `GET /health` - ヘルスチェック
- `GET /api/books` - 書籍一覧（未実装）
- `GET /api/videos` - 動画処理（未実装）

**環境変数:**

- `DATABASE_URL`: PostgreSQL接続URL（docker-compose.ymlで設定済み）
- `NODE_ENV`: development/production
- `PORT`: サーバーポート（デフォルト: 3000）

## プロジェクト構造

```
BookTracker/
├── .github/
│   ├── prompts/          # Spec-Kitプロンプト
│   └── workflows/        # CI/CDワークフロー
├── memory/
│   └── constitution.md   # プロジェクト憲章
├── specs/                # 機能仕様書
├── src/                  # ソースコード（実装予定）
└── __tests__/            # テストコード
```

## 技術スタック

- **言語**: Node.js / JavaScript
- **OCR**: Tesseract.js（日本語・英語対応）
- **動画処理**: FFmpeg
- **データベース**: PostgreSQL
- **テスト**: Jest
- **CI/CD**: GitHub Actions
- **コンテナ**: Docker / Docker Compose

## ドキュメント

- [プロジェクト憲章](memory/constitution.md)
- [機能仕様書](specs/video-book-management.md)

## ライセンス

ISC

## 開発状況

現在、仕様定義フェーズです。次のステップ：実装計画の策定
