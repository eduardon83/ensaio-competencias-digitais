import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Caminho } from "../componentes/Caminho";
import { VideoYoutube } from "../componentes/VideoYoutube";
import { Icone } from "../componentes/Icone";
import { obterAgregados, telemetriaConfigurada } from "../dados/telemetria";
import { FAIXAS, faixaDe } from "../motor/tipos";
import { AvisoTutorial } from "./Tutorial";
import { PAGINAS } from "../textos/paginas";
import { Rico, preencher } from "../textos/Rico";

const BLOCOS = PAGINAS.inicio.blocos;

/** Média global das pontuações no Observatório (só grupos públicos, com 20 ou mais tentativas). */
function useMediaGlobal(): { media: number; n: number } | null {
  const [m, setM] = useState<{ media: number; n: number } | null>(null);
  useEffect(() => {
    if (!telemetriaConfigurada) return;
    obterAgregados().then((r) => {
      if (!r || "erro" in r) return;
      const grupos = Object.values(r.por_atividade);
      const n = grupos.reduce((s, g) => s + g.n, 0);
      if (n > 0) setM({ media: Math.round(grupos.reduce((s, g) => s + g.media * g.n, 0) / n), n });
    });
  }, []);
  return m;
}

export function Inicio() {
  const mediaGlobal = useMediaGlobal();
  const faixaGlobal = mediaGlobal ? faixaDe(mediaGlobal.media) : null;
  const T = PAGINAS.inicio;
  return (
    <div className="grid gap-12">
      <section className="grid gap-4 max-w-3xl mx-auto text-center justify-items-center">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--suave)", fontFamily: "var(--fonte-rotulo)" }}>
          {T.etiqueta}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-none" style={{ letterSpacing: "-.02em" }}>
          {T.titulo}
        </h1>
        <p className="text-xl m-0">
          <Rico texto={T.destaque} />
        </p>
        <p className="m-0">
          <Rico texto={T.subtitulo} />
        </p>
      </section>

      <AvisoTutorial />

      <nav aria-label="Entradas principais" className="grid gap-4 sm:grid-cols-2 max-w-4xl w-full mx-auto">
        {BLOCOS.map((b) => (
          <Link key={b.para} to={b.para} className="bloco-entrada cartao no-underline grid gap-2 p-6 content-start" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-xl" style={{ width: 56, height: 56, background: "var(--acento)", color: "var(--acento-tinta)" }}>
              <Icone nome={b.icone} tamanho={28} />
            </span>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--fonte-titulo)" }}>
              {b.titulo}
            </span>
            <span style={{ color: "var(--suave)" }}>{b.texto}</span>
          </Link>
        ))}
      </nav>

      <section className="max-w-3xl w-full mx-auto" aria-label={PAGINAS.videos.titulos.promocional}>
        <VideoYoutube qual="promocional" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[T.porque, T.comoFunciona, T.dados].map((c) => (
          <div key={c.titulo} className="cartao p-5 grid gap-2 content-start">
            <h2 className="text-xl">{c.titulo}</h2>
            {c.paragrafos.map((p, k) => (
              <p key={k} className="m-0 text-sm">
                <Rico texto={p} />
              </p>
            ))}
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">{T.nivelMedio.titulo}</h2>
        {mediaGlobal && faixaGlobal && (
          <p className="m-0">
            <Rico texto={preencher(T.nivelMedio.media, { media: mediaGlobal.media, faixa: faixaGlobal.nome, n: mediaGlobal.n })} />
          </p>
        )}
        <div className="faixa" role="list">
          {FAIXAS.map((f) => (
            <div key={f.nome} role="listitem" aria-current={faixaGlobal?.nome === f.nome ? "true" : undefined} style={faixaGlobal?.nome === f.nome ? { outline: "3px solid var(--acento)", outlineOffset: -3 } : undefined}>
              <b className="block" style={{ fontFamily: "var(--fonte-titulo)" }}>
                {f.nome}
              </b>
              <span className="tabular-nums text-xs" style={{ color: "var(--suave)", fontFamily: "var(--fonte-rotulo)" }}>
                {f.min} a {f.max}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm m-0" style={{ color: "var(--suave)" }}>
          <Rico texto={T.nivelMedio.nota} />
        </p>
      </section>

      <section className="text-xs" style={{ color: "var(--suave)" }}>
        <p className="m-0">
          <Rico texto={T.fontes} />
        </p>
      </section>
    </div>
  );
}

export function Treinar() {
  const T = PAGINAS.treinar;
  const opcoes = T.opcoes;
  return (
    <div className="grid gap-[2rem]">
      <Caminho atual={T.titulo} />
      <header className="grid gap-2 text-center justify-items-center">
        <h1 className="text-4xl">{T.titulo}</h1>
        <p className="m-0 max-w-2xl">
          <Rico texto={T.introducao} />
        </p>
      </header>
      <nav aria-label="Modos de treino" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full mx-auto">
        {opcoes.map((b) => (
          <Link key={b.para} to={b.para} className="bloco-entrada cartao no-underline grid gap-2 p-6 content-start" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-xl" style={{ width: 56, height: 56, background: "var(--acento)", color: "var(--acento-tinta)" }}>
              <Icone nome={b.icone} tamanho={28} />
            </span>
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--fonte-titulo)" }}>
              {b.titulo}
            </span>
            <span style={{ color: "var(--suave)" }}>{b.texto}</span>
          </Link>
        ))}
      </nav>
      <p className="text-center text-sm m-0" style={{ color: "var(--suave)" }}>
        <Rico texto={T.rodape} />
      </p>
    </div>
  );
}
