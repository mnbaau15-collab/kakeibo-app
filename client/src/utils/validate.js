import { formatYen } from "./aggregate.js";

// レシートの合計金額（読み取った合計がなければ明細の合計を使う）
export function receiptTotal(receipt) {
  return receipt.total ?? receipt.items.reduce((acc, item) => acc + item.price, 0);
}

// 金額がマイナスの商品を返す
export function findNegativeItems(receipt) {
  return receipt.items.filter((item) => item.price < 0);
}

// 日時・合計金額が同じレシートかどうか
// 時刻はどちらかが読み取れていない場合は比較しない（日付と合計金額で判定）
function isSameReceipt(a, b) {
  if (!a.date || a.date !== b.date) return false;
  if (a.time && b.time && a.time !== b.time) return false;
  return receiptTotal(a) === receiptTotal(b);
}

// 登録済みレシートの中から重複しているものを探す（自分自身は除く）
export function findDuplicate(receipt, receipts) {
  return receipts.find((other) => other.id !== receipt.id && isSameReceipt(receipt, other));
}

/**
 * レシートの警告メッセージ一覧を返す
 * @param {object} receipt 検証するレシート
 * @param {object[]} receipts 登録済みのレシート一覧（重複チェック用）
 */
export function validateReceipt(receipt, receipts) {
  const warnings = [];

  const negatives = findNegativeItems(receipt);
  if (negatives.length > 0) {
    const names = negatives.map((item) => `${item.name}（${formatYen(item.price)}）`).join("、");
    warnings.push(`金額がマイナスの項目があります：${names}。値引き以外の場合は読み取りミスの可能性があります。`);
  }
  if (receiptTotal(receipt) < 0) {
    warnings.push("合計金額がマイナスになっています。");
  }

  const duplicate = findDuplicate(receipt, receipts);
  if (duplicate) {
    warnings.push(
      `同じ日時・合計金額のレシートが既に登録されています（${formatDateTime(duplicate)}・${
        duplicate.store || "店名不明"
      }・${formatYen(receiptTotal(duplicate))}）。`
    );
  }

  // 読み取った合計と明細の合計が合わない場合
  const itemSum = receipt.items.reduce((acc, item) => acc + item.price, 0);
  if (receipt.total != null && receipt.total !== itemSum) {
    warnings.push(`レシートの合計（${formatYen(receipt.total)}）と明細の合計が一致しません。`);
  }

  return warnings;
}

// 「2026-09-27 14:05」形式の日時表示
export function formatDateTime(receipt) {
  if (!receipt.date) return "日付不明";
  return receipt.time ? `${receipt.date} ${receipt.time}` : receipt.date;
}
