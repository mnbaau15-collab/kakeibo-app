import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CATEGORIES } from "./categories.js";

// 使用モデル：Claude Haiku の最新バージョン
const MODEL = "claude-haiku-4-5";

// APIキーは環境変数 ANTHROPIC_API_KEY から自動で読み込まれる
const client = new Anthropic();

// Claudeに返してもらうJSONの形（構造化出力のスキーマ）
const ReceiptSchema = z.object({
  is_receipt: z.boolean().describe("画像がレシート・領収書として読み取れる場合はtrue"),
  store: z.string().describe("店名。読み取れない場合は空文字"),
  date: z.string().describe("購入日（YYYY-MM-DD形式）。読み取れない場合は空文字"),
  time: z.string().describe("購入時刻（24時間表記のHH:MM形式）。読み取れない場合は空文字"),
  items: z.array(
    z.object({
      name: z.string().describe("商品名"),
      price: z.number().int().describe("税込の金額（円、整数）。値引きはマイナス"),
      category: z.enum(CATEGORIES).describe("商品のカテゴリ"),
    })
  ),
  total: z.number().int().describe("レシートの合計金額（円、整数）"),
});

const INSTRUCTIONS = `この画像は日本のレシートです。内容を読み取り、指定のJSON形式で返してください。

- items には購入した商品を1行ずつ入れてください。小計・合計・お預かり・お釣り・ポイントの行は含めないでください。
- 値引き・割引の行は、金額をマイナスにして1つの項目として入れてください。
- 外税表記で「消費税」の行が別にある場合は、それも1つの項目（name: "消費税"）として入れ、カテゴリは最も金額の大きい商品と同じにしてください。
- 金額はすべて円単位の整数にしてください。
- 日付が和暦（令和など）の場合は西暦に変換してください。
- カテゴリは次の中から最も適切なものを選んでください：${CATEGORIES.join("、")}。
  スーパーで買った食材は「食費」、飲食店での飲食は「外食」、洗剤やティッシュなどは「日用品」としてください。
- レシートでない画像の場合は is_receipt を false にし、items は空配列にしてください。`;

/**
 * レシート画像をClaudeに送り、商品・金額・日付・カテゴリを読み取る
 * @param {Buffer} imageBuffer 画像データ
 * @param {string} mediaType 画像のMIMEタイプ（image/jpeg など）
 */
export async function analyzeReceipt(imageBuffer, mediaType) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBuffer.toString("base64"),
            },
          },
          { type: "text", text: INSTRUCTIONS },
        ],
      },
    ],
    output_config: {
      format: zodOutputFormat(ReceiptSchema),
    },
  });

  // 途中で打ち切られた・拒否された場合は結果を信用しない
  if (response.stop_reason === "max_tokens") {
    throw new ReceiptError("レシートの項目が多すぎて読み取りきれませんでした。");
  }
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new ReceiptError("レシートを読み取れませんでした。別の画像でお試しください。");
  }

  const result = response.parsed_output;
  if (!result.is_receipt) {
    throw new ReceiptError("レシートの画像ではないようです。");
  }
  return result;
}

// ユーザーにそのまま表示してよいエラー
export class ReceiptError extends Error {}
