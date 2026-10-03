// ─── Biblioteca Viva: geração das rondas a partir do texto ───────────────────
import { amostra, inteiro, type Gerador } from "../../motor/aleatorio";
import type { TextoLiterario } from "./textos";

const PALAVRAS_VAZIAS = new Set(
  "a o as os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas para com sem que se e é ou mas não nem já só mais muito ao aos à às lhe lhes me te nos vos seu sua seus suas meu minha teu tua isto isso aquilo este esta esse essa ele ela eles elas quem como quando onde tão porque pois porém todo toda todos todas tudo nada cada aquele aquela aqueles aquelas ainda nunca sempre também então assim depois antes sobre entre mesmo mesma quanto quanta quantos quantas qual quais muito muita muitos muitas pouco poucos outro outra outros outras seja sejam tem têm ter era eram foi foram está estão são sou será vai vão minhas meus teus tuas nossa nosso nossos nossas dele dela".split(" "),
);

/** Divide o texto em partes: palavras (que podem virar lacunas) e o resto (espaços, pontuação, mudanças de linha). */
export function tokenizar(texto: string): { t: string; palavra: boolean }[] {
  const partes: { t: string; palavra: boolean }[] = [];
  const re = /\p{L}[\p{L}'’-]*\p{L}|\p{L}/gu;
  let ultimo = 0;
  for (const m of texto.matchAll(re)) {
    if (m.index! > ultimo) partes.push({ t: texto.slice(ultimo, m.index), palavra: false });
    partes.push({ t: m[0], palavra: true });
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < texto.length) partes.push({ t: texto.slice(ultimo), palavra: false });
  return partes;
}

export interface Lacuna {
  indice: number; // posição em `partes`
  certa: string;
}

/** Escolhe `n` palavras de conteúdo (4+ letras, não repetidas, espalhadas pelo texto) para ficarem em branco. */
export function gerarLacunas(texto: string, n: number, r: Gerador = Math.random): { partes: { t: string; palavra: boolean }[]; lacunas: Lacuna[] } {
  const partes = tokenizar(texto);
  const candidatas = partes
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.palavra && p.t.length >= 4 && !PALAVRAS_VAZIAS.has(p.t.toLowerCase()));
  // Uma ocorrência por palavra, para a resposta não ser ambígua.
  const vistas = new Set<string>();
  const unicas = candidatas.filter(({ p }) => {
    const k = p.t.toLowerCase();
    if (vistas.has(k)) return false;
    vistas.add(k);
    return true;
  });
  // Espalhar: divide o texto em n faixas e tira uma palavra de cada.
  const escolhidas: Lacuna[] = [];
  const faixa = unicas.length / Math.max(1, n);
  for (let k = 0; k < n && k * faixa < unicas.length; k++) {
    const grupo = unicas.slice(Math.floor(k * faixa), Math.max(Math.floor((k + 1) * faixa), Math.floor(k * faixa) + 1));
    const c = amostra(grupo, 1, r)[0];
    if (c) escolhidas.push({ indice: c.i, certa: c.p.t });
  }
  return { partes, lacunas: escolhidas };
}

/** Unidades para ordenar: versos (poema) ou segmentos entre pontuação (prosa). Devolve um bloco contínuo de `n`. */
export function unidadesOrdenar(t: TextoLiterario, n: number, r: Gerador = Math.random): string[] {
  const unidades =
    t.tipo === "poema"
      ? t.texto.split("\n").map((l) => l.trim()).filter(Boolean)
      : t.texto
          .split(/(?<=[,;:.—])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.split(/\s+/).length >= 2);
  const k = Math.min(n, unidades.length);
  const inicio = inteiro(0, unidades.length - k, r);
  return unidades.slice(inicio, inicio + k);
}

/** Frase para o ditado: um verso ou segmento com 4 a 14 palavras. */
export function fraseDitado(t: TextoLiterario, r: Gerador = Math.random, evitar: string[] = []): string {
  const unidades = (t.tipo === "poema" ? t.texto.split("\n") : t.texto.split(/(?<=[.;:])\s+/)).map((s) => s.trim()).filter(Boolean);
  const boas = unidades.filter((u) => {
    const n = u.split(/\s+/).length;
    return n >= 4 && n <= 14 && !evitar.includes(u);
  });
  const lista = boas.length ? boas : unidades;
  return lista[inteiro(0, lista.length - 1, r)];
}

export function semAcentos(t: string) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Compara uma palavra escrita com a certa. Sem `acentos`, aceita a palavra sem acentos. */
export function palavraCerta(escrita: string, certa: string, acentos: boolean): boolean {
  const a = escrita.trim().toLowerCase();
  const b = certa.toLowerCase();
  return acentos ? a === b : semAcentos(a) === semAcentos(b);
}
