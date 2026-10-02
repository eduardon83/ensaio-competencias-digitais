import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180, open: false },
  build: { target: "es2022" },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
} as Parameters<typeof defineConfig>[0]);
