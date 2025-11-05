# Node.js LTS版をベースイメージとして使用
FROM node:20-bookworm-slim

# FFmpegとTesseract OCRのインストールに必要なパッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-jpn \
    tesseract-ocr-eng \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# ポートの公開（将来のWebサーバー用）
EXPOSE 3000

# デフォルトコマンド
CMD ["npm", "test"]
