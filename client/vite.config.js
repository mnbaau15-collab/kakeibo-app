import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 開発時は /api へのリクエストをNode.jsサーバーへ転送する
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
