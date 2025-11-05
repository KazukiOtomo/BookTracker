# API Contract: Book Management

書籍の登録・管理に関するエンドポイント定義

## POST /api/books

新しい書籍を登録します。

### Request

**Content-Type**: `application/json`

**Body**:

```json
{
  "title": "ハリー・ポッターと賢者の石",
  "author": "J.K.ローリング",
  "isbn": "9784915512377",
  "category": "ファンタジー",
  "recognitionSource": "550e8400-e29b-41d4-a716-446655440000",
  "confidenceScore": 0.92
}
```

**Required Fields**:

- `title`: String (1-255文字)

**Optional Fields**:

- `author`: String
- `isbn`: String (10桁または13桁)
- `category`: String
- `recognitionSource`: UUID (動画ID)
- `confidenceScore`: Float (0.0 - 1.0)

### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "title": "ハリー・ポッターと賢者の石",
    "author": "J.K.ローリング",
    "isbn": "9784915512377",
    "category": "ファンタジー",
    "status": "available",
    "recognitionSource": "550e8400-e29b-41d4-a716-446655440000",
    "confidenceScore": 0.92,
    "createdAt": "2025-11-05T11:00:00.000Z",
    "updatedAt": "2025-11-05T11:00:00.000Z"
  },
  "message": "書籍を登録しました。"
}
```

**Error (400 Bad Request)**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "タイトルは必須です。",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ISBN",
    "message": "このISBNはすでに登録されています。",
    "details": {
      "existingBookId": "a1b2c3d4-e5f6-7890-a123-456789abcdef"
    }
  }
}
```

---

## GET /api/books

書籍一覧を取得します。

### Request

**Query Parameters**:

- `search` (optional): タイトル・著者での部分一致検索
- `status` (optional): 在庫状態でフィルタ (`available`, `loaned`)
- `category` (optional): カテゴリでフィルタ
- `page` (optional): ページ番号 (デフォルト: 1)
- `limit` (optional): 1ページあたりの件数 (デフォルト: 20, 最大: 100)
- `sort` (optional): ソート順 (`title`, `createdAt`, `-title`, `-createdAt`)

**Example**:

```bash
curl "http://localhost:3000/api/books?search=ハリー&status=available&page=1&limit=20"
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
        "title": "ハリー・ポッターと賢者の石",
        "author": "J.K.ローリング",
        "isbn": "9784915512377",
        "category": "ファンタジー",
        "status": "available",
        "createdAt": "2025-11-05T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## GET /api/books/:id

特定の書籍の詳細情報を取得します。

### Request

**Path Parameters**:

- `id`: Book ID (UUID)

**Example**:

```bash
curl http://localhost:3000/api/books/b1c2d3e4-f5a6-7890-b123-456789abcdef
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "title": "ハリー・ポッターと賢者の石",
    "author": "J.K.ローリング",
    "isbn": "9784915512377",
    "category": "ファンタジー",
    "status": "available",
    "recognitionSource": "550e8400-e29b-41d4-a716-446655440000",
    "confidenceScore": 0.92,
    "createdAt": "2025-11-05T11:00:00.000Z",
    "updatedAt": "2025-11-05T11:00:00.000Z",
    "currentLoan": null,
    "loanHistory": []
  }
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "指定された書籍が見つかりません。"
  }
}
```

---

## PATCH /api/books/:id

書籍情報を更新します。

### Request

**Path Parameters**:

- `id`: Book ID (UUID)

**Content-Type**: `application/json`

**Body** (すべて任意):

```json
{
  "title": "ハリー・ポッターと賢者の石（新装版）",
  "author": "J.K.ローリング",
  "isbn": "9784915512377",
  "category": "児童文学"
}
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "title": "ハリー・ポッターと賢者の石（新装版）",
    "author": "J.K.ローリング",
    "isbn": "9784915512377",
    "category": "児童文学",
    "status": "available",
    "updatedAt": "2025-11-05T12:00:00.000Z"
  },
  "message": "書籍情報を更新しました。"
}
```

---

## DELETE /api/books/:id

書籍を削除します（貸出中の場合は削除不可）。

### Request

**Path Parameters**:

- `id`: Book ID (UUID)

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/books/b1c2d3e4-f5a6-7890-b123-456789abcdef
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "書籍を削除しました。"
}
```

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": {
    "code": "BOOK_ON_LOAN",
    "message": "貸出中の書籍は削除できません。先に返却処理を行ってください。"
  }
}
```

---

## エラーコード一覧

| コード             | HTTPステータス | 説明                   |
| ------------------ | -------------- | ---------------------- |
| `VALIDATION_ERROR` | 400            | バリデーションエラー   |
| `DUPLICATE_ISBN`   | 409            | ISBN重複               |
| `BOOK_NOT_FOUND`   | 404            | 書籍が見つからない     |
| `BOOK_ON_LOAN`     | 409            | 貸出中の書籍操作エラー |

## 実装ノート

### バリデーション

- ISBNは10桁または13桁の数字のみ
- タイトルは1文字以上255文字以下
- 検索クエリは最大100文字

### パフォーマンス

- タイトルにインデックスを作成
- 検索は部分一致（LIKE検索）
- ページネーションは必須

### テスト観点

- ISBN重複登録の拒否
- 貸出中書籍の削除防止
- 検索の精度
- ページネーション動作
