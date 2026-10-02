// ─── Aleatoriedade partilhada pelas atividades ───────────────────────────────
// Todas as funções aceitam um gerador `r` (por omissão Math.random) para os testes poderem fixar a semente.

export type Gerador = () => number;

export function escolher<T>(l: readonly T[], r: Gerador = Math.random): T {
  return l[Math.floor(r() * l.length)];
}

export function misturar<T>(l: readonly T[], r: Gerador = Math.random): T[] {
  const a = [...l];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `n` elementos distintos, por ordem aleatória. */
export function amostra<T>(l: readonly T[], n: number, r: Gerador = Math.random): T[] {
  return misturar(l, r).slice(0, Math.min(n, l.length));
}

export function inteiro(min: number, max: number, r: Gerador = Math.random): number {
  return min + Math.floor(r() * (max - min + 1));
}

/** Gerador determinista (para testes e para reproduzir uma tentativa). */
export function semente(n: number): Gerador {
  let s = n >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Baralha as opções de uma pergunta de escolha múltipla e devolve o novo índice da correta. */
export function baralharOpcoes<T>(opcoes: readonly T[], correta: number, r: Gerador = Math.random): { opcoes: T[]; correta: number } {
  const ordem = misturar(opcoes.map((_, i) => i), r);
  return { opcoes: ordem.map((i) => opcoes[i]), correta: ordem.indexOf(correta) };
}
