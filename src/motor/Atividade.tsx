// ─── Motor: corre uma atividade em quatro etapas (intro → prática → avaliação → resultado) ──
// Briefing (guia de arte da Aldeia Digital, secção 14): banda com o edifício do contexto, retrato da personagem
// numa moldura, etiquetas com nível, tempo e competência, e os botões Começar, Experimentar primeiro e Ouvir.
// Resultado: o avatar celebra (ou faz “Vamos outra vez” abaixo de 50), estrelas em pixel e o carimbo dos 85.
// Dentro da Aldeia (`aldeia`), o resultado vai para o progresso do aluno e não fica neste navegador.
import { Rico, preencher } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { lerEmVozAlta, VOZ_DISPONIVEL } from "../componentes/Ouvir";
import { lazy, Suspense, useMemo, useState } from "react";
import { Caminho } from "../componentes/Caminho";
import { Icone } from "../componentes/Icone";
import { TEMAS } from "../seguranca/conteudo";
import { Link } from "react-router";
import { contexto as defContexto } from "../contextos";
import { registarTentativaAnonima, repositorioLocal, type Origem, type Tentativa } from "../dados/repositorio";
import { usePreferencias, type Contexto } from "../preferencias/preferencias";
import { Botao, Etiqueta, LigacaoBotao } from "../ui";
import { DISPONIVEIS } from "../atividades";
import { SeletorContexto } from "../componentes/SeletorContexto";
import { ResumoRelatorio, TabelaRelatorio } from "./Relatorio";
import { BandaEdificio, EMBLEMAS_PIXEL, EstrelasPixel, NOME_EDIFICIO, NOME_PERSONAGEM, Retrato, cenaDaAtividade, pixelado, urlPixel } from "../aldeia/arte/pixel";
import type { Aparencia } from "../aldeia/nucleo/modelo";
import { CARIMBO_MINIMO, NOME_DOMINIO, NOME_NIVEL, estrelasDe, faixaDe, type DefinicaoAtividade, type Nivel, type ResultadoAtividade, type LinhaRelatorio } from "./tipos";

// O avatar (manifesto e folhas) só carrega no ecrã de resultado.
const AvatarResultado = lazy(() => import("../aldeia/arte/componentes").then((m) => ({ default: m.AvatarResultado })));

type Etapa = "intro" | "pratica" | "avaliacao" | "resultado";

/** Ligação com a Aldeia Digital: edifício e personagem da missão, e onde guardar o resultado. */
export interface AldeiaNaAtividade {
  edificio: string;
  personagem: string;
  nomePersonagem: string;
  briefing: string;
  etiqueta?: string;
  melhor?: number;
  aparencia: Aparencia;
  /** Treino (“Treinar aqui”): não conta para a prova. */
  treino?: boolean;
  guardar: (r: ResultadoAtividade) => void;
  rotuloVoltar: string;
  aoVoltar: () => void;
}

export function Atividade({
  definicao,
  nivel,
  origem,
  aoConcluir,
  rotuloContinuar,
  escolherContexto = true,
  extensaoTempo: extensaoForcada,
  etiquetas,
  contexto: contextoForcado,
  aldeia,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definicao: DefinicaoAtividade<any>;
  nivel: Nivel;
  origem: Origem;
  /** Quando presente (percurso de teste), o botão "Continuar" chama-o com a tentativa guardada. */
  aoConcluir?: (t: Tentativa) => void;
  rotuloContinuar?: string;
  /** Mostra a escolha do cenário no briefing (falso dentro de um teste/sessão, onde já foi escolhido). */
  escolherContexto?: boolean;
  /** Tempo alargado imposto pela sessão do professor (sobrepõe-se às definições). */
  extensaoTempo?: number;
  /** Marcas da sessão do professor, enviadas com a tentativa. */
  etiquetas?: { codigo?: string; aluno?: string };
  /** Cenário imposto (missões da Aldeia: o edifício decide). */
  contexto?: Contexto;
  aldeia?: AldeiaNaAtividade;
}) {
  const { prefs } = usePreferencias();
  const idContexto = contextoForcado ?? prefs.contexto;
  const ctx = defContexto(idContexto);
  const extensao = extensaoForcada ?? prefs.extensaoTempo;
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [chave, setChave] = useState(0); // força remontagem ao repetir
  const [tentativa, setTentativa] = useState<Tentativa | null>(null);
  const [relatorio, setRelatorio] = useState<LinhaRelatorio[] | undefined>(undefined);
  const config = definicao.niveis[nivel];
  const configPratica = useMemo(() => definicao.pratica(config), [definicao, config]);
  const melhorLocal = useMemo(() => (aldeia ? undefined : repositorioLocal.melhor(definicao.slug, nivel)), [definicao.slug, nivel, chave, aldeia]);
  const melhorAnterior = aldeia ? aldeia.melhor : melhorLocal?.pontuacao;

  function terminarAvaliacao(r: ResultadoAtividade) {
    const dados = {
      atividade: definicao.slug,
      nivel,
      pontuacao: r.pontuacao,
      duracaoMs: Math.round(r.duracaoMs),
      metricas: r.metricas,
      origem,
      contexto: idContexto,
      formato: prefs.formato,
      extensaoTempo: extensao,
    };
    let t: Tentativa;
    if (aldeia) {
      t = registarTentativaAnonima(dados);
      aldeia.guardar(r);
    } else t = repositorioLocal.guardarTentativa({ ...dados, codigo: etiquetas?.codigo, aluno: etiquetas?.aluno });
    setTentativa(t);
    setRelatorio(r.relatorio);
    setEtapa("resultado");
  }

  const Componente = definicao.Componente;
  const titulo = definicao.titulo[idContexto];
  const cena = aldeia ? { edificio: aldeia.edificio, personagem: aldeia.personagem } : cenaDaAtividade(definicao.slug, definicao.numero, idContexto);
  const nomePersonagem = aldeia ? aldeia.nomePersonagem : definicao.numero < 100 ? ctx.personagens.responsavel : (NOME_PERSONAGEM[cena.personagem] ?? ctx.personagens.responsavel);
  const briefCenario = ctx.briefs[definicao.slug];
  const brief = aldeia ? aldeia.briefing : (briefCenario ?? definicao.descricao);
  // Sem briefing próprio, a descrição já é o briefing: não se repete por baixo.
  const descricao = aldeia || briefCenario ? definicao.descricao : "";
  // Caminho de regresso (só no treino livre; no teste e na prova do professor há botões próprios).
  const temaSeg = TEMAS.find((t) => t.teste.slug === definicao.slug);
  const caminho: [string, string][] | null =
    aldeia || origem !== "treino" || aoConcluir ? null : definicao.numero >= 200 && temaSeg ? [["/treinar", "Treinar"], ["/seguranca", "Segurança digital"], [`/seguranca/${temaSeg.id}`, temaSeg.titulo]] : definicao.numero >= 100 ? [["/treinar", "Treinar"], ["/jogos", "Jogos"]] : [["/treinar", "Treinar"], ["/treino", PAGINAS.atividades.caminho]];
  const B = PAGINAS.atividade.briefing;

  return (
    <div className="grid gap-5">
      {caminho && <Caminho itens={caminho} atual={titulo} />}
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl">{titulo}</h1>
        <span className="text-sm ml-auto" style={{ color: "var(--suave)" }}>
          {PAGINAS.atividade.etapas[etapa === "intro" ? "intro" : etapa === "pratica" ? "pratica" : etapa === "avaliacao" ? "avaliacao" : "resultado"]}
        </span>
      </header>

      {etapa === "intro" && (
        <section className="cartao atividade-intro" aria-labelledby="brief-t" data-ouvir="">
          <BandaEdificio edificio={cena.edificio} nome={NOME_EDIFICIO[cena.edificio] ?? ""} />
          <div className="atividade-intro__corpo">
            <Retrato id={cena.personagem} escala={2} />
            <div className="grid gap-3 min-w-0">
              <div id="brief-t" className="text-sm font-bold" style={{ color: "var(--suave)" }}>
                {nomePersonagem}
                {!aldeia && definicao.numero < 100 && <> · {ctx.publicacao(nivel)}</>}
              </div>
              <p className="text-xl m-0" style={{ fontFamily: "var(--fonte-titulo)" }}>
                “{brief}”
              </p>
              <div className="flex flex-wrap gap-2">
                <Etiqueta>{aldeia?.etiqueta ?? preencher(B.nivel, { nivel, nome: NOME_NIVEL[nivel] })}</Etiqueta>
                <Etiqueta>{definicao.duracao}</Etiqueta>
                <Etiqueta>{NOME_DOMINIO[definicao.dominio]}</Etiqueta>
              </div>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {descricao} <Rico texto={B.praticaOpcional} />
                {extensao !== 1 && <> {preencher(B.alargado, { x: extensao })}</>}
              </p>
              {melhorAnterior !== undefined && (
                <p className="m-0 text-sm">
                  <Rico texto={preencher(B.melhor, { pontos: melhorAnterior })} />
                </p>
              )}
              <div className="flex gap-3 flex-wrap">
                <Botao grande onClick={() => setEtapa("avaliacao")}>
                  {B.iniciar}
                </Botao>
                <Botao variante="contorno" onClick={() => setEtapa("pratica")}>
                  {B.experimentar}
                </Botao>
                {VOZ_DISPONIVEL && (
                  <Botao variante="contorno" onClick={() => lerEmVozAlta(`${nomePersonagem}: ${brief} ${definicao.descricao}`)}>
                    <Icone nome="ouvir" /> {B.ouvir}
                  </Botao>
                )}
              </div>
              {escolherContexto && !aldeia && !contextoForcado && (
                <div className="pt-2 border-t" style={{ borderColor: "var(--linha)" }}>
                  <SeletorContexto compacto />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {etapa === "pratica" && (
        <section aria-label="Prática" className="grid gap-3">
          <Componente key={`p${chave}`} config={configPratica} modo="pratica" nivel={nivel} contexto={idContexto} extensaoTempo={extensao} aoTerminar={() => setEtapa("avaliacao")} />
          <div>
            <Botao variante="discreto" onClick={() => setEtapa("avaliacao")}>
              Passar à avaliação
            </Botao>
          </div>
        </section>
      )}

      {etapa === "avaliacao" && (
        <section aria-label="Avaliação">
          <Componente key={`a${chave}`} config={config} modo="avaliacao" nivel={nivel} contexto={idContexto} extensaoTempo={extensao} aoTerminar={terminarAvaliacao} />
        </section>
      )}

      {etapa === "resultado" && tentativa && (
        <Resultado
          tentativa={tentativa}
          relatorio={relatorio}
          definicao={definicao}
          contexto={idContexto}
          nivel={nivel}
          melhorAnterior={melhorAnterior}
          aldeia={aldeia}
          aoRepetir={() => {
            setChave((k) => k + 1);
            setTentativa(null);
            setEtapa("avaliacao");
          }}
          aoContinuar={aldeia ? aldeia.aoVoltar : aoConcluir ? () => aoConcluir(tentativa) : undefined}
          rotuloContinuar={aldeia ? aldeia.rotuloVoltar : rotuloContinuar}
        />
      )}
    </div>
  );
}

function Resultado({
  tentativa,
  relatorio,
  definicao,
  contexto,
  nivel,
  melhorAnterior,
  aldeia,
  aoRepetir,
  aoContinuar,
  rotuloContinuar,
}: {
  tentativa: Tentativa;
  relatorio?: LinhaRelatorio[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definicao: DefinicaoAtividade<any>;
  contexto: Contexto;
  nivel: Nivel;
  melhorAnterior: number | undefined;
  aldeia?: AldeiaNaAtividade;
  aoRepetir: () => void;
  aoContinuar?: () => void;
  rotuloContinuar?: string;
}) {
  const ctx = defContexto(contexto);
  const p = tentativa.pontuacao;
  const estrelas = estrelasDe(p);
  const faixa = faixaDe(p);
  const recorde = melhorAnterior === undefined || p > melhorAnterior;
  const proxima = DISPONIVEIS.find((a) => a.numero > definicao.numero) ?? DISPONIVEIS[0];
  const dica = definicao.dica(tentativa.metricas, p);
  const R = PAGINAS.atividade.resultado;
  const temCarimbo = EMBLEMAS_PIXEL.has(definicao.slug) && !aldeia?.treino;
  const titulo = definicao.titulo[contexto];
  const corFaixa = ["var(--b1)", "var(--b2)", "var(--b3)", "var(--b4)"][Math.max(0, ["A começar", "Em progresso", "Confiante", "Autónomo"].indexOf(faixa.nome))];

  return (
    <section className="grid gap-4" aria-labelledby="res-t">
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="cartao p-6 grid gap-2 justify-items-center text-center content-start">
          <Suspense fallback={<div style={{ width: 132, height: 192 }} />}>
            <AvatarResultado pontuacao={p} aparencia={aldeia?.aparencia} />
          </Suspense>
          <div className="text-6xl font-extrabold tabular-nums leading-none" style={{ fontFamily: "var(--fonte-titulo)" }} role="img" aria-label={`${p} pontos em 100`}>
            {p}
          </div>
          <EstrelasPixel n={estrelas} entrar />
          <span className="etiqueta inline-flex items-center gap-2" style={{ justifySelf: "center" }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: corFaixa, display: "inline-block" }} />
            {faixa.nome}
          </span>
        </div>
        <div className="cartao p-6 grid gap-3 content-start">
          <h2 id="res-t" className="text-2xl">
            {p >= CARIMBO_MINIMO ? R.muitoBem : p >= 75 ? R.bom : p >= 50 ? R.caminho : R.tenta}
          </h2>
          {recorde && melhorAnterior !== undefined && <p className="m-0 font-bold" style={{ color: "var(--certo)" }}>{preencher(R.recorde, { antes: melhorAnterior })}</p>}
          <ResumoRelatorio pontuacao={p} linhas={relatorio} dica={dica} />
          {temCarimbo && p >= 50 && (
            <div className="cartao p-3 flex items-center gap-3" style={{ borderRadius: "var(--raio)" }}>
              <img src={urlPixel(`avatares/emblemas/emblema-${definicao.slug}`)} alt="" width={44} height={44} style={{ ...pixelado, flex: "none", filter: p >= CARIMBO_MINIMO ? undefined : "grayscale(1) opacity(.55)" }} />
              <span>
                {p >= CARIMBO_MINIMO ? (
                  <>
                    {preencher(R.ganhouCarimbo, { titulo })}{" "}
                    {!aldeia && <Link to="/cartao">{preencher(R.verCartao, { cartao: ctx.resultado.cartao })}</Link>}
                  </>
                ) : (
                  preencher(R.faltaCarimbo, { titulo })
                )}
              </span>
            </div>
          )}
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            {preencher(R.tempo, { s: Math.round(tentativa.duracaoMs / 1000), nivel, nome: NOME_NIVEL[nivel] })}
            {tentativa.extensaoTempo !== 1 && <> · tempo alargado ×{tentativa.extensaoTempo}</>}
          </p>
          <div className="flex gap-3 flex-wrap">
            {aoContinuar ? (
              <>
                <Botao grande onClick={aoContinuar}>
                  {rotuloContinuar ?? "Continuar"}
                </Botao>
                <Botao variante="contorno" onClick={aoRepetir}>
                  {R.repetirEsta}
                </Botao>
              </>
            ) : (
              <>
                <Botao onClick={aoRepetir}>{R.repetir}</Botao>
                {definicao.numero >= 200 ? (
                  <>
                    <Link to={`/seguranca/${definicao.slug}`} className="botao botao--contorno">
                      {R.revInfo}
                    </Link>
                    <Link to="/seguranca" className="botao botao--discreto">
                      {R.voltarSeguranca}
                    </Link>
                  </>
                ) : definicao.numero >= 100 ? (
                  <Link to="/jogos" className="botao botao--contorno">
                    {R.voltarJogos}
                  </Link>
                ) : (
                  <>
                    {proxima && (
                      <LigacaoBotao para={`/atividades/${proxima.slug}/${nivel}`} variante="contorno">
                        {preencher(R.proxima, { titulo: proxima.titulo[contexto] })}
                      </LigacaoBotao>
                    )}
                    <Link to="/treino" className="botao botao--discreto">
                      {R.voltar}
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {relatorio && relatorio.length > 0 && <TabelaRelatorio linhas={relatorio} />}
    </section>
  );
}
