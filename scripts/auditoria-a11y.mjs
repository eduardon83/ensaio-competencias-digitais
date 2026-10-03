// ─── Auditoria automática de acessibilidade (WCAG 2.2 AA) com axe-core ───────
// Uso:  npm run dev   (noutro terminal)   e depois   npm run a11y [-- http://localhost:5180]
// Percorre as páginas e as atividades nos dois aspetos (Mosaico, Original) e nos dois temas (claro, escuro),
// e escreve o relatório em docs/AUDITORIA_A11Y.md. Usa o Chrome instalado no sistema (ou o Chromium do Playwright).
// Atenção: a verificação automática apanha só parte dos problemas WCAG. É precisa revisão humana com leitor de ecrã.
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5180";
const PAGINAS = [
  ["/", "Início"], ["/treinar", "Treinar"], ["/teste", "Teste"], ["/treino", "Atividade (treino)"], ["/codigo", "Código"],
  ["/professor", "Professor"], ["/tutorial", "Tutorial"], ["/observatorio", "Observatório"], ["/cartao", "Cartão"],
  ["/resultados", "Resultados"], ["/definicoes", "Definições"], ["/sobre", "Sobre"], ["/acessibilidade", "Acessibilidade"],
  ["/privacidade", "Privacidade"], ["/licenca", "Licença"], ["/admin", "Administração"],
  ["/jogos", "Jogos"], ["/seguranca", "Segurança digital"], ["/seguranca/boas-praticas", "Segurança: boas práticas"],
  ["/seguranca/fraude", "Segurança: exemplos de fraude"], ["/seguranca/redes-sociais", "Segurança: redes sociais"],
];
// Jogos e testes de segurança (ecrã de jogo, depois de saltar a prática).
const JOGOS = ["/jogos/leitura/3", "/jogos/sala-trancada/3", "/jogos/misterio/3", "/jogos/orcamento/3", "/jogos/correio/3", "/jogos/robo/3", "/seguranca/boas-praticas/teste/3", "/seguranca/fraude/teste/3", "/seguranca/redes-sociais/teste/3"];
const ATIVIDADES = ["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "simulador", "matematica", "maqueta"];
const VARIANTES = [["mosaico", "claro"], ["mosaico", "escuro"], ["original", "claro"], ["original", "escuro"]];

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}

const linhas = [];
const porRegra = new Map();
let total = 0;

for (const [formato, tema] of VARIANTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(([f, t]) => {
    localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: f, tema: t, contexto: "jornal", tamanho: "normal", extensaoTempo: 1, nome: "", telemetria: false }));
    localStorage.setItem("ecd.tutorial.visto.v1", "1");
  }, [formato, tema]);
  const alvos = [...PAGINAS, ...ATIVIDADES.map((a) => [`/atividades/${a}/3`, `Atividade: ${a}`]), ...JOGOS.map((j) => [j, `Jogo/teste: ${j.split("/")[2]}`]), ["/atividades/revisao/2#resultado", "Resultado com relatório (Revisão)"]];
  for (const [rota, nome] of alvos) {
    const page = await ctx.newPage();
    await page.goto(BASE + rota, { waitUntil: "networkidle" });
    if (rota.startsWith("/atividades/") || JOGOS.includes(rota)) {
      await page.getByRole("button", { name: "Saltar a prática" }).click().catch(() => {});
      await page.waitForTimeout(300);
      const comecar = page.getByRole("button", { name: "Começar" });
      if (await comecar.count()) await comecar.first().click().catch(() => {});
      await page.waitForTimeout(300);
      if (rota.endsWith("#resultado")) {
        // Ecrã de resultado com o relatório: marca uma palavra e termina.
        await page.locator('section[aria-label="Cópia digital"] button.palavra').first().click().catch(() => {});
        await page.getByRole("button", { name: "Terminei" }).click().catch(() => {});
        await page.waitForTimeout(400);
      }
    }
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    // Verificação própria (o axe não a faz): rótulos tapados por um campo opaco por cima (texto invisível).
    const tapados = await page.evaluate(() => {
      const maus = [];
      for (const l of document.querySelectorAll("label")) {
        const b = l.getBoundingClientRect();
        if (b.width < 2 || b.height < 2 || l.classList.contains("sr-only") || !l.textContent.trim()) continue;
        const el = document.elementFromPoint(b.left + Math.min(20, b.width / 2), b.top + b.height / 2);
        if (!el || l.contains(el)) continue;
        const bg = getComputedStyle(el).backgroundColor;
        const opaco = !/rgba\(.*,\s*0\)$/.test(bg) && bg !== "transparent";
        if (el.tagName === "INPUT" && opaco) maus.push(l.textContent.trim().slice(0, 40));
      }
      return maus;
    });
    if (tapados.length) r.violations.push({ id: "rotulo-tapado", help: "Rótulo tapado por um campo opaco (texto invisível)", impact: "critical", nodes: tapados.map((t) => ({ target: [t] })) });
    for (const v of r.violations) {
      total += v.nodes.length;
      const k = v.id;
      const e = porRegra.get(k) ?? { descricao: v.help, impacto: v.impact, ocorrencias: 0, onde: new Set(), exemplo: v.nodes[0]?.target?.join(" ") ?? "" };
      e.ocorrencias += v.nodes.length;
      e.onde.add(`${nome} (${formato}/${tema})`);
      porRegra.set(k, e);
    }
    linhas.push(`| ${nome} | ${formato} | ${tema} | ${r.violations.length === 0 ? "✓" : r.violations.map((v) => `${v.id} (${v.nodes.length})`).join(", ")} |`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();

const data = new Date().toISOString().slice(0, 10);
const md = `# Auditoria automática de acessibilidade

Gerado por \`npm run a11y\` em ${data}, com axe-core (regras WCAG 2.0, 2.1 e 2.2, níveis A e AA).
Páginas e atividades (nível 3, depois de saltar a prática) nos aspetos Mosaico e Original, em tema claro e escuro.

**Total de ocorrências:** ${total} · **Regras violadas:** ${porRegra.size}

> A verificação automática deteta cerca de um terço dos problemas WCAG. Antes da entrega é necessária uma revisão
> manual: navegação só com teclado, leitor de ecrã (NVDA no Windows, VoiceOver no macOS/iOS), zoom a 200 % e 400 %,
> 320 px de largura, e testes com alunos da idade alvo.

## Regras violadas

${porRegra.size === 0 ? "Nenhuma." : [...porRegra.entries()].map(([k, e]) => `- **${k}** (${e.impacto}, ${e.ocorrencias} ocorrências): ${e.descricao}. Exemplo: \`${e.exemplo}\`. Em: ${[...e.onde].slice(0, 6).join("; ")}${e.onde.size > 6 ? "…" : ""}`).join("\n")}

## Por página

| Página | Aspeto | Tema | Resultado |
|---|---|---|---|
${linhas.join("\n")}
`;
writeFileSync(new URL("../docs/AUDITORIA_A11Y.md", import.meta.url), md);
console.log(`Ocorrências: ${total} · regras: ${porRegra.size}`);
for (const [k, e] of porRegra) console.log(`- ${k} (${e.impacto}): ${e.ocorrencias} · ${[...e.onde].slice(0, 3).join("; ")}`);
