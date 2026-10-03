// ─── Textos editáveis (backoffice) ───────────────────────────────────────────
// Os conteúdos continuam no código (são os valores por omissão). Cada objeto de conteúdo é registado aqui; o
// catálogo lista as frases (folhas de texto) desses objetos. No arranque, a aplicação pede ao Worker as alterações
// guardadas (/api/textos) e escreve-as por cima, antes de desenhar a página. Sem Worker (npm run dev, alojamento
// estático), fica tudo como no código.
//
// Chave de cada texto: "<prefixo>.<caminho>" (ex.: "contextos.jornal.briefs.noticia", "seguranca.temas.0.resumo").
// Identificadores, respostas automáticas e valores técnicos ficam de fora (lista NEGADAS e regras em `editavel`).

export interface EntradaTexto {
  chave: string;
  grupo: string; // "Páginas", "Atividades", "Segurança"…
  seccao: string; // "Início", "A Notícia"…
  caminho: string;
  padrao: string;
  longo: boolean;
  aviso?: string;
}

interface Fonte {
  prefixo: string;
  grupo: string;
  seccao: string;
  obj: unknown;
  negar: Set<string>;
  aviso?: string;
  padroes: Map<string, string>; // caminho → texto original (fotografado no registo)
}

/** Nomes de campos que nunca são texto para editar (identificadores, chaves de correção, valores técnicos). */
const NEGADAS = new Set([
  "id", "slug", "tipo", "chave", "chaves", "veredicto", "canal", "sinais", "cor", "fraude", "correta", "app", "email", "valor",
  "ferramenta", "acao", "campo", "formato", "rota", "para", "icone", "emoji", "dominio", "numero", "nivel", "fonte", "autor",
  "falecimento", "ficheiro", "pasta", "anexo", "outrosAnexos", "atalho", "tecla", "teclas", "aceites", "regex", "mascara",
]);

const fontes: Fonte[] = [];
let aplicadas: Record<string, string> = {};

function folhas(obj: unknown, caminho: string, negar: Set<string>, saida: Map<string, string>, chavePai = "") {
  if (typeof obj === "string") {
    if (editavel(obj, chavePai, negar)) saida.set(caminho, obj);
    return;
  }
  if (typeof obj !== "object" || obj === null || typeof obj === "function") return;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => folhas(v, caminho ? `${caminho}.${i}` : String(i), negar, saida, chavePai));
    return;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (NEGADAS.has(k) || negar.has(k) || typeof v === "function") continue;
    folhas(v, caminho ? `${caminho}.${k}` : k, negar, saida, k);
  }
}

/** Uma frase para pessoas: tem letras e não parece um identificador (minúsculas sem espaços, URLs, emails). */
function editavel(t: string, chave: string, negar: Set<string>): boolean {
  if (negar.has(chave)) return false;
  if (!/\p{L}/u.test(t)) return false;
  if (/^[a-z0-9_\-./]+$/.test(t) && !/\s/.test(t)) return false; // slugs e ficheiros
  if (/^https?:\/\//.test(t) || /^[^\s@]+@[^\s@]+$/.test(t)) return false;
  return true;
}

export function registar(prefixo: string, grupo: string, seccao: string, obj: unknown, opcoes: { negar?: string[]; aviso?: string } = {}) {
  if (fontes.some((f) => f.prefixo === prefixo)) return;
  const negar = new Set(opcoes.negar ?? []);
  const padroes = new Map<string, string>();
  folhas(obj, "", negar, padroes);
  fontes.push({ prefixo, grupo, seccao, obj, negar, aviso: opcoes.aviso, padroes });
}

export function catalogo(): EntradaTexto[] {
  return fontes.flatMap((f) =>
    [...f.padroes.entries()].map(([caminho, padrao]) => ({ chave: `${f.prefixo}.${caminho}`, grupo: f.grupo, seccao: f.seccao, caminho, padrao, longo: padrao.length > 90 || padrao.includes("\n"), aviso: f.aviso })),
  );
}

/** Escreve os textos guardados por cima dos objetos registados. Chaves desconhecidas são ignoradas. */
export function aplicar(valores: Record<string, string>) {
  aplicadas = { ...valores };
  for (const f of fontes) {
    for (const caminho of f.padroes.keys()) {
      const chave = `${f.prefixo}.${caminho}`;
      const novo = chave in valores && typeof valores[chave] === "string" ? valores[chave] : f.padroes.get(caminho)!;
      definirFolha(f.obj, caminho, novo);
    }
  }
}

function definirFolha(obj: unknown, caminho: string, valor: string) {
  const partes = caminho.split(".");
  let atual = obj as Record<string, unknown>;
  for (let i = 0; i < partes.length - 1; i++) {
    atual = atual?.[partes[i]] as Record<string, unknown>;
    if (typeof atual !== "object" || atual === null) return;
  }
  const ultima = partes[partes.length - 1];
  if (typeof atual[ultima] === "string") atual[ultima] = valor;
}

export const textosAplicados = () => aplicadas;

// ─── Comunicação com o Worker ────────────────────────────────────────────────
export interface PacoteTextos {
  valores: Record<string, string>;
  atualizadoEm?: string;
  versao?: number;
}

/** Pede os textos guardados (até 1,5 s; sem resposta, fica tudo como no código). */
export async function carregarTextos(): Promise<void> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const r = await fetch(`${import.meta.env.BASE_URL}api/textos`, { signal: ctrl.signal, headers: { accept: "application/json" } });
    clearTimeout(t);
    if (!r.ok || !(r.headers.get("content-type") ?? "").includes("json")) return;
    const p = (await r.json()) as PacoteTextos;
    if (p && typeof p.valores === "object") aplicar(p.valores);
  } catch {
    /* sem Worker: textos do código */
  }
}
