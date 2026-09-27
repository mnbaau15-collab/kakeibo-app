import { CATEGORY_NAMES, categoryColor } from "../categories.js";
import { formatYen } from "../utils/aggregate.js";
import { formatDateTime, validateReceipt } from "../utils/validate.js";

/**
 * 登録済みレシートの商品一覧（カテゴリの変更・削除ができる）
 * allReceipts は重複チェック用（月で絞り込む前の全レシート）
 */
export default function ReceiptList({
  receipts,
  allReceipts,
  onChangeCategory,
  onDeleteItem,
  onDeleteReceipt,
}) {
  if (receipts.length === 0) {
    return (
      <section className="card">
        <h2>明細</h2>
        <p className="empty">まだレシートが登録されていません。</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>明細</h2>
      {receipts.map((receipt) => {
        const sum = receipt.items.reduce((acc, item) => acc + item.price, 0);
        const warnings = validateReceipt(receipt, allReceipts);
        return (
          <div key={receipt.id} className="receipt">
            <div className="receipt-header">
              <div>
                <strong>{receipt.store || "店名不明"}</strong>
                <span className="muted">{formatDateTime(receipt)}</span>
              </div>
              <div className="receipt-actions">
                <span className="amount">{formatYen(sum)}</span>
                <button
                  className="link danger"
                  onClick={() => {
                    if (confirm("このレシートを削除しますか？")) onDeleteReceipt(receipt.id);
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            {/* マイナス金額・重複・合計の不一致などの警告 */}
            {warnings.length > 0 && (
              <ul className="warnings">
                {warnings.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
            <table className="items">
              <thead>
                <tr>
                  <th>商品名</th>
                  <th>カテゴリ</th>
                  <th className="num">金額</th>
                  <th aria-label="操作"></th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={item.id} className={item.price < 0 ? "negative" : undefined}>
                    <td>{item.name}</td>
                    <td>
                      <select
                        value={item.category}
                        style={{ borderLeftColor: categoryColor(item.category) }}
                        onChange={(e) => onChangeCategory(receipt.id, item.id, e.target.value)}
                      >
                        {CATEGORY_NAMES.map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="num">{formatYen(item.price)}</td>
                    <td>
                      <button
                        className="link"
                        aria-label={`${item.name}を削除`}
                        onClick={() => onDeleteItem(receipt.id, item.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </section>
  );
}
