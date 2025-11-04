description: 自然言語の機能説明から仕様を生成 / 更新しテンプレート構造に整形する。
scripts:
sh: scripts/bash/create-new-feature.sh --json "{ARGS}"
ps: scripts/powershell/create-new-feature.ps1 -Json "{ARGS}"

---

機能説明（引数）を基に以下を実行:

1. リポジトリルートで `{SCRIPT}` を 1 回だけ実行し JSON 出力から `BRANCH_NAME`, `SPEC_FILE` を取得（パスは絶対）。以後は出力を参照し再実行しない。
2. `templates/spec-template.md` を読み必要セクションと順序を把握。
3. SPEC_FILE にテンプレート骨子を適用し、各プレースホルダーを説明内容から導いた具体値で置換（見出し・順序維持）。
4. ブランチ名 / SPEC_FILE の絶対パス / 次フェーズ遷移可否を報告。

注: スクリプトはブランチ作成と空の仕様初期化を行うため重複実行禁止。
