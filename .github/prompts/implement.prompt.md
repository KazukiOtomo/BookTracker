description: tasks.md のタスク計画に従い実装を段階的に遂行し完了検証する。
scripts:
sh: scripts/bash/check-implementation-prerequisites.sh --json
ps: scripts/powershell/check-implementation-prerequisites.ps1 -Json

---

次を順に実行:

1. ルートで `{SCRIPT}` を走らせ `FEATURE_DIR`, `AVAILABLE_DOCS` を取得（絶対パス運用）。
2. コンテキスト読込:
   - 必須: `tasks.md`, `plan.md`
   - 任意: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`
3. `tasks.md` を解析し: フェーズ / 依存 / タスクID / 説明 / ファイルパス / 並列マーカー[P] を抽出。
4. 計画通り実行:
   - フェーズ順守（全完了→次）
   - 共有ファイルは直列 / 独立は [P] 並列
   - TDD: テストタスク→実装タスク
   - フェーズ境界で検証チェック
5. 実行指針:
   - Setup → Tests → Core(Model/Service/Endpoint) → Integration(DB/MW/Logging/External) → Polish(性能/Doc/追加テスト)
6. 進捗 & エラー:
   - 各タスク完了後進捗更新
   - 非並列タスク失敗で停止
   - 並列は成功分継続し失敗詳細を収集
   - 原因 / 次アクションを明確化
   - 完了タスクは `tasks.md` を [X] に更新
7. 完了検証:
   - 全タスク [X]
   - 仕様整合 / テスト合格 / カバレッジ基準達成
   - 設計逸脱なし
   - 最終サマリー報告

注: タスク分解が不十分なら `/tasks` の再生成を推奨して中断。
