// ─── Capturas dos ecrãs do ECD tocados pelo novo desenho (para a produção de vídeo) ──
// Uso: npm run dev e depois  node scripts/aldeia/capturas-ecd.mjs [URL] [pasta]
// Briefing, resultado e relógio das atividades, um jogo, a página Professor com os dois modos e o tutorial.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5180";
const PASTA = process.argv[3] ?? "capturas-ecd";
mkdirSync(PASTA, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}
for (const [formato, tema, w, h] of [["mosaico", "claro", 1280, 860], ["mosaico", "escuro", 390, 844], ["original", "claro", 1280, 860]]) {
  const nome = `${formato}-${tema}-${w}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(([f, t]) => {
    localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: f, tema: t, telemetria: false }));
    localStorage.setItem("ecd.tutorial.visto.v1", "1");
  }, [formato, tema]);
  const p = await ctx.newPage();
  const foto = (n) => p.screenshot({ path: `${PASTA}/ecd-${nome}-${n}.png`, fullPage: n.startsWith("professor") || n.startsWith("tutorial") });
  await p.goto(`${BASE}/professor`);
  await p.waitForTimeout(600);
  await foto("professor-modos");
  await p.goto(`${BASE}/atividades/noticia/2`);
  await p.waitForTimeout(1200);
  await foto("briefing-desafio");
  await p.goto(`${BASE}/jogos/leitura/2`);
  await p.waitForTimeout(1200);
  await foto("briefing-jogo");
  await p.goto(`${BASE}/seguranca/fraude/teste/2`);
  await p.waitForTimeout(1200);
  await foto("briefing-seguranca");
  await p.goto(`${BASE}/atividades/fecho/2`);
  await p.getByRole("button", { name: "Começar", exact: true }).click();
  await p.waitForTimeout(500);
  await p.getByRole("button", { name: "Começar" }).first().click().catch(() => {});
  await p.waitForTimeout(1200);
  await foto("relogio-personagem");
  await p.goto(`${BASE}/atividades/revisao/2`);
  await p.getByRole("button", { name: "Começar", exact: true }).click();
  await p.waitForTimeout(500);
  await p.locator('section[aria-label="Cópia digital"] button.palavra').first().click().catch(() => {});
  await p.getByRole("button", { name: "Terminei" }).click().catch(() => {});
  await p.waitForTimeout(1800);
  await foto("resultado");
  await p.goto(`${BASE}/tutorial`);
  for (let k = 0; k < 8; k++) {
    await p.waitForTimeout(300);
    await foto(`tutorial-${k + 1}`);
    await p.getByRole("button", { name: "Seguinte" }).click().catch(() => {});
  }
  await ctx.close();
}
await browser.close();
console.log(`Capturas em ${PASTA}/`);
