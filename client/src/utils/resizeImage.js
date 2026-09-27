// 長辺の最大ピクセル数（これ以上大きくしても読み取り精度はほぼ変わらない）
const MAX_SIZE = 1568;

/**
 * 画像を縮小してJPEGに変換する
 * スマホ写真はサイズが大きいため、送信前に縮小して通信量とAPI料金を抑える
 * @param {File} file
 * @returns {Promise<Blob>}
 */
export async function resizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("画像の変換に失敗しました"))),
      "image/jpeg",
      0.9
    );
  });
}
