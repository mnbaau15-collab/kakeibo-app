import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CATEGORIES } from "../categories.js";
import { formatYen, totalsByMonth } from "../utils/aggregate.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * 月別の支出棒グラフ（カテゴリごとの積み上げ）
 */
export default function MonthlyChart({ items }) {
  const months = totalsByMonth(items);

  // 1件でも使われているカテゴリだけを系列にする
  const datasets = CATEGORIES.filter((c) => months.some((m) => m.byCategory[c.name])).map(
    (c) => ({
      label: c.name,
      data: months.map((m) => m.byCategory[c.name] ?? 0),
      backgroundColor: c.color,
      stack: "total",
    })
  );

  const data = { labels: months.map((m) => m.month), datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: { stacked: true, ticks: { callback: (value) => formatYen(value) } },
    },
    plugins: {
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatYen(ctx.parsed.y)}` },
      },
    },
  };

  return (
    <section className="card">
      <h2>月別の支出</h2>
      {months.length === 0 ? (
        <p className="empty">データがありません。</p>
      ) : (
        <div className="bar">
          <Bar data={data} options={options} />
        </div>
      )}
    </section>
  );
}
