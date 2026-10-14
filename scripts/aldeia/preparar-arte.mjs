// ─── Aldeia Digital: copia a arte do pacote para a aplicação ──────────────────
// Uso:  node scripts/aldeia/preparar-arte.mjs
// Lê design/aldeia-digital (pacote de ilustração) e escreve:
//   public/aldeia/…                     imagens na resolução nativa (1 px de arte = 1 px), sem o sufixo "@nativo"
//   src/aldeia/arte/manifesto.json      dados de desenho (grelhas, âncoras, pivôs, fotogramas, rampas de cor)
//   src/aldeia/nucleo/catalogo-arte.json ids e nomes que o servidor também valida (fatos, cosmética, cores, troféus)
// A aplicação escala por números inteiros (image-rendering: pixelated / imageSmoothingEnabled = false).
// Correr de novo sempre que o pacote de arte mudar. As cenas em sequência, o modo calmo pré-desenhado, as maquetas
// e o guia não são copiados: a aplicação monta o nascimento por camadas.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ARTE = join(RAIZ, "design", "aldeia-digital");
const PUBLICO = join(RAIZ, "public", "aldeia");
const lerJson = (p) => JSON.parse(readFileSync(join(ARTE, p), "utf8"));

if (!existsSync(ARTE)) {
  console.error("Falta o pacote de arte em design/aldeia-digital.");
  process.exit(1);
}

// Pastas a copiar (relativas ao pacote) e exclusões.
const PASTAS = [
  "avatares/fatos", "avatares/fatos-extintos", "avatares/caras", "avatares/cabelos", "avatares/padroes", "avatares/cosmetica", "avatares/emblemas",
  "nascimento-v2", "nascimento/cegonha", "nascimento/efeitos",
  "mundo/edificios", "mundo/mosaicos", "mundo/aderecos", "mundo/casa", "mundo/interior",
  "personagens", "missoes", "ui",
];
const EXCLUIR = [/nascimento-v2[\\/](calmo|sequencia)/, /casa-exemplo/, /-exemplo\./];

function* ficheiros(pasta) {
  for (const nome of readdirSync(pasta)) {
    const p = join(pasta, nome);
    if (statSync(p).isDirectory()) yield* ficheiros(p);
    else yield p;
  }
}

rmSync(PUBLICO, { recursive: true, force: true });
let n = 0;
let bytes = 0;
for (const pasta of PASTAS) {
  for (const f of ficheiros(join(ARTE, pasta))) {
    const rel = relative(ARTE, f).replaceAll("\\", "/");
    if (!rel.endsWith("@nativo.png") || EXCLUIR.some((r) => r.test(rel))) continue;
    const destino = join(PUBLICO, rel.replace("@nativo.png", ".png"));
    mkdirSync(dirname(destino), { recursive: true });
    copyFileSync(f, destino);
    n++;
    bytes += statSync(f).size;
  }
}
// Mapa inteiro (dia e entardecer): banda dos briefings e miniatura do painel do professor.
for (const luz of ["dia", "entardecer"]) {
  const f = join(ARTE, "mundo", "mapa", `mapa-${luz}@nativo.png`);
  const destino = join(PUBLICO, "mundo", "mapa", `mapa-${luz}.png`);
  mkdirSync(dirname(destino), { recursive: true });
  copyFileSync(f, destino);
  n++;
  bytes += statSync(f).size;
}

// ── Manifesto de desenho ─────────────────────────────────────────────────────
const av = lerJson("avatares/avatares.json");
const mundo = lerJson("mundo/mundo.json");
const trofeus = lerJson("mundo/interior/trofeus/trofeus.json");
const missoes = lerJson("missoes/missoes.json");
const personagens = lerJson("personagens/personagens.json");
const nascimento = lerJson("nascimento-v2/nascimento.json");
const movimento = lerJson("movimento.json");

// Metadados das folhas em tira (célula, fotogramas, fps, pivô), pelo caminho público sem extensão.
const tiras = {};
for (const pasta of ["mundo/aderecos", "nascimento/cegonha", "nascimento/efeitos", "ui", "personagens", "mundo/casa/bandeiras"]) {
  for (const f of ficheiros(join(ARTE, pasta))) {
    const rel = relative(ARTE, f).replaceAll("\\", "/");
    if (!rel.endsWith(".json") || /@(2x|nativo)\.json$/.test(rel) || rel.endsWith("personagens.json")) continue;
    const d = JSON.parse(readFileSync(f, "utf8"));
    if (!d.celula) continue;
    tiras[rel.replace(/\.json$/, "")] = { celula: d.celula, fotogramas: d.fotogramas, fps: d.fps, ciclo: d.ciclo, pivo: d.pivo };
  }
}
// Folhas novas da cegonha (v2) e o ovo a abanar: tiras horizontais com a mesma célula.
tiras["nascimento-v2/cegonha/cegonha-entregar"] = { celula: [64, 64], fotogramas: 8, fps: 12, ciclo: false, pivo: [32, 60] };
tiras["nascimento-v2/cegonha/cegonha-pousar-trouxa"] = { celula: [64, 64], fotogramas: 4, fps: 12, ciclo: false, pivo: [32, 60] };

const fatoArte = (f, colecao) => ({ id: f.id, rampa: f.rampa, colecao });
const manifesto = {
  _nota: "Gerado por scripts/aldeia/preparar-arte.mjs a partir de design/aldeia-digital. Não editar à mão.",
  avatar: {
    celula: av.celula,
    fps: av.fps,
    linhas: av.linhas.map((l) => ({ anim: l.anim, dir: l.dir, frames: l.frames })),
    ordem: av.ordem_camadas,
    ancoras: av.ancoras,
    fatos: [...av.fatos.map((f) => fatoArte(f, "atuais")), ...av.fatos_extintos.map((f) => fatoArte(f, "extintos"))],
    cores: av.cores_fato,
    peles: av.peles,
    coresCabelo: av.cores_cabelo,
    cosmetica: Object.fromEntries(Object.entries(av.cosmetica).map(([id, c]) => [id, { cat: c.cat, ancora: c.anchor, pivo: c.pivot, tamanho: c.size, frente: c.ficheiros.frente.replace(".png", ""), costas: c.ficheiros.costas?.replace(".png", "") ?? null }])),
  },
  mundo: {
    edificios: Object.fromEntries(Object.entries(mundo).filter(([, v]) => v.estados).map(([id, v]) => [id, { pegada: v.pegada, estados: Object.fromEntries(Object.entries(v.estados).map(([e, d]) => [e, { origem: d.origem_mosaico_norte, ancoras: d.ancoras }])) }])),
    casa: { origem: mundo.casa.origem_mosaico_norte, ancoras: mundo.casa.ancoras, paredes: mundo.casa.paredes, telhados: mundo.casa.telhados, portas: mundo.casa.portas },
    interior: { origem: mundo.interior.origem_grelha, trofeus: mundo.interior.trofeus, moldura: mundo.interior.moldura, moveis: mundo.interior.moveis },
  },
  trofeus: { parede: trofeus.parede, vitrine: trofeus.vitrine },
  missoes: Object.fromEntries(Object.entries(missoes).map(([id, m]) => [id, m.situacoes.map((s) => ({ ancoras: s.ancoras_1x, pose: s.pose_avatar }))])),
  personagens: Object.keys(personagens),
  nascimento: { fps: nascimento.fps, cena: nascimento.cena, segmentos: nascimento.segmentos },
  movimento,
  tiras,
};
const destManifesto = join(RAIZ, "src", "aldeia", "arte", "manifesto.json");
mkdirSync(dirname(destManifesto), { recursive: true });
writeFileSync(destManifesto, JSON.stringify(manifesto));

// ── Catálogo (ids e nomes) partilhado com o servidor ─────────────────────────
const catalogo = {
  _nota: "Gerado por scripts/aldeia/preparar-arte.mjs. Ids validados pelo Worker; nomes editáveis no backoffice através de src/aldeia/textos.",
  fatos: [...av.fatos.map((f) => ({ id: f.id, nome: f.nome, genero: f.genero, colecao: "atuais" })), ...av.fatos_extintos.map((f) => ({ id: f.id, nome: f.nome, genero: f.genero, colecao: "extintos", nota: f.nota ?? undefined }))],
  cores: Object.keys(av.cores_fato),
  peles: Object.keys(av.peles),
  cabelos: av.cabelos,
  coresCabelo: Object.keys(av.cores_cabelo),
  padroes: av.padroes,
  cosmetica: Object.entries(av.cosmetica).map(([id, c]) => ({ id, cat: c.cat, nome: c.nome })),
  emblemas: av.emblemas.map((e) => ({ id: e.id, nome: e.nome })),
  trofeus: trofeus.trofeus.map((t) => ({ id: t.id, nome: t.nome, familia: t.familia, regra: t.regra })),
  casa: { paredes: Object.keys(mundo.casa.paredes), telhados: Object.keys(mundo.casa.telhados), portas: Object.keys(mundo.casa.portas) },
};
const destCatalogo = join(RAIZ, "src", "aldeia", "nucleo", "catalogo-arte.json");
mkdirSync(dirname(destCatalogo), { recursive: true });
writeFileSync(destCatalogo, JSON.stringify(catalogo, null, 1));

console.log(`Arte: ${n} imagens, ${Math.round(bytes / 1024)} kB em public/aldeia.`);
console.log(`Manifesto: ${Math.round(JSON.stringify(manifesto).length / 1024)} kB. Catálogo: ${catalogo.fatos.length} fatos, ${catalogo.cosmetica.length} itens.`);
