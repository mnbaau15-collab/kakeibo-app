import { useEffect, useState } from "react";

/**
 * ローカルストレージと同期するstate
 * リロードしても値が残るように、変更のたびに保存する
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      // 保存データが壊れている・ストレージが使えない場合は初期値で始める
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("ローカルストレージへの保存に失敗しました", err);
    }
  }, [key, value]);

  return [value, setValue];
}
