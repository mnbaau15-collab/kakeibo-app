import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { categoryColor } from "../categories.js";
import { formatYen, totalsByCategory } from "../utils/aggregate.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * カテゴリ別の円グラフと集計表
 */
export default function CategoryChart({ items }) {
  // 円グラフはマイナス値を描けないため、合計がプラスのカテゴリだけ使う
  const totals = totalsByCategory(items).filter((t) => t.total > 0);
  const grandTotal = totals.reduce((acc, t) => acc + t.total, 0);

  const data = {
    labels: totals.map((t) => t.category),
    datasets: [
      {
        data: totals.map((t) => t.total),
        backgroundColor: totals.map((t) => categoryColor(t.category)),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${formatYen(ctx.parsed)}` },
      },
    },
  };

  return (
    <section className="card">
      <h2>カテゴリ別</h2>
      {totals.length === 0 ? (
        <p className="empty">データがありません。</p>
      ) : (
        <div className="category-layout">
          <div className="pie">
            <Pie data={data} options={options} />
          </div>
          <table className="summary">
            <tbody>
              {totals.map((t) => (
                <tr key={t.category}>
                  <td>
                    <span className="swatch" style={{ background: categoryColor(t.category) }} />
                    {t.category}
                  </td>
                  <td className="num">{formatYen(t.total)}</td>
                  <td className="num muted">{Math.round((t.total / grandTotal) * 100)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>合計</td>
                <td className="num">{formatYen(grandTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
