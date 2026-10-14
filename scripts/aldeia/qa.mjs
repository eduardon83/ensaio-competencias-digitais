// ─── Aldeia Digital · QA no navegador contra o Worker local ─────────────────
// Uso: npm run build && npx wrangler dev --port 8787 --local   (noutro terminal, com .dev.vars)
//      node scripts/aldeia/qa.mjs [http://127.0.0.1:8787] [pasta-capturas]
// Cenários: teclado no mapa, outro computador, sair deste computador, sem rede, ritmo guiado, ações do professor,
// turma cheia, modo calmo, definições visuais (Original, texto grande, alvos grandes, leitura facilitada, contraste
// reforçado) com axe, reflow a 320 px e desempenho do mapa com a CPU 4× mais lenta.
// As turmas criam-se pela API com IPs simulados (só funciona no Worker local); os alunos entram no navegador.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:8787";
const PASTA = process.argv[3] ?? "capturas-qa";
mkdirSync(PASTA, { recursive: true });
const resultados = [];
const ok = (cond, msg) => {
  resultados.push(`${cond ? "✓" : "✗"} ${msg}`);
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
let ip = 1;
async function api(metodo, caminho, corpo, auth) {
  const h = { "content-type": "application/json", "cf-connecting-ip": `10.9.${Math.floor(ip / 250)}.${ip++ % 250}` };
  if (auth) h.authorization = auth;
  const r = await fetch(`${BASE}/api/aldeia${caminho}`, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined });
  return { estado: r.status, d: await r.json().catch(() => null) };
}
const fim = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
const CONFIG = { nome: "QA", lugares: 4, nivel: 2, extensao: "completa", escolha: [], dimensoes: ["direitos", "democracia", "sustentabilidade", "financeira"], identificacao: ["anonimo", "nome", "numero"], ritmo: "livre", tempo: 1, dataFim: fim, colecao: "atuais" };
async function turma(extra = {}) {
  const r = await api("POST", "/turmas", { config: { ...CONFIG, ...extra }, termos: true });
  if (r.estado !== 201) throw new Error(`criar turma: ${r.estado} ${JSON.stringify(r.d)}`);
  return r.d;
}
async function aluno(t, nome, fato, modo = "anonimo") {
  const r = await api("POST", `/t/${t}/alunos`, { nome, modo, fato });
  if (r.estado !== 201) throw new Error(`aluno: ${r.estado} ${JSON.stringify(r.d)}`);
  const auth = `Aluno ${r.d.vista.aluno.id}.${r.d.chave}`;
  await api("POST", `/t/${t}/eu`, { ops: [{ op: "evento", missao: "nascimento" }, { op: "evento", missao: "tutorial" }] }, auth);
  return { ...r.d, auth, nome, fato };
}
/** Abre um contexto já com a sessão do aluno (como se tivesse entrado neste computador). */
async function contextoAluno(browser, t, a, prefs = {}, viewport = { width: 1280, height: 860 }) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(([c, s, p]) => {
    localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: "mosaico", tema: "claro", telemetria: false, ...p }));
    localStorage.setItem("ecd.aldeia.sessoes.v1", JSON.stringify({ [c]: s }));
    localStorage.setItem(`ecd.aldeia.vistos.${c}`, JSON.stringify(["abertura:c0", "abertura:c1", "chegada:escola", "fecho:c0"]));
  }, [t, { codigo: t, id: a.vista.aluno.id, chave: a.chave, nome: a.nome, fato: a.fato, local: false, em: new Date().toISOString() }, prefs]);
  return ctx;
}
/** Espera até o elemento aparecer (isVisible não espera). */
const visivel = (loc, ms = 8000) => loc.waitFor({ state: "visible", timeout: ms }).then(() => true, () => false);
async function axe(page, nome) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  for (const v of r.violations) console.log(`   axe ${nome}: ${v.id} ${v.nodes.length}× ${v.nodes[0]?.target.join(" ")}`);
  return r.violations.length;
}

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}

// ── 1. Teclado no mapa ───────────────────────────────────────────────────────
{
  const t = await turma();
  const a = await aluno(t.turma, "Lince Veloz", "lince");
  const ctx = await contextoAluno(browser, t.turma, a);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  await p.getByRole("application", { name: "Mapa da aldeia" }).waitFor();
  await p.waitForTimeout(1500);
  await p.getByRole("application", { name: "Mapa da aldeia" }).focus();
  for (let k = 0; k < 4; k++) await p.keyboard.press("ArrowUp");
  await p.waitForTimeout(900);
  let chegou = false;
  for (let k = 0; k < 20 && !chegou; k++) {
    await p.keyboard.press("Tab");
    chegou = ((await p.evaluate(() => document.activeElement?.getAttribute("aria-label"))) ?? "").startsWith("Escola");
  }
  ok(chegou, "teclado: Tab chega ao botão da Escola no mapa");
  await p.keyboard.press("Enter");
  await p.getByRole("dialog", { name: "Escola" }).waitFor({ timeout: 15000 }).catch(() => {});
  ok(await visivel(p.getByRole("dialog", { name: "Escola" })), "teclado: Enter anda até à porta e abre o cartão da Escola");
  await p.keyboard.press("Escape");
  ok(!(await p.getByRole("dialog", { name: "Escola" }).isVisible().catch(() => false)), "teclado: Escape fecha o cartão");
  await p.screenshot({ path: `${PASTA}/01-teclado.png` });
  // ── 3. Sair deste computador
  await p.getByRole("button", { name: "Sair" }).click();
  await p.getByRole("dialog").getByRole("button", { name: "Sair" }).click();
  await p.waitForURL(/\/aldeia$/);
  ok(await visivel(p.getByText("Saíste deste computador")), "sair: mensagem e regresso à entrada");
  ok((await p.evaluate((c) => JSON.parse(localStorage.getItem("ecd.aldeia.sessoes.v1") ?? "{}")[c] === undefined, t.turma)), "sair: a chave local foi apagada");
  ok((await api("GET", `/t/${t.turma}/eu`, undefined, a.auth)).estado === 401, "sair: a chave deixou de servir no servidor");
  await ctx.close();

  // ── 2. Outro computador (código + nome)
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx2.addInitScript(() => localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: "mosaico", tema: "claro", telemetria: false })));
  const p2 = await ctx2.newPage();
  await p2.goto(`${BASE}/aldeia/${t.turma}`);
  await p2.getByRole("radio", { name: "Um nome de animal" }).check({ force: true }).catch(() => {});
  await p2.getByRole("button", { name: "Seguinte" }).click().catch(() => {});
  await p2.getByLabel(/Noutro computador/).check();
  await p2.getByLabel(/nome de animal/i).fill("lince veloz");
  await p2.getByRole("button", { name: "Entrar" }).click();
  await p2.getByRole("application", { name: "Mapa da aldeia" }).waitFor({ timeout: 15000 }).catch(() => {});
  ok(await visivel(p2.getByText("Lince Veloz").first()), "outro computador: entra com código e nome, sem novo nascimento");
  await ctx2.close();
}

// ── 4. Sem rede: a fila guarda e envia quando a rede volta ──────────────────
{
  const t = await turma();
  const a = await aluno(t.turma, "Foca Feliz", "foca");
  const ctx = await contextoAluno(browser, t.turma, a);
  const p = await ctx.newPage();
  // primeiro o mapa (os módulos ficam no navegador), depois a casa pelo HUD, e só então se corta a rede
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  await p.getByRole("application", { name: "Mapa da aldeia" }).waitFor();
  await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "Casa", exact: true }).click();
  await p.getByRole("tab", { name: "Mobília" }).waitFor();
  await p.waitForTimeout(800);
  await ctx.setOffline(true);
  await p.getByRole("button", { name: /Mudar: Planta/ }).click();
  await p.getByRole("button", { name: "Guardar" }).click();
  await p.getByRole("link", { name: "Sair de casa" }).click();
  await p.waitForTimeout(9500);
  ok(await visivel(p.getByText("Por guardar: sem rede")), "sem rede: o HUD diz \"Por guardar: sem rede\"");
  await ctx.setOffline(false);
  await p.waitForTimeout(10000);
  const v = await api("GET", `/t/${t.turma}/eu`, undefined, a.auth);
  ok(v.d?.aluno?.interior?.moveis?.planta?.lugar === "canto-da-frente", "sem rede: a alteração chegou ao servidor quando a rede voltou");
  ok(!(await p.getByText("Por guardar").isVisible().catch(() => false)), "sem rede: o aviso desaparece depois de guardar");
  await ctx.close();
}

// ── 5. Ritmo guiado e 6. ações do professor ─────────────────────────────────
{
  const t = await turma({ ritmo: "guiado" });
  const a = await aluno(t.turma, "Gato Simpático", "gato");
  await api("POST", `/t/${t.turma}/eu`, { ops: [{ op: "resultado", id: "qa1", missao: "pratica", pontuacao: 70, duracaoMs: 30000 }] }, a.auth);
  const ctx = await contextoAluno(browser, t.turma, a);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/aldeia/${t.turma}/missao/painel`);
  ok(await visivel(p.getByText("Aqui não há missões neste capítulo.")), "guiado: o capítulo 1 fica fechado até o professor o abrir");
  const prof = await api("POST", "/professor/entrar", { codigo: t.professor });
  const tok = `Bearer ${prof.d.token}`;
  await api("POST", "/professor/acao", { acao: "abrirCapitulo", capitulo: 1 }, tok);
  await p.goto(`${BASE}/aldeia/${t.turma}/missao/painel`);
  ok(await visivel(p.getByRole("button", { name: "Começar", exact: true })), "guiado: depois de abrir o capítulo 1, a missão começa");
  await api("POST", "/professor/acao", { acao: "renomear", aluno: a.vista.aluno.id, nome: "Gato Sereno" }, tok);
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  ok(await visivel(p.getByText("Gato Sereno").first()), "professor: mudar o nome chega ao aluno");
  await api("POST", "/professor/acao", { acao: "renovarAluno", aluno: a.vista.aluno.id }, tok);
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  ok(await visivel(p.getByText("Como te queres chamar?").first()), "professor: renovar o acesso obriga o aluno a entrar outra vez");
  await api("POST", "/professor/acao", { acao: "fechar" }, tok);
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  ok(await visivel(p.getByText(/Não encontrámos esta turma, ou já fechou/)), "professor: fechar a turma impede novas entradas");
  await ctx.close();
}

// ── 7. Turma cheia ───────────────────────────────────────────────────────────
{
  const t = await turma({ lugares: 1 });
  await aluno(t.turma, "Zebra Alegre", "zebra");
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  ok(await visivel(p.getByText("A turma já está cheia").first()), "turma cheia: aviso antes de escolher o nome");
  await ctx.close();
}

// ── 8. Modo calmo no nascimento ─────────────────────────────────────────────
{
  const t = await turma();
  const r = await api("POST", `/t/${t.turma}/alunos`, { nome: "Coruja Atenta", modo: "anonimo", fato: "coruja" });
  const a = { ...r.d, nome: "Coruja Atenta", fato: "coruja" };
  const ctx = await contextoAluno(browser, t.turma, a, { calmo: true });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/aldeia/${t.turma}`);
  ok(await visivel(p.getByRole("button", { name: "Abrir o ovo · 1 de 3" })), "modo calmo: \"Abrir o ovo\" em vez da animação");
  for (let k = 1; k <= 3; k++) await p.getByRole("button", { name: `Abrir o ovo · ${k} de 3` }).click();
  ok(await visivel(p.getByText(/à Aldeia Digital! Esta é a tua casa/)), "modo calmo: 3 passos e o avatar nasce");
  await ctx.close();
}

// ── 9. Definições visuais com axe e 10. reflow a 320 px ─────────────────────
{
  const t = await turma();
  const a = await aluno(t.turma, "Panda Gentil", "panda");
  const variantes = [
    ["original-claro", { formato: "original", tema: "claro" }],
    ["original-escuro", { formato: "original", tema: "escuro" }],
    ["mosaico-ajudas", { formato: "mosaico", tema: "claro", tamanho: "grande", alvos: "grandes", leitura: "facilitada", contraste: "reforcado" }],
  ];
  const paginas = ["", "/lista", "/guarda-roupa", "/casa", "/jornal", "/ajuda", "/missao/pratica"];
  for (const [nome, prefs] of variantes) {
    const ctx = await contextoAluno(browser, t.turma, a, prefs);
    const p = await ctx.newPage();
    let violacoes = 0;
    for (const pg of paginas) {
      await p.goto(`${BASE}/aldeia/${t.turma}${pg}`);
      await p.waitForTimeout(1200);
      violacoes += await axe(p, `${nome}${pg || "/mapa"}`);
    }
    await p.screenshot({ path: `${PASTA}/09-${nome}.png` });
    ok(violacoes === 0, `axe sem ocorrências na aldeia (${nome}, ${paginas.length} páginas)`);
    await ctx.close();
  }
  const ctx = await contextoAluno(browser, t.turma, a, {}, { width: 320, height: 640 });
  const p = await ctx.newPage();
  const largas = [];
  for (const pg of ["/lista", "/guarda-roupa", "/casa", "/jornal", "/ajuda", "/missao/pratica"]) {
    await p.goto(`${BASE}/aldeia/${t.turma}${pg}`);
    await p.waitForTimeout(1000);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > 322) largas.push(`${pg} (${w}px)`);
  }
  await p.goto(`${BASE}/aldeia`);
  if ((await p.evaluate(() => document.documentElement.scrollWidth)) > 322) largas.push("/aldeia");
  await p.goto(`${BASE}/professor`);
  await p.getByRole("radio", { name: /Aldeia Digital/ }).click();
  await p.waitForTimeout(800);
  if ((await p.evaluate(() => document.documentElement.scrollWidth)) > 322) largas.push("/professor (Aldeia)");
  ok(largas.length === 0, `reflow a 320 px sem deslocamento horizontal${largas.length ? `: ${largas.join(", ")}` : ""}`);
  await ctx.close();

  // ── 11. Desempenho do mapa com a CPU 4× mais lenta
  const ctx3 = await contextoAluno(browser, t.turma, a);
  const p3 = await ctx3.newPage();
  let bytes = 0;
  p3.on("response", async (r) => {
    if (r.url().includes("/aldeia/") && r.url().endsWith(".png")) bytes += (await r.body().catch(() => Buffer.alloc(0))).length;
  });
  const cdp = await ctx3.newCDPSession(p3);
  await p3.goto(`${BASE}/aldeia/${t.turma}`);
  await p3.getByRole("application", { name: "Mapa da aldeia" }).waitFor();
  await p3.waitForTimeout(3000);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const fps = await p3.evaluate(
    () =>
      new Promise((resolver) => {
        const marcas = [];
        const passo = (t) => {
          marcas.push(t);
          if (marcas.length < 180) requestAnimationFrame(passo);
          else {
            const d = marcas.slice(1).map((x, i) => x - marcas[i]);
            resolver({ media: d.reduce((s, x) => s + x, 0) / d.length, longos: d.filter((x) => x > 100).length });
          }
        };
        requestAnimationFrame(passo);
      }),
  );
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  ok(fps.media < 40 && fps.longos < 6, `mapa com CPU 4× mais lenta: ${Math.round(1000 / fps.media)} fps de rAF, ${fps.longos} quadros acima de 100 ms (alvo: 30 fps)`);
  ok(bytes < 1.5 * 1024 * 1024, `arte carregada pelo mapa: ${Math.round(bytes / 1024)} kB (orçamento 1,5 MB)`);
  await ctx3.close();
}

await browser.close();
const falhas = resultados.filter((r) => r.startsWith("✗")).length;
console.log(`\n${resultados.length - falhas} de ${resultados.length} verificações certas.`);
process.exit(falhas ? 1 : 0);
