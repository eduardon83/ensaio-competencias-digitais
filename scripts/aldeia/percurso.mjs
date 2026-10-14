// ─── Aldeia Digital · percurso de verificação no navegador (Playwright) ─────
// Uso: npm run dev (noutro terminal) e depois  node scripts/aldeia/percurso.mjs [URL] [pasta]
// Cria uma turma (modo local sem Worker), entra como aluno, faz o nascimento, a personalização, o tutorial,
// abre a aldeia, o Mapa em lista, o guarda-roupa, a casa, uma missão e o painel do professor.
// Guarda capturas (desktop 1280 e telemóvel 390, claro e escuro) e falha se houver erros na consola.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
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
const violacoes = [];

async function percurso(nome, viewport, tema) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  await ctx.addInitScript(([t]) => {
    if (!localStorage.getItem("ecd.preferencias.v1")) localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: "mosaico", tema: t, telemetria: false }));
    localStorage.setItem("ecd.tutorial.visto.v1", "1");
  }, [tema]);
  const page = await ctx.newPage();
  // Sem Worker (npm run dev) a API responde 404: esperado. Tudo o resto (imagens em falta) é erro.
  page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && erros.push(`${nome}: ${m.text()}`));
  page.on("response", (r) => r.status() >= 400 && !new URL(r.url()).pathname.startsWith("/api/") && erros.push(`${nome}: ${r.status()} ${new URL(r.url()).pathname}`));
  page.on("pageerror", (e) => erros.push(`${nome}: ${e.message}`));
  // Cada captura passa também pelo axe-core (WCAG 2.2 AA).
  const foto = async (n) => {
    await page.screenshot({ path: `${PASTA}/${nome}-${n}.png` });
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of r.violations) violacoes.push(`${nome}-${n}: ${v.id} (${v.impact}) ${v.nodes.length}× · ${v.nodes[0]?.target.join(" ")} · ${v.nodes[0]?.failureSummary?.split("\n")[1] ?? ""}`);
  };

  // Professor: escolher a Aldeia Digital e criar a turma
  await page.goto(`${BASE}/professor`);
  await page.getByRole("radio", { name: /Aldeia Digital/ }).click();
  await page.waitForTimeout(600);
  await foto("01-professor");
  await page.getByLabel("Nome da turma").fill("5.º B");
  await page.getByLabel(/Li e aceito/).check();
  await page.getByRole("button", { name: "Criar a aldeia" }).click();
  await page.getByText("A sua aldeia está pronta").waitFor();
  await foto("02-criada");
  const codigo = (await page.locator(".text-5xl").first().innerText()).replace(/[^A-Z0-9]/g, "");
  const professor = (await page.locator(".text-3xl.font-extrabold").first().innerText()).trim();

  // Aluno
  await page.goto(`${BASE}/aldeia/${codigo}`);
  await page.getByText("Escolhe um nome").waitFor();
  await foto("03-nome");
  await page.locator("label.aldeia-escolha").first().click();
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByText("Escolhe o teu fato").first().waitFor();
  await foto("04-fato");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.waitForTimeout(3200);
  await foto("05-nascimento");
  for (let k = 0; k < 3; k++) {
    await page.getByRole("button", { name: /Toca no ovo|Abrir o ovo/ }).click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(2600);
  await foto("06-nasceu");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Como é o teu avatar?").first().waitFor();
  await page.getByText("Caracóis").click();
  await foto("07-personalizar");
  await page.getByRole("button", { name: "Está pronto" }).click();
  await foto("08-guarda-nome");
  await page.getByRole("button", { name: "Já guardei" }).click();
  await page.waitForTimeout(2500);
  await foto("09-tutorial-1");
  for (let k = 0; k < 5; k++) await page.getByRole("button", { name: "Continuar" }).click();
  await foto("10-tutorial-6");
  for (let k = 0; k < 2; k++) await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Vamos!" }).click();
  await page.waitForTimeout(4500);
  await foto("11-mapa");
  // Mapa em lista
  await page.goto(`${BASE}/aldeia/${codigo}/lista`);
  await page.waitForTimeout(600);
  await foto("12-lista");
  await page.goto(`${BASE}/aldeia/${codigo}/guarda-roupa`);
  await page.waitForTimeout(800);
  await foto("13-guarda-roupa");
  await page.goto(`${BASE}/aldeia/${codigo}/casa`);
  await page.waitForTimeout(1000);
  await foto("14-casa");
  await page.goto(`${BASE}/aldeia/${codigo}/missao/pratica`);
  await page.waitForTimeout(800);
  await foto("15-missao-intro");
  await page.goto(`${BASE}/aldeia/${codigo}/jornal`);
  await page.waitForTimeout(800);
  await foto("16-jornal");
  // Professor: painel
  await page.goto(`${BASE}/professor/aldeia/painel`);
  await page.waitForTimeout(600);
  if (await page.getByLabel("Código do professor").count()) {
    await page.getByLabel("Código do professor").fill(professor);
    await page.getByRole("button", { name: "Entrar no painel" }).click();
  }
  await page.getByText("Onde está cada aluno").waitFor();
  await page.waitForTimeout(600);
  await foto("17-painel");
  await ctx.close();
}

await percurso("desktop-claro", { width: 1280, height: 860 }, "claro");
await percurso("telemovel-escuro", { width: 390, height: 844 }, "escuro");
await browser.close();
if (violacoes.length) console.error("Acessibilidade:\n" + violacoes.join("\n"));
if (erros.length || violacoes.length) {
  console.error("Erros na consola:\n" + erros.join("\n"));
  process.exit(1);
}
console.log(`Percurso concluído. Capturas em ${PASTA}/`);
