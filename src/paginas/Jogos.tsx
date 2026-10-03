// ─── Jogos: lista dos jogos disponíveis (com 5 níveis) e dos jogos propostos ──
import { useState } from "react";
import { Link, useParams } from "react-router";
import { JOGOS, META_JOGOS, PROPOSTOS, jogoPorSlug } from "../jogos";
import { TEXTOS } from "../jogos/leitura/textos";
import { Atividade } from "../motor/Atividade";
import { NIVEIS, NOME_NIVEL, estrelasDe, type Nivel } from "../motor/tipos";
import { repositorioLocal } from "../dados/repositorio";
import { usePreferencias } from "../preferencias/preferencias";
import { Cartao, Etiqueta } from "../ui";

export function Jogos() {
  const { prefs } = usePreferencias();
  const [nivel, setNivel] = useState<Nivel>(2);
  const autores = [...new Set(TEXTOS.map((t) => t.autor.replace(/ \(.*\)$/, "")))];
  return (
    <div className="grid gap-8">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Jogos</h1>
        <p className="m-0">Jogos para desenvolver competências digitais e de literacia. Cada jogo tem cinco níveis e um relatório no fim. Não contam para o teste nem para os carimbos: são treino livre.</p>
      </header>

      <div role="tablist" aria-label="Nível de dificuldade" className="flex gap-1 flex-wrap border-b" style={{ borderColor: "var(--linha)" }}>
        {NIVEIS.map((n) => (
          <button key={n} type="button" role="tab" className="separador" aria-selected={nivel === n} onClick={() => setNivel(n)}>
            Nível {n} · {NOME_NIVEL[n]}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {JOGOS.map((j) => {
          const melhor = repositorioLocal.melhor(j.slug, nivel);
          const estrelas = melhor ? estrelasDe(melhor.pontuacao) : 0;
          return (
            <Cartao key={j.slug} className="grid gap-3 content-start">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl">
                  <span aria-hidden="true">{META_JOGOS[j.slug]?.icone}</span> {j.titulo[prefs.contexto]}
                </h2>
                <span className="ml-auto text-lg" role="img" aria-label={`${estrelas} de 3 estrelas`}>
                  {"★".repeat(estrelas)}
                  <span aria-hidden="true" style={{ color: "var(--suave)" }}>{"☆".repeat(3 - estrelas)}</span>
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {META_JOGOS[j.slug]?.etiquetas.map((e) => (
                  <Etiqueta key={e}>{e}</Etiqueta>
                ))}
              </div>
              <p className="m-0">{j.descricao}</p>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {j.slug === "leitura" ? `Autores: ${autores.join(", ")}. O texto cresce e fica mais antigo e complexo a cada nível.` : META_JOGOS[j.slug]?.nota}
              </p>
              <div className="flex gap-3 items-center flex-wrap">
                <Link to={`/jogos/${j.slug}/${nivel}`} className="botao">
                  Jogar · nível {nivel}
                </Link>
                <span className="text-sm" style={{ color: "var(--suave)" }}>
                  {j.duracao}
                  {melhor && <> · melhor {melhor.pontuacao}</>}
                </span>
              </div>
            </Cartao>
          );
        })}
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">Próximo jogo (proposta)</h2>
        <p className="m-0 max-w-3xl" style={{ color: "var(--suave)" }}>
          Em estudo para uma próxima versão. Os jogos sobre emails falsos e notícias falsas estão agora em <Link to="/seguranca">Segurança digital</Link>.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROPOSTOS.map((p) => (
            <Cartao key={p.titulo} className="grid gap-2 content-start">
              <div className="flex gap-2 items-baseline">
                <h3 className="text-lg">
                  <span aria-hidden="true">{p.icone}</span> {p.titulo}
                </h3>
                <span className="etiqueta ml-auto">Em breve</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {p.competencias.map((c) => (
                  <span key={c} className="text-xs" style={{ color: "var(--suave)" }}>
                    · {c}
                  </span>
                ))}
              </div>
              <p className="m-0 text-sm">{p.descricao}</p>
            </Cartao>
          ))}
        </div>
      </section>
    </div>
  );
}

export function JogoPagina() {
  const { slug = "", nivel: n = "1" } = useParams();
  const jogo = jogoPorSlug(slug);
  const nivel = Math.min(5, Math.max(1, Number(n) || 1)) as Nivel;
  if (!jogo)
    return (
      <p>
        Jogo desconhecido. <Link to="/jogos">Ver os jogos</Link>.
      </p>
    );
  return <Atividade key={`${slug}-${nivel}`} definicao={jogo} nivel={nivel} origem="treino" />;
}
