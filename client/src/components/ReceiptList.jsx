import { CATEGORY_NAMES, categoryColor } from "../categories.js";
import { formatYen } from "../utils/aggregate.js";

/**
 * 登録済みレシートの商品一覧（カテゴリの変更・削除ができる）
 */
export default function ReceiptList({ receipts, onChangeCategory, onDeleteItem, onDeleteReceipt }) {
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
        return (
          <div key={receipt.id} className="receipt">
            <div className="receipt-header">
              <div>
                <strong>{receipt.store || "店名不明"}</strong>
                <span className="muted">{receipt.date || "日付不明"}</span>
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
            {/* 商品の合計とレシートの合計が合わない場合は注意を出す */}
            {receipt.total != null && receipt.total !== sum && (
              <p className="warning">
                レシートの合計（{formatYen(receipt.total)}）と明細の合計が一致しません。
              </p>
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
                  <tr key={item.id}>
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
