import { useMemo, useState } from "react";
import ReceiptUploader from "./components/ReceiptUploader.jsx";
import ReceiptList from "./components/ReceiptList.jsx";
import CategoryChart from "./components/CategoryChart.jsx";
import MonthlyChart from "./components/MonthlyChart.jsx";
import { useLocalStorage } from "./utils/useLocalStorage.js";
import { flattenItems, toMonth } from "./utils/aggregate.js";

const ALL_MONTHS = "all";

export default function App() {
  // 登録したレシートはローカルストレージに保存する
  const [receipts, setReceipts] = useLocalStorage("kakeibo.receipts", []);
  const [month, setMonth] = useState(ALL_MONTHS);

  // 読み取り結果をレシートとして追加する
  function addReceipt(result) {
    const receipt = {
      id: crypto.randomUUID(),
      store: result.store,
      date: result.date,
      total: result.total,
      items: result.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
      createdAt: new Date().toISOString(),
    };
    setReceipts((prev) => [receipt, ...prev]);
    // 追加したレシートの月を表示する
    setMonth(toMonth(receipt.date));
  }

  // 指定レシートの商品一覧を書き換える共通処理
  function updateItems(receiptId, update) {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, items: update(r.items) } : r))
    );
  }

  function changeCategory(receiptId, itemId, category) {
    updateItems(receiptId, (items) =>
      items.map((item) => (item.id === itemId ? { ...item, category } : item))
    );
  }

  function deleteItem(receiptId, itemId) {
    updateItems(receiptId, (items) => items.filter((item) => item.id !== itemId));
  }

  function deleteReceipt(receiptId) {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
  }

  // 月の選択肢（新しい月が上）
  const monthOptions = useMemo(
    () => [...new Set(receipts.map((r) => toMonth(r.date)))].sort().reverse(),
    [receipts]
  );

  // 選択中の月のレシート（日付の新しい順）
  const visibleReceipts = useMemo(
    () =>
      receipts
        .filter((r) => month === ALL_MONTHS || toMonth(r.date) === month)
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [receipts, month]
  );

  const allItems = useMemo(() => flattenItems(receipts), [receipts]);
  const visibleItems = useMemo(() => flattenItems(visibleReceipts), [visibleReceipts]);

  return (
    <div className="app">
      <header>
        <h1>レシート家計簿</h1>
        <label className="month-filter">
          表示する月
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value={ALL_MONTHS}>すべて</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main>
        <ReceiptUploader onAnalyzed={addReceipt} />
        <div className="charts">
          <CategoryChart items={visibleItems} />
          {/* 月別グラフは月の絞り込みに関係なく全期間を表示 */}
          <MonthlyChart items={allItems} />
        </div>
        <ReceiptList
          receipts={visibleReceipts}
          onChangeCategory={changeCategory}
          onDeleteItem={deleteItem}
          onDeleteReceipt={deleteReceipt}
        />
      </main>
    </div>
  );
}
