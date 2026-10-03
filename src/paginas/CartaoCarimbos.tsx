// ─── Cartão de imprensa / cartão de acesso com carimbos (um por competência, a partir de 85 pontos) ──
// Calculado a partir dos resultados guardados neste navegador; não há contas nem registos.
import { Link } from "react-router";
import { ATIVIDADES } from "../atividades";
import { contexto as defContexto } from "../contextos";
import { repositorioLocal } from "../dados/repositorio";
import { CARIMBO_MINIMO, NOME_DOMINIO, type Dominio } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao } from "../ui";

const ICONE: Record<Dominio, string> = {
  teclado: "⌨", interface: "☰", atencao: "◉", navegacao: "🗂", formularios: "✎", arrastar: "⇅", tempo: "⏱", atalhos: "⌘", leitura: "🔍", matematica: "∑", seguranca: "🛡", comunicacao: "✉", folhas: "▦", pensamento: "🕵", programacao: "🤖", todas: "★",
};

export interface EstadoCarimbo {
  dominio: Dominio;
  nome: string;
  melhor: number | null;
  ganho: boolean;
  atividade: string; // slug da atividade que dá este carimbo
}

/** Carimbos a partir das tentativas guardadas: o melhor resultado de cada competência, em qualquer nível. */
export function carimbos(): EstadoCarimbo[] {
  const tentativas = repositorioLocal.listarTentativas();
  return ATIVIDADES.filter((a) => a.disponivel).map((a) => {
    const melhor = tentativas.filter((t) => t.atividade === a.slug).reduce<number | null>((m, t) => (m === null || t.pontuacao > m ? t.pontuacao : m), null);
    return { dominio: a.dominio, nome: a.dominio === "todas" ? "Prova final" : NOME_DOMINIO[a.dominio], melhor, ganho: (melhor ?? 0) >= CARIMBO_MINIMO, atividade: a.slug };
  });
}

export function CartaoCarimbos() {
  const { prefs } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const lista = carimbos();
  const ganhos = lista.filter((c) => c.ganho).length;
  const nome = prefs.nome.trim() || ctx.papelAnonimo;
  const titulo = ctx.resultado.cartao.charAt(0).toUpperCase() + ctx.resultado.cartao.slice(1);
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">O meu {ctx.resultado.cartao}</h1>
        <p className="m-0">
          Cada competência dá um {ctx.resultado.carimbo} quando chegas aos {CARIMBO_MINIMO} pontos numa atividade, em qualquer nível. O cartão fica guardado só neste navegador.
        </p>
      </header>
      <article className="cartao p-6 grid gap-5 max-w-4xl" style={{ borderWidth: 2, borderColor: "var(--tinta)" }} aria-label={titulo}>
        <div className="flex flex-wrap justify-between gap-3 items-start border-b pb-3" style={{ borderColor: "var(--linha)" }}>
          <div>
            <div className="text-xs uppercase tracking-widest" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>{titulo}</div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--fonte-titulo)" }}>{nome}</div>
            <div className="text-sm" style={{ color: "var(--suave)" }}>{ctx.papel} · {ctx.publicacao(1)}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold tabular-nums" style={{ color: "var(--acento)", fontFamily: "var(--fonte-titulo)" }}>{ganhos}<span className="text-xl" style={{ color: "var(--suave)" }}>/{lista.length}</span></div>
            <div className="text-xs" style={{ color: "var(--suave)" }}>{ctx.resultado.carimbo}s</div>
          </div>
        </div>
        <ul className="list-none m-0 p-0 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
          {lista.map((c, i) => (
            <li key={c.atividade} className="grid justify-items-center gap-1 text-center">
              <div
                aria-hidden="true"
                className="grid place-items-center rounded-full text-3xl"
                style={{
                  width: 84, height: 84,
                  border: c.ganho ? "4px double var(--acento)" : "2px dashed var(--tecla-borda)",
                  color: c.ganho ? "var(--acento)" : "var(--tecla-borda)",
                  background: c.ganho ? "var(--acento-suave)" : "transparent",
                  transform: c.ganho ? `rotate(${((i * 37) % 24) - 12}deg)` : undefined,
                  filter: c.ganho ? undefined : "grayscale(1)",
                  opacity: c.ganho ? 1 : 0.6,
                }}
              >
                {ICONE[c.dominio]}
              </div>
              <span className="text-sm font-bold">{c.nome}</span>
              <span className="text-xs" style={{ color: "var(--suave)" }}>
                {c.ganho ? `Ganho · melhor ${c.melhor}` : c.melhor === null ? "Ainda não jogado" : `Melhor ${c.melhor} · faltam ${CARIMBO_MINIMO - c.melhor}`}
              </span>
              <span className="sr-only">{c.ganho ? `${ctx.resultado.carimbo} ganho` : `${ctx.resultado.carimbo} por ganhar`}</span>
              {!c.ganho && <Link to={`/atividades/${c.atividade}/1`} className="text-xs">Treinar</Link>}
            </li>
          ))}
        </ul>
      </article>
      <div className="flex gap-3 flex-wrap">
        <Botao onClick={() => window.print()}>Imprimir o cartão</Botao>
        <Link to="/treino" className="botao botao--contorno">Treinar atividades</Link>
      </div>
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
        Para o teu nome aparecer no cartão, escreve-o em <Link to="/definicoes">Definições</Link>. Fica só neste navegador.
      </p>
    </div>
  );
}
