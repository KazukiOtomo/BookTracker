# API Contract: Video Processing

動画アップロードとOCR処理に関するエンドポイント定義

## POST /api/videos/upload

動画ファイルをアップロードして処理を開始します。

### Request

**Content-Type**: `multipart/form-data`

**Body**:

```
video: File (必須)
  - 対応形式: .mp4, .mov, .avi
  - 最大サイズ: 500MB
  - フィールド名: "video"
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@bookshelf.mp4"
```

### Response

**Success (202 Accepted)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "bookshelf.mp4",
    "status": "pending",
    "createdAt": "2025-11-05T10:30:00.000Z"
  },
  "message": "動画のアップロードが完了しました。処理を開始します。"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "対応していないファイル形式です。MP4, MOV, AVIのいずれかをアップロードしてください。"
  }
}
```

**Error (413 Payload Too Large)**:

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "ファイルサイズが500MBを超えています。"
  }
}
```

---

## GET /api/videos/:id/status

動画処理の進捗状況を取得します。

### Request

**Path Parameters**:

- `id`: VideoProcessing ID (UUID)

**Example**:

```bash
curl http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/status
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "progress": {
      "frameCount": 100,
      "processedFrames": 45,
      "percentage": 45
    },
    "createdAt": "2025-11-05T10:30:00.000Z",
    "updatedAt": "2025-11-05T10:32:15.000Z"
  }
}
```

**Status値**:

- `pending`: 処理待ち
- `processing`: 処理中
- `completed`: 完了
- `failed`: 失敗

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "VIDEO_NOT_FOUND",
    "message": "指定された動画が見つかりません。"
  }
}
```

---

## GET /api/videos/:id/results

OCR認識結果を取得します。

### Request

**Path Parameters**:

- `id`: VideoProcessing ID (UUID)

**Query Parameters**:

- `minConfidence` (optional): 最小信頼度スコア (0.0 - 1.0)
- `limit` (optional): 取得件数制限 (デフォルト: 50)

**Example**:

```bash
curl "http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/results?minConfidence=0.7&limit=20"
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "totalResults": 87,
    "results": [
      {
        "id": "a1b2c3d4-e5f6-4789-a012-3456789abcde",
        "frameNumber": 42,
        "recognizedText": "ハリー・ポッターと賢者の石",
        "confidenceScore": 0.92,
        "language": "ja",
        "isBookTitle": false,
        "createdAt": "2025-11-05T10:31:30.000Z"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-b234-56789abcdef0",
        "frameNumber": 78,
        "recognizedText": "吾輩は猫である",
        "confidenceScore": 0.88,
        "language": "ja",
        "isBookTitle": false,
        "createdAt": "2025-11-05T10:32:05.000Z"
      }
    ]
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "VIDEO_NOT_FOUND",
    "message": "指定された動画が見つかりません。"
  }
}
```

---

## DELETE /api/videos/:id

動画処理ジョブと関連データを削除します。

### Request

**Path Parameters**:

- `id`: VideoProcessing ID (UUID)

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "動画処理ジョブを削除しました。"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "VIDEO_NOT_FOUND",
    "message": "指定された動画が見つかりません。"
  }
}
```

---

## エラーコード一覧

| コード                   | HTTPステータス | 説明                 |
| ------------------------ | -------------- | -------------------- |
| `INVALID_FILE_TYPE`      | 400            | 非対応のファイル形式 |
| `FILE_TOO_LARGE`         | 413            | ファイルサイズ超過   |
| `VIDEO_NOT_FOUND`        | 404            | 動画が見つからない   |
| `PROCESSING_FAILED`      | 500            | 処理中にエラー発生   |
| `MISSING_REQUIRED_FIELD` | 400            | 必須フィールド不足   |

## 実装ノート

### セキュリティ

- ファイルアップロードにはMIMEタイプと拡張子の二重チェックを実施
- 一時ファイルは処理後に削除
- ファイルパスの外部公開を避ける

### パフォーマンス

- 動画処理は非同期ジョブとして実行
- ステータス確認はポーリング（5秒間隔推奨）
- 結果取得時はページネーション対応

### テスト観点

- 大容量ファイルのアップロード
- 非対応形式のリジェクト
- 処理中の中断
- 同時アップロード
