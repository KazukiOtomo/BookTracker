# データモデル設計

## エンティティ概要

システムは以下の4つの主要エンティティで構成されます：

1. **Book**: 書籍情報
2. **Loan**: 貸出記録
3. **VideoProcessing**: 動画処理ジョブ
4. **OcrResult**: OCR認識結果

## エンティティ定義

### Book（書籍）

書籍の基本情報と状態を管理します。

**属性**:

- `id`: UUID（主キー）
- `title`: String（必須、索引）- 書籍タイトル
- `author`: String（任意）- 著者名
- `isbn`: String（任意、ユニーク）- ISBN番号
- `category`: String（任意）- カテゴリ
- `status`: Enum（在庫中/貸出中）- 在庫状態
- `recognitionSource`: String（任意）- 認識元（動画ID or 手動）
- `confidenceScore`: Float（任意）- OCR信頼度スコア
- `createdAt`: DateTime（自動）- 登録日時
- `updatedAt`: DateTime（自動）- 更新日時

**制約**:

- `title` は必須（空文字不可）
- `isbn` は一意（設定されている場合）
- `status` は 'available' または 'loaned'

**関係**:

- `loans`: 1対多 → Loan（貸出履歴）

---

### Loan（貸出記録）

書籍の貸出・返却情報を管理します。

**属性**:

- `id`: UUID（主キー）
- `bookId`: UUID（外部キー → Book）
- `borrowerName`: String（必須）- 借り手の名前
- `borrowerContact`: String（任意）- 連絡先
- `loanDate`: DateTime（必須）- 貸出日
- `dueDate`: DateTime（必須）- 返却期限
- `returnDate`: DateTime（任意）- 実際の返却日
- `status`: Enum（貸出中/返却済/延滞）- 貸出状態
- `createdAt`: DateTime（自動）
- `updatedAt`: DateTime（自動）

**制約**:

- `bookId` は Book.id を参照
- `dueDate` は `loanDate` より未来
- `returnDate` は設定時のみ `status` を '返却済' に

**関係**:

- `book`: 多対1 → Book

**ビジネスロジック**:

- 新規貸出時、`dueDate` は `loanDate + 14日` を自動設定
- 現在日時 > `dueDate` かつ `returnDate` が null なら延滞

---

### VideoProcessing（動画処理ジョブ）

動画のアップロードと処理状況を追跡します。

**属性**:

- `id`: UUID（主キー）
- `filename`: String（必須）- 元ファイル名
- `filepath`: String（必須）- サーバー保存パス
- `filesize`: Integer（必須）- ファイルサイズ（バイト）
- `mimeType`: String（必須）- MIMEタイプ
- `status`: Enum（待機中/処理中/完了/失敗）
- `frameCount`: Integer（任意）- 抽出フレーム数
- `processedFrames`: Integer（任意）- 処理済みフレーム数
- `errorMessage`: String（任意）- エラー詳細
- `createdAt`: DateTime（自動）
- `updatedAt`: DateTime（自動）

**制約**:

- `filesize` は 500MB（524,288,000バイト）以下
- `mimeType` は 'video/mp4', 'video/quicktime', 'video/x-msvideo' のいずれか

**関係**:

- `ocrResults`: 1対多 → OcrResult（抽出結果）

---

### OcrResult（OCR認識結果）

動画から抽出されたテキスト認識結果を保存します。

**属性**:

- `id`: UUID（主キー）
- `videoProcessingId`: UUID（外部キー → VideoProcessing）
- `frameNumber`: Integer（必須）- フレーム番号
- `recognizedText`: String（必須）- 認識されたテキスト
- `confidenceScore`: Float（必須）- 信頼度（0.0 - 1.0）
- `boundingBox`: JSON（任意）- テキスト領域座標
- `language`: String（必須）- 認識言語（ja/en）
- `isBookTitle`: Boolean（デフォルト: false）- 書籍タイトルとして採用されたか
- `createdAt`: DateTime（自動）

**制約**:

- `confidenceScore` は 0.0 以上 1.0 以下
- `videoProcessingId` は VideoProcessing.id を参照

**関係**:

- `videoProcessing`: 多対1 → VideoProcessing

---

## ER図（簡易版）

```
┌─────────────────┐         ┌─────────────────┐
│  VideoProcessing│1      * │   OcrResult     │
│─────────────────│────────▶│─────────────────│
│ id (PK)         │         │ id (PK)         │
│ filename        │         │ videoId (FK)    │
│ status          │         │ recognizedText  │
│ frameCount      │         │ confidenceScore │
└─────────────────┘         └─────────────────┘
                                     │
                                     │ (手動で Book 作成)
                                     ▼
┌─────────────────┐         ┌─────────────────┐
│      Book       │1      * │      Loan       │
│─────────────────│────────▶│─────────────────│
│ id (PK)         │         │ id (PK)         │
│ title           │         │ bookId (FK)     │
│ author          │         │ borrowerName    │
│ isbn (UNIQUE)   │         │ loanDate        │
│ status          │         │ dueDate         │
│ confidenceScore │         │ returnDate      │
└─────────────────┘         │ status          │
                            └─────────────────┘
```

## Prisma スキーマ（概要）

```prisma
model Book {
  id                String   @id @default(uuid())
  title             String
  author            String?
  isbn              String?  @unique
  category          String?
  status            BookStatus @default(AVAILABLE)
  recognitionSource String?
  confidenceScore   Float?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  loans             Loan[]

  @@index([title])
}

enum BookStatus {
  AVAILABLE
  LOANED
}

model Loan {
  id              String     @id @default(uuid())
  bookId          String
  borrowerName    String
  borrowerContact String?
  loanDate        DateTime
  dueDate         DateTime
  returnDate      DateTime?
  status          LoanStatus @default(LOANED)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  book            Book       @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@index([bookId])
  @@index([dueDate])
}

enum LoanStatus {
  LOANED
  RETURNED
  OVERDUE
}

model VideoProcessing {
  id               String            @id @default(uuid())
  filename         String
  filepath         String
  filesize         Int
  mimeType         String
  status           ProcessingStatus  @default(PENDING)
  frameCount       Int?
  processedFrames  Int?
  errorMessage     String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  ocrResults       OcrResult[]
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model OcrResult {
  id                 String          @id @default(uuid())
  videoProcessingId  String
  frameNumber        Int
  recognizedText     String
  confidenceScore    Float
  boundingBox        Json?
  language           String
  isBookTitle        Boolean         @default(false)
  createdAt          DateTime        @default(now())

  videoProcessing    VideoProcessing @relation(fields: [videoProcessingId], references: [id], onDelete: Cascade)

  @@index([videoProcessingId])
  @@index([confidenceScore])
}
```

## データフロー

### 1. 動画アップロード → OCR → 書籍登録

```
1. ユーザーが動画をアップロード
   ↓
2. VideoProcessing レコード作成（status: PENDING）
   ↓
3. FFmpeg でフレーム抽出
   ↓
4. 各フレームに対して OCR 実行
   ↓
5. OcrResult レコードを複数作成
   ↓
6. 信頼度の高い結果をユーザーに提示
   ↓
7. ユーザーが確認・編集後、Book レコード作成
```

### 2. 書籍貸出

```
1. ユーザーが Book を選択
   ↓
2. Loan レコード作成（status: LOANED, dueDate: 自動計算）
   ↓
3. Book.status を 'LOANED' に更新
```

### 3. 書籍返却

```
1. Loan.returnDate を現在日時に設定
   ↓
2. Loan.status を 'RETURNED' に更新
   ↓
3. Book.status を 'AVAILABLE' に更新
```

## バリデーションルール

### Book

- `title`: 1文字以上、255文字以下
- `isbn`: 正規表現 `/^(\d{10}|\d{13})$/` (10桁または13桁)
- `confidenceScore`: 0.0 ≦ score ≦ 1.0

### Loan

- `borrowerName`: 1文字以上、100文字以下
- `loanDate` ≦ `dueDate`
- `dueDate` は未来の日付

### VideoProcessing

- `filesize`: 0 < size ≦ 524,288,000 (500MB)
- `mimeType`: ['video/mp4', 'video/quicktime', 'video/x-msvideo']

## インデックス戦略

### パフォーマンス最適化のためのインデックス

1. **Book.title**: 書籍検索での頻繁な使用
2. **Loan.bookId**: 貸出履歴取得
3. **Loan.dueDate**: 延滞書籍の検索
4. **OcrResult.videoProcessingId**: 動画に紐づく結果取得
5. **OcrResult.confidenceScore**: 高信頼度結果の抽出

## マイグレーション戦略

1. 初期スキーマ作成
2. 開発中はPrisma Migrateで管理
3. 本番環境では慎重なマイグレーション計画
4. データバックアップを事前に実施
