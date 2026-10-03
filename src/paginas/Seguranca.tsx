// ─── Segurança digital: três temas, cada um com informações e um teste de 5 níveis ──
import { useState } from "react";
import { Link, useParams } from "react-router";
import { AJUDA, TEMAS, TESTES_SEGURANCA, type TemaSeguranca } from "../seguranca";
import { Atividade } from "../motor/Atividade";
import { NIVEIS, NOME_NIVEL, estrelasDe, type Nivel } from "../motor/tipos";
import { repositorioLocal } from "../dados/repositorio";
import { Cartao } from "../ui";

function Estrelas({ slug, nivel }: { slug: string; nivel: Nivel }) {
  const melhor = repositorioLocal.melhor(slug, nivel);
  const estrelas = melhor ? estrelasDe(melhor.pontuacao) : 0;
  return (
    <span className="text-lg" role="img" aria-label={`${estrelas} de 3 estrelas no nível ${nivel}`}>
      {"★".repeat(estrelas)}
      <span aria-hidden="true" style={{ color: "var(--suave)" }}>{"☆".repeat(3 - estrelas)}</span>
    </span>
  );
}

function Ajuda() {
  return (
    <Cartao className="grid gap-3" aria-labelledby="ajuda-t">
      <h2 id="ajuda-t" className="text-2xl">Onde pedir ajuda</h2>
      <ul className="m-0 pl-5 grid gap-2">
        {AJUDA.map((a) => (
          <li key={a.nome}>
            <strong>{a.nome}</strong>. {a.descricao}
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

export function Seguranca() {
  const [nivel, setNivel] = useState<Nivel>(2);
  return (
    <div className="grid gap-8">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Segurança digital</h1>
        <p className="m-0">Três temas para estares mais seguro na internet. Em cada um, lê as informações e depois faz o teste, com cinco níveis e um relatório no fim. Os testes de segurança não contam para o teste por ciclo nem para os carimbos.</p>
      </header>

      <div role="tablist" aria-label="Nível de dificuldade dos testes" className="flex gap-1 flex-wrap border-b" style={{ borderColor: "var(--linha)" }}>
        {NIVEIS.map((n) => (
          <button key={n} type="button" role="tab" className="separador" aria-selected={nivel === n} onClick={() => setNivel(n)}>
            Nível {n} · {NOME_NIVEL[n]}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {TEMAS.map((t) => (
          <Cartao key={t.id} className="grid gap-3 content-start">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl">
                <span aria-hidden="true" style={{ fontSize: "1.2em" }}>{t.icone}</span> {t.titulo}
              </h2>
            </div>
            <p className="m-0">{t.resumo}</p>
            <div className="grid gap-1">
              <div className="flex items-baseline gap-2">
                <strong>{t.teste.titulo}</strong>
                <span className="ml-auto">
                  <Estrelas slug={t.teste.slug} nivel={nivel} />
                </span>
              </div>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {t.teste.descricao}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to={`/seguranca/${t.id}`} className="botao botao--contorno">
                Aprender
              </Link>
              <Link to={`/seguranca/${t.id}/teste/${nivel}`} className="botao">
                Testar · nível {nivel}
              </Link>
            </div>
          </Cartao>
        ))}
      </section>

      <Ajuda />
    </div>
  );
}

export function SegurancaTema() {
  const { tema = "" } = useParams();
  const t = TEMAS.find((x) => x.id === tema);
  if (!t)
    return (
      <p>
        Tema desconhecido. <Link to="/seguranca">Ver os temas de segurança</Link>.
      </p>
    );
  return (
    <div className="grid gap-6 max-w-3xl">
      <nav aria-label="Caminho" className="text-sm">
        <Link to="/seguranca">Segurança digital</Link> › {t.titulo}
      </nav>
      <header className="grid gap-2">
        <h1 className="text-4xl">
          <span aria-hidden="true">{t.icone}</span> {t.titulo}
        </h1>
        <p className="m-0 text-lg">{t.resumo}</p>
      </header>
      {t.secoes.map((s) => (
        <section key={s.titulo} className="grid gap-2">
          <h2 className="text-2xl">{s.titulo}</h2>
          <ul className="m-0 pl-5 grid gap-1">
            {s.pontos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {s.exemplo && (
            <Cartao className="grid gap-2" style={{ borderLeft: "4px solid var(--aviso, var(--acento))" }}>
              <strong>{s.exemplo.titulo}</strong>
              <div className="p-3 rounded-lg" style={{ background: "var(--tecla)", fontFamily: "var(--fonte-mono)" }}>
                {s.exemplo.linhas.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
              <p className="m-0 text-sm">{s.exemplo.nota}</p>
            </Cartao>
          )}
        </section>
      ))}
      <Cartao className="grid gap-3">
        <h2 className="text-2xl">{t.teste.titulo}</h2>
        <p className="m-0">{t.teste.descricao}</p>
        <div className="flex gap-2 flex-wrap">
          {NIVEIS.map((n) => (
            <Link key={n} to={`/seguranca/${t.id}/teste/${n}`} className={n === 1 ? "botao" : "botao botao--contorno"}>
              Nível {n} · {NOME_NIVEL[n]}
            </Link>
          ))}
        </div>
      </Cartao>
      <Ajuda />
    </div>
  );
}

export function SegurancaTeste() {
  const { tema = "", nivel: n = "1" } = useParams();
  const def = TESTES_SEGURANCA[tema as TemaSeguranca];
  const nivel = Math.min(5, Math.max(1, Number(n) || 1)) as Nivel;
  if (!def)
    return (
      <p>
        Teste desconhecido. <Link to="/seguranca">Ver os temas de segurança</Link>.
      </p>
    );
  return <Atividade key={`${tema}-${nivel}`} definicao={def} nivel={nivel} origem="treino" />;
}
