// ─── Aldeia Digital · Jornal da Aldeia (primeira página do aluno) e Ajuda ────
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Botao } from "../../ui";
import { faixaDe } from "../../motor/tipos";
import { frase } from "../../motor/frases";
import { qualquerPorSlug } from "../../registo";
import { Avatar } from "../arte/componentes";
import { nomeVisivel } from "../nucleo/nomes";
import { perfilCidadania, perfilCompetencias } from "../nucleo/regras";
import { FESTA } from "../nucleo/catalogo";
import { useAldeia } from "../cliente/estado";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia, preencherAluno, texto } from "./comum";
import { nomeMissao } from "./missoes";

const COR_FAIXA: Record<string, string> = { "A começar": "var(--b1)", "Em progresso": "var(--b2)", Confiante: "var(--b3)", "Autónomo": "var(--b4)" };

export function Jornal() {
  const { vista, missoes, d, ciclo, enviar, codigo } = useAldeia();
  const folha = useRef<HTMLElement>(null);
  const [aGuardar, setAGuardar] = useState(false);
  const T = ALDEIA.interface.jornal;
  const aluno = vista.aluno;
  const comp = perfilCompetencias(aluno, missoes);
  const cid = perfilCidadania(aluno, missoes).filter((c) => c.feitas > 0);
  const final = d.festa;
  const aparencia = final ? { ...aluno.aparencia, chapeu: aluno.aparencia.chapeu ?? FESTA.item } : aluno.aparencia;
  const fracas = [...comp].sort((a, b) => a.melhor - b.melhor).slice(0, 2).filter((c) => c.melhor < 85);
  const paraTreinar = fracas.map((c) => {
    const def = qualquerPorSlug(c.slug);
    return def ? frase(def.dominio, c.melhor) : nomeMissao(c.slug);
  });

  async function guardarImagem() {
    if (!folha.current) return;
    setAGuardar(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(folha.current, { pixelRatio: 2, backgroundColor: getComputedStyle(folha.current).backgroundColor, skipFonts: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `jornal-da-aldeia-${codigo}.png`;
      a.click();
    } catch {
      window.print();
    } finally {
      setAGuardar(false);
    }
    if (final && !aluno.marcos.jornal) void enviar([{ op: "jornal" }]);
  }

  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-4" style={{ maxWidth: 900 }}>
        <article ref={folha} className="jornal-aldeia" aria-labelledby="ja-titulo">
          <header className="jornal-aldeia__cabecalho">
            <h1 id="ja-titulo">{T.titulo}</h1>
            <p className="m-0 text-sm">{final ? T.edicao : T.edicaoCurso}</p>
          </header>
          <div className="jornal-aldeia__capa">
            <div className="jornal-aldeia__foto">
              <Avatar aparencia={aparencia} anim="celebrar" escala={5} />
            </div>
            <div className="grid gap-2 content-center">
              <h2 className="jornal-aldeia__manchete">{(final ? T.manchete : T.mancheteCurso).replace("{nome}", nomeVisivel(aluno.nome))}</h2>
              <p className="m-0">{final ? preencherAluno(texto(T.lead, ciclo), aluno) : T.leadCurso}</p>
            </div>
          </div>
          <div className="jornal-aldeia__colunas">
            <section>
              <h3 className="text-lg">{T.competencias}</h3>
              {comp.length === 0 && <p className="m-0 text-sm">{T.semDados}</p>}
              <ul className="m-0 p-0 list-none grid gap-2">
                {comp.map((c) => {
                  const f = faixaDe(c.melhor);
                  return (
                    <li key={c.slug} className="grid gap-1">
                      <span className="flex justify-between text-sm"><span>{nomeMissao(c.slug)}</span><strong className="tabular-nums">{c.melhor}</strong></span>
                      <span className="jornal-aldeia__barra" role="img" aria-label={`${nomeMissao(c.slug)}: ${c.melhor} pontos, ${f.nome}`}>
                        <span style={{ width: `${c.melhor}%`, background: COR_FAIXA[f.nome] }} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="grid gap-2 content-start">
              <h3 className="text-lg">{T.cidadania}</h3>
              <div className="flex flex-wrap gap-2">
                {cid.length ? cid.map((c) => <span key={c.dimensao} className="etiqueta">{ALDEIA.dimensoes[c.dimensao]}</span>) : <span className="text-sm">{T.semDados}</span>}
              </div>
              {paraTreinar.length > 0 && (
                <>
                  <h3 className="text-lg">{T.treinar}</h3>
                  <p className="m-0">{paraTreinar.join(" ")}</p>
                </>
              )}
            </section>
          </div>
        </article>
        <div className="flex gap-3 flex-wrap">
          <Botao onClick={() => void guardarImagem()} disabled={aGuardar}>{T.guardar}</Botao>
          {final && d.casa.includes("moldura") && !aluno.interior.moldura && (
            <Botao variante="contorno" onClick={() => void enviar([{ op: "interior", valor: { ...aluno.interior, moldura: true } }])}>{T.moldura}</Botao>
          )}
          <Link to={`/aldeia/${codigo}`} className="botao botao--contorno">{T.voltar}</Link>
        </div>
      </main>
    </div>
  );
}

export function Ajuda() {
  const { ciclo, codigo, sair, vista } = useAldeia();
  const nav = useNavigate();
  const T = ALDEIA.interface.ajuda;
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-4" style={{ maxWidth: 760 }}>
        <h1 className="text-3xl">{T.titulo}</h1>
        <section className="cartao p-4 grid gap-2" data-ouvir="">
          <h2 className="text-xl">{T.controlos}</h2>
          <p className="m-0">{T.controlosTexto}</p>
        </section>
        <section className="cartao p-4 grid gap-2" data-ouvir="">
          <h2 className="text-xl">{T.dados}</h2>
          <p className="m-0">{texto(ALDEIA.tutorial.passos.dados.texto, ciclo)}</p>
        </section>
        <section className="cartao p-4 grid gap-2">
          <h2 className="text-xl">{ALDEIA.tutorial.passos.ajudas.titulo}</h2>
          <p className="m-0">{texto(ALDEIA.tutorial.passos.ajudas.texto, ciclo)}</p>
          <div className="flex gap-2 flex-wrap">
            <Link className="botao botao--contorno" to={`/definicoes?voltar=/aldeia/${codigo}`}>{ALDEIA.interface.hud.definicoes}</Link>
          </div>
        </section>
        <section className="cartao p-4 grid gap-2">
          <h2 className="text-xl">{T.tutorial}</h2>
          <div className="flex gap-2 flex-wrap">
            <Botao variante="contorno" onClick={() => nav(`/aldeia/${codigo}`, { state: { tutorial: true } })}>{T.tutorial}</Botao>
            <Botao variante="contorno" onClick={() => nav(`/aldeia/${codigo}/lista`)}>{ALDEIA.interface.mapa.lugares}</Botao>
          </div>
        </section>
        <section className="cartao p-4 grid gap-2">
          <h2 className="text-xl">{ALDEIA.premios.objetivo.titulo}</h2>
          <p className="m-0">{vista.objetivo.atingido ? ALDEIA.premios.objetivo.atingido : ALDEIA.premios.objetivo.texto.replace("{capitulo}", String(vista.objetivo.capitulo)).replace("{feitos}", String(vista.objetivo.feitos)).replace("{precisa}", String(vista.objetivo.precisa))}</p>
        </section>
        <section className="cartao p-4 grid gap-2" style={{ borderColor: "var(--aviso)" }}>
          <h2 className="text-xl">{T.sair}</h2>
          <p className="m-0">{T.sairTexto}</p>
          <div>
            <Botao onClick={async () => { await sair(); nav("/aldeia", { state: { saiu: true } }); }}>{T.sair}</Botao>
          </div>
        </section>
      </main>
    </div>
  );
}
