// ─── Segurança digital: registo dos testes (um por tema) ─────────────────────
// Usam o motor das atividades (numero ≥ 200), mas ficam fora do teste por ciclo, dos códigos e dos carimbos.
import type { DefinicaoAtividade } from "../motor/tipos";
import type { TemaSeguranca } from "./conteudo";
import { definicao as boasPraticas } from "./boas-praticas";
import { definicao as fraude } from "./fraude";
import { definicao as redes } from "./redes";
import { definicao as privacidade } from "./privacidade";
import { definicao as publicos } from "./publicos";
import { definicao as familia } from "./familia";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TESTES_SEGURANCA: Record<TemaSeguranca, DefinicaoAtividade<any>> = {
  "boas-praticas": boasPraticas,
  fraude,
  "redes-sociais": redes,
  privacidade,
  publicos,
  familia,
};

export { TEMAS, AJUDA, type TemaSeguranca } from "./conteudo";
