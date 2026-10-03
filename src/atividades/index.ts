// ─── Registo de atividades ───────────────────────────────────────────────────
import type { DefinicaoAtividade } from "../motor/tipos";
import { definicao as noticia } from "./noticia";
import { definicao as painel } from "./painel";
import { definicao as revisao } from "./revisao";
import { definicao as arquivo } from "./arquivo";
import { definicao as cartao } from "./cartao";
import { definicao as paginacao } from "./paginacao";
import { definicao as fecho } from "./fecho";
import { definicao as teclas } from "./teclas";
import { definicao as encontra } from "./encontra";
import { definicao as simulador } from "./simulador";
import { definicao as matematica } from "./matematica";
import { definicao as maqueta } from "./maqueta";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ATIVIDADES: DefinicaoAtividade<any>[] = [noticia, painel, revisao, arquivo, cartao, paginacao, fecho, teclas, encontra, simulador, matematica, maqueta].sort((a, b) => a.numero - b.numero);

export const DISPONIVEIS = ATIVIDADES.filter((a) => a.disponivel);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function porSlug(slug: string): DefinicaoAtividade<any> | undefined {
  return ATIVIDADES.find((a) => a.slug === slug);
}
