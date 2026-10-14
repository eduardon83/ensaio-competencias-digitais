// ─── Aldeia Digital · percurso dos prémios e de uma missão de cidadania ─────
// Uso: npm run dev e depois  node scripts/aldeia/percurso-premios.mjs [URL] [pasta]
// Só no modo local (sem Worker): cria a turma, entra, salta o tutorial, marca o capítulo 0 como feito diretamente no
// armazém local (atalho de teste), escolhe o prémio, faz a missão de cidadania do capítulo 1 e abre o painel.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5180";
const PASTA = process.argv[3] ?? "capturas-aldeia";
mkdirSync(PASTA, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}
const erros = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
await ctx.addInitScript(() => {
  if (!localStorage.getItem("ecd.preferencias.v1")) localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: "mosaico", tema: "claro", telemetria: false, calmo: true }));
});
const page = await ctx.newPage();
page.on("pageerror", (e) => erros.push(e.message));
page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && erros.push(m.text()));
const foto = (n) => page.screenshot({ path: `${PASTA}/premios-${n}.png` });

await page.goto(`${BASE}/professor`);
await page.getByRole("radio", { name: /Aldeia Digital/ }).click();
await page.getByLabel(/Li e aceito/).check();
await page.getByRole("button", { name: "Criar a aldeia" }).click();
await page.getByText("A sua aldeia está pronta").waitFor();
const codigo = (await page.locator(".text-5xl").first().innerText()).replace(/[^A-Z0-9]/g, "");
const professor = (await page.locator(".text-3xl.font-extrabold").first().innerText()).trim();
await page.goto(`${BASE}/aldeia/${codigo}`);
await page.locator("label.aldeia-escolha").first().click();
await page.getByRole("button", { name: "Seguinte" }).click();
await page.getByRole("button", { name: "Seguinte" }).click();
for (let k = 0; k < 3; k++) await page.getByRole("button", { name: /Abrir o ovo|Toca no ovo/ }).click();
await page.getByRole("button", { name: "Continuar" }).click();
await page.getByRole("button", { name: "Está pronto" }).click();
await page.getByRole("button", { name: "Já guardei" }).click();
await page.getByRole("button", { name: "Saltar tutorial" }).click();
await page.waitForTimeout(800);

// Atalho de teste: o capítulo 0 (prática do Painel) feito com 90 pontos.
await page.evaluate((c) => {
  const k = Object.keys(localStorage).find((x) => x.startsWith(`ecd.aldeia.local.t.${c}.aluno:`));
  const a = JSON.parse(localStorage.getItem(k));
  const agora = new Date().toISOString();
  a.progresso.pratica = { primeira: 70, melhor: 90, ultima: 90, tentativas: 2, duracaoMs: 60000, primeiraEm: agora, em: agora };
  localStorage.setItem(k, JSON.stringify(a));
  localStorage.removeItem(`ecd.aldeia.vista.${c}`);
}, codigo);
await page.reload();
await page.getByText("Escolhe o teu prémio").first().waitFor();
await foto("01-escolher");
await page.locator(".aldeia-premio").first().click();
await page.getByRole("button", { name: "Vestir agora" }).waitFor();
await foto("02-ganhou");
await page.getByRole("button", { name: "Vestir agora" }).click();
await page.getByText("Capítulo concluído").first().waitFor();
await foto("03-capitulo");
await page.getByRole("button", { name: "Continuar" }).click();
await page.waitForTimeout(500);
await foto("04-abertura-c1");

// Missão de cidadania do capítulo 1
await page.goto(`${BASE}/aldeia/${codigo}/missao/cid-direitos-online`);
await page.getByRole("button", { name: "Começar", exact: true }).click();
for (let k = 0; k < 3; k++) {
  await page.getByRole("radio").first().check({ force: true });
  await page.getByRole("button", { name: "Escolher" }).click();
  if (k === 0) await foto("05-situacao");
  await page.getByRole("button", { name: k < 2 ? "Continuar" : "Terminar" }).click();
}
await page.waitForTimeout(800);
await foto("06-resultado");
await page.getByRole("button", { name: "Voltar à aldeia" }).click();
await page.waitForTimeout(1500);
await foto("07-depois");

await page.goto(`${BASE}/professor/aldeia/painel`);
if (await page.getByLabel("Código do professor").count()) {
  await page.getByLabel("Código do professor").fill(professor);
  await page.getByRole("button", { name: "Entrar no painel" }).click();
}
await page.getByText("Feito e por fazer").waitFor();
await page.getByText("Feito e por fazer").scrollIntoViewIfNeeded();
await foto("08-painel-grelha");
await page.locator(".aluno-linha").first().click();
await page.waitForTimeout(400);
await foto("09-gaveta");
await page.keyboard.press("Escape");
await page.getByRole("tab", { name: "Relatórios" }).click();
await page.waitForTimeout(400);
await foto("10-relatorios");
await browser.close();
if (erros.length) {
  console.error(erros.join("\n"));
  process.exit(1);
}
console.log("ok");
