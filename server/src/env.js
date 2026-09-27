import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// server ディレクトリの絶対パス
export const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// server/.env → プロジェクト直下の .env の順に環境変数を読み込む（先に見つかった値が優先）
// 他のモジュールより先に import して、Anthropicクライアント生成前に読み込ませること
dotenv.config({
  path: [path.join(serverDir, ".env"), path.join(serverDir, "../.env")],
  quiet: true,
});
