description: 利用可能な設計成果物から依存順序付きで実行可能な tasks.md を生成する。
scripts:
sh: scripts/bash/check-task-prerequisites.sh --json
ps: scripts/powershell/check-task-prerequisites.ps1 -Json

---

コンテキスト（引数）を基に以下を実行:

1. ルートで `{SCRIPT}` を走らせ `FEATURE_DIR`, `AVAILABLE_DOCS` を取得（絶対パス運用）。
2. 利用可能ドキュメント解析:
   - 常: `plan.md`
   - 任意: `data-model.md` / `contracts/` / `research.md` / `quickstart.md`
   - 欠如は許容。存在するもののみ活用。
3. `/templates/tasks-template.md` を基礎に例タスクを実タスクへ置換:
   - セットアップ: 初期化 / 依存 / Lint
   - テスト [P]: コントラクト毎 + 統合シナリオ毎
   - コア: エンティティ / サービス / CLI / エンドポイント
   - 統合: DB / ミドルウェア / ログ / 外部連携
   - 仕上げ [P]: ユニットテスト / 性能 / ドキュメント
4. 生成ルール:
   - コントラクト→テスト[P]
   - エンティティ→モデル作成[P]
   - エンドポイント→実装（共有ファイルは直列）
   - ユーザーストーリー→統合テスト[P]
   - 異ファイル=並列[P], 同ファイル=直列
5. 並べ替え順: セットアップ → テスト → モデル → サービス → エンドポイント → 統合 → 仕上げ。
6. 並列例: 同時可能 [P] をグルーピングし実行コマンド例を提示。
7. `FEATURE_DIR/tasks.md` を生成し以下を含む:
   - 機能名 / 連番 (T001...) / 明確なファイルパス / 依存メモ / 並列ガイダンス

Context: {ARGS}

要件: 各タスクは追加説明不要で LLM が直接実行可能な粒度。
