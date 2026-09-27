import { CATEGORY_NAMES } from "../categories.js";

// 日付（YYYY-MM-DD）から月（YYYY-MM）を取り出す
export function toMonth(date) {
  return date ? date.slice(0, 7) : "日付不明";
}

// 金額を「¥1,234」形式にする
export function formatYen(value) {
  return `¥${value.toLocaleString("ja-JP")}`;
}

// レシート一覧を、日付・店名付きの商品一覧に平坦化する
export function flattenItems(receipts) {
  return receipts.flatMap((receipt) =>
    receipt.items.map((item) => ({
      ...item,
      receiptId: receipt.id,
      date: receipt.date,
      store: receipt.store,
    }))
  );
}

// カテゴリ別の合計金額（カテゴリの定義順、金額0のカテゴリは除く）
export function totalsByCategory(items) {
  const totals = Object.fromEntries(CATEGORY_NAMES.map((name) => [name, 0]));
  for (const item of items) {
    totals[item.category] = (totals[item.category] ?? 0) + item.price;
  }
  return Object.entries(totals)
    .filter(([, total]) => total !== 0)
    .map(([category, total]) => ({ category, total }));
}

// 月別・カテゴリ別の合計金額（月の昇順）
export function totalsByMonth(items) {
  const months = {};
  for (const item of items) {
    const month = toMonth(item.date);
    months[month] ??= {};
    months[month][item.category] = (months[month][item.category] ?? 0) + item.price;
  }
  return Object.keys(months)
    .sort()
    .map((month) => ({ month, byCategory: months[month] }));
}
