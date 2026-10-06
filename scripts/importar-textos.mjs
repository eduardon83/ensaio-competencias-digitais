// ─── Passar os textos editados no backoffice para o código ───────────────────
// Uso:  node scripts/importar-textos.mjs <exportacao.json> [--verificar]
// O ficheiro é o "Exportar" do backoffice ({ valores: { chave: texto } }) ou só o mapa de chaves.
// Por agora trata as chaves "paginas.*" (src/textos/paginas.ts): percorre a árvore do TypeScript pelo caminho da chave
// (propriedades e índices) e troca apenas o texto desse campo. As outras chaves são listadas para tratar à mão.
// Com --verificar não grava nada: só diz o que mudaria.
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const [, , ficheiro, opcao] = process.argv;
if (!ficheiro) {
  console.error("Uso: node scripts/importar-textos.mjs <exportacao.json> [--verificar]");
  process.exit(1);
}
const bruto = JSON.parse(readFileSync(ficheiro, "utf8"));
const valores = bruto.valores ?? bruto;
const ALVO = "src/textos/paginas.ts";
const fonte = readFileSync(ALVO, "utf8");
const sf = ts.createSourceFile(ALVO, fonte, ts.ScriptTarget.Latest, true);

let raiz = null;
sf.forEachChild((n) => {
  if (ts.isVariableStatement(n))
    for (const d of n.declarationList.declarations) if (d.name.getText(sf) === "PAGINAS" && d.initializer && ts.isObjectLiteralExpression(d.initializer)) raiz = d.initializer;
});
if (!raiz) throw new Error("PAGINAS não encontrado em " + ALVO);

const nomeDe = (p) => (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name) ? p.name.text : null);
function encontrar(no, partes) {
  let atual = no;
  for (const parte of partes) {
    if (ts.isObjectLiteralExpression(atual)) {
      const p = atual.properties.find((x) => ts.isPropertyAssignment(x) && nomeDe(x) === parte);
      if (!p) return null;
      atual = p.initializer;
    } else if (ts.isArrayLiteralExpression(atual)) {
      atual = atual.elements[Number(parte)];
      if (!atual) return null;
    } else return null;
  }
  return ts.isStringLiteral(atual) || ts.isNoSubstitutionTemplateLiteral(atual) ? atual : null;
}

const trocas = [];
const fora = [];
const naoEncontradas = [];
for (const [chave, texto] of Object.entries(valores)) {
  if (!chave.startsWith("paginas.")) {
    fora.push(chave);
    continue;
  }
  const no = encontrar(raiz, chave.split(".").slice(1));
  if (!no) {
    naoEncontradas.push(chave);
    continue;
  }
  if (no.text === texto) continue;
  trocas.push({ inicio: no.getStart(sf), fim: no.getEnd(), novo: JSON.stringify(texto), chave });
}

let saida = fonte;
for (const t of trocas.sort((a, b) => b.inicio - a.inicio)) saida = saida.slice(0, t.inicio) + t.novo + saida.slice(t.fim);
console.log(`${trocas.length} textos alterados em ${ALVO}.`);
for (const t of trocas) console.log("  ✓", t.chave);
if (naoEncontradas.length) console.log("Chaves sem campo correspondente (o texto mudou de sítio?):\n  " + naoEncontradas.join("\n  "));
if (fora.length) console.log("Chaves fora de paginas.* (tratar à mão):\n  " + fora.join("\n  "));
if (opcao !== "--verificar") writeFileSync(ALVO, saida, "utf8");
