import { useRef, useState } from "react";
import { resizeImage } from "../utils/resizeImage.js";

/**
 * レシート画像を選択してサーバーに送り、読み取り結果を親に渡す
 */
export default function ReceiptUploader({ onAnalyzed }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setLoading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // 送信前に縮小（JPEGに統一される）
      const image = await resizeImage(file);
      const form = new FormData();
      form.append("image", image, "receipt.jpg");

      const res = await fetch("/api/receipts/analyze", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "読み取りに失敗しました。");
      }
      onAnalyzed(data);
    } catch (err) {
      setError(err.message || "読み取りに失敗しました。");
    } finally {
      setLoading(false);
      // 同じファイルを続けて選んでも反応するようにリセット
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card uploader">
      <h2>レシートを読み込む</h2>
      <label
        className={`dropzone ${loading ? "is-loading" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!loading) handleFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={loading}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {preview && <img src={preview} alt="選択したレシート" className="preview" />}
        <span>
          {loading ? "読み取り中…" : "クリックまたはドラッグ＆ドロップで画像を選択"}
        </span>
      </label>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
