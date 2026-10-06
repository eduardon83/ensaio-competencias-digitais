// ─── Capturas e gravações para o pacote de vídeo (design/pacote-video) ───────
// Uso:  node scripts/capturas-video.mjs [endereço]
// Por omissão usa o sítio publicado, para as capturas terem os textos editados no backoffice (a versão local usa
// só os textos do código). Ecrãs a 1920×1080 (16:9) no aspeto Mosaico claro (predefinido), mais variantes.
// Saída:
//   ecras/        capturas soltas, com LISTA.txt
//   sequencias/   passo a passo dos vídeos Professor (P..) e Aluno (A..), com o cursor visível
//   gravacoes/    os mesmos percursos gravados em vídeo (webm, 1920×1080), com o cursor visível
// As preferências guardadas desligam o envio de estatísticas: nenhuma tentativa sai do navegador.
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "https://ecd-ensaio.edmnns.workers.dev";
const RAIZ = "design/pacote-video";
for (const d of ["ecras", "sequencias", "gravacoes"]) {
  rmSync(`${RAIZ}/${d}`, { recursive: true, force: true });
  mkdirSync(`${RAIZ}/${d}`, { recursive: true });
}
mkdirSync(`${RAIZ}/sequencias/professor`, { recursive: true });
mkdirSync(`${RAIZ}/sequencias/aluno`, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  browser = await chromium.launch();
}

// Cursor desenhado na página (o Playwright não mostra o rato nas capturas nem nas gravações).
// Guarda a posição entre páginas e mostra um anel em cada clique.
function cursorNaPagina() {
  const montar = () => {
    if (document.getElementById("cursor-video")) return;
    const c = document.createElement("div");
    c.id = "cursor-video";
    c.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5l6.8 18.2 2.6-7.4 7.4-2.6z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const pos = JSON.parse(sessionStorage.getItem("cursor-video") ?? "[-100,-100]");
    Object.assign(c.style, { position: "fixed", left: pos[0] + "px", top: pos[1] + "px", zIndex: 2147483647, pointerEvents: "none", transform: "translate(-5px,-3px)" });
    document.documentElement.appendChild(c);
    addEventListener("mousemove", (e) => {
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
      sessionStorage.setItem("cursor-video", JSON.stringify([e.clientX, e.clientY]));
    }, true);
    addEventListener("mousedown", (e) => {
      const a = document.createElement("div");
      Object.assign(a.style, { position: "fixed", left: e.clientX - 22 + "px", top: e.clientY - 22 + "px", width: "44px", height: "44px", borderRadius: "50%", border: "4px solid #f408fc", zIndex: 2147483646, pointerEvents: "none", transition: "transform .5s, opacity .5s" });
      document.documentElement.appendChild(a);
      requestAnimationFrame(() => { a.style.transform = "scale(1.6)"; a.style.opacity = "0"; });
      setTimeout(() => a.remove(), 600);
    }, true);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", montar);
  else montar();
}

async function contexto({ formato = "mosaico", tema = "claro", cenario = "jornal", largura = 1920, altura = 1080, escala = 1, tutorialVisto = true, extra = {}, gravar = false, cursor = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: largura, height: altura },
    deviceScaleFactor: escala,
    ...(gravar ? { recordVideo: { dir: `${RAIZ}/gravacoes/.tmp`, size: { width: largura, height: altura } } } : {}),
  });
  await ctx.addInitScript(([prefs, v]) => {
    localStorage.setItem("ecd.preferencias.v1", JSON.stringify(prefs));
    if (v) localStorage.setItem("ecd.tutorial.visto.v1", "1");
  }, [{ formato, tema, contexto: cenario, tamanho: "normal", extensaoTempo: 1, nome: "", telemetria: false, ...extra }, tutorialVisto]);
  if (cursor) await ctx.addInitScript(cursorNaPagina);
  return ctx;
}

const lista = [];
async function foto(page, nome, descricao, inteira = false, pasta = "ecras") {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${RAIZ}/${pasta}/${nome}.png`, fullPage: inteira });
  lista.push(`${pasta === "ecras" ? "" : pasta + "/"}${nome}.png: ${descricao}`);
  console.log("✓", pasta, nome);
}
const ir = (page, rota) => page.goto(BASE + rota, { waitUntil: "networkidle" });
const saltar = (page) => page.getByRole("button", { name: "Saltar a prática" }).click().catch(() => {});
const pausa = (page, ms) => page.waitForTimeout(ms);

/** Desliza até ao elemento, leva o cursor até ele devagar e (opcionalmente) clica. */
async function apontar(page, loc, { clicar = false, espera = 500 } = {}) {
  await loc.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await pausa(page, 700);
  const c = await loc.boundingBox();
  await page.mouse.move(c.x + Math.min(c.width / 2, 60), c.y + c.height / 2, { steps: 35 });
  await pausa(page, espera);
  if (clicar) {
    await page.mouse.down();
    await page.mouse.up();
    await pausa(page, 600);
  }
}

/** Responde à primeira opção de cada pergunta e avança (para chegar às partes seguintes de um teste). */
async function responderEAvancar(page) {
  for (const fs of await page.locator("fieldset").all()) {
    const r = fs.locator('input[type="radio"]:not([disabled])');
    if ((await r.count()) && !(await fs.locator('input[type="radio"]:checked').count())) await r.first().check({ force: true }).catch(() => {});
  }
  await page.getByRole("button", { name: "Verificar" }).click().catch(() => {});
  await page.getByRole("button", { name: "Continuar" }).click().catch(() => {});
  await pausa(page, 300);
}

// ── Mosaico claro (aspeto predefinido)
{
  const ctx = await contexto();
  const page = await ctx.newPage();
  await ir(page, "/"); await foto(page, "01-inicio", "Início: mensagem principal e os quatro blocos (Treinar, Professor, Tutorial, Observatório)");
  await ir(page, "/"); await foto(page, "01b-inicio-pagina-inteira", "Início, página inteira (Porquê, com os dados das provas digitais e do ICILS 2023)", true);
  await ir(page, "/treinar"); await foto(page, "02-treinar", "Treinar: Provas e exames, Desafios, Código, Jogos e Segurança digital");
  await ir(page, "/teste"); await foto(page, "03-provas-e-exames", "Preparação para provas e exames: ModA 4.º e 6.º ano, Provas Finais 9.º ano, Exames Nacionais, Ensino Superior", true);
  await ir(page, "/treino"); await foto(page, "04-desafios", "Desafios: os 12 desafios com 5 níveis e o melhor resultado por nível");
  await ir(page, "/atividades/noticia/2"); await foto(page, "05-desafio-briefing", "Briefing de um desafio: personagem, tarefa, escolha do cenário, prática, Ler em voz alta");
  await saltar(page); await pausa(page, 300);
  const fonte = (await page.locator(".dactilo").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
  await page.locator("textarea").first().click().catch(() => {});
  await page.keyboard.type(fonte.slice(0, 48), { delay: 20 }); await foto(page, "06-desafio-tarefa", "Desafio a decorrer (A Notícia: escrever no teclado)");
  await ir(page, "/atividades/painel/2"); await saltar(page); await foto(page, "06b-desafio-painel", "Desafio O Painel: seguir instruções num sítio simulado");
  await ir(page, "/atividades/matematica/3"); await saltar(page); await foto(page, "06c-desafio-infografia", "Desafio Infografia: escrita matemática no teclado");
  await ir(page, "/atividades/arquivo/2"); await saltar(page); await foto(page, "06g-desafio-arquivo", "Desafio O Arquivo: pastas, ficheiros, separadores e histórico");
  await ir(page, "/atividades/maqueta/3"); await foto(page, "06d-maqueta-briefing", "A Maqueta: briefing (com Ler em voz alta)");
  await saltar(page); await pausa(page, 1800);
  await foto(page, "06e-maqueta", "A Maqueta: manipulação 3D com ferramentas, tarefas, câmara e objetos");
  await page.getByRole("button", { name: "Rodar a câmara para a esquerda" }).click().catch(() => {});
  await page.getByRole("button", { name: "Aproximar a câmara" }).click().catch(() => {});
  await page.locator("#mq-objetos").locator("..").getByRole("button", { name: /^Telhado/ }).click().catch(() => {});
  await page.keyboard.press("n");
  await page.evaluate(() => window.scrollTo(0, 0));
  await foto(page, "06f-maqueta-em-uso", "A Maqueta a ser arrumada: telhado selecionado, cubo criado, tarefas assinaladas");
  await ir(page, "/atividades/revisao/2"); await saltar(page); await pausa(page, 300);
  await page.locator('section[aria-label="Cópia digital"] button.palavra').first().click().catch(() => {});
  await page.getByRole("button", { name: "Terminei" }).click().catch(() => {});
  await foto(page, "07-resultado-relatorio", "Resultado: pontuação, estrelas, dica e relatório por tarefa", true);
  await ir(page, "/codigo"); await foto(page, "08-codigo", "Entrar com o código do professor");
  await ir(page, "/professor"); await foto(page, "09-professor-montar", "Professor: montar uma prova (nível, desafios, segurança, jogos, alunos) com resumo ao lado", true);
  await page.getByRole("button", { name: /Criar código/ }).first().click().catch(() => {});
  await foto(page, "10-professor-codigo-qr", "Professor: código e QR para projetar na sala");
  await ir(page, "/jogos"); await foto(page, "11-jogos", "Jogos: seis jogos com 5 níveis", true);
  await ir(page, "/jogos/leitura/2"); await saltar(page); await foto(page, "12-jogo-biblioteca-viva", "Biblioteca Viva: ler autores portugueses com glossário");
  await ir(page, "/jogos/sala-trancada/3"); await saltar(page); await foto(page, "13-jogo-sala-trancada-notas", "A Sala Trancada: as notas com as pistas");
  await page.getByRole("tab", { name: /Cofre/ }).click().catch(() => {}); await foto(page, "13b-jogo-sala-trancada-cofre", "A Sala Trancada: o cofre");
  await ir(page, "/jogos/misterio/4"); await saltar(page); await foto(page, "14-jogo-misterio", "Quem Apagou a Reportagem?: pistas digitais e acusação");
  await ir(page, "/jogos/orcamento/3"); await saltar(page); await foto(page, "15-jogo-orcamento", "Orçamento da Visita de Estudo: folha de cálculo com fórmulas");
  await ir(page, "/jogos/correio/3"); await saltar(page); await foto(page, "16-jogo-correio", "Correio da Redação: escrever um email formal", true);
  await ir(page, "/jogos/robo/3"); await saltar(page); await foto(page, "17-jogo-robo", "O Robô da Redação: programar um robô");
  await ir(page, "/seguranca"); await foto(page, "18-seguranca", "Segurança digital: seis temas, informações e testes", true);
  await ir(page, "/seguranca/fraude"); await foto(page, "19-seguranca-fraude-info", "Informações: exemplos de fraude e sinais de alerta", true);
  await ir(page, "/seguranca/fraude/teste/2"); await saltar(page); await foto(page, "20-teste-email-desconfiado", "Teste O Email Desconfiado: legítima ou fraude?");
  await ir(page, "/seguranca/redes-sociais/teste/3"); await saltar(page);
  for (const b of (await page.getByRole("button", { name: /Ver quem publicou|Procurar noutras fontes/ }).all()).slice(0, 2)) await b.click();
  await foto(page, "21-teste-verdade-ou-boato", "Teste Verdade ou Boato?: verificar publicações");
  await ir(page, "/seguranca/boas-praticas/teste/2"); await saltar(page); await foto(page, "21b-teste-boas-praticas", "Teste Boas Práticas Online");
  await ir(page, "/seguranca/privacidade"); await foto(page, "21c-seguranca-privacidade-info", "Informações: privacidade e navegação (ler um endereço, cookies, limpar os dados)", true);
  await ir(page, "/seguranca/privacidade/teste/3"); await saltar(page); await foto(page, "21d-teste-endereco-certo", "Teste O Endereço Certo: qual é a ligação oficial?");
  await ir(page, "/seguranca/publicos"); await foto(page, "21e-seguranca-publicos-info", "Informações: computadores e Wi-Fi públicos", true);
  await ir(page, "/seguranca/publicos/teste/3"); await saltar(page); await foto(page, "21f-teste-na-biblioteca", "Teste Na Biblioteca: escolher a rede Wi-Fi oficial a partir do cartaz");
  await responderEAvancar(page); await foto(page, "21g-teste-na-biblioteca-antes-de-sair", "Teste Na Biblioteca: o que fazer antes de sair do computador público");
  await ir(page, "/seguranca/familia"); await foto(page, "21h-seguranca-familia-info", "Informações: família e controlo parental (inclui secção para pais)", true);
  await ir(page, "/seguranca/familia/teste/3"); await saltar(page); await foto(page, "21i-teste-acordo-familia-mitos", "Teste O Acordo da Família: mito ou facto?");
  await responderEAvancar(page); await foto(page, "21j-teste-acordo-familia-painel", "Teste O Acordo da Família: painel de controlo parental configurado em família");
  await ir(page, "/observatorio"); await foto(page, "23-observatorio", "Observatório: estatísticas anónimas");
  await ir(page, "/cartao"); await foto(page, "24-cartao", "O meu cartão de imprensa com carimbos");
  await ir(page, "/definicoes"); await foto(page, "25-definicoes", "Definições: aspeto, cenário, leitura, ajudas (botões grandes, Ler em voz alta, modo calmo), tempo alargado", true);
  await page.getByRole("heading", { name: "Ajudas" }).evaluate((el) => el.scrollIntoView({ block: "start" }));
  await foto(page, "25b-definicoes-ajudas", "Definições: o cartão Ajudas (botões grandes, Ler em voz alta, modo calmo)");
  await ir(page, "/sobre"); await foto(page, "26-sobre", "Sobre o projeto", true);
  for (const d of await page.locator("details.faq > summary").all()) await d.click();
  await page.getByRole("heading", { name: "Perguntas frequentes" }).evaluate((el) => el.scrollIntoView({ block: "start" }));
  await foto(page, "26b-sobre-perguntas-frequentes", "Sobre: perguntas frequentes abertas");
  await ctx.close();
}

// ── Ajudas ligadas: modo calmo e botões Ouvir; leitura facilitada e botões grandes
{
  const ctx = await contexto({ extra: { calmo: true, voz: true } });
  const page = await ctx.newPage();
  await ir(page, "/atividades/noticia/3"); await saltar(page); await pausa(page, 600);
  await foto(page, "27-modo-calmo-ouvir", "Modo calmo (sem relógio, só “O tempo está a contar…”) e botão Ouvir na instrução");
  await ctx.close();
}
{
  const ctx = await contexto({ extra: { leitura: "facilitada", alvos: "grandes", voz: true } });
  const page = await ctx.newPage();
  await ir(page, "/seguranca/familia/teste/2"); await saltar(page);
  await foto(page, "28-leitura-facilitada-botoes-grandes", "Leitura facilitada, botões grandes e Ouvir em cada pergunta (teste O Acordo da Família)");
  await ctx.close();
}

// ── Primeira página (resultado final de uma prova)
{
  const ctx = await contexto();
  const page = await ctx.newPage();
  await ir(page, "/professor");
  await page.getByText("Não pedir (resultados anónimos)").click({ force: true });
  await page.getByRole("button", { name: "Nenhuma" }).click(); // começa com tudo marcado
  for (const n of [/^A Notícia ·/, /^O Email Desconfiado ·/, /^Boas Práticas Online ·/]) await page.getByText(n).first().click({ force: true });
  await page.getByRole("button", { name: /Criar código/ }).click();
  await pausa(page, 500);
  const m = /([2-9A-HJKMNP-Z]{4}·[2-9A-HJKMNP-Z]{6,8})/.exec(await page.locator("body").innerText());
  await ir(page, "/codigo/" + m[1].replace("·", ""));
  await page.getByRole("button", { name: /Começar/ }).first().click();
  await pausa(page, 400);
  for (let k = 0; k < 160; k++) {
    if (await page.getByText("Guardar como imagem").isVisible().catch(() => false)) break;
    const sp = page.getByRole("button", { name: "Saltar a prática" });
    if (await sp.isVisible().catch(() => false)) { await sp.click(); await pausa(page, 300); continue; }
    const area = page.locator("textarea").first();
    if ((await area.count()) && (await area.isEditable().catch(() => false)) && !(await area.inputValue())) {
      const f = (await page.locator(".dactilo").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
      await area.fill(f);
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
    if (!ok) await pausa(page, 250);
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

// ── Vídeo b: Tutorial Professor (sequência P + gravação). O cursor percorre os quatro passos e um aluno entra com o código.
{
  const ctx = await contexto({ gravar: true, cursor: true });
  const page = await ctx.newPage();
  const P = (nome, desc) => foto(page, nome, desc, false, "sequencias/professor");
  await ir(page, "/professor"); await page.mouse.move(960, 540); await pausa(page, 800);
  await P("P01-professor", "A página Professor: montar uma prova");
  await apontar(page, page.getByRole("heading", { name: "1. Nível" }));
  await apontar(page, page.getByText(/^Nível 3 · Intermédio/).first(), { clicar: true });
  await P("P02-passo-1-nivel", "Passo 1: escolher o nível (Nível 3 · Intermédio)");
  await apontar(page, page.getByRole("heading", { name: /^2\. Atividades/ }));
  // A página começa com todos os desafios marcados: limpar e escolher três.
  await apontar(page, page.getByRole("button", { name: "Nenhuma" }), { clicar: true, espera: 300 });
  for (const n of [/^A Notícia ·/, /^Infografia ·/, /^O Email Desconfiado ·/]) await apontar(page, page.getByText(n).first(), { clicar: true, espera: 300 });
  await P("P03-passo-2-atividades", "Passo 2: escolher os desafios, testes de segurança e jogos");
  await apontar(page, page.getByRole("heading", { name: "3. Alunos" }));
  await apontar(page, page.getByText("Número de turma (recomendado)"), { clicar: true });
  await P("P04-passo-3-alunos", "Passo 3: como se identificam os alunos (número de turma)");
  await apontar(page, page.getByRole("button", { name: /Criar código/ }));
  await P("P05-criar-codigo", "Criar o código");
  await apontar(page, page.getByRole("button", { name: /Criar código/ }), { clicar: true, espera: 200 });
  await pausa(page, 1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" })); await pausa(page, 800);
  await P("P06-passo-4-codigo-qr", "Passo 4: o código e o QR para projetar na sala (recortar o aviso de instalação, se aparecer)");
  const m = /([2-9A-HJKMNP-Z]{4}·[2-9A-HJKMNP-Z]{6,8})/.exec(await page.locator("body").innerText());
  await pausa(page, 1500);
  // O aluno, noutro computador, entra com o código.
  await ir(page, "/codigo"); await pausa(page, 600);
  const campo = page.getByLabel("Código da sessão");
  await apontar(page, campo, { clicar: true });
  await page.keyboard.type(m[1].replace("·", ""), { delay: 140 });
  await P("P07-aluno-escreve-codigo", "O aluno escreve o código em Treinar → Código");
  await apontar(page, page.getByRole("button", { name: "Entrar" }), { clicar: true });
  await pausa(page, 1000);
  const numero = page.getByLabel(/número de turma/i).first();
  await apontar(page, numero, { clicar: true });
  await page.keyboard.type("12", { delay: 200 });
  await P("P08-aluno-numero", "O aluno indica o número de turma");
  await apontar(page, page.getByRole("button", { name: /Começar/ }).first(), { clicar: true });
  await pausa(page, 1200);
  await P("P09-aluno-comeca", "A prova do professor começa: primeiro desafio");
  await pausa(page, 1000);
  const video = page.video();
  await ctx.close();
  await video.saveAs(`${RAIZ}/gravacoes/professor.webm`);
  lista.push("gravacoes/professor.webm: percurso do Tutorial Professor (passos 1 a 4 e o aluno a entrar com o código), com cursor");
}

// ── Vídeo c: Tutorial Aluno (sequência A + gravação): Treinar, desafio e nível, cenário, tarefa, resultado, código, Definições.
{
  const ctx = await contexto({ gravar: true, cursor: true });
  const page = await ctx.newPage();
  const A = (nome, desc) => foto(page, nome, desc, false, "sequencias/aluno");
  await ir(page, "/"); await page.mouse.move(960, 400); await pausa(page, 800);
  await A("A01-inicio", "Início");
  await apontar(page, page.locator("main").getByRole("link", { name: /^Treinar/ }).first(), { clicar: true });
  await pausa(page, 600);
  await apontar(page, page.locator("main").getByRole("link", { name: /Desafios/ }).first());
  await A("A02-treinar", "Treinar: as cinco formas de treinar (cursor em Desafios)");
  await apontar(page, page.locator("main").getByRole("link", { name: /Desafios/ }).first(), { clicar: true });
  await pausa(page, 600);
  await apontar(page, page.getByRole("tab", { name: /^Nível 3/ }), { clicar: true });
  await A("A03-desafios-nivel", "Desafios: escolher o nível (Nível 3 · Intermédio)");
  await apontar(page, page.getByRole("link", { name: "Treinar nível 3" }).first());
  await A("A04-escolher-desafio", "Escolher o desafio (A Notícia)");
  await apontar(page, page.getByRole("link", { name: "Treinar nível 3" }).first(), { clicar: true });
  await pausa(page, 900);
  await apontar(page, page.getByText(/^Laboratório/).first(), { clicar: true });
  await pausa(page, 600);
  await A("A05-cenario", "Escolher o cenário (laboratório): o título e a personagem mudam, as regras não");
  await apontar(page, page.getByRole("button", { name: "Saltar a prática" }), { clicar: true });
  await pausa(page, 600);
  const f = (await page.locator(".dactilo").first().innerText().catch(() => "")).replace(/\s+/g, " ").trim();
  const area = page.locator("textarea").first();
  await apontar(page, area, { clicar: true });
  await page.keyboard.type(f.slice(0, 60), { delay: 45 });
  await A("A06-tarefa", "A tarefa: escrever no teclado");
  await page.keyboard.type(f.slice(60), { delay: 18 });
  await pausa(page, 800);
  // Com o texto completo o desafio termina sozinho; se não terminar, carrega em Terminei.
  const terminei = page.getByRole("button", { name: "Terminei" });
  if (await terminei.isVisible().catch(() => false)) await apontar(page, terminei, { clicar: true });
  // No nível 3 há uma segunda ronda com o teclado numérico: salta-se (a aplicação permite, sem penalização).
  const semTeclado = page.getByRole("button", { name: /^Não tenho/ });
  if (await semTeclado.isVisible().catch(() => false)) await apontar(page, semTeclado, { clicar: true });
  await pausa(page, 1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" })); await pausa(page, 600);
  await A("A07-resultado", "O resultado: pontuação, estrelas, dica e relatório tarefa a tarefa");
  await ir(page, "/treinar"); await pausa(page, 500);
  await apontar(page, page.locator("main").getByRole("link", { name: /Código/ }).first(), { clicar: true });
  await pausa(page, 600);
  await apontar(page, page.getByLabel("Código da sessão"), { clicar: true });
  await page.keyboard.type("TEC74F7KQ2", { delay: 120 });
  await A("A08-codigo", "Código: o aluno escreve o código que o professor deu");
  await apontar(page, page.locator("header").getByRole("link", { name: "Definições" }), { clicar: true });
  await pausa(page, 800);
  await A("A09-definicoes", "Definições: aspeto, cenário, tema, texto e contraste");
  await apontar(page, page.getByRole("heading", { name: "Ajudas" }));
  await page.getByRole("heading", { name: "Ajudas" }).evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  await pausa(page, 900);
  await A("A10-definicoes-ajudas", "Definições: botões grandes, Ler em voz alta, modo calmo, tempo alargado");
  await pausa(page, 1000);
  const video = page.video();
  await ctx.close();
  await video.saveAs(`${RAIZ}/gravacoes/aluno.webm`);
  lista.push("gravacoes/aluno.webm: percurso do Tutorial Aluno, com cursor");
}

rmSync(`${RAIZ}/gravacoes/.tmp`, { recursive: true, force: true });
await browser.close();
writeFileSync(`${RAIZ}/ecras/LISTA.txt`, lista.join("\n") + "\n", "utf8");
console.log(`${lista.length} ficheiros em ${RAIZ}`);
