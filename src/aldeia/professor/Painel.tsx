// ─── Aldeia Digital · painel do professor ────────────────────────────────────
// Entrada com o código do professor (token de 2 horas em sessionStorage, sem cookies). Responde a três perguntas:
// onde está cada aluno na história, o que já fez e o que falta, e o que fazer na próxima aula. Fica no Mosaico/Original,
// sem pixel nos dados (só as cabeças dos avatares, para reconhecer o aluno pelo fato). Estados por forma e ícone.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import QRCode from "qrcode";
import { AlertTriangle, Check, CircleCheck, Star, RotateCcw, X } from "lucide-react";
import { Caminho } from "../../componentes/Caminho";
import { Barras } from "../../componentes/Graficos";
import { Botao, BotaoRadio, CaixaVerificacao, Cartao, CampoTexto, Seletor } from "../../ui";
import { NOME_NIVEL, faixaDe } from "../../motor/tipos";
import { Cabeca } from "../arte/componentes";
import { urlPixel } from "../arte/pixel";
import { capitulosDaTurma, DIMENSOES, LUGARES_MAX, fimAnoLetivo, missoesDaTurma, type DefMissao, type FrequenciaEmail } from "../nucleo/catalogo";
import { codigoProfessorValido, formatarProfessor, formatarTurma } from "../nucleo/codigos";
import type { AlunoPainel, VistaProfessor } from "../nucleo/modelo";
import { nomeVisivel } from "../nucleo/nomes";
import { capituloAtual, estadoCapitulos, perfilCidadania, perfilCompetencias, pontuaveis } from "../nucleo/regras";
import { alertas, csvTurma, diasSemAtividade, estadoCelula, motivosApoio, resumoTurma, terminou, type Alerta, type EstadoCelula } from "../nucleo/relatorios";
import { LOTES, P } from "../mapa/mundo";
import { obterLigacao, type Ligacao } from "../cliente/servidor";
import { apagarTokenPainel, esquecerTurma, guardarTokenPainel, tokenPainel, turmasGuardadas } from "../cliente/sessao";
import { ALDEIA } from "../textos";
import { nomeMissao } from "../ecras/missoes";
import { Modal } from "../ecras/comum";

const T = () => ALDEIA.professor.painel;
const tituloCap = (n: number) => (ALDEIA.capitulos as Record<string, { titulo: string }>)[`c${n}`]?.titulo ?? "";
const dataPt = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("pt-PT", { day: "numeric", month: "long" });

export default function Painel() {
  const [ligacao, setLigacao] = useState<Ligacao | null>(null);
  const [sessao, setSessao] = useState(tokenPainel());
  const [dados, setDados] = useState<VistaProfessor | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    void obterLigacao().then(setLigacao);
  }, []);
  const carregar = useCallback(async () => {
    if (!ligacao || !sessao) return;
    const r = await ligacao.servidor.painel(sessao.token);
    if (r.ok) {
      setDados(r.valor);
      setErro("");
    } else if (r.erro === "token") {
      apagarTokenPainel();
      setSessao(null);
    } else setErro(r.rede ? ALDEIA.interface.erros.rede : ALDEIA.interface.erros.geral);
  }, [ligacao, sessao]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  if (!ligacao) return <p>{ALDEIA.interface.a_carregar}</p>;
  if (!sessao) return <Entrar ligacao={ligacao} aoEntrar={(token, turma) => { guardarTokenPainel(token, turma); setSessao(tokenPainel()); }} />;
  if (!dados) return <div className="grid gap-3"><Caminho itens={[["/professor", "Professor"]]} atual={T().titulo} /><p role="status">{erro || ALDEIA.interface.a_carregar}</p></div>;
  return <PainelTurma ligacao={ligacao} token={sessao.token} dados={dados} aoMudar={setDados} aoAtualizar={carregar} aoSair={() => { apagarTokenPainel(); setSessao(null); setDados(null); }} />;
}

function Entrar({ ligacao, aoEntrar }: { ligacao: Ligacao; aoEntrar: (token: string, turma: string) => void }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);
  const turmas = turmasGuardadas();
  async function entrar(e: FormEvent) {
    e.preventDefault();
    const c = codigoProfessorValido(codigo);
    if (!c) return setErro(T().erroCodigo);
    setAEnviar(true);
    const r = await ligacao.servidor.professorEntrar(c);
    setAEnviar(false);
    if (r.ok) aoEntrar(r.valor.token, r.valor.turma);
    else setErro(r.estado === 429 ? T().bloqueado : r.rede ? ALDEIA.interface.erros.rede : T().erroCodigo);
  }
  return (
    <div className="grid gap-5 max-w-2xl">
      <Caminho itens={[["/professor", "Professor"]]} atual={T().titulo} />
      <h1 className="text-4xl">{T().titulo}</h1>
      {ligacao.estado !== "servidor" && <p className="cartao p-3 m-0 text-sm" role="note">{T().local}</p>}
      <form onSubmit={entrar} className="cartao p-5 grid gap-3" noValidate>
        <CampoTexto id="painel-codigo" rotulo={T().codigo} ajuda={T().codigoAjuda} value={codigo} onChange={(e) => { setCodigo(formatarProfessor(e.target.value).slice(0, 16)); setErro(""); }} autoComplete="off" spellCheck={false} erro={erro || undefined} style={{ fontFamily: "var(--fonte-mono)", fontSize: "1.2rem", letterSpacing: ".06em" }} />
        <div>
          <Botao type="submit" grande disabled={aEnviar}>{T().entrar}</Botao>
        </div>
      </form>
      {turmas.length > 0 && (
        <Cartao className="grid gap-2">
          <h2 className="text-lg">{ALDEIA.professor.sessoes.titulo}</h2>
          <ul className="m-0 pl-5">
            {turmas.map((t) => (
              <li key={t.codigo}>
                <strong style={{ fontFamily: "var(--fonte-mono)" }}>{formatarTurma(t.codigo)}</strong> {t.nome && <>· {t.nome}</>} · {new Date(t.criadoEm).toLocaleDateString("pt-PT")}
              </li>
            ))}
          </ul>
        </Cartao>
      )}
    </div>
  );
}

type Separador = keyof ReturnType<typeof T>["separadores"];
type Filtro = "todos" | "apoio" | "inativos" | "adiantados";

function PainelTurma({ ligacao, token, dados, aoMudar, aoAtualizar, aoSair }: { ligacao: Ligacao; token: string; dados: VistaProfessor; aoMudar: (d: VistaProfessor) => void; aoAtualizar: () => void; aoSair: () => void }) {
  const t = dados.turma;
  const alunos = dados.alunos;
  const agora = useMemo(() => new Date(), [dados]); // eslint-disable-line react-hooks/exhaustive-deps
  const missoes = useMemo(() => missoesDaTurma(t.config), [t.config]);
  const caps = capitulosDaTurma(missoes);
  const resumo = useMemo(() => resumoTurma(t, alunos, agora), [t, alunos, agora]);
  const listaAlertas = useMemo(() => alertas(t, alunos, agora), [t, alunos, agora]);
  const [sep, setSep] = useState<Separador>("turma");
  const [aluno, setAluno] = useState<string | null>(null);
  const [projetar, setProjetar] = useState(false);
  const [msg, setMsg] = useState("");
  const fechada = Boolean(t.fechadaEm) || agora.getTime() > Date.parse(`${t.config.dataFim}T23:59:59Z`);
  async function acao(a: Parameters<Ligacao["servidor"]["acao"]>[1]) {
    const r = await ligacao.servidor.acao(token, a);
    if (r.ok) {
      aoMudar(r.valor);
      setMsg(T().acoes.feito);
    } else setMsg(r.erro === "nome-existe" ? ALDEIA.interface.entrada.jaExiste : r.erro === "nome-invalido" ? ALDEIA.interface.entrada.erros.forma : ALDEIA.interface.erros.geral);
    return r.ok;
  }
  const sel = alunos.find((a) => a.id === aluno) ?? null;
  return (
    <div className="grid gap-5 painel-aldeia">
      <Caminho itens={[["/professor", "Professor"]]} atual={T().titulo} />
      <header className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1">
          <h1 className="text-3xl">{t.config.nome ? `${t.config.nome} · ${T().minhaAldeia}` : T().minhaAldeia}</h1>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            {T().codigoTurma} <strong style={{ fontFamily: "var(--fonte-mono)", color: "var(--tinta)" }}>{formatarTurma(t.codigo)}</strong> · {fechada ? T().fechada : T().abertaAte.replace("{data}", dataPt(t.config.dataFim))} · {t.config.ritmo === "livre" ? T().modoLivre : T().modoGuiado} · {ALDEIA.professor.config.colecoes[t.config.colecao]} · Nível {t.config.nivel}
          </p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <Botao variante="contorno" onClick={() => setProjetar(true)}>{T().projetar}</Botao>
          <Botao onClick={() => setSep("relatorios")}>{T().relatorio}</Botao>
          <Botao variante="discreto" onClick={aoAtualizar}>{T().atualizar}</Botao>
          <Botao variante="discreto" onClick={aoSair}>{T().sairPainel}</Botao>
        </div>
      </header>
      {ligacao.estado !== "servidor" && <p className="cartao p-3 m-0 text-sm" role="note">{T().local}</p>}
      <p className="sr-only" role="status">{msg}</p>

      {listaAlertas.length > 0 && (
        <ul className="m-0 p-0 list-none grid gap-2" aria-label="Alertas">
          {listaAlertas.map((a) => (
            <AlertaCartao key={a.chave} a={a} alunos={alunos} aoAbrir={(n) => void acao({ acao: "abrirCapitulo", capitulo: n })} caps={caps} guiado={t.config.ritmo === "guiado"} />
          ))}
        </ul>
      )}

      <div role="tablist" aria-label={T().titulo} className="flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--linha)" }}>
        {(Object.keys(T().separadores) as Separador[]).map((s) => (
          <button key={s} role="tab" aria-selected={sep === s} className="separador" onClick={() => setSep(s)}>
            {T().separadores[s]}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="grid gap-5">
        {sep === "turma" && <Turma dados={dados} resumo={resumo} missoes={missoes} caps={caps} agora={agora} aoAluno={setAluno} aoAbrir={(n) => void acao({ acao: "abrirCapitulo", capitulo: n })} />}
        {sep === "missoes" && <Missoes dados={dados} missoes={missoes} />}
        {sep === "competencias" && <Competencias resumo={resumo} />}
        {sep === "cidadania" && <Cidadania dados={dados} missoes={missoes} />}
        {sep === "relatorios" && <Relatorios dados={dados} resumo={resumo} missoes={missoes} caps={caps} agora={agora} />}
        {sep === "definicoes" && <Definicoes ligacao={ligacao} token={token} dados={dados} acao={acao} aoApagado={() => { esquecerTurma(t.codigo); aoSair(); }} />}
      </div>

      {sel && <Gaveta aluno={sel} dados={dados} missoes={missoes} agora={agora} aoFechar={() => setAluno(null)} acao={acao} />}
      {projetar && <Projetar codigo={t.codigo} aoFechar={() => setProjetar(false)} />}
    </div>
  );
}

function AlertaCartao({ a, alunos, aoAbrir, caps, guiado }: { a: Alerta; alunos: AlunoPainel[]; aoAbrir: (n: number) => void; caps: number[]; guiado: boolean }) {
  const A = T().alertas;
  const quem = a.alunos.map((id) => nomeVisivel(alunos.find((x) => x.id === id)?.nome ?? "")).filter(Boolean);
  const n = quem.length === 1 ? "1 aluno" : `${quem.length} alunos`;
  const frase = (A[a.tipo] as string).replace("{n}", n).replace("{capitulo}", String(a.capitulo ?? "")).replace("{dias}", String(a.dias ?? ""));
  const bom = a.tipo === "concluida" || a.tipo === "capitulo";
  const prox = a.capitulo !== undefined ? caps[caps.indexOf(a.capitulo) + 1] : undefined;
  return (
    <li className="cartao p-3 flex flex-wrap items-center gap-3 alerta-aldeia" style={{ borderLeft: `6px solid ${bom ? "var(--certo)" : "var(--aviso)"}` }}>
      {bom ? <CircleCheck size={20} aria-hidden="true" style={{ color: "var(--certo)" }} /> : <AlertTriangle size={20} aria-hidden="true" style={{ color: "var(--aviso)" }} />}
      <span className="flex-1 min-w-0">
        {frase}
        {quem.length > 0 && <span style={{ color: "var(--suave)" }}> · {quem.join(", ")}</span>}
      </span>
      {a.tipo === "capitulo" && guiado && prox !== undefined && <Botao variante="contorno" onClick={() => aoAbrir(prox)}>{A.abrir.replace("{n}", String(prox))}</Botao>}
    </li>
  );
}

function Icelula({ e }: { e: EstadoCelula }) {
  const L = T().legenda;
  if (e === "estrela") return <span className="celula celula--estrela" role="img" aria-label={L.estrela}><Star size={12} aria-hidden="true" fill="currentColor" /></span>;
  if (e === "visto") return <span className="celula celula--visto" role="img" aria-label={L.visto}><Check size={12} aria-hidden="true" /></span>;
  if (e === "repetir") return <span className="celula celula--repetir" role="img" aria-label={L.repetir}><RotateCcw size={11} aria-hidden="true" /></span>;
  if (e === "curso") return <span className="celula celula--curso" role="img" aria-label={L.curso} />;
  return <span className="celula celula--vazio" role="img" aria-label={L.vazio} />;
}

function emCurso(a: AlunoPainel, t: VistaProfessor["turma"]): string | null {
  const caps = estadoCapitulos(t.config, t.capitulosAbertos, a);
  const c = caps.find((x) => x.aberto && !x.concluido);
  return c?.missoes.find((m) => !a.progresso[m.id])?.id ?? null;
}

function Turma({ dados, resumo, missoes, caps, agora, aoAluno, aoAbrir }: { dados: VistaProfessor; resumo: ReturnType<typeof resumoTurma>; missoes: DefMissao[]; caps: number[]; agora: Date; aoAluno: (id: string) => void; aoAbrir: (n: number) => void }) {
  const { turma: t, alunos } = dados;
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const apoio = new Set(resumo.apoio.map((x) => x.id));
  const atual = (a: AlunoPainel) => capituloAtual(estadoCapitulos(t.config, t.capitulosAbertos, a));
  const lista = alunos
    .filter((a) => filtro === "todos" || (filtro === "apoio" ? apoio.has(a.id) : filtro === "inativos" ? diasSemAtividade(a, agora) >= 7 : true))
    .sort((a, b) => (filtro === "adiantados" ? Object.keys(b.progresso).length - Object.keys(a.progresso).length : a.lugar - b.lugar));
  const total = missoes.length;
  if (!alunos.length) return <p className="cartao p-4 m-0">{T().vazio}</p>;
  const sugestoes = proximaAula(dados, resumo, missoes, caps);
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Kpi n={String(resumo.alunos)} r={T().kpis.alunos} />
        <Kpi n={String(resumo.ativos7)} r={T().kpis.ativos} />
        <Kpi n={T().capituloCurto.replace("{n}", String(resumo.capituloMaioria))} r={T().kpis.maioria} />
        <Kpi n={String(resumo.apoio.length)} r={T().kpis.apoio} aviso={resumo.apoio.length > 0} />
      </div>

      <section className="cartao p-4 grid gap-3" aria-labelledby="onde">
        <h2 id="onde" className="text-xl">{T().ondeEsta}</h2>
        <ol className="caminho-capitulos m-0 p-0 list-none">
          {caps.map((n) => {
            const aqui = alunos.filter((a) => atual(a) === n && !terminou(a, t));
            const passaram = resumo.porCapitulo.find((c) => c.n === n)?.feitos ?? 0;
            const edificio = missoes.find((m) => m.capitulo === n && m.edificio !== "casa")?.edificio;
            return (
              <li key={n} className="caminho-capitulos__estacao">
                <span className={`caminho-capitulos__n ${n === 0 ? "caminho-capitulos__n--cheio" : ""}`} aria-hidden="true">{n}</span>
                <strong className="text-sm">{tituloCap(n)}</strong>
                <span className="text-xs" style={{ color: "var(--suave)" }}>
                  {edificio ? `${ALDEIA.edificios[edificio].nome.split(" ")[0]} · ` : ""}{T().passaram.replace("{n}", String(passaram)).replace("{total}", String(alunos.length))}
                </span>
                <span className="caminho-capitulos__cabecas">
                  {aqui.slice(0, 6).map((a) => (
                    <button key={a.id} type="button" className="cabeca-aluno" onClick={() => aoAluno(a.id)} aria-label={`${nomeVisivel(a.nome)}${apoio.has(a.id) ? `, ${T().kpis.apoio}` : ""}`}>
                      <Cabeca fato={a.aparencia.fato} tamanho={32} />
                      {apoio.has(a.id) && <span className="cabeca-aluno__aviso" aria-hidden="true">!</span>}
                    </button>
                  ))}
                  {aqui.length > 6 && <span className="text-xs">{T().maisN.replace("{n}", String(aqui.length - 6))}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-3" aria-labelledby="feito">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="feito" className="text-xl mr-auto">{T().feito}</h2>
          {(["todos", "apoio", "inativos", "adiantados"] as Filtro[]).map((f) => (
            <button key={f} type="button" className="filtro" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {T().filtros[f].replace("{n}", String(resumo.apoio.length))}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm" aria-hidden="true">
          {(["estrela", "visto", "repetir", "curso", "vazio"] as EstadoCelula[]).map((e) => (
            <span key={e} className="inline-flex items-center gap-1"><Icelula e={e} /> {T().legenda[e]}</span>
          ))}
        </div>
        <div className="cartao grelha-feito" style={{ overflowX: "auto" }}>
          <table className="tabela tabela-feito">
            <thead>
              <tr>
                <th scope="col" rowSpan={2}>{T().aluno}</th>
                {caps.map((n) => (
                  <th key={n} scope="colgroup" colSpan={missoes.filter((m) => m.capitulo === n).length} className="text-center">{T().capituloCurto.replace("{n}", String(n))}</th>
                ))}
              </tr>
              <tr>
                {missoes.map((m) => (
                  <th key={m.id} scope="col" title={nomeMissao(m.id)} className="tabela-feito__missao">
                    <abbr title={nomeMissao(m.id)}>{nomeMissao(m.id).replace(/^(A |O |As |Os )/, "").slice(0, 4)}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => {
                const curso = emCurso(a, t);
                const feitas = Object.keys(a.progresso).filter((k) => missoes.some((m) => m.id === k)).length;
                const dias = diasSemAtividade(a, agora);
                return (
                  <tr key={a.id}>
                    <th scope="row">
                      <button type="button" className="aluno-linha" onClick={() => aoAluno(a.id)}>
                        <Cabeca fato={a.aparencia.fato} tamanho={28} />
                        <span className="grid text-left">
                          <strong>{nomeVisivel(a.nome)}</strong>
                          <span className="text-xs" style={{ color: "var(--suave)" }}>
                            {T().capituloCurto.replace("{n}", String(atual(a)))} · {T().missoesFeitas.replace("{n}", String(feitas)).replace("{total}", String(total))} · {dias >= 7 ? <span style={{ color: "var(--aviso)", fontWeight: 700 }}>⚠ {T().ha.replace("{n}", String(dias))}</span> : dias === 0 ? T().hoje : T().ha.replace("{n}", String(dias))}
                          </span>
                        </span>
                      </button>
                    </th>
                    {missoes.map((m) => (
                      <td key={m.id} className="text-center">
                        <Icelula e={estadoCelula(a, m, curso === m.id)} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* No telemóvel a grelha passa a cartões, um por aluno, com a mesma fila de estados. */}
        <ul className="cartoes-feito m-0 p-0 list-none grid gap-2">
          {lista.map((a) => {
            const curso = emCurso(a, t);
            return (
              <li key={a.id} className="cartao p-3 grid gap-2">
                <button type="button" className="aluno-linha" onClick={() => aoAluno(a.id)}>
                  <Cabeca fato={a.aparencia.fato} tamanho={32} />
                  <strong>{nomeVisivel(a.nome)}</strong>
                  <span className="text-xs" style={{ color: "var(--suave)" }}>{T().capituloCurto.replace("{n}", String(atual(a)))}</span>
                </button>
                <div className="flex flex-wrap gap-1">
                  {missoes.map((m) => (
                    <span key={m.id} title={nomeMissao(m.id)}>
                      <Icelula e={estadoCelula(a, m, curso === m.id)} />
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3" aria-labelledby="prox">
        <h2 id="prox" className="text-xl">{T().proximaAula}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {sugestoes.map((s, k) => (
            <div key={k} className="cartao p-4 grid gap-2 content-start" style={{ borderLeft: "6px solid var(--acento)" }}>
              <strong>{s.titulo}</strong>
              <span style={{ color: "var(--suave)" }}>{s.texto}</span>
              {s.abrir !== undefined && (
                <div>
                  <Botao onClick={() => aoAbrir(s.abrir!)}>{T().alertas.abrir.replace("{n}", String(s.abrir))}</Botao>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Miniatura dados={dados} apoio={apoio} aoAluno={aoAluno} />
    </>
  );
}

function proximaAula(dados: VistaProfessor, resumo: ReturnType<typeof resumoTurma>, missoes: DefMissao[], caps: number[]) {
  const S = T().sugestoes;
  const { turma: t, alunos } = dados;
  const out: { titulo: string; texto: string; abrir?: number }[] = [];
  // a missão aberta que menos alunos fizeram
  const porFazer = pontuaveis(missoes)
    .map((m) => ({ m, n: alunos.filter((a) => !a.progresso[m.id] && estadoCapitulos(t.config, t.capitulosAbertos, a).some((c) => c.aberto && c.missoes.includes(m))).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => a.m.capitulo - b.m.capitulo)[0];
  if (porFazer) out.push({ titulo: S.porFazer.replace("{n}", porFazer.n === 1 ? "1 aluno" : `${porFazer.n} alunos`).replace("{missao}", nomeMissao(porFazer.m.id)), texto: S.porFazerTexto.replace("{capitulo}", String(porFazer.m.capitulo)).replace("{min}", "5") });
  const dificil = resumo.dificeis.find((d) => d.media < 50);
  if (dificil) {
    const n = alunos.filter((a) => a.progresso[dificil.missao] && a.progresso[dificil.missao].melhor < 50).length;
    out.push({ titulo: S.abaixo.replace("{n}", `${n} alunos`).replace("{missao}", nomeMissao(dificil.missao)), texto: S.abaixoTexto });
  }
  if (t.config.ritmo === "guiado") {
    const prox = caps.find((n) => !t.capitulosAbertos.includes(n));
    if (prox !== undefined) {
      const ant = caps[caps.indexOf(prox) - 1];
      const feitos = resumo.porCapitulo.find((c) => c.n === ant)?.feitos ?? 0;
      out.push({ titulo: S.abrir.replace("{n}", String(prox)), texto: S.abrirTexto.replace("{feitos}", String(feitos)).replace("{n}", String(prox)), abrir: prox });
    }
  }
  if (!out.length) out.push({ titulo: S.tudoBem, texto: S.tudoBemTexto });
  return out.slice(0, 3);
}

function Kpi({ n, r, aviso }: { n: string; r: string; aviso?: boolean }) {
  return (
    <div className="cartao p-4" style={aviso ? { borderLeft: "6px solid var(--aviso)" } : undefined}>
      <div className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>{n}</div>
      <div className="text-sm" style={{ color: "var(--suave)" }}>{r}</div>
    </div>
  );
}

/** Miniatura da aldeia com a casa de cada aluno (e a lista equivalente nos botões). */
function Miniatura({ dados, apoio, aoAluno }: { dados: VistaProfessor; apoio: Set<string>; aoAluno: (id: string) => void }) {
  return (
    <section className="cartao p-3 grid gap-2" aria-labelledby="mini">
      <h2 id="mini" className="text-lg">{ALDEIA.interface.mapa.titulo}</h2>
      <div className="miniatura-aldeia">
        <img src={urlPixel("mundo/mapa/mapa-dia")} alt="" className="miniatura-aldeia__mapa" />
        {dados.alunos.map((a) => {
          const l = LOTES.find((x) => x.n === a.lugar);
          if (!l) return null;
          const [x, y] = P(l.i + 1, l.j + 1);
          return (
            <button key={a.id} type="button" className="miniatura-aldeia__casa" style={{ left: `${(x / 2640) * 100}%`, top: `${(y / 1500) * 100}%` }} onClick={() => aoAluno(a.id)} aria-label={`${nomeVisivel(a.nome)}${apoio.has(a.id) ? `, ${T().kpis.apoio}` : ""}`}>
              <Cabeca fato={a.aparencia.fato} tamanho={24} />
              {apoio.has(a.id) && <span className="cabeca-aluno__aviso" aria-hidden="true">!</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Gaveta({ aluno, dados, missoes, agora, aoFechar, acao }: { aluno: AlunoPainel; dados: VistaProfessor; missoes: DefMissao[]; agora: Date; aoFechar: () => void; acao: (a: Parameters<Ligacao["servidor"]["acao"]>[1]) => Promise<boolean> }) {
  const G = T().gaveta;
  const A = T().acoes;
  const t = dados.turma;
  const [verTudo, setVerTudo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [confirmar, setConfirmar] = useState<"" | "apagar" | "renovar">("");
  const feitas = missoes.filter((m) => aluno.progresso[m.id] && m.tipo !== "evento");
  const porFazer = missoes.filter((m) => !aluno.progresso[m.id] && m.tipo !== "evento");
  const cap = capituloAtual(estadoCapitulos(t.config, t.capitulosAbertos, aluno));
  const motivos = motivosApoio(aluno, t, dados.alunos, agora);
  const fracas = perfilCompetencias(aluno, missoes).filter((c) => c.melhor < 65).sort((a, b) => a.melhor - b.melhor);
  const dias = diasSemAtividade(aluno, agora);
  const linha = (m: DefMissao) => {
    const p = aluno.progresso[m.id];
    return (
      <li key={m.id} className="cartao px-3 py-2 flex items-center gap-2">
        <span className="flex-1">{nomeMissao(m.id)}</span>
        {p ? <><span className="tabular-nums text-sm">{p.melhor}</span><Icelula e={estadoCelula(aluno, m, false)} /></> : <span className="text-sm" style={{ color: "var(--suave)" }}>{T().capituloCurto.replace("{n}", String(m.capitulo))}</span>}
      </li>
    );
  };
  return (
    <Modal titulo={nomeVisivel(aluno.nome)} aoFechar={aoFechar} largura={460}>
      <aside className="gaveta-aluno grid gap-3">
        <header className="flex items-start gap-3">
          <Cabeca fato={aluno.aparencia.fato} tamanho={56} />
          <div className="grid flex-1">
            <h2 className="text-xl">{nomeVisivel(aluno.nome)}</h2>
            <span className="text-sm" style={{ color: "var(--suave)" }}>{T().capituloCurto.replace("{n}", String(cap))} · {tituloCap(cap)}</span>
            <span className="text-sm" style={{ color: "var(--suave)" }}>{G.ultima.replace("{quando}", dias === 0 ? T().hoje : T().ha.replace("{n}", String(dias)))}</span>
            {aluno.entradas.length > 0 && <span className="text-sm" style={{ color: "var(--suave)" }}>{G.entradas.replace("{n}", String(aluno.entradas.length))}</span>}
          </div>
          <button type="button" className="botao botao--contorno" onClick={aoFechar} aria-label={G.fechar}><X size={18} aria-hidden="true" /></button>
        </header>
        {motivos.length > 0 && <p className="m-0 text-sm font-bold" style={{ color: "var(--aviso)" }}>⚠ {motivos.map((m) => T().motivos[m]).join(" · ")}</p>}
        <div className="grid gap-1">
          <div className="flex justify-between"><strong>{G.historia}</strong><span>{feitas.length} de {feitas.length + porFazer.length}</span></div>
          <div className="barra"><div style={{ width: `${(feitas.length / Math.max(1, feitas.length + porFazer.length)) * 100}%` }} /></div>
        </div>
        <h3 className="text-base">{G.feito}</h3>
        <ul className="m-0 p-0 list-none grid gap-1">{(verTudo ? feitas : feitas.slice(0, 6)).map(linha)}</ul>
        <h3 className="text-base">{G.porFazer}</h3>
        <ul className="m-0 p-0 list-none grid gap-1">{(verTudo ? porFazer : porFazer.slice(0, 5)).map(linha)}</ul>
        {!verTudo && feitas.length + porFazer.length > 11 && <Botao variante="contorno" onClick={() => setVerTudo(true)}>{G.maisN.replace("{n}", String(Math.max(0, feitas.length - 6) + Math.max(0, porFazer.length - 5)))}</Botao>}
        {fracas.length > 0 && (
          <>
            <h3 className="text-base">{G.treinar}</h3>
            <p className="m-0 text-sm">{fracas.map((c) => `${nomeMissao(c.slug)} (${c.melhor}, ${faixaDe(c.melhor).nome})`).join(" · ")}</p>
          </>
        )}
        <h3 className="text-base">{A.titulo}</h3>
        <form className="flex gap-2 items-end flex-wrap" onSubmit={async (e) => { e.preventDefault(); if (novoNome.trim() && (await acao({ acao: "renomear", aluno: aluno.id, nome: novoNome }))) setNovoNome(""); }}>
          <CampoTexto id="novo-nome" rotulo={A.novoNome} value={novoNome} onChange={(e) => setNovoNome(e.target.value)} maxLength={20} />
          <Botao type="submit" variante="contorno">{A.renomear}</Botao>
        </form>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{A.renovarAjuda}</p>
        {confirmar === "" ? (
          <div className="flex gap-2 flex-wrap">
            <Botao variante="contorno" onClick={() => setConfirmar("renovar")}>{A.renovar}</Botao>
            <Botao variante="perigo" onClick={() => setConfirmar("apagar")}>{A.apagarAluno}</Botao>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap items-center" role="alert">
            <span>{confirmar === "apagar" ? `${A.apagarAluno}?` : `${A.renovar}?`}</span>
            <Botao variante={confirmar === "apagar" ? "perigo" : "primario"} onClick={async () => { await acao(confirmar === "apagar" ? { acao: "apagarAluno", aluno: aluno.id } : { acao: "renovarAluno", aluno: aluno.id }); setConfirmar(""); if (confirmar === "apagar") aoFechar(); }}>{A.confirmar}</Botao>
            <Botao variante="contorno" onClick={() => setConfirmar("")}>{A.cancelar}</Botao>
          </div>
        )}
      </aside>
    </Modal>
  );
}

function Missoes({ dados, missoes }: { dados: VistaProfessor; missoes: DefMissao[] }) {
  const M = T().missoes;
  return (
    <div className="cartao" style={{ overflowX: "auto" }}>
      <table className="tabela">
        <thead>
          <tr>
            <th scope="col">Missão</th><th scope="col">Cap.</th><th scope="col">{M.feitas}</th><th scope="col">{M.media}</th><th scope="col">{M.primeiraMelhor}</th><th scope="col">{M.faixas}</th><th scope="col">{M.tempo}</th>
          </tr>
        </thead>
        <tbody>
          {pontuaveis(missoes).map((m) => {
            const ps = dados.alunos.map((a) => a.progresso[m.id]).filter(Boolean);
            const media = ps.length ? Math.round(ps.reduce((s, p) => s + p.melhor, 0) / ps.length) : null;
            const primeira = ps.length ? Math.round(ps.reduce((s, p) => s + p.primeira, 0) / ps.length) : null;
            const tempo = ps.length ? Math.round(ps.reduce((s, p) => s + p.duracaoMs, 0) / ps.length / 1000) : null;
            const faixas = ["A começar", "Em progresso", "Confiante", "Autónomo"].map((f) => ps.filter((p) => faixaDe(p.melhor).nome === f).length);
            return (
              <tr key={m.id}>
                <th scope="row">{nomeMissao(m.id)}</th>
                <td>{m.capitulo}</td>
                <td className="tabular-nums">{ps.length} de {dados.alunos.length}</td>
                <td className="tabular-nums">{media ?? "—"}</td>
                <td className="tabular-nums">{primeira !== null ? `${primeira} → ${media}` : "—"}</td>
                <td className="tabular-nums text-sm">{faixas.join(" · ")}</td>
                <td className="tabular-nums">{tempo !== null ? `${Math.floor(tempo / 60)}:${String(tempo % 60).padStart(2, "0")}` : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="m-0 p-3 text-sm" style={{ color: "var(--suave)" }}>{M.faixas}: A começar · Em progresso · Confiante · Autónomo</p>
    </div>
  );
}

function Competencias({ resumo }: { resumo: ReturnType<typeof resumoTurma> }) {
  const R = ALDEIA.professor.relatorios;
  const feitas = resumo.competencias.filter((c) => c.n > 0);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Barras titulo={R.competencias} dados={feitas.map((c) => ({ rotulo: nomeMissao(c.slug), valor: c.media, nota: `n = ${c.n}` }))} max={100} unidade="Média" />
      <Barras titulo={`${R.evolucao} (${R.primeira})`} dados={feitas.map((c) => ({ rotulo: nomeMissao(c.slug), valor: c.primeira }))} max={100} unidade={R.primeira} />
    </div>
  );
}

function Cidadania({ dados, missoes }: { dados: VistaProfessor; missoes: DefMissao[] }) {
  const R = ALDEIA.professor.relatorios;
  const porDim = DIMENSOES.map((d) => {
    const v = dados.alunos.flatMap((a) => perfilCidadania(a, missoes).filter((x) => x.dimensao === d.id && x.feitas > 0).map((x) => x.media));
    return { d: d.id, media: v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null, n: v.length };
  }).filter((x) => dados.turma.config.dimensoes.includes(x.d));
  return <Barras titulo={R.cidadania} dados={porDim.filter((x) => x.media !== null).map((x) => ({ rotulo: ALDEIA.dimensoes[x.d], valor: x.media!, nota: `n = ${x.n}` }))} max={100} unidade="Média" />;
}

function Relatorios({ dados, resumo, missoes, caps, agora }: { dados: VistaProfessor; resumo: ReturnType<typeof resumoTurma>; missoes: DefMissao[]; caps: number[]; agora: Date }) {
  const R = ALDEIA.professor.relatorios;
  const t = dados.turma;
  const nomeTurma = t.config.nome || formatarTurma(t.codigo);
  const quem = (id: string) => nomeVisivel(dados.alunos.find((a) => a.id === id)?.nome ?? "");
  const feitas = resumo.competencias.filter((c) => c.n > 0);
  const forte = [...feitas].sort((a, b) => b.media - a.media)[0];
  const fraca = [...feitas].sort((a, b) => a.media - b.media)[0];
  const mediaGeral = feitas.length ? Math.round(feitas.reduce((s, c) => s + c.media, 0) / feitas.length) : 0;
  const totalMissoes = dados.alunos.reduce((s, a) => s + Object.keys(a.progresso).length, 0);
  const padde = R.paddeTexto.replace("{n}", String(dados.alunos.length)).replace("{m}", String(totalMissoes)).replace("{media}", String(mediaGeral)).replace("{forte}", forte ? nomeMissao(forte.slug) : "—").replace("{fraca}", fraca ? nomeMissao(fraca.slug) : "—");
  const treinarAgrupado = feitas.map((c) => ({ c, alunos: dados.alunos.filter((a) => { const p = perfilCompetencias(a, missoes).find((x) => x.slug === c.slug); return p && p.melhor < 65; }).map((a) => nomeVisivel(a.nome)) })).filter((x) => x.alunos.length);
  const terminouTurma = dados.alunos.length > 0 && resumo.terminaram === dados.alunos.length;

  function csv() {
    const blob = new Blob(["\uFEFF" + csvTurma(t, dados.alunos, nomeMissao)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aldeia-${t.codigo}-${agora.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function pdf(conclusao: boolean) {
    const { pdfRelatorio } = await import("./pdf");
    pdfRelatorio(
      `${nomeTurma} · ${conclusao ? R.conclusao : R.progresso}`,
      `${ALDEIA.nome} · ${agora.toLocaleDateString("pt-PT")} · ${dados.alunos.length} alunos`,
      [
        { titulo: R.capitulos, barras: resumo.porCapitulo.map((c) => ({ rotulo: `${c.n} · ${tituloCap(c.n)}`, valor: c.pct })) },
        { titulo: R.competencias, barras: feitas.map((c) => ({ rotulo: nomeMissao(c.slug), valor: c.media })) },
        ...(conclusao ? [{ titulo: R.evolucao, linhas: feitas.map((c) => `${nomeMissao(c.slug)}: ${R.primeira} ${c.primeira}, ${R.melhor} ${c.media}`) }, { titulo: R.paraTreinar, linhas: treinarAgrupado.map((x) => `${nomeMissao(x.c.slug)}: ${x.alunos.join(", ")}`) }, { titulo: R.padde, linhas: [padde] }] : []),
        { titulo: R.apoio, linhas: resumo.apoio.length ? resumo.apoio.map((x) => `${quem(x.id)}: ${x.motivos.map((m) => T().motivos[m]).join(", ")}`) : [R.ninguem] },
        { titulo: R.dificeis, linhas: resumo.dificeis.map((d) => `${nomeMissao(d.missao)}: ${d.media} (${d.n})`) },
        { titulo: R.porAluno, linhas: dados.alunos.map((a) => { const c = capituloAtual(estadoCapitulos(t.config, t.capitulosAbertos, a)); const ps = perfilCompetencias(a, missoes); return `${nomeVisivel(a.nome)} · ${T().capituloCurto.replace("{n}", String(c))} · ${Object.keys(a.progresso).length} missões${ps.length ? ` · ${ps.map((p) => `${nomeMissao(p.slug)} ${p.primeira}→${p.melhor}`).join(", ")}` : ""}`; }) },
      ],
      `aldeia-${t.codigo}-${conclusao ? "conclusao" : "progresso"}.pdf`,
    );
  }
  return (
    <>
      <section className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl mr-auto">{nomeTurma} · {R.progresso}</h2>
          <Botao variante="contorno" onClick={csv}>{R.csv}</Botao>
          <Botao variante="contorno" onClick={() => void pdf(false)}>{R.pdf}</Botao>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Barras titulo={R.capitulos} dados={resumo.porCapitulo.map((c) => ({ rotulo: `${c.n} · ${tituloCap(c.n)}`, valor: c.pct }))} max={100} unidade="%" />
          <Barras titulo={R.competencias} dados={feitas.map((c) => ({ rotulo: nomeMissao(c.slug), valor: c.media }))} max={100} unidade="Média" />
        </div>
        <Cartao className="grid gap-2">
          <h3 className="text-lg">{R.apoio}</h3>
          <p className="m-0">{resumo.apoio.length ? resumo.apoio.map((x) => `${quem(x.id)} · ${x.motivos.map((m) => T().motivos[m]).join(", ")}`).join(". ") : R.ninguem}</p>
          <h3 className="text-lg">{R.dificeis}</h3>
          <p className="m-0">{resumo.dificeis.length ? resumo.dificeis.map((d) => `${nomeMissao(d.missao)} (${d.media})`).join(" · ") : R.ninguem}</p>
        </Cartao>
      </section>
      <section className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl mr-auto">{R.conclusao}{!terminouTurma && <span className="text-base font-normal" style={{ color: "var(--suave)" }}> · {resumo.terminaram} de {dados.alunos.length}</span>}</h2>
          <Botao variante="contorno" onClick={() => void pdf(true)}>{R.pdf}</Botao>
        </div>
        <div className="cartao" style={{ overflowX: "auto" }}>
          <table className="tabela">
            <caption className="sr-only">{R.evolucao}</caption>
            <thead><tr><th scope="col">{R.competencias}</th><th scope="col">{R.primeira}</th><th scope="col">{R.melhor}</th></tr></thead>
            <tbody>{feitas.map((c) => <tr key={c.slug}><th scope="row">{nomeMissao(c.slug)}</th><td className="tabular-nums">{c.primeira}</td><td className="tabular-nums">{c.media}</td></tr>)}</tbody>
          </table>
        </div>
        <Cartao className="grid gap-2">
          <h3 className="text-lg">{R.paraTreinar}</h3>
          {treinarAgrupado.length ? <ul className="m-0 pl-5">{treinarAgrupado.map((x) => <li key={x.c.slug}><strong>{nomeMissao(x.c.slug)}</strong> {R.com} {x.alunos.join(", ")}</li>)}</ul> : <p className="m-0">{R.ninguem}</p>}
          <h3 className="text-lg">{R.padde}</h3>
          <p className="m-0">{padde}</p>
        </Cartao>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{R.aviso} {caps.length} capítulos.</p>
      </section>
    </>
  );
}

function Definicoes({ ligacao, token, dados, acao, aoApagado }: { ligacao: Ligacao; token: string; dados: VistaProfessor; acao: (a: Parameters<Ligacao["servidor"]["acao"]>[1]) => Promise<boolean>; aoApagado: () => void }) {
  const t = dados.turma;
  const C = ALDEIA.professor.config;
  const A = T().acoes;
  const E = T().emailAlertas;
  const [lugares, setLugares] = useState(t.config.lugares);
  const [nome, setNome] = useState(t.config.nome);
  const [dataFim, setDataFim] = useState(t.config.dataFim);
  const [ritmo, setRitmo] = useState(t.config.ritmo);
  const [email, setEmail] = useState(t.email?.endereco ?? "");
  const [freq, setFreq] = useState<FrequenciaEmail>(t.email?.frequencia ?? "semanal");
  const [autorizar, setAutorizar] = useState(t.email?.autorizarNome ?? false);
  const [msgEmail, setMsgEmail] = useState("");
  const [apagar, setApagar] = useState("");
  const [confFechar, setConfFechar] = useState(false);
  const caps = capitulosDaTurma(missoesDaTurma(t.config));
  async function guardarEmail(endereco: string | null) {
    const r = await ligacao.servidor.email(token, { endereco, frequencia: freq, autorizarNome: autorizar });
    setMsgEmail(r.ok ? (r.valor.confirmacaoEnviada ? ALDEIA.professor.criada.emailEnviado.replace("{email}", endereco ?? "") : A.feito) : r.erro === "email-local" ? C.local : ALDEIA.interface.erros.geral);
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Cartao className="grid gap-3">
        <h2 className="text-xl">{C.turma}</h2>
        <CampoTexto id="d-nome" rotulo={C.nome} ajuda={C.nomeAjuda} value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} />
        <CampoTexto id="d-fim" type="date" rotulo={C.dataFim} ajuda={C.dataFimAjuda} value={dataFim} min={new Date().toISOString().slice(0, 10)} max={fimAnoLetivo()} onChange={(e) => setDataFim(e.target.value)} />
        <fieldset className="grid gap-1 border-0 p-0 m-0">
          <legend className="font-bold">{C.ritmo}</legend>
          {(["livre", "guiado"] as const).map((r) => <BotaoRadio key={r} id={`d-ritmo-${r}`} name="d-ritmo" rotulo={C.ritmos[r]} checked={ritmo === r} onChange={() => setRitmo(r)} />)}
        </fieldset>
        <div><Botao onClick={() => void acao({ acao: "configurar", config: { nome, dataFim, ritmo } })}>{E.guardar}</Botao></div>
      </Cartao>
      <Cartao className="grid gap-3">
        <h2 className="text-xl">{A.titulo}</h2>
        <div className="flex gap-2 items-end flex-wrap">
          <CampoTexto id="d-lugares" type="number" rotulo={C.lugares} ajuda={C.lugaresAjuda} min={t.config.lugares} max={LUGARES_MAX} value={lugares} onChange={(e) => setLugares(Number(e.target.value))} />
          <Botao variante="contorno" onClick={() => void acao({ acao: "lugares", lugares })} disabled={lugares <= t.config.lugares}>{A.lugares}</Botao>
        </div>
        {t.config.ritmo === "guiado" && (
          <div className="flex gap-2 flex-wrap">
            {caps.filter((n) => !t.capitulosAbertos.includes(n)).slice(0, 1).map((n) => <Botao key={n} onClick={() => void acao({ acao: "abrirCapitulo", capitulo: n })}>{A.abrirCapitulo.replace("{n}", String(n))}</Botao>)}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Botao variante="contorno" onClick={async () => (await import("./pdf")).pdfCartoes(t.codigo, t.config.lugares)}>{ALDEIA.professor.criada.cartoes}</Botao>
          <Botao variante="contorno" onClick={async () => (await import("./pdf")).pdfCarta(t.codigo, t.config.nome)}>{ALDEIA.professor.criada.carta}</Botao>
        </div>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>Nível {t.config.nivel} · {NOME_NIVEL[t.config.nivel]} · {C.extensoes[t.config.extensao]}</p>
      </Cartao>
      <Cartao className="grid gap-3">
        <h2 className="text-xl">{E.titulo}</h2>
        <p className="m-0 text-sm">{t.email ? (t.email.confirmado ? E.estado.confirmado : E.estado.porConfirmar) : E.estado.nenhum}</p>
        <CampoTexto id="d-email" type="email" rotulo={C.emailCampo} ajuda={C.emailAjuda} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Seletor id="d-freq" rotulo={C.frequencia} value={freq} onChange={(e) => setFreq(e.target.value as FrequenciaEmail)} opcoes={(["semanal", "diario", "marcos", "nenhum"] as FrequenciaEmail[]).map((f) => ({ valor: f, texto: C.frequencias[f] }))} />
        <CaixaVerificacao id="d-autorizar" rotulo={C.autorizarNome} checked={autorizar} onChange={(e) => setAutorizar(e.target.checked)} />
        <div className="flex gap-2 flex-wrap">
          <Botao onClick={() => void guardarEmail(email.trim() || null)} disabled={!ligacao.email && ligacao.estado === "servidor"}>{E.guardar}</Botao>
          {t.email && <Botao variante="contorno" onClick={() => { setEmail(""); void guardarEmail(null); }}>{E.remover}</Botao>}
        </div>
        <p className="m-0 text-sm" role="status">{msgEmail}</p>
      </Cartao>
      <Cartao className="grid gap-3" style={{ borderColor: "var(--errado)" }}>
        <h2 className="text-xl">{A.fechar} · {A.apagarTudo}</h2>
        {!t.fechadaEm && (
          <>
            <p className="m-0 text-sm">{A.fecharAviso}</p>
            {confFechar ? (
              <div className="flex gap-2"><Botao variante="perigo" onClick={() => void acao({ acao: "fechar" })}>{A.confirmar}</Botao><Botao variante="contorno" onClick={() => setConfFechar(false)}>{A.cancelar}</Botao></div>
            ) : <div><Botao variante="contorno" onClick={() => setConfFechar(true)}>{A.fechar}</Botao></div>}
          </>
        )}
        <p className="m-0 text-sm">{A.apagarAviso}</p>
        <CampoTexto id="d-apagar" rotulo={T().codigoTurma} value={apagar} onChange={(e) => setApagar(e.target.value.toUpperCase())} autoComplete="off" />
        <div>
          <Botao variante="perigo" disabled={apagar.replace(/[^A-Z0-9]/g, "") !== t.codigo} onClick={async () => { const r = await ligacao.servidor.apagar(token, t.codigo); if (r.ok) aoApagado(); }}>{A.apagarTudo}</Botao>
        </div>
      </Cartao>
    </div>
  );
}

export function Projetar({ codigo, aoFechar }: { codigo: string; aoFechar: () => void }) {
  const [qr, setQr] = useState("");
  const url = `${window.location.origin}/aldeia/${codigo}`;
  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(""));
  }, [url]);
  return (
    <Modal titulo={ALDEIA.professor.criada.projetar} aoFechar={aoFechar} largura={900}>
      <div className="grid gap-4 justify-items-center text-center projetar">
        <div className="text-sm" style={{ color: "var(--suave)" }}>{ALDEIA.professor.criada.codigoTurma}</div>
        <div className="projetar__codigo">{formatarTurma(codigo)}</div>
        {qr && <div className="w-56 h-56 p-2 rounded-lg" style={{ background: "#fff" }} role="img" aria-label="Código QR com a ligação para os alunos" dangerouslySetInnerHTML={{ __html: qr }} />}
        <div style={{ fontFamily: "var(--fonte-mono)" }}>{url.replace(/^https?:\/\//, "")}</div>
        <Botao onClick={aoFechar}>{T().gaveta.fechar}</Botao>
        <Link to="/professor" className="sr-only">Professor</Link>
      </div>
    </Modal>
  );
}

