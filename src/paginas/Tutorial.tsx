// ─── Tutorial: passos curtos que mostram as funcionalidades. Pode saltar-se a qualquer momento. ──
import { Caminho } from "../componentes/Caminho";
import { VideoYoutube } from "../componentes/VideoYoutube";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { CONTEXTOS } from "../contextos";
import { FAIXAS } from "../motor/tipos";
import { Botao } from "../ui";
import { PAGINAS } from "../textos/paginas";
import { Rico, preencher } from "../textos/Rico";

const CHAVE_VISTO = "ecd.tutorial.visto.v1";
export function tutorialVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE_VISTO) === "1";
  } catch {
    return true;
  }
}
export function marcarTutorialVisto() {
  try {
    localStorage.setItem(CHAVE_VISTO, "1");
  } catch {
    /* nada */
  }
}

/** Pequenas ilustrações (HTML, não imagens) para o passo "Treinar: cinco maneiras". Decorativas: aria-hidden. */
function IlustracaoTeste() {
  const barras: [string, number][] = [["Teclado", 82], ["Interfaces", 64], ["Leitura", 91], ["Matemática", 47]];
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tabular-nums" style={{ color: "var(--acento)", fontFamily: "var(--fonte-titulo)" }}>71</span>
        <span className="text-xs" style={{ color: "var(--suave)" }}>em 100 · Confiante</span>
      </div>
      {barras.map(([n, v]) => (
        <div key={n} className="grid gap-0.5 text-xs">
          <div className="flex justify-between"><span>{n}</span><span className="tabular-nums">{v}</span></div>
          <div className="barra" style={{ height: 6 }}><div style={{ width: `${v}%`, background: v >= 85 ? "var(--b4)" : v >= 65 ? "var(--b3)" : v >= 40 ? "var(--b2)" : "var(--b1)" }} /></div>
        </div>
      ))}
    </div>
  );
}
function IlustracaoAtividade() {
  const fonte = "A turma visitou o museu.";
  const escritos = 14;
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <div className="flex gap-1 flex-wrap">
        <span className="etiqueta">Teclado</span>
        <span className="etiqueta">Nível 2 · Base</span>
      </div>
      <div className="dactilo" style={{ fontSize: ".95rem", lineHeight: 1.6 }}>
        {Array.from(fonte).map((c, i) => (
          <span key={i} className={i < escritos ? (i === 9 ? "errado" : "certo") : i === escritos ? "atual" : ""}>{c}</span>
        ))}
      </div>
      <div className="barra" style={{ height: 6 }}><div style={{ width: "62%" }} /></div>
      <div className="text-xs" style={{ color: "var(--suave)" }}>★★☆ · melhor 78</div>
    </div>
  );
}
function IlustracaoCodigo() {
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2 justify-items-center text-center" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <span className="text-xs" style={{ color: "var(--suave)" }}>Código do professor</span>
      <span className="text-2xl font-extrabold tracking-wider" style={{ fontFamily: "var(--fonte-mono)" }}>TEC7·4F7KQ2</span>
      <span className="text-xs" style={{ color: "var(--suave)" }}>Nível 3 · 4 atividades</span>
      <span className="botao" style={{ minHeight: 32, padding: "4px 12px", fontSize: ".85rem" }}>Entrar</span>
    </div>
  );
}

function IlustracaoJogos() {
  const c = ["", "📦", "", "", "🤖", "", "", "📦", "", "", "🧪", "", "", "", "", "🧊"];
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-2 justify-items-center" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(4, 1.6rem)" }}>
        {c.map((x, i) => (
          <span key={i} className="grid place-items-center rounded" style={{ height: "1.6rem", background: "var(--tecla)", fontSize: ".9rem" }}>{x}</span>
        ))}
      </div>
      <span className="text-xs" style={{ color: "var(--suave)" }}>Repetir 3× [Avançar] · Virar à direita</span>
    </div>
  );
}
function IlustracaoSeguranca() {
  return (
    <div aria-hidden="true" className="rounded-lg p-3 grid gap-1 text-xs" style={{ background: "var(--fundo)", border: "1px solid var(--linha)" }}>
      <span className="text-xs" style={{ wordBreak: "break-all" }}><b>De:</b> seguranca@bancohorizonte-alerta.com</span>
      <span className="text-xs"><b>Assunto:</b> A sua conta vai ser bloqueada!</span>
      <span className="flex gap-1 mt-1">
        <span className="etiqueta">Legítima</span>
        <span className="etiqueta" style={{ background: "#b3402e", color: "#fff" }}>Fraude</span>
      </span>
    </div>
  );
}

function Mini({ titulo, children, figura }: { titulo: string; children: ReactNode; figura?: ReactNode }) {
  return (
    <div className="cartao p-4 grid gap-2 content-start">
      {figura}
      <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{titulo}</strong>
      <span className="text-sm" style={{ color: "var(--suave)" }}>
        {children}
      </span>
    </div>
  );
}

/** Passos do tutorial, montados ao desenhar (os textos podem ter sido editados no backoffice). */
function passos(): { titulo: string; corpo: ReactNode }[] {
  const T = PAGINAS.tutorial;
  const paragrafos = (l: string[]) => l.map((p, k) => (
    <p key={k} className="m-0">
      <Rico texto={p} />
    </p>
  ));
  return [
    {
      titulo: T.boasVindas.titulo,
      corpo: (
        <>
          {paragrafos(T.boasVindas.paragrafos)}
          <div className="max-w-2xl w-full">
            <VideoYoutube qual="aluno" compacto />
          </div>
        </>
      ),
    },
    {
      titulo: T.maneiras.titulo,
      corpo: (
        <div className="grid gap-3 md:grid-cols-3">
          <Mini titulo={T.maneiras.provas.titulo} figura={<IlustracaoTeste />}><Rico texto={T.maneiras.provas.texto} /></Mini>
          <Mini titulo={T.maneiras.atividade.titulo} figura={<IlustracaoAtividade />}><Rico texto={T.maneiras.atividade.texto} /></Mini>
          <Mini titulo={T.maneiras.codigo.titulo} figura={<IlustracaoCodigo />}><Rico texto={T.maneiras.codigo.texto} /></Mini>
          <Mini titulo={T.maneiras.jogos.titulo} figura={<IlustracaoJogos />}><Rico texto={T.maneiras.jogos.texto} /></Mini>
          <Mini titulo={T.maneiras.seguranca.titulo} figura={<IlustracaoSeguranca />}><Rico texto={T.maneiras.seguranca.texto} /></Mini>
        </div>
      ),
    },
    {
      titulo: T.cenario.titulo,
      corpo: (
        <>
          <p className="m-0"><Rico texto={T.cenario.texto} /></p>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.values(CONTEXTOS).map((c) => (
              <Mini key={c.id} titulo={c.nome}>
                {c.descricao} {T.cenario.personagens}: {c.personagens.responsavel}, {c.personagens.ficheiros}, {c.personagens.revisao}, {c.personagens.relogio}.
              </Mini>
            ))}
          </div>
        </>
      ),
    },
    {
      titulo: T.atividade.titulo,
      corpo: (
        <ol className="grid gap-3 md:grid-cols-4 list-none m-0 p-0">
          {T.atividade.etapas.map((e) => (
            <li key={e.titulo}>
              <Mini titulo={e.titulo}><Rico texto={e.texto} /></Mini>
            </li>
          ))}
        </ol>
      ),
    },
    {
      titulo: T.pontuacao.titulo,
      corpo: (
        <>
          <p className="m-0"><Rico texto={T.pontuacao.texto} /></p>
          <div className="faixa" role="list">
            {FAIXAS.map((f) => (
              <div key={f.nome} role="listitem">
                <b style={{ fontFamily: "var(--fonte-titulo)" }}>{f.nome}</b>
                <br />
                <span className="text-xs tabular-nums" style={{ color: "var(--suave)" }}>
                  {f.min} a {f.max}
                </span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    { titulo: T.medida.titulo, corpo: <>{paragrafos(T.medida.paragrafos)}</> },
    {
      titulo: T.professores.titulo,
      corpo: (
        <div className="grid gap-3 md:grid-cols-3">
          {[T.professores.montar, T.professores.partilhar, T.professores.acompanhar].map((m) => (
            <Mini key={m.titulo} titulo={m.titulo}><Rico texto={m.texto} /></Mini>
          ))}
          <div className="md:col-span-3 max-w-2xl w-full">
            <VideoYoutube qual="professor" compacto />
          </div>
        </div>
      ),
    },
    { titulo: T.dados.titulo, corpo: <>{paragrafos(T.dados.paragrafos)}</> },
  ];
}

export function Tutorial() {
  const [i, setI] = useState(0);
  const navegar = useNavigate();
  const PASSOS = passos();
  const T = PAGINAS.tutorial;
  const total = PASSOS.length;
  const ultimo = i === total - 1;

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") setI((x) => Math.min(total - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [total]);

  useEffect(() => {
    if (ultimo) marcarTutorialVisto();
  }, [ultimo]);

  function saltar() {
    marcarTutorialVisto();
    navegar("/");
  }

  return (
    <div className="grid gap-6 max-w-4xl mx-auto">
      <Caminho atual={PAGINAS.geral.ligacoesRodape.tutorial} />
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm" style={{ color: "var(--suave)" }}>
          {preencher(T.progresso, { i: i + 1, n: total })}
        </span>
        <Botao variante="discreto" className="ml-auto" onClick={saltar}>
          {T.saltar}
        </Botao>
      </div>
      <section className="cartao p-6 md:p-8 grid gap-4" aria-live="polite" aria-labelledby="tut-titulo" style={{ minHeight: 320 }}>
        <h1 id="tut-titulo" className="text-3xl md:text-4xl">
          {PASSOS[i].titulo}
        </h1>
        {PASSOS[i].corpo}
      </section>
      <div className="flex items-center gap-2 justify-center" role="tablist" aria-label="Passos do tutorial">
        {PASSOS.map((p, k) => (
          <button key={p.titulo} type="button" role="tab" aria-selected={k === i} aria-label={`Passo ${k + 1}: ${p.titulo}`} onClick={() => setI(k)} style={{ minWidth: 28, height: 28, border: 0, cursor: "pointer", background: "transparent", padding: 0, display: "grid", placeItems: "center" }}>
            <span aria-hidden="true" style={{ display: "block", width: k === i ? 28 : 12, height: 12, borderRadius: 99, background: k === i ? "var(--acento)" : "var(--tecla-borda)", transition: "width .2s" }} />
          </button>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap justify-between">
        <Botao variante="contorno" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          {T.anterior}
        </Botao>
        {ultimo ? (
          <Link to="/" className="botao botao--grande">
            {T.fim}
          </Link>
        ) : (
          <Botao onClick={() => setI((x) => x + 1)}>{T.seguinte}</Botao>
        )}
      </div>
      <p className="text-center text-xs m-0" style={{ color: "var(--suave)" }}>
        {T.teclas}
      </p>
    </div>
  );
}

/** Aviso discreto na página inicial, só na primeira visita. */
export function AvisoTutorial() {
  const [visivel, setVisivel] = useState(() => !tutorialVisto());
  if (!visivel) return null;
  return (
    <div className="cartao p-4 flex flex-wrap items-center gap-3 max-w-4xl w-full mx-auto" role="region" aria-label="Primeira visita" style={{ borderColor: "var(--acento)", borderWidth: 2 }}>
      <span className="flex-1 min-w-48 font-bold">{PAGINAS.tutorial.aviso.titulo}</span>
      <Link to="/tutorial" className="botao">
        {PAGINAS.tutorial.aviso.ver}
      </Link>
      <Botao
        variante="discreto"
        onClick={() => {
          marcarTutorialVisto();
          setVisivel(false);
        }}
      >
        {PAGINAS.tutorial.aviso.agoraNao}
      </Botao>
    </div>
  );
}
