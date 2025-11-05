# API Contract: Loan Management

書籍の貸出・返却管理に関するエンドポイント定義

## POST /api/loans

書籍を貸し出します。

### Request

**Content-Type**: `application/json`

**Body**:

```json
{
  "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
  "borrowerName": "山田太郎",
  "borrowerContact": "yamada@example.com",
  "loanDate": "2025-11-05T10:00:00.000Z",
  "dueDate": "2025-11-19T10:00:00.000Z"
}
```

**Required Fields**:

- `bookId`: UUID
- `borrowerName`: String (1-100文字)

**Optional Fields**:

- `borrowerContact`: String (メールアドレスまたは電話番号)
- `loanDate`: DateTime (デフォルト: 現在日時)
- `dueDate`: DateTime (デフォルト: loanDate + 14日)

### Response

**Success (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
    "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "book": {
      "title": "ハリー・ポッターと賢者の石",
      "author": "J.K.ローリング"
    },
    "borrowerName": "山田太郎",
    "borrowerContact": "yamada@example.com",
    "loanDate": "2025-11-05T10:00:00.000Z",
    "dueDate": "2025-11-19T10:00:00.000Z",
    "returnDate": null,
    "status": "loaned",
    "createdAt": "2025-11-05T10:00:00.000Z"
  },
  "message": "書籍を貸し出しました。"
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

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": {
    "code": "BOOK_ALREADY_LOANED",
    "message": "この書籍はすでに貸出中です。",
    "details": {
      "currentLoan": {
        "borrowerName": "佐藤花子",
        "dueDate": "2025-11-15T10:00:00.000Z"
      }
    }
  }
}
```

---

## GET /api/loans

貸出記録の一覧を取得します。

### Request

**Query Parameters**:

- `status` (optional): ステータスフィルタ (`loaned`, `returned`, `overdue`)
- `bookId` (optional): 特定書籍の貸出履歴
- `overdue` (optional): `true`で延滞のみ
- `page` (optional): ページ番号 (デフォルト: 1)
- `limit` (optional): 件数 (デフォルト: 20, 最大: 100)
- `sort` (optional): ソート順 (`dueDate`, `-dueDate`, `loanDate`, `-loanDate`)

**Example**:

```bash
# 延滞中の貸出一覧
curl "http://localhost:3000/api/loans?overdue=true"

# 特定書籍の履歴
curl "http://localhost:3000/api/loans?bookId=b1c2d3e4-f5a6-7890-b123-456789abcdef"
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
        "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
        "book": {
          "title": "ハリー・ポッターと賢者の石",
          "author": "J.K.ローリング"
        },
        "borrowerName": "山田太郎",
        "loanDate": "2025-11-05T10:00:00.000Z",
        "dueDate": "2025-11-19T10:00:00.000Z",
        "returnDate": null,
        "status": "loaned",
        "daysUntilDue": 14
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    },
    "summary": {
      "totalLoaned": 1,
      "totalOverdue": 0
    }
  }
}
```

---

## GET /api/loans/:id

特定の貸出記録の詳細を取得します。

### Request

**Path Parameters**:

- `id`: Loan ID (UUID)

**Example**:

```bash
curl http://localhost:3000/api/loans/c1d2e3f4-a5b6-7890-c123-456789abcdef
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
    "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "book": {
      "id": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
      "title": "ハリー・ポッターと賢者の石",
      "author": "J.K.ローリング",
      "isbn": "9784915512377"
    },
    "borrowerName": "山田太郎",
    "borrowerContact": "yamada@example.com",
    "loanDate": "2025-11-05T10:00:00.000Z",
    "dueDate": "2025-11-19T10:00:00.000Z",
    "returnDate": null,
    "status": "loaned",
    "daysUntilDue": 14,
    "isOverdue": false,
    "createdAt": "2025-11-05T10:00:00.000Z",
    "updatedAt": "2025-11-05T10:00:00.000Z"
  }
}
```

---

## PATCH /api/loans/:id/return

書籍を返却します。

### Request

**Path Parameters**:

- `id`: Loan ID (UUID)

**Content-Type**: `application/json`

**Body** (任意):

```json
{
  "returnDate": "2025-11-10T15:30:00.000Z"
}
```

**Optional Fields**:

- `returnDate`: DateTime (デフォルト: 現在日時)

**Example**:

```bash
curl -X PATCH http://localhost:3000/api/loans/c1d2e3f4-a5b6-7890-c123-456789abcdef/return \
  -H "Content-Type: application/json" \
  -d '{"returnDate": "2025-11-10T15:30:00.000Z"}'
```

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-c123-456789abcdef",
    "bookId": "b1c2d3e4-f5a6-7890-b123-456789abcdef",
    "borrowerName": "山田太郎",
    "loanDate": "2025-11-05T10:00:00.000Z",
    "dueDate": "2025-11-19T10:00:00.000Z",
    "returnDate": "2025-11-10T15:30:00.000Z",
    "status": "returned",
    "wasOverdue": false
  },
  "message": "書籍を返却しました。"
}
```

**Error (404 Not Found)**:

```json
{
  "success": false,
  "error": {
    "code": "LOAN_NOT_FOUND",
    "message": "指定された貸出記録が見つかりません。"
  }
}
```

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_RETURNED",
    "message": "この書籍はすでに返却済みです。",
    "details": {
      "returnDate": "2025-11-08T12:00:00.000Z"
    }
  }
}
```

---

## GET /api/loans/overdue

延滞中の貸出一覧を取得します（専用エンドポイント）。

### Request

**Query Parameters**:

- `page` (optional): ページ番号
- `limit` (optional): 件数

**Example**:

```bash
curl http://localhost:3000/api/loans/overdue
```

### Response

**Success (200 OK)**:

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
        "loanDate": "2025-10-01T10:00:00.000Z",
        "dueDate": "2025-10-15T10:00:00.000Z",
        "daysOverdue": 21,
        "status": "overdue"
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

## DELETE /api/loans/:id

貸出記録を削除します（返却済みのみ削除可能）。

### Request

**Path Parameters**:

- `id`: Loan ID (UUID)

### Response

**Success (200 OK)**:

```json
{
  "success": true,
  "message": "貸出記録を削除しました。"
}
```

**Error (409 Conflict)**:

```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_ACTIVE_LOAN",
    "message": "返却されていない貸出記録は削除できません。"
  }
}
```

---

## エラーコード一覧

| コード                      | HTTPステータス | 説明                   |
| --------------------------- | -------------- | ---------------------- |
| `BOOK_NOT_FOUND`            | 404            | 書籍が見つからない     |
| `LOAN_NOT_FOUND`            | 404            | 貸出記録が見つからない |
| `BOOK_ALREADY_LOANED`       | 409            | すでに貸出中           |
| `ALREADY_RETURNED`          | 409            | すでに返却済み         |
| `CANNOT_DELETE_ACTIVE_LOAN` | 409            | 未返却の記録削除エラー |
| `VALIDATION_ERROR`          | 400            | バリデーションエラー   |

## ビジネスロジック

### 貸出ステータスの自動判定

```javascript
// 実装ロジック参考
function calculateLoanStatus(loan) {
  if (loan.returnDate !== null) {
    return 'returned';
  }
  const now = new Date();
  const dueDate = new Date(loan.dueDate);
  return now > dueDate ? 'overdue' : 'loaned';
}
```

### 延滞日数の計算

```javascript
function calculateDaysOverdue(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  if (now <= due) return 0;
  return Math.floor((now - due) / (1000 * 60 * 60 * 24));
}
```

## 実装ノート

### トランザクション

- 貸出作成時: Loan作成 + Book.status更新を同一トランザクション
- 返却時: Loan更新 + Book.status更新を同一トランザクション

### 通知機能（将来要件）

- 返却期限3日前にリマインダー
- 延滞発生時に通知

### テスト観点

- 貸出中書籍の重複貸出防止
- 返却済み書籍の再返却エラー
- 延滞判定の正確性
- トランザクションのロールバック
