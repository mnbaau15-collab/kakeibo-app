# レシート家計簿

レシート画像をアップロードすると、Claude API が商品名・金額・日付を読み取り、カテゴリ別・月別に集計する家計簿アプリです。

## セットアップ

```bash
npm install
cp server/.env.example server/.env   # ANTHROPIC_API_KEY を設定する
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 構成

- `client/` — React + Vite + Chart.js
- `server/` — Node.js + Express（Claude API の呼び出しはここだけで行う）

登録したデータはブラウザのローカルストレージに保存されます。
