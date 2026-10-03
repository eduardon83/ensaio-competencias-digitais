// ─── Capturas de ecrã para o pacote de vídeo (design/pacote-video/ecras) ─────
// Uso:  npm run dev   (noutro terminal)   e depois   node scripts/capturas-video.mjs [http://localhost:5180]
// Ecrãs a 1920×1080 (16:9) no aspeto Mosaico claro (predefinido), mais variantes (Original, escuro, telemóvel).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5180";
const SAIDA = "design/pacote-video/ecras";
mkdirSync(SAIDA, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}

async function contexto({ formato = "mosaico", tema = "claro", cenario = "jornal", largura = 1920, altura = 1080, escala = 1, tutorialVisto = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, deviceScaleFactor: escala });
  await ctx.addInitScript(([f, t, c, v]) => {
    localStorage.setItem("ecd.preferencias.v1", JSON.stringify({ formato: f, tema: t, contexto: c, tamanho: "normal", extensaoTempo: 1, nome: "", telemetria: false }));
    if (v) localStorage.setItem("ecd.tutorial.visto.v1", "1");
  }, [formato, tema, cenario, tutorialVisto]);
  return ctx;
}

const lista = [];
async function foto(page, nome, descricao, inteira = false) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${SAIDA}/${nome}.png`, fullPage: inteira });
  lista.push(`${nome}.png — ${descricao}`);
  console.log("✓", nome);
}
const ir = (page, rota) => page.goto(BASE + rota, { waitUntil: "networkidle" });
const saltar = (page) => page.getByRole("button", { name: "Saltar a prática" }).click().catch(() => {});

// ── Mosaico claro (aspeto predefinido)
{
  const ctx = await contexto();
  const page = await ctx.newPage();
  await ir(page, "/"); await foto(page, "01-inicio", "Início: mensagem principal e os quatro blocos (Treinar, Professor, Tutorial, Observatório)");
  await ir(page, "/"); await foto(page, "01b-inicio-pagina-inteira", "Início, página inteira", true);
  await ir(page, "/treinar"); await foto(page, "02-treinar", "Treinar: Teste, Atividade, Código, Jogos e Segurança");
  await ir(page, "/teste"); await foto(page, "03-provas-e-exames", "Preparação para provas e exames: ModA 4.º e 6.º ano, Provas Finais 9.º ano, Exames Nacionais, Ensino Superior", true);
  await ir(page, "/treino"); await foto(page, "04-atividades", "Catálogo de atividades com 5 níveis");
  await ir(page, "/atividades/noticia/2"); await foto(page, "05-atividade-briefing", "Briefing de uma atividade: personagem, tarefa, escolha do cenário, prática");
  await saltar(page); await page.waitForTimeout(300);
  const fonte = (await page.locator(".dactilo").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
  await page.locator("textarea").first().click().catch(() => {});
  await page.keyboard.type(fonte.slice(0, 48), { delay: 20 }); await foto(page, "06-atividade-tarefa", "Atividade a decorrer (A Notícia: escrever no teclado)");
  await ir(page, "/atividades/painel/2"); await saltar(page); await foto(page, "06b-atividade-painel", "Atividade O Painel: seguir instruções num sítio simulado");
  await ir(page, "/atividades/matematica/3"); await saltar(page); await foto(page, "06c-atividade-matematica", "Escrita Matemática");
  await ir(page, "/atividades/maqueta/3"); await foto(page, "06d-maqueta-briefing", "A Maqueta: briefing (com Ler em voz alta)");
  await saltar(page); await page.waitForTimeout(1800);
  await foto(page, "06e-maqueta", "A Maqueta: manipulação 3D com ferramentas, tarefas, câmara e objetos");
  await page.getByRole("button", { name: "Rodar a câmara para a esquerda" }).click();
  await page.getByRole("button", { name: "Aproximar a câmara" }).click();
  await page.locator("#mq-objetos").locator("..").getByRole("button", { name: /^Telhado/ }).click();
  await page.keyboard.press("n");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "06f-maqueta-em-uso", "A Maqueta a ser arrumada: telhado selecionado, cubo criado, tarefas assinaladas");
  await ir(page, "/atividades/revisao/2"); await saltar(page); await page.waitForTimeout(300);
  await page.locator('section[aria-label="Cópia digital"] button.palavra').first().click().catch(() => {});
  await page.getByRole("button", { name: "Terminei" }).click().catch(() => {});
  await foto(page, "07-resultado-relatorio", "Resultado: pontuação, estrelas, dica e relatório por tarefa", true);
  await ir(page, "/codigo"); await foto(page, "08-codigo", "Entrar com o código do professor");
  await ir(page, "/professor"); await foto(page, "09-professor-montar", "Professor: montar uma prova (nível, atividades, segurança, jogos) com resumo ao lado", true);
  await page.getByRole("button", { name: /Criar|Gerar/ }).first().click().catch(() => {});
  await foto(page, "10-professor-codigo-qr", "Professor: código e QR para projetar na sala");
  await ir(page, "/jogos"); await foto(page, "11-jogos", "Jogos: seis jogos com 5 níveis", true);
  await ir(page, "/jogos/leitura/2"); await saltar(page); await foto(page, "12-jogo-biblioteca-viva", "Biblioteca Viva: ler autores portugueses com glossário");
  await ir(page, "/jogos/sala-trancada/3"); await saltar(page); await foto(page, "13-jogo-sala-trancada-notas", "A Sala Trancada: as notas com as pistas");
  await page.getByRole("tab", { name: /Cofre/ }).click(); await foto(page, "13b-jogo-sala-trancada-cofre", "A Sala Trancada: o cofre");
  await ir(page, "/jogos/misterio/4"); await saltar(page); await foto(page, "14-jogo-misterio", "Quem Apagou o Ficheiro?: pistas digitais e acusação");
  await ir(page, "/jogos/orcamento/3"); await saltar(page); await foto(page, "15-jogo-orcamento", "Orçamento da Visita de Estudo: folha de cálculo com fórmulas");
  await ir(page, "/jogos/correio/3"); await saltar(page); await foto(page, "16-jogo-correio", "Correio da Redação: escrever um email formal", true);
  await ir(page, "/jogos/robo/3"); await saltar(page); await foto(page, "17-jogo-robo", "O Robô da Redação: programar um robô");
  await ir(page, "/seguranca"); await foto(page, "18-seguranca", "Segurança digital: três temas, informações e testes");
  await ir(page, "/seguranca/fraude"); await foto(page, "19-seguranca-fraude-info", "Informações: exemplos de fraude e sinais de alerta", true);
  await ir(page, "/seguranca/fraude/teste/2"); await saltar(page); await foto(page, "20-teste-email-desconfiado", "Teste O Email Desconfiado: legítima ou fraude?");
  await ir(page, "/seguranca/redes-sociais/teste/3"); await saltar(page);
  for (const b of (await page.getByRole("button", { name: /Ver quem publicou|Procurar noutras fontes/ }).all()).slice(0, 2)) await b.click();
  await foto(page, "21-teste-verdade-ou-boato", "Teste Verdade ou Boato?: verificar publicações");
  await ir(page, "/seguranca/boas-praticas/teste/2"); await saltar(page); await foto(page, "21b-teste-boas-praticas", "Teste Boas práticas online");
  await ir(page, "/observatorio"); await foto(page, "23-observatorio", "Observatório: estatísticas anónimas");
  await ir(page, "/cartao"); await foto(page, "24-cartao", "O meu cartão de imprensa com carimbos");
  await ir(page, "/definicoes"); await foto(page, "25-definicoes", "Definições: aspeto, tema, tamanho do texto, contraste reforçado (AAA), tempo alargado", true);
  await ir(page, "/sobre"); await foto(page, "26-sobre", "Sobre o projeto", true);
  await ctx.close();
}

// ── Primeira página (resultado final de uma preparação/prova)
{
  const ctx = await contexto();
  const page = await ctx.newPage();
  await ir(page, "/professor");
  await page.getByRole("button", { name: "Nenhuma" }).click();
  for (const n of [/^A Notícia/, /^O Email Desconfiado/, /^Boas Práticas Online/]) await page.getByLabel(n).check({ force: true });
  await page.getByRole("button", { name: /Criar código/ }).click();
  await page.waitForTimeout(500);
  const m = /([2-9A-HJKMNP-Z]{4}·[2-9A-HJKMNP-Z]{6,7})/.exec(await page.locator("body").innerText());
  await ir(page, "/codigo/" + m[1].replace("·", ""));
  await page.getByLabel(/número/i).first().fill("12").catch(() => {});
  await page.getByRole("button", { name: /Começar/ }).first().click();
  await page.waitForTimeout(400);
  for (let k = 0; k < 160; k++) {
    if (await page.getByText("Guardar como imagem").isVisible().catch(() => false)) break;
    const sp = page.getByRole("button", { name: "Saltar a prática" });
    if (await sp.isVisible().catch(() => false)) { await sp.click(); await page.waitForTimeout(300); continue; }
    const area = page.locator("textarea").first();
    if ((await area.count()) && (await area.isEditable().catch(() => false)) && !(await area.inputValue())) {
      const fonte = (await page.locator(".dactilo").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
      await area.fill(fonte);
    }
    for (const fs of await page.locator("fieldset").all()) {
      const r = fs.locator('input[type="radio"]:not([disabled])');
      if ((await r.count()) && !(await fs.locator('input[type="radio"]:checked').count())) await r.first().check({ force: true }).catch(() => {});
    }
    const senha = page.getByLabel(/palavra-passe/i).first();
    if ((await senha.count()) && (await senha.isEditable().catch(() => false)) && !(await senha.inputValue())) await senha.fill("Bicicleta-azul-come-7");
    let ok = false;
    for (const n of ["Terminei", "Verificar", "Continuar", "Confirmar", "Guardar", "Mensagem seguinte", /^Terminar/, "Próxima atividade", /Ver o resultado|Seguinte/]) {
      const b = page.getByRole("button", { name: n }).first();
      if ((await b.count()) && (await b.isVisible().catch(() => false)) && (await b.isEnabled().catch(() => false))) { await b.click(); ok = true; break; }
    }
    if (!ok) await page.waitForTimeout(250);
  }
  await foto(page, "07b-primeira-pagina", "Resultado final (primeira página): pontuação, frase por competência, Para treinar, Guardar como imagem", true);
  await ctx.close();
}

// ── Tutorial (todos os passos)
{
  const ctx = await contexto({ tutorialVisto: false });
  const page = await ctx.newPage();
  await ir(page, "/tutorial");
  for (let i = 1; i <= 9; i++) {
    await foto(page, `22-tutorial-passo-${i}`, `Tutorial, passo ${i}`);
    const seg = page.getByRole("button", { name: /Seguinte|Próximo/ }).first();
    if (!(await seg.count())) break;
    await seg.click();
  }
  await ctx.close();
}

// ── Variantes: aspeto Original, tema escuro, cenário laboratório, telemóvel
for (const [formato, tema, sufixo] of [["original", "claro", "original-claro"], ["original", "escuro", "original-escuro"], ["mosaico", "escuro", "mosaico-escuro"]]) {
  const ctx = await contexto({ formato, tema });
  const page = await ctx.newPage();
  await ir(page, "/"); await foto(page, `30-inicio-${sufixo}`, `Início no aspeto ${formato}, tema ${tema}`);
  await ir(page, "/jogos/robo/2"); await saltar(page); await foto(page, `31-robo-${sufixo}`, `Robô no aspeto ${formato}, tema ${tema}`);
  await ctx.close();
}
{
  const ctx = await contexto({ cenario: "laboratorio" });
  const page = await ctx.newPage();
  await ir(page, "/atividades/noticia/2"); await foto(page, "32-briefing-laboratorio", "O mesmo briefing no cenário laboratório (O Protocolo)");
  await ir(page, "/jogos/robo/3"); await saltar(page); await foto(page, "33-robo-laboratorio", "O Robô da Bancada no cenário laboratório");
  await ctx.close();
}
{
  const ctx = await contexto({ largura: 390, altura: 844, escala: 2 });
  const page = await ctx.newPage();
  await ir(page, "/"); await foto(page, "40-telemovel-inicio", "Telemóvel: início");
  await ir(page, "/treinar"); await foto(page, "41-telemovel-treinar", "Telemóvel: treinar");
  await ir(page, "/seguranca/fraude/teste/2"); await saltar(page); await foto(page, "42-telemovel-teste-fraude", "Telemóvel: teste O Email Desconfiado");
  await ctx.close();
}

await browser.close();
const { writeFileSync } = await import("node:fs");
writeFileSync(`${SAIDA}/LISTA.txt`, lista.join("\n") + "\n", "utf8");
console.log(`${lista.length} capturas em ${SAIDA}`);
