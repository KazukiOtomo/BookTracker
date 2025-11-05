# 実装計画書

**プロジェクト**: BookTracker - 動画ベース蔵書管理システム  
**作成日**: 2025-11-05  
**ステータス**: Phase 1完了

---

## 実装フェーズ

### Phase 0: 技術調査と設計 ✅

**完了成果物**:

- `research.md`: 技術スタック選定、アーキテクチャ設計、リスク分析

**主要な決定事項**:

- バックエンド: Node.js + Express
- データベース: SQLite（開発）→ PostgreSQL（本番）
- OCR: Tesseract.js
- 動画処理: FFmpeg（fluent-ffmpeg）
- ORM: Prisma

---

### Phase 1: データモデルとAPI設計 ✅

**完了成果物**:

- `data-model.md`: 4エンティティの詳細設計（Book, Loan, VideoProcessing, OcrResult）
- `contracts/video-api.md`: 動画処理APIの仕様
- `contracts/book-api.md`: 書籍管理APIの仕様
- `contracts/loan-api.md`: 貸出管理APIの仕様
- `quickstart.md`: 統合テストシナリオとセットアップ手順

**主要な設計**:

- RESTful API設計（12エンドポイント）
- Prismaスキーマ定義
- エラーハンドリング戦略
- トランザクション設計

---

### Phase 2: タスク分解と実装準備 🔄

**次のステップ**: タスクリストを生成

**予定される成果物**:

- `tasks.md`: 実装可能な粒度のタスク一覧
- 依存関係の明確化
- 並列実行可能なタスクの特定

---

## 実装優先順位

### 優先度: 高（MVP必須）

1. **データベースセットアップ**
   - Prismaスキーマ実装
   - マイグレーション作成
   - シーディングスクリプト

2. **書籍管理機能**
   - Book CRUD API実装
   - 検索機能
   - バリデーション

3. **貸出管理機能**
   - Loan CRUD API実装
   - 貸出・返却ロジック
   - 延滞判定

4. **動画処理基盤**
   - ファイルアップロード
   - FFmpegによるフレーム抽出
   - 処理状況管理

5. **OCR機能**
   - Tesseract.js統合
   - 結果保存
   - 信頼度フィルタリング

### 優先度: 中（機能拡張）

6. **API統合テスト**
   - Supertestによるエンドポイントテスト
   - テストデータ生成

7. **エラーハンドリング**
   - グローバルエラーハンドラー
   - カスタムエラークラス
   - ロギング

### 優先度: 低（将来機能）

8. **認証・認可**
9. **通知機能**
10. **フロントエンド実装**

---

## 技術的な実装順序

### 1. プロジェクト初期化

```bash
# 依存関係
- express
- @prisma/client
- prisma (dev)
- fluent-ffmpeg
- tesseract.js
- multer
- joi
- jest, supertest (dev)
```

### 2. ディレクトリ構造

```
src/
├── config/
│   ├── database.js
│   └── upload.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── services/
│   ├── video.service.js
│   ├── ocr.service.js
│   ├── book.service.js
│   └── loan.service.js
├── routes/
│   ├── video.routes.js
│   ├── book.routes.js
│   └── loan.routes.js
├── middleware/
│   ├── error.middleware.js
│   ├── validation.middleware.js
│   └── upload.middleware.js
├── utils/
│   ├── logger.js
│   └── helpers.js
├── app.js
└── server.js
```

### 3. 実装順序（推奨）

**Week 1: 基盤構築**

- Day 1-2: プロジェクト初期化、Prismaセットアップ
- Day 3-4: Book APIの実装
- Day 5: Bookテストの作成

**Week 2: 貸出管理**

- Day 1-2: Loan APIの実装
- Day 3: Loanテストの作成
- Day 4-5: 延滞ロジックと統合テスト

**Week 3-4: 動画処理とOCR**

- Day 1-2: ファイルアップロードとFFmpeg統合
- Day 3-4: Tesseract.js統合とOCR実装
- Day 5-7: 動画処理ワークフローの統合
- Day 8-10: E2Eテストとバグ修正

---

## テスト戦略

### 単体テスト（Jest）

**対象**:

- 各サービスクラスのメソッド
- ユーティリティ関数
- ビジネスロジック

**カバレッジ目標**: 70%以上

### 統合テスト（Supertest）

**対象**:

- 全APIエンドポイント
- データベース連携
- トランザクション動作

**シナリオ**:

- 正常系: CRUD操作
- 異常系: バリデーションエラー、重複エラー
- エッジケース: 境界値テスト

### E2Eテスト

**主要シナリオ**:

1. 動画アップロード → OCR → 書籍登録
2. 書籍検索 → 貸出 → 返却
3. 延滞書籍の検出と管理

---

## リスクと対応策

### リスク1: OCR精度の課題

**対応**:

- 画像前処理の実装（コントラスト調整、ノイズ除去）
- ユーザー確認UIの充実
- 複数フレームでの認識結果マージ

**期限**: Week 3終了時点で精度評価

### リスク2: 動画処理のパフォーマンス

**対応**:

- 非同期ジョブキュー導入（Bullなど）
- フレーム抽出間隔の最適化
- 処理タイムアウトの設定

**期限**: Week 4で負荷テスト実施

### リスク3: スケジュール遅延

**対応**:

- MVP機能に注力（認証・通知は後回し）
- 週次レビューで進捗確認
- 問題発生時は即座にエスカレーション

---

## 完了基準

### Phase 2完了基準

- [ ] すべてのタスクがTasksファイルに記載されている
- [ ] 依存関係が明確
- [ ] 各タスクが1-2日で完了可能な粒度

### MVP完了基準

- [ ] 全APIエンドポイントが実装済み
- [ ] 単体テストカバレッジ70%以上
- [ ] 統合テスト（主要シナリオ3つ）がパス
- [ ] 動画→OCR→登録のE2Eが動作
- [ ] エラーハンドリングが適切
- [ ] README とAPI ドキュメント整備

### 本番リリース基準

- [ ] パフォーマンステスト完了（動画処理時間）
- [ ] セキュリティレビュー完了
- [ ] データバックアップ機能実装
- [ ] ロギングとモニタリング設定

---

## 次のアクション

1. **即座に実行**: `/tasks` コマンドでタスク分解を生成
2. **環境準備**: 開発環境のセットアップ（Node.js, FFmpeg, Tesseract）
3. **ブランチ戦略**: feature/video, feature/book, feature/loan などの作成
4. **CI/CD**: GitHub Actionsの設定を拡張

---

## 参照ドキュメント

- [機能仕様書](../video-book-management.md)
- [憲章](../../memory/constitution.md)
- [技術調査](./research.md)
- [データモデル](./data-model.md)
- [API契約](./contracts/)
- [クイックスタート](./quickstart.md)

---

**承認者**: _未定_  
**最終更新**: 2025-11-05
