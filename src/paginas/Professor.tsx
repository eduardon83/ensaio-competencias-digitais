// ─── Professor: montar uma prova, obter o código, receber e consultar resultados (sem contas) ──
// O código transporta a configuração (src/codigo/codigo.ts). Se a recolha estiver configurada, a sessão é
// registada no ponto de recolha com o hash de um token privado do professor e, opcionalmente, um email
// (confirmado por ligação antes de qualquer envio). O token fica neste navegador e na ligação privada.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import QRCode from "qrcode";
import { DISPONIVEIS, porSlug } from "../atividades";
import { codificar, descodificar, type ConfigSessao, type Identificacao } from "../codigo/codigo";
import { fecharSessao, obterResultadosSessao, registarSessao, sha256Hex, telemetriaConfigurada, type ResultadosSessao } from "../dados/telemetria";
import { CICLOS, NIVEIS, NOME_DOMINIO, NOME_NIVEL, type Nivel } from "../motor/tipos";
import type { ExtensaoTempo } from "../preferencias/preferencias";
import { Botao, BotaoRadio, CaixaVerificacao, Cartao, CampoTexto, Etiqueta } from "../ui";

interface SessaoGuardada {
  codigo: string;
  sessao: string;
  token: string;
  criadoEm: string;
  config: ConfigSessao;
  email: string;
}
const CHAVE = "ecd.professor.sessoes.v1";
function lerSessoes(): SessaoGuardada[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as SessaoGuardada[];
  } catch {
    return [];
  }
}
function guardarSessoes(l: SessaoGuardada[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(l));
  } catch {
    /* nada */
  }
}
function tokenAleatorio(): string {
  const b = new Uint8Array(18);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function urlBase(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}`;
}
function urlResultados(s: { sessao: string; token: string }) {
  return `${urlBase()}/professor/resultados#s=${s.sessao}&t=${s.token}`;
}
function urlAluno(codigo: string) {
  return `${urlBase()}/codigo/${codigo.replace("·", "")}`;
}

export function Professor() {
  const [nivel, setNivel] = useState<Nivel>(2);
  const [atividades, setAtividades] = useState<string[]>(() => DISPONIVEIS.map((a) => a.slug));
  const [extensao, setExtensao] = useState<ExtensaoTempo>(1);
  const [identificacao, setIdentificacao] = useState<Identificacao>("numero");
  const [email, setEmail] = useState("");
  const [frequencia, setFrequencia] = useState<"cada" | "diario">("diario");
  const [criada, setCriada] = useState<SessaoGuardada | null>(null);
  const [estado, setEstado] = useState<"" | "a_criar" | "ok" | "aviso">("");
  const [mensagem, setMensagem] = useState("");
  const [sessoes, setSessoes] = useState<SessaoGuardada[]>(lerSessoes);
  const emailInvalido = email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function criar() {
    setEstado("a_criar");
    const { codigo, sessao, config } = codificar({ nivel, atividades, extensaoTempo: extensao, identificacao });
    const token = tokenAleatorio();
    const nova: SessaoGuardada = { codigo, sessao, token, criadoEm: new Date().toISOString(), config, email: email.trim() };
    const lista = [nova, ...lerSessoes()].slice(0, 50);
    guardarSessoes(lista);
    setSessoes(lista);
    setCriada(nova);
    if (!telemetriaConfigurada) {
      setEstado("aviso");
      setMensagem("Esta instalação não tem recolha configurada: os alunos veem o resultado no ecrã deles, mas os resultados não chegam ao professor.");
      return;
    }
    const r = await registarSessao({ sessao, codigo, config, tokenHash: await sha256Hex(token), email: email.trim(), frequencia: email.trim() ? frequencia : "nenhum", urlResultados: urlResultados(nova) });
    if ("ok" in r && r.ok) {
      setEstado("ok");
      setMensagem(email.trim() ? `Enviámos um email de confirmação para ${email.trim()}. Os resultados só começam a chegar depois de confirmar. Se não o vir em alguns minutos, procure no spam.` : "Sessão registada. Consulte os resultados com a ligação privada abaixo.");
    } else {
      setEstado("aviso");
      setMensagem("Não foi possível registar a sessão no ponto de recolha agora. O código funciona na mesma; tente criar outra sessão mais tarde para receber resultados.");
    }
  }

  if (criada) return <SessaoCriada s={criada} estado={estado} mensagem={mensagem} aoNova={() => setCriada(null)} />;

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Professor</h1>
        <p className="m-0">Monte uma prova para a turma: escolha o nível e as atividades, obtenha um código e dê-o aos alunos. Não precisa de conta. Se indicar um email, recebe os resultados.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid gap-4">
          <Cartao className="grid gap-3">
            <h2 className="text-xl">1. Nível</h2>
            <fieldset className="grid gap-1 border-0 p-0 m-0">
              <legend className="sr-only">Nível</legend>
              {NIVEIS.map((n) => {
                const ciclo = CICLOS.find((c) => c.nivel === n);
                return <BotaoRadio key={n} id={`pnivel-${n}`} name="pnivel" rotulo={`Nível ${n} · ${NOME_NIVEL[n]}${ciclo ? ` (≈ ${ciclo.nome})` : ""}`} checked={nivel === n} onChange={() => setNivel(n)} />;
              })}
            </fieldset>
          </Cartao>

          <Cartao className="grid gap-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-xl">2. Atividades</h2>
              <Botao variante="discreto" onClick={() => setAtividades(DISPONIVEIS.map((a) => a.slug))}>
                Todas
              </Botao>
              <Botao variante="discreto" onClick={() => setAtividades([])}>
                Nenhuma
              </Botao>
            </div>
            <div className="grid gap-1">
              {DISPONIVEIS.map((a) => (
                <CaixaVerificacao
                  key={a.slug}
                  id={`pat-${a.slug}`}
                  rotulo={`${a.titulo.jornal} · ${NOME_DOMINIO[a.dominio]} (${a.duracao})`}
                  checked={atividades.includes(a.slug)}
                  onChange={(e) => setAtividades((l) => (e.target.checked ? [...l, a.slug] : l.filter((x) => x !== a.slug)))}
                />
              ))}
            </div>
            {atividades.length === 0 && (
              <p className="m-0 text-sm font-bold" style={{ color: "var(--errado)" }} role="alert">
                Escolha pelo menos uma atividade.
              </p>
            )}
          </Cartao>

          <Cartao className="grid gap-3">
            <h2 className="text-xl">3. Alunos</h2>
            <fieldset className="grid gap-1 border-0 p-0 m-0">
              <legend className="font-bold text-sm">Como se identificam os alunos</legend>
              <BotaoRadio id="pid-numero" name="pid" rotulo="Número de turma (recomendado)" checked={identificacao === "numero"} onChange={() => setIdentificacao("numero")} />
              <BotaoRadio id="pid-alcunha" name="pid" rotulo="Alcunha escolhida pelo aluno" checked={identificacao === "alcunha"} onChange={() => setIdentificacao("alcunha")} />
              <BotaoRadio id="pid-nenhuma" name="pid" rotulo="Não pedir (resultados anónimos)" checked={identificacao === "nenhuma"} onChange={() => setIdentificacao("nenhuma")} />
            </fieldset>
            <fieldset className="flex gap-4 flex-wrap border-0 p-0 m-0">
              <legend className="font-bold text-sm">Tempo alargado para toda a turma</legend>
              {([1, 1.25, 1.5, 2] as ExtensaoTempo[]).map((x) => (
                <BotaoRadio key={x} id={`pext-${x}`} name="pext" rotulo={x === 1 ? "Normal" : `×${x}`} checked={extensao === x} onChange={() => setExtensao(x)} />
              ))}
            </fieldset>
          </Cartao>

          <Cartao className="grid gap-3">
            <h2 className="text-xl">4. Resultados por email (opcional)</h2>
            {telemetriaConfigurada ? (
              <>
                <CampoTexto id="pemail" type="email" rotulo="O seu email" ajuda="Enviamos primeiro um email de confirmação. Sem confirmação não enviamos nada. O endereço é apagado 12 meses depois da última tentativa." value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" erro={emailInvalido ? "Este endereço não parece válido." : undefined} />
                {email.trim() && (
                  <fieldset className="grid gap-1 border-0 p-0 m-0">
                    <legend className="font-bold text-sm">Quando receber</legend>
                    <BotaoRadio id="pfreq-diario" name="pfreq" rotulo="Um resumo por dia (recomendado)" checked={frequencia === "diario"} onChange={() => setFrequencia("diario")} />
                    <BotaoRadio id="pfreq-cada" name="pfreq" rotulo="Um email por cada atividade concluída" checked={frequencia === "cada"} onChange={() => setFrequencia("cada")} />
                  </fieldset>
                )}
                <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                  Sem email, consulta os resultados na ligação privada que aparece depois de criar a sessão.
                </p>
              </>
            ) : (
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                Esta instalação não tem recolha de resultados configurada. Os alunos veem o resultado no ecrã deles e podem imprimi-lo ou mostrá-lo.
              </p>
            )}
          </Cartao>

          <div>
            <Botao grande onClick={() => void criar()} disabled={atividades.length === 0 || emailInvalido || estado === "a_criar"}>
              {estado === "a_criar" ? "A criar…" : "Criar código"}
            </Botao>
          </div>
        </div>

        <aside className="grid gap-4 content-start">
          <Cartao className="grid gap-2">
            <h2 className="text-lg">Como funciona</h2>
            <ol className="m-0 pl-5 grid gap-1 text-sm">
              <li>Escolhe o nível, as atividades e como os alunos se identificam.</li>
              <li>Recebe um código e um QR para projetar.</li>
              <li>Os alunos vão a Treinar → Código, escrevem o código e fazem a prova.</li>
              <li>Os resultados chegam por email e ficam numa página privada, com exportação CSV.</li>
            </ol>
          </Cartao>
          {sessoes.length > 0 && (
            <Cartao className="grid gap-2">
              <h2 className="text-lg">As suas sessões neste navegador</h2>
              <ul className="m-0 p-0 list-none grid gap-2 text-sm">
                {sessoes.map((s) => (
                  <li key={s.codigo} className="grid gap-0">
                    <span>
                      <strong style={{ fontFamily: "var(--fonte-mono)" }}>{s.codigo}</strong> · nível {s.config.nivel} · {s.config.atividades.length} atividade{s.config.atividades.length === 1 ? "" : "s"}
                    </span>
                    <span style={{ color: "var(--suave)" }}>
                      {new Date(s.criadoEm).toLocaleDateString("pt-PT")} · <Link to={`/professor/resultados#s=${s.sessao}&t=${s.token}`}>ver resultados</Link>
                    </span>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </aside>
      </div>
    </div>
  );
}

function SessaoCriada({ s, estado, mensagem, aoNova }: { s: SessaoGuardada; estado: string; mensagem: string; aoNova: () => void }) {
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState("");
  const ligacaoAluno = urlAluno(s.codigo);
  const ligacaoPrivada = urlResultados(s);
  useEffect(() => {
    QRCode.toString(ligacaoAluno, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(""));
  }, [ligacaoAluno]);
  function copiar(texto: string, qual: string) {
    navigator.clipboard?.writeText(texto).then(() => setCopiado(qual), () => setCopiado(""));
  }
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl">Sessão criada</h1>
      {mensagem && (
        <div className="cartao p-4" role="status" style={{ borderColor: estado === "ok" ? "var(--certo)" : "var(--aviso)", borderWidth: 2 }}>
          {mensagem}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Cartao className="grid gap-3 text-center justify-items-center">
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            Código para os alunos
          </div>
          <div className="text-5xl md:text-6xl font-extrabold tracking-wider" style={{ fontFamily: "var(--fonte-mono)" }}>
            {s.codigo}
          </div>
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            Treinar → Código, ou a ligação: <span style={{ fontFamily: "var(--fonte-mono)" }}>{ligacaoAluno}</span>
          </div>
          {qr && <div className="w-48 h-48 p-2 rounded-lg" style={{ background: "#fff" }} aria-label="Código QR com a ligação para os alunos" role="img" dangerouslySetInnerHTML={{ __html: qr }} />}
          <div className="flex gap-2 flex-wrap justify-center">
            <Botao variante="contorno" onClick={() => copiar(s.codigo, "codigo")}>
              {copiado === "codigo" ? "Copiado" : "Copiar código"}
            </Botao>
            <Botao variante="contorno" onClick={() => copiar(ligacaoAluno, "aluno")}>
              {copiado === "aluno" ? "Copiado" : "Copiar ligação"}
            </Botao>
            <Botao variante="contorno" onClick={() => window.print()}>
              Imprimir
            </Botao>
          </div>
        </Cartao>
        <div className="grid gap-4 content-start">
          <Cartao className="grid gap-2">
            <h2 className="text-lg">Resumo</h2>
            <p className="m-0 text-sm">
              Nível {s.config.nivel} · {NOME_NIVEL[s.config.nivel]}
              {s.config.extensaoTempo !== 1 && <> · tempo ×{s.config.extensaoTempo}</>}
            </p>
            <div className="flex gap-1 flex-wrap">
              {s.config.atividades.map((slug) => (
                <Etiqueta key={slug}>{porSlug(slug)?.titulo.jornal ?? slug}</Etiqueta>
              ))}
            </div>
            <p className="m-0 text-sm">Identificação: {s.config.identificacao === "numero" ? "número de turma" : s.config.identificacao === "alcunha" ? "alcunha" : "nenhuma"}</p>
          </Cartao>
          {telemetriaConfigurada && (
            <Cartao className="grid gap-2">
              <h2 className="text-lg">Ligação privada de resultados</h2>
              <p className="m-0 text-sm">Guarde-a. Não a partilhe com os alunos. Também fica guardada neste navegador{s.email ? " e vai no email de confirmação" : ""}.</p>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/professor/resultados#s=${s.sessao}&t=${s.token}`} className="botao">
                  Ver resultados
                </Link>
                <Botao variante="contorno" onClick={() => copiar(ligacaoPrivada, "privada")}>
                  {copiado === "privada" ? "Copiada" : "Copiar ligação privada"}
                </Botao>
              </div>
            </Cartao>
          )}
          <div>
            <Botao variante="discreto" onClick={aoNova}>
              Criar outra sessão
            </Botao>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Resultados de uma sessão (ligação privada) ──────────────────────────────
export function ResultadosProfessor() {
  const local = useLocation();
  const params = useMemo(() => new URLSearchParams(local.hash.replace(/^#/, "")), [local.hash]);
  const sessao = params.get("s") ?? "";
  const token = params.get("t") ?? "";
  const [dados, setDados] = useState<ResultadosSessao | null>(null);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  async function carregar() {
    setACarregar(true);
    const r = await obterResultadosSessao(sessao, token);
    setACarregar(false);
    if ("erro" in r) {
      setDados(null);
      setErro(r.erro === "token" || r.erro === "sessao" ? "Ligação inválida: verifique que copiou a ligação privada completa." : r.erro === "nao_configurado" ? "Esta instalação não tem recolha de resultados configurada." : `Não foi possível obter os resultados (${r.erro}).`);
    } else {
      setErro("");
      setDados(r);
    }
  }
  useEffect(() => {
    if (sessao && token) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao, token]);

  if (!sessao || !token) {
    return (
      <div className="grid gap-3 max-w-2xl">
        <h1 className="text-4xl">Resultados da sessão</h1>
        <p className="m-0">Abra a ligação privada que recebeu ao criar a sessão (ou no email de confirmação). As sessões criadas neste navegador estão listadas em <Link to="/professor">Professor</Link>.</p>
      </div>
    );
  }

  const config = dados ? descodificar(dados.codigo)?.config : undefined;
  const alunos = dados ? [...new Set(dados.tentativas.map((t) => t.aluno || "—"))].sort((a, b) => a.localeCompare(b, "pt", { numeric: true })) : [];
  const slugs = config?.atividades ?? (dados ? [...new Set(dados.tentativas.map((t) => t.atividade))] : []);
  const melhor = (aluno: string, slug: string) => {
    const ts = dados!.tentativas.filter((t) => (t.aluno || "—") === aluno && t.atividade === slug);
    return ts.length ? Math.max(...ts.map((t) => t.pontuacao)) : null;
  };

  function exportar() {
    if (!dados) return;
    const cab = ["data", "aluno", "atividade", "nivel", "pontuacao", "duracao_s", "dispositivo", "cenario"];
    const linhas = [cab.join(";"), ...dados.tentativas.map((t) => [t.recebidoEm, t.aluno, t.atividade, t.nivel, t.pontuacao, t.duracaoS, t.dispositivo, t.contexto].join(";"))];
    const blob = new Blob(["﻿" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ecd-sessao-${dados.sessao}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-4xl">Resultados da sessão</h1>
        {dados && (
          <p className="m-0">
            Código <strong style={{ fontFamily: "var(--fonte-mono)" }}>{dados.codigo}</strong> · nível {config?.nivel ?? "?"} · criada a {new Date(dados.criadoEm).toLocaleDateString("pt-PT")}
            {dados.email && <> · email {dados.email} ({dados.confirmado ? "confirmado" : "por confirmar"}, {dados.frequencia === "cada" ? "por atividade" : dados.frequencia === "diario" ? "resumo diário" : "sem envio"})</>}
            {dados.fechada && <> · <strong>sessão fechada</strong></>}
          </p>
        )}
      </header>
      {aCarregar && <p className="m-0">A carregar…</p>}
      {erro && (
        <p className="m-0 font-bold" style={{ color: "var(--errado)" }} role="alert">
          {erro}
        </p>
      )}
      {dados && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Cartao>
              <div className="text-sm" style={{ color: "var(--suave)" }}>
                Alunos
              </div>
              <div className="text-4xl font-extrabold tabular-nums">{alunos.length}</div>
            </Cartao>
            <Cartao>
              <div className="text-sm" style={{ color: "var(--suave)" }}>
                Atividades concluídas
              </div>
              <div className="text-4xl font-extrabold tabular-nums">{dados.tentativas.length}</div>
            </Cartao>
            <Cartao>
              <div className="text-sm" style={{ color: "var(--suave)" }}>
                Média geral
              </div>
              <div className="text-4xl font-extrabold tabular-nums">{dados.tentativas.length ? Math.round(dados.tentativas.reduce((s, t) => s + t.pontuacao, 0) / dados.tentativas.length) : "—"}</div>
            </Cartao>
          </div>
          <div className="cartao" style={{ overflowX: "auto" }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Aluno</th>
                  {slugs.map((s) => (
                    <th key={s} scope="col">
                      {porSlug(s)?.titulo.jornal ?? s}
                    </th>
                  ))}
                  <th scope="col">Média</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a) => {
                  const ps = slugs.map((s) => melhor(a, s));
                  const feitos = ps.filter((p): p is number => p !== null);
                  return (
                    <tr key={a}>
                      <th scope="row">{a}</th>
                      {ps.map((p, i) => (
                        <td key={slugs[i]} className="tabular-nums">
                          {p ?? "—"}
                        </td>
                      ))}
                      <td className="tabular-nums font-bold">{feitos.length ? Math.round(feitos.reduce((x, y) => x + y, 0) / feitos.length) : "—"}</td>
                    </tr>
                  );
                })}
                {alunos.length === 0 && (
                  <tr>
                    <td colSpan={slugs.length + 2} style={{ color: "var(--suave)" }}>
                      Ainda nenhum aluno concluiu uma atividade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            A tabela mostra a melhor pontuação de cada aluno em cada atividade. O CSV tem todas as tentativas.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Botao onClick={() => void carregar()}>Atualizar</Botao>
            <Botao variante="contorno" onClick={exportar} disabled={dados.tentativas.length === 0}>
              Exportar CSV
            </Botao>
            {!dados.fechada && (
              <Botao
                variante="perigo"
                onClick={async () => {
                  if (!window.confirm("Fechar a sessão? Os alunos deixam de poder usar o código e deixa de receber emails.")) return;
                  await fecharSessao(sessao, token);
                  void carregar();
                }}
              >
                Fechar sessão
              </Botao>
            )}
          </div>
        </>
      )}
    </div>
  );
}
