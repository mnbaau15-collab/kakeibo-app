# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code 向けのガイドです。

## プロジェクト概要

- アプリ名: kakeibo-app（家計簿アプリ）
- 目的: レシート画像を Claude API で読み取り、支出をカテゴリ別・月別に集計・可視化する

## 技術スタック

- npm workspaces 構成
  - `client/`: React + Vite、グラフは Chart.js（react-chartjs-2）
  - `server/`: Node.js + Express、`@anthropic-ai/sdk` で Claude API を呼ぶ
- モデル: `claude-haiku-4-5`（[server/src/analyzeReceipt.js](server/src/analyzeReceipt.js)）
- APIキーは `server/.env` の `ANTHROPIC_API_KEY`。ブラウザから直接 Claude API を呼ばない
- データはブラウザのローカルストレージ（キー: `kakeibo.receipts`）に保存

## よく使うコマンド

- `npm install` — 依存パッケージのインストール（ルートで実行）
- `npm run dev` — サーバー（:3001）とフロント（:5173）を同時起動
- `npm run build` — フロントエンドをビルド
- `npm start` — ビルド済みフロントをサーバーから配信（:3001）

## 注意点

- カテゴリ一覧は `server/src/categories.js` と `client/src/categories.js` の2か所にある。変更時は両方そろえる

## コーディング規約

- 既存コードの命名・書き方・コメント量に合わせる
- 金額は浮動小数点ではなく整数（円単位）で扱う
- ユーザー向けの文言は日本語で記述する

## Git 運用ルール

- **コードを変更するたびに、コミットして GitHub にプッシュすること。**
  - 変更がひとまとまり完了したら、その都度 `git add` → `git commit` → `git push` まで行う
  - 変更を未プッシュのまま作業を終えない
- コミットメッセージは変更内容が分かるように簡潔に書く（日本語可）
  - 例: `支出入力フォームにカテゴリ選択を追加`
- プッシュ前に、テストや Lint がある場合は実行して通ることを確認する
- 秘密情報（API キー、`.env` など）はコミットしない。必要に応じて `.gitignore` に追加する
- `git push --force` や履歴の書き換えは、ユーザーの明示的な指示がない限り行わない
