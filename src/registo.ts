// ─── Registo geral: atividades, testes de segurança e jogos ──────────────────
// As atividades (src/atividades) contam para o teste por ciclo e para os carimbos. Os testes de segurança e os
// jogos ficam fora disso, mas o professor pode incluí-los numa prova (código de sessão).
import type { DefinicaoAtividade } from "./motor/tipos";
import { ATIVIDADES, DISPONIVEIS } from "./atividades";
import { TESTES_SEGURANCA } from "./seguranca";
import { JOGOS } from "./jogos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Def = DefinicaoAtividade<any>;

export const SEGURANCA: Def[] = Object.values(TESTES_SEGURANCA);
export { JOGOS };

/** Grupos mostrados ao professor ao montar uma prova. */
export const GRUPOS: { id: "atividades" | "seguranca" | "jogos"; nome: string; itens: Def[] }[] = [
  { id: "atividades", nome: "Atividades", itens: DISPONIVEIS },
  { id: "seguranca", nome: "Segurança digital", itens: SEGURANCA },
  { id: "jogos", nome: "Jogos", itens: JOGOS },
];

export const TODOS: Def[] = [...ATIVIDADES, ...SEGURANCA, ...JOGOS];

export function qualquerPorSlug(slug: string): Def | undefined {
  return TODOS.find((a) => a.slug === slug);
}
