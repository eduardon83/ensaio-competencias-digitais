// ─── Recalibração dos limiares a partir dos dados do piloto ──────────────────
// Uso: node scripts/recalibrar.mjs tentativas.csv [teste.csv]
//   tentativas.csv = folha "tentativa" da folha de cálculo de telemetria, exportada em CSV (Ficheiro → Transferir → CSV).
//   teste.csv (opcional) = folha "teste".
// Escreve docs/RECALIBRACAO.md com, por atividade e nível: n, mediana, quartis, distribuição pelas faixas e
// sugestões concretas (alvo de palavras por minuto, tempos de referência, nível mais fácil/difícil).
// Objetivo da especificação: mediana entre 60 e 70 em cada nível. As sugestões são para decisão humana.
import { readFileSync, writeFileSync } from "node:fs";

const [ficheiro, ficheiroTeste] = process.argv.slice(2);
if (!ficheiro) {
  console.error("Uso: node scripts/recalibrar.mjs tentativas.csv [teste.csv]");
  process.exit(1);
}

/** CSV com aspas (formato do Google Sheets). */
function lerCsv(texto) {
  const linhas = [];
  let campo = "", linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo); campo = "";
      if (linha.some((x) => x !== "")) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas;
  return resto.map((l) => Object.fromEntries(cab.map((k, i) => [k.trim(), l[i] ?? ""])));
}

const quantil = (xs, q) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const p = (s.length - 1) * q;
  const b = Math.floor(p);
  return s[b] + (s[Math.min(b + 1, s.length - 1)] - s[b]) * (p - b);
};
const r1 = (x) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : "—");
const FAIXAS = [["A começar", 0, 39], ["Em progresso", 40, 64], ["Confiante", 65, 84], ["Autónomo", 85, 100]];
// Valores atuais no código (para comparar com as sugestões).
const ALVO_WPM = { 1: 8, 2: 15, 3: 25, 4: 35, 5: 50 };
const N_MINIMO = 30;

const tentativas = lerCsv(readFileSync(ficheiro, "utf8")).filter((t) => t.atividade && t.pontuacao !== "");
const grupos = new Map();
for (const t of tentativas) {
  const k = `${t.atividade}|${t.nivel}`;
  if (!grupos.has(k)) grupos.set(k, []);
  let m = {};
  try { m = JSON.parse(t.metricas || "{}"); } catch { /* métricas em falta */ }
  grupos.get(k).push({ p: Number(t.pontuacao), d: Number(t.duracaoS), ext: Number(t.extensaoTempo || 1), m, origem: t.origem, disp: t.dispositivo });
}

const linhas = [];
const sugestoes = [];
for (const [k, xs] of [...grupos.entries()].sort()) {
  const [atividade, nivel] = k.split("|");
  const ps = xs.map((x) => x.p);
  const med = quantil(ps, 0.5);
  const dist = FAIXAS.map(([, a, b]) => Math.round((100 * ps.filter((p) => p >= a && p <= b).length) / ps.length));
  linhas.push(`| ${atividade} | ${nivel} | ${xs.length} | ${r1(med)} | ${r1(quantil(ps, 0.25))}–${r1(quantil(ps, 0.75))} | ${dist.join(" / ")} | ${r1(quantil(xs.map((x) => x.d), 0.5))} s |`);
  if (xs.length < N_MINIMO) {
    sugestoes.push(`- **${atividade} · nível ${nivel}:** só ${xs.length} tentativas (mínimo recomendado ${N_MINIMO}). Recolher mais dados antes de mudar.`);
    continue;
  }
  const semExtensao = xs.filter((x) => x.ext === 1);
  if (med > 70) sugestoes.push(`- **${atividade} · nível ${nivel}:** mediana ${r1(med)} (acima de 70). O nível está fácil: aumentar a exigência (mais itens, menos tempo ou alvos mais altos).`);
  else if (med < 60) sugestoes.push(`- **${atividade} · nível ${nivel}:** mediana ${r1(med)} (abaixo de 60). O nível está difícil: reduzir a exigência (menos itens, mais tempo ou alvos mais baixos).`);
  else sugestoes.push(`- **${atividade} · nível ${nivel}:** mediana ${r1(med)}, dentro do intervalo 60–70. Manter.`);
  if (atividade === "noticia") {
    const wpm = semExtensao.map((x) => Number(x.m.wpm)).filter(Number.isFinite);
    if (wpm.length >= N_MINIMO) {
      const alvo = Math.round(quantil(wpm, 0.5) / 0.75);
      sugestoes.push(`  - Palavras por minuto: mediana ${r1(quantil(wpm, 0.5))}. Alvo atual ${ALVO_WPM[nivel]}; sugestão ${alvo} (a mediana fica a 75 % do alvo). Mudar em \`src/atividades/noticia/index.tsx\`.`);
    }
  }
  if (["encontra", "matematica"].includes(atividade)) {
    const seg = semExtensao.map((x) => x.d).filter(Number.isFinite);
    if (seg.length >= N_MINIMO) sugestoes.push(`  - Tempo de referência sugerido: ${Math.round(quantil(seg, 0.5))} s (mediana sem tempo alargado). Campo \`tempoReferenciaSeg\` no ficheiro da atividade.`);
  }
  if (atividade === "painel") {
    const pen = xs.map((x) => Number(x.m.penalizacaoTempo)).filter(Number.isFinite);
    if (pen.length && quantil(pen, 0.5) >= 4) sugestoes.push("  - Muitos alunos perdem pontos por tempo parado: rever a clareza das instruções ou subir o limite de 20 s por tarefa.");
  }
}

// Faixas globais: percentis das pontuações para ver se as faixas separam bem os alunos.
const todas = tentativas.map((t) => Number(t.pontuacao));
const percentis = [0.25, 0.5, 0.75, 0.9].map((q) => `P${q * 100}: ${r1(quantil(todas, q))}`).join(" · ");
let blocoTeste = "";
if (ficheiroTeste) {
  const testes = lerCsv(readFileSync(ficheiroTeste, "utf8"));
  const porCiclo = {};
  for (const t of testes) (porCiclo[t.ciclo] ??= []).push(Number(t.pontuacaoGlobal));
  blocoTeste = `\n## Testes completos por ciclo\n\n| Ciclo | n | Mediana | P25–P75 |\n|---|---|---|---|\n${Object.entries(porCiclo).map(([c, xs]) => `| ${c} | ${xs.length} | ${r1(quantil(xs, 0.5))} | ${r1(quantil(xs, 0.25))}–${r1(quantil(xs, 0.75))} |`).join("\n")}\n`;
}

const md = `# Recalibração dos limiares

Gerado por \`node scripts/recalibrar.mjs\` em ${new Date().toISOString().slice(0, 10)} a partir de ${tentativas.length} tentativas.
Objetivo: mediana entre 60 e 70 em cada atividade e nível. Grupos com menos de ${N_MINIMO} tentativas não geram sugestões de mudança.

Percentis globais das pontuações: ${percentis}.

## Por atividade e nível

| Atividade | Nível | n | Mediana | P25–P75 | Faixas (% A começar / Em progresso / Confiante / Autónomo) | Duração mediana |
|---|---|---|---|---|---|---|
${linhas.join("\n")}

## Sugestões

${sugestoes.join("\n")}
${blocoTeste}
## Como aplicar

1. Mudar os valores indicados nos ficheiros das atividades (\`src/atividades/<atividade>/index.tsx\`).
2. Se a distribuição global ficar desequilibrada, ajustar as faixas em \`src/motor/tipos.ts\` (\`FAIXAS\`).
3. Correr \`npm test\`, publicar e repetir a análise com os dados seguintes. Registar cada mudança em AGENTS.md.
`;
writeFileSync(new URL("../docs/RECALIBRACAO.md", import.meta.url), md);
console.log(`docs/RECALIBRACAO.md escrito (${tentativas.length} tentativas, ${grupos.size} grupos).`);
