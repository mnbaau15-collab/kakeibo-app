// 環境変数の読み込みは最初に行う
import { serverDir } from "./env.js";
import path from "node:path";
import express from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeReceipt, ReceiptError } from "./analyzeReceipt.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY が設定されていません。.env を作成してください。");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Claude APIが受け付ける画像形式
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// アップロード画像はディスクに保存せず、メモリ上で扱う（上限5MB）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// レシート画像を受け取り、読み取り結果を返すAPI
app.post("/api/receipts/analyze", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "画像ファイルを選択してください。" });
  }
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "JPEG・PNG・WebP・GIF形式の画像を選択してください。" });
  }

  try {
    const result = await analyzeReceipt(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (err) {
    if (err instanceof ReceiptError) {
      return res.status(422).json({ error: err.message });
    }
    // Claude APIのエラーは種類ごとにメッセージを分ける
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "混み合っています。少し待ってから再度お試しください。" });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("APIキーが無効です:", err.message);
      return res.status(500).json({ error: "サーバーの設定に問題があります。" });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude APIエラー:", err.status, err.message);
      return res.status(502).json({ error: "読み取りサービスでエラーが発生しました。" });
    }
    console.error(err);
    res.status(500).json({ error: "予期しないエラーが発生しました。" });
  }
});

// ファイルサイズ超過などアップロード時のエラー
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "画像サイズは5MB以下にしてください。" });
  }
  next(err);
});

// 本番用：ビルド済みのフロントエンドを配信する
const clientDist = path.join(serverDir, "../client/dist");
app.use(express.static(clientDist));

app.listen(PORT, () => {
  console.log(`APIサーバー起動: http://localhost:${PORT}`);
});
