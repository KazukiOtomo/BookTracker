description: 実装計画テンプレートを用いて設計フェーズ成果物を生成し次工程へ橋渡しする。
scripts:
sh: scripts/bash/setup-plan.sh --json
ps: scripts/powershell/setup-plan.ps1 -Json

---

実装詳細（引数）を基に以下を実行:

1. ルートで `{SCRIPT}` を実行し JSON から `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, `BRANCH` を取得（以後絶対パス運用）。
2. FEATURE_SPEC を解析し: 要件 / ユーザーストーリー / NFR / 成功 & 受入基準 / 制約 / 依存を抽出。
3. `/memory/constitution.md` を読み憲章上の制約・必須原則を反映。
4. `/templates/plan-template.md`（IMPL_PLAN に複製済）を用いメインフロー(1-9)実行:
   - Phase 0: `research.md`
   - Phase 1: `data-model.md`, `contracts/`, `quickstart.md`
   - Phase 2: `tasks.md`
   - 技術コンテキストに {ARGS} を統合。フェーズ完了ごとに進捗更新。ゲート/エラーチェック遵守。
5. 完了検証: 全フェーズ完了 / 生成物存在 / ERROR 非検出。
6. ブランチ / 生成物パス / 生成一覧を報告。

パス解決は常にリポジトリ絶対パスで処理。
