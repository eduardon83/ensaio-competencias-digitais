// ─── Escolha do nível (1 a 5) dentro do cartão de cada desafio, jogo ou teste ──
// Lista nativa nos dois formatos (via Seletor). Cada opção mostra o melhor resultado guardado nesse nível.
import { repositorioLocal } from "../dados/repositorio";
import { NIVEIS, NOME_NIVEL, type Nivel } from "../motor/tipos";
import { Seletor } from "../ui";

export function SeletorNivel({ id, slug, valor, aoMudar }: { id: string; slug: string; valor: Nivel; aoMudar: (n: Nivel) => void }) {
  const opcoes = NIVEIS.map((n) => {
    const m = repositorioLocal.melhor(slug, n);
    return { valor: String(n), texto: `Nível ${n} · ${NOME_NIVEL[n]}${m ? ` · melhor ${m.pontuacao}` : ""}` };
  });
  return <Seletor id={id} rotulo="Nível" opcoes={opcoes} value={String(valor)} onChange={(e) => aoMudar(Number(e.target.value) as Nivel)} />;
}
