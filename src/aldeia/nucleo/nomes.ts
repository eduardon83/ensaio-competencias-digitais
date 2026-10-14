// ─── Aldeia Digital · nomes dos alunos ───────────────────────────────────────
// Três formas, só as que o professor permitiu: número de turma (1 a 99), primeiro nome (até 20 caracteres) ou nome
// anónimo gerado (animal do fato + adjetivo positivo, com concordância de género: "a Raposa Corajosa", "o Lince Veloz").
// O nome é único na turma, sem diferença de maiúsculas e acentos. Nada de adjetivos sobre corpo, aparência ou inteligência.
import { FATO, type ModoIdentificacao } from "./catalogo";

/** Adjetivos [masculino, feminino]. Os invariáveis repetem a forma. Ids estáveis = forma masculina. */
export const ADJETIVOS: [string, string][] = [
  ["Charmoso", "Charmosa"], ["Corajoso", "Corajosa"], ["Curioso", "Curiosa"], ["Atento", "Atenta"], ["Sábio", "Sábia"],
  ["Criativo", "Criativa"], ["Engenhoso", "Engenhosa"], ["Simpático", "Simpática"], ["Sereno", "Serena"], ["Destemido", "Destemida"],
  ["Veloz", "Veloz"], ["Alegre", "Alegre"], ["Gentil", "Gentil"], ["Brilhante", "Brilhante"], ["Feliz", "Feliz"],
];

export const NOME_MAX = 20;

/** Para comparar: NFC, minúsculas, sem acentos, espaços simples. */
export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Limpa o que o aluno escreveu: NFC, sem caracteres invisíveis nem de controlo, só letras, números, espaço e hífen. */
export function limparNome(nome: string): string {
  return nome
    .normalize("NFC")
    .replace(/[\p{C}\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/gu, "")
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NOME_MAX);
}

// Palavras impróprias (pt-PT), comparadas sem acentos, com e sem trocas comuns de letras por algarismos.
// Lista curta e conservadora: o professor pode sempre mudar o nome de um lugar no painel.
const IMPROPRIAS = [
  "merda", "caralho", "foda", "fodas", "foder", "fodido", "puta", "puto", "putas", "cabrao", "corno", "cona", "pila", "piroca",
  "colhoes", "conas", "badalhoco", "badalhoca", "paneleiro", "maricas", "bicha", "fufa", "cu", "rabo", "mamas", "tetas", "porra", "chupa",
  "estupido", "estupida", "idiota", "burro", "burra", "parvo", "parva", "otario", "otaria", "atrasado", "mongo", "anormal", "imbecil",
  "gordo", "gorda", "feio", "feia", "nazi", "hitler", "sexo", "porno", "droga", "matar", "morte", "suicidio", "preto", "macaco", "cigano",
];
const TROCAS: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

export function temPalavraImpropria(nome: string): boolean {
  const base = normalizarNome(nome);
  const trocado = base.replace(/[0134578@$]/g, (c) => TROCAS[c] ?? c);
  for (const variante of [base, trocado, trocado.replace(/(.)\1+/g, "$1")]) {
    const palavras = variante.split(/[\s-]+/);
    const junto = variante.replace(/[\s-]+/g, "");
    if (IMPROPRIAS.some((p) => palavras.includes(p) || (p.length >= 5 && junto.includes(p)))) return true;
  }
  return false;
}

export type ErroNome = "vazio" | "longo" | "improprio" | "numero" | "palavras" | "forma";

/** Valida um nome escrito pelo aluno para o modo pedido. Devolve o nome limpo ou um erro. */
export function validarNome(texto: string, modo: ModoIdentificacao): { nome: string } | { erro: ErroNome } {
  if (modo === "numero") {
    const n = texto.trim();
    if (!/^\d{1,2}$/.test(n) || Number(n) < 1) return { erro: "numero" };
    return { nome: String(Number(n)) };
  }
  if (texto.normalize("NFC").trim().length > NOME_MAX) return { erro: "longo" };
  const limpo = limparNome(texto);
  if (!limpo) return { erro: "vazio" };
  if (modo === "nome" && limpo.includes(" ")) return { erro: "palavras" };
  if (modo === "nome" && !/^[\p{L}-]+$/u.test(limpo)) return { erro: "forma" };
  if (modo === "anonimo" && !nomeAnonimoValido(limpo)) return { erro: "forma" };
  if (temPalavraImpropria(limpo)) return { erro: "improprio" };
  return { nome: limpo };
}

/** Nome anónimo de um fato com um adjetivo, na forma certa para o género do animal. */
export function nomeAnonimo(fato: string, adjetivo: number): string {
  const f = FATO.get(fato);
  const a = ADJETIVOS[((adjetivo % ADJETIVOS.length) + ADJETIVOS.length) % ADJETIVOS.length];
  if (!f) return a[0];
  return `${f.nome} ${f.genero === "f" ? a[1] : a[0]}`;
}

/** Aceita só nomes anónimos gerados (animal de um fato + adjetivo da lista, na forma certa). */
export function nomeAnonimoValido(nome: string): boolean {
  const n = normalizarNome(nome);
  for (const f of FATO.values()) {
    const animal = normalizarNome(f.nome);
    if (!n.startsWith(animal + " ")) continue;
    const resto = n.slice(animal.length + 1);
    if (ADJETIVOS.some((a) => normalizarNome(f.genero === "f" ? a[1] : a[0]) === resto)) return true;
  }
  return false;
}

/** O fato de um nome anónimo (o animal do nome é o fato proposto). */
export function fatoDoNomeAnonimo(nome: string): string | null {
  const n = normalizarNome(nome);
  let melhor: string | null = null;
  let comprimento = 0;
  for (const f of FATO.values()) {
    const animal = normalizarNome(f.nome);
    if (n.startsWith(animal + " ") && animal.length > comprimento) {
      melhor = f.id;
      comprimento = animal.length;
    }
  }
  return melhor;
}

/** Três propostas de nome anónimo com fatos livres (sorteio). */
export function proporNomesAnonimos(fatosLivres: string[], n = 3, aleatorio: () => number = Math.random): string[] {
  const fatos = [...fatosLivres];
  for (let i = fatos.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [fatos[i], fatos[j]] = [fatos[j], fatos[i]];
  }
  return fatos.slice(0, n).map((f) => nomeAnonimo(f, Math.floor(aleatorio() * ADJETIVOS.length)));
}

/** Artigo do nome anónimo ("o"/"a") para os textos com {o}. Números e primeiros nomes: sem artigo. */
export function generoDoNome(nome: string, fato: string): "m" | "f" | null {
  const f = FATO.get(fato);
  if (!f || !nomeAnonimoValido(nome)) return null;
  return f.genero;
}

/** Como mostrar o nome: número de turma → "N.º 7"; os outros ficam como estão. */
export function nomeVisivel(nome: string): string {
  return /^\d+$/.test(nome) ? `N.º ${nome}` : nome;
}
