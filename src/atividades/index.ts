// ─── Registo de atividades ───────────────────────────────────────────────────
import type { DefinicaoAtividade } from "../motor/tipos";
import { definicao as noticia } from "./noticia";
import { definicao as painel } from "./painel";
import { definicao as revisao } from "./revisao";
import { definicao as paginacao } from "./paginacao";
import { definicao as teclas } from "./teclas";
import { definicao as encontra } from "./encontra";
import { definicao as matematica } from "./matematica";
import { arquivo, cartao, fecho, simulador } from "./embreve";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ATIVIDADES: DefinicaoAtividade<any>[] = [noticia, painel, revisao, arquivo, cartao, paginacao, fecho, teclas, encontra, simulador, matematica].sort((a, b) => a.numero - b.numero);

export const DISPONIVEIS = ATIVIDADES.filter((a) => a.disponivel);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function porSlug(slug: string): DefinicaoAtividade<any> | undefined {
  return ATIVIDADES.find((a) => a.slug === slug);
}
