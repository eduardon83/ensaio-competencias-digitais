import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// O tema do Ágora importa o Noto Sans do Google Fonts. As fontes são servidas pelo próprio sítio (@fontsource, em
// src/styles/fontes.css), para nenhuma visita contactar a Google: este plugin retira esse @import do CSS.
const SEM_GOOGLE_FONTS = /@import\s*(?:url\()?\s*["']https:\/\/fonts\.googleapis\.com[^;]*;/g;
function semGoogleFonts(): Plugin {
  return {
    name: "sem-google-fonts",
    enforce: "post",
    transform(codigo, id) {
      if (/\.css($|\?)/.test(id) && codigo.includes("fonts.googleapis.com")) return { code: codigo.replace(SEM_GOOGLE_FONTS, ""), map: null };
    },
    generateBundle(_o, bundle) {
      for (const f of Object.values(bundle)) if (f.type === "asset" && f.fileName.endsWith(".css") && typeof f.source === "string") f.source = f.source.replace(SEM_GOOGLE_FONTS, "");
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), semGoogleFonts()],
  server: { port: 5180, open: false },
  build: { target: "es2022" },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
} as Parameters<typeof defineConfig>[0]);
