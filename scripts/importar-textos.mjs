// ─── Passar os textos editados no backoffice para o código ───────────────────
// Uso:  node scripts/importar-textos.mjs <exportacao.json> [--verificar]
// O ficheiro é o "Exportar" do backoffice ({ valores: { chave: texto } }) ou só o mapa de chaves.
// Trata as chaves "paginas.*" (src/textos/paginas.ts) e as da Aldeia Digital ("aldeia.emails.*", "aldeia.cidadania.*"
// e "aldeia.*"): percorre a árvore do TypeScript pelo caminho da chave (propriedades e índices) e troca apenas o
// texto desse campo. As outras chaves são listadas para tratar à mão. Com --verificar não grava nada.
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";

const [, , ficheiro, opcao] = process.argv;
if (!ficheiro) {
  console.error("Uso: node scripts/importar-textos.mjs <exportacao.json> [--verificar]");
  process.exit(1);
}
const bruto = JSON.parse(readFileSync(ficheiro, "utf8"));
const valores = bruto.valores ?? bruto;

// Por ordem: o primeiro prefixo que serve ganha. `corte` = partes da chave antes do caminho dentro da constante.
const ALVOS = [
  { prefixo: "paginas.", ficheiro: "src/textos/paginas.ts", constante: "PAGINAS", corte: 1 },
  { prefixo: "aldeia.emails.", ficheiro: "src/aldeia/textos-emails.ts", constante: "ALDEIA_EMAILS", corte: 2 },
  { prefixo: "aldeia.cidadania.", ficheiro: "src/aldeia/cidadania/conteudo.ts", constante: "CIDADANIA", corte: 2 },
  { prefixo: "aldeia.", ficheiro: "src/aldeia/textos.ts", constante: "ALDEIA", corte: 1 },
];

const nomeDe = (p) => (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name) ? p.name.text : null);
const desembrulhar = (n) => (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression?.(n) || ts.isParenthesizedExpression(n)) ? desembrulhar(n.expression) : n);
function encontrar(no, partes) {
  let atual = desembrulhar(no);
  for (const parte of partes) {
    if (ts.isObjectLiteralExpression(atual)) {
      const p = atual.properties.find((x) => ts.isPropertyAssignment(x) && nomeDe(x) === parte);
      if (!p) return null;
      atual = desembrulhar(p.initializer);
    } else if (ts.isArrayLiteralExpression(atual)) {
      atual = desembrulhar(atual.elements[Number(parte)]);
      if (!atual) return null;
    } else return null;
  }
  return ts.isStringLiteral(atual) || ts.isNoSubstitutionTemplateLiteral(atual) ? atual : null;
}

const fora = [];
const porAlvo = new Map(ALVOS.map((a) => [a, []]));
for (const [chave, texto] of Object.entries(valores)) {
  const alvo = ALVOS.find((a) => chave.startsWith(a.prefixo));
  if (!alvo) fora.push(chave);
  else porAlvo.get(alvo).push([chave, texto]);
}

for (const [alvo, lista] of porAlvo) {
  if (!lista.length) continue;
  const fonte = readFileSync(alvo.ficheiro, "utf8");
  const sf = ts.createSourceFile(alvo.ficheiro, fonte, ts.ScriptTarget.Latest, true);
  let raiz = null;
  sf.forEachChild((n) => {
    if (ts.isVariableStatement(n)) for (const d of n.declarationList.declarations) if (d.name.getText(sf) === alvo.constante && d.initializer) raiz = desembrulhar(d.initializer);
  });
  if (!raiz) throw new Error(`${alvo.constante} não encontrado em ${alvo.ficheiro}`);
  const trocas = [];
  const naoEncontradas = [];
  for (const [chave, texto] of lista) {
    const no = encontrar(raiz, chave.split(".").slice(alvo.corte));
    if (!no) {
      naoEncontradas.push(chave);
      continue;
    }
    if (no.text === texto) continue;
    trocas.push({ inicio: no.getStart(sf), fim: no.getEnd(), novo: JSON.stringify(texto), chave });
  }
  let saida = fonte;
  for (const t of trocas.sort((a, b) => b.inicio - a.inicio)) saida = saida.slice(0, t.inicio) + t.novo + saida.slice(t.fim);
  console.log(`${trocas.length} textos alterados em ${alvo.ficheiro}.`);
  for (const t of trocas) console.log("  ✓", t.chave);
  if (naoEncontradas.length) console.log("Chaves sem campo correspondente (o texto mudou de sítio?):\n  " + naoEncontradas.join("\n  "));
  if (opcao !== "--verificar" && trocas.length) writeFileSync(alvo.ficheiro, saida, "utf8");
}
if (fora.length) console.log("Chaves por tratar à mão:\n  " + fora.join("\n  "));
