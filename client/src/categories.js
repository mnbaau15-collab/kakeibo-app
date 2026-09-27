// カテゴリ一覧とグラフの表示色（server/src/categories.js と同じ並び）
export const CATEGORIES = [
  { name: "食費", color: "#4e9f6e" },
  { name: "外食", color: "#e07a3f" },
  { name: "日用品", color: "#4a80c8" },
  { name: "飲料・嗜好品", color: "#b5873a" },
  { name: "医療・健康", color: "#d0506a" },
  { name: "衣服・美容", color: "#9a62c4" },
  { name: "交通費", color: "#3aa6b0" },
  { name: "趣味・娯楽", color: "#c9a227" },
  { name: "その他", color: "#8a8f98" },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

// カテゴリ名から色を取得する
export function categoryColor(name) {
  return CATEGORIES.find((c) => c.name === name)?.color ?? "#8a8f98";
}
