// ─── Aldeia Digital · configuração da turma pelo professor e turma criada ────
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "qrcode";
import { Rico } from "../../textos/Rico";
import { Botao, BotaoRadio, CaixaVerificacao, Cartao, CampoTexto, Seletor } from "../../ui";
import { CICLOS, NIVEIS, NOME_NIVEL, type Nivel } from "../../motor/tipos";
import {
  CAPITULOS, DIMENSOES, DIMENSOES_GRUPO_1, FIXAS, LUGARES_MAX, capitulosDaTurma, escolhaInicial, fimAnoLetivo, missoesDaTurma, missoesEscolhiveis,
  type Colecao, type ConfigTurma, type Dimensao, type Extensao, type FrequenciaEmail, type ModoIdentificacao, type Ritmo, type Tempo,
} from "../nucleo/catalogo";
import { formatarProfessor, formatarTurma } from "../nucleo/codigos";
import { emailValido } from "../nucleo/esquema";
import { obterLigacao, type Ligacao } from "../cliente/servidor";
import { guardarTokenPainel, guardarTurma } from "../cliente/sessao";
import { ALDEIA } from "../textos";
import { nomeMissao } from "../ecras/missoes";
import { Projetar } from "./Painel";

const C = () => ALDEIA.professor.config;

export default function ConfigAldeia() {
  const [ligacao, setLigacao] = useState<Ligacao | null>(null);
  useEffect(() => {
    void obterLigacao().then(setLigacao);
  }, []);
  const [nome, setNome] = useState("");
  const [lugares, setLugares] = useState(24);
  const [nivel, setNivel] = useState<Nivel>(2);
  const [extensao, setExtensao] = useState<Extensao>("completa");
  const [dimensoes, setDimensoes] = useState<Dimensao[]>(DIMENSOES_GRUPO_1);
  const [escolha, setEscolha] = useState<string[]>(() => escolhaInicial(DIMENSOES_GRUPO_1));
  const [identificacao, setIdentificacao] = useState<ModoIdentificacao[]>(["anonimo"]);
  const [ritmo, setRitmo] = useState<Ritmo>("livre");
  const [tempo, setTempo] = useState<Tempo>(1);
  const [dataFim, setDataFim] = useState(fimAnoLetivo());
  const [colecao, setColecao] = useState<Colecao>("atuais");
  const [email, setEmail] = useState("");
  const [frequencia, setFrequencia] = useState<FrequenciaEmail>("semanal");
  const [autorizarNome, setAutorizarNome] = useState(false);
  const [termos, setTermos] = useState(false);
  const [aCriar, setACriar] = useState(false);
  const [erro, setErro] = useState("");
  const [criada, setCriada] = useState<{ turma: string; professor: string; token: string; email: boolean } | null>(null);

  const config: ConfigTurma = { nome: nome.trim(), lugares, nivel, extensao, escolha, dimensoes, identificacao, ritmo, tempo, dataFim, colecao };
  const missoes = useMemo(() => missoesDaTurma(config), [extensao, escolha, dimensoes]); // eslint-disable-line react-hooks/exhaustive-deps
  const caps = capitulosDaTurma(missoes);
  const aulas = Math.max(1, Math.round((missoes.filter((m) => m.tipo !== "evento").length * 7) / 45));
  const emailInvalido = email.trim() !== "" && !emailValido(email.trim());

  function mudarDimensoes(d: Dimensao, ligar: boolean) {
    const novas = ligar ? [...dimensoes, d] : dimensoes.filter((x) => x !== d);
    setDimensoes(novas);
    const cid = missoesEscolhiveis([d]).filter((m) => m.tipo === "cidadania").map((m) => m.id);
    setEscolha((e) => (ligar ? [...new Set([...e, ...cid])] : e.filter((x) => !cid.includes(x))));
  }

  async function criar() {
    if (!ligacao) return;
    setACriar(true);
    setErro("");
    const r = await ligacao.servidor.criarTurma(config);
    if (!r.ok) {
      setACriar(false);
      return setErro(r.estado === 429 ? C().limite : r.erro === "teto" ? C().teto : C().erro);
    }
    let enviado = false;
    if (email.trim() && ligacao.estado === "servidor") {
      const e = await ligacao.servidor.email(r.valor.token, { endereco: email.trim(), frequencia, autorizarNome });
      enviado = e.ok && e.valor.confirmacaoEnviada;
    }
    guardarTurma({ codigo: r.valor.turma, nome: config.nome, criadoEm: new Date().toISOString(), local: ligacao.estado !== "servidor" });
    guardarTokenPainel(r.valor.token, r.valor.turma);
    setACriar(false);
    setCriada({ ...r.valor, email: enviado });
  }

  if (criada) return <TurmaCriada {...criada} nome={config.nome} lugares={lugares} emailEndereco={email.trim()} aoNova={() => setCriada(null)} />;
  if (!ligacao) return <p>{ALDEIA.interface.a_carregar}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="grid gap-4">
        {ligacao.estado !== "servidor" && <p className="cartao p-3 m-0 text-sm" role="note">{ligacao.estado === "indisponivel" ? C().indisponivel : C().local}</p>}
        <Cartao className="grid gap-3">
          <h2 className="text-xl">{C().turma}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTexto id="al-nome" rotulo={C().nome} ajuda={C().nomeAjuda} value={nome} maxLength={40} onChange={(e) => setNome(e.target.value)} />
            <CampoTexto id="al-lugares" type="number" rotulo={C().lugares} ajuda={C().lugaresAjuda} min={1} max={LUGARES_MAX} value={lugares} onChange={(e) => setLugares(Math.max(1, Math.min(LUGARES_MAX, Number(e.target.value) || 1)))} />
          </div>
        </Cartao>
        <Cartao className="grid gap-3">
          <fieldset className="grid gap-1 border-0 p-0 m-0">
            <legend className="text-xl font-bold mb-1" style={{ fontFamily: "var(--fonte-titulo)" }}>{C().nivelTitulo}</legend>
            {NIVEIS.map((n) => {
              const ciclo = CICLOS.find((c) => c.nivel === n);
              return <BotaoRadio key={n} id={`al-nivel-${n}`} name="al-nivel" rotulo={`Nível ${n} · ${NOME_NIVEL[n]}${ciclo ? ` (${ciclo.nome})` : ""}`} checked={nivel === n} onChange={() => setNivel(n)} />;
            })}
          </fieldset>
        </Cartao>
        <Cartao className="grid gap-3">
          <fieldset className="grid gap-1 border-0 p-0 m-0">
            <legend className="text-xl font-bold mb-1" style={{ fontFamily: "var(--fonte-titulo)" }}>{C().extensao}</legend>
            {(["essencial", "completa", "personalizada"] as Extensao[]).map((x) => (
              <BotaoRadio key={x} id={`al-ext-${x}`} name="al-ext" rotulo={C().extensoes[x]} checked={extensao === x} onChange={() => setExtensao(x)} />
            ))}
          </fieldset>
          {extensao === "personalizada" && (
            <div className="grid gap-3">
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{C().missoesAjuda}</p>
              {CAPITULOS.filter((n) => n !== 0 && n !== 8).map((n) => {
                const ms = missoesEscolhiveis(dimensoes).filter((m) => m.capitulo === n && !FIXAS.has(m.id));
                if (!ms.length) return null;
                return (
                  <fieldset key={n} className="grid gap-1 border-0 p-0 m-0">
                    <legend className="font-bold">{n} · {(ALDEIA.capitulos as Record<string, { titulo: string }>)[`c${n}`].titulo}</legend>
                    {ms.map((m) => (
                      <CaixaVerificacao key={m.id} id={`al-m-${m.id}`} rotulo={`${nomeMissao(m.id)}${m.conta ? " · conta para a prova" : ""}`} checked={escolha.includes(m.id)} onChange={(e) => setEscolha((l) => (e.target.checked ? [...l, m.id] : l.filter((x) => x !== m.id)))} />
                    ))}
                  </fieldset>
                );
              })}
            </div>
          )}
        </Cartao>
        <Cartao className="grid gap-3">
          <h2 className="text-xl">{C().dimensoes}</h2>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{C().dimensoesAjuda}</p>
          {([1, 2] as const).map((g) => (
            <fieldset key={g} className="grid gap-1 border-0 p-0 m-0">
              <legend className="font-bold">{g === 1 ? C().grupo1 : C().grupo2}</legend>
              {DIMENSOES.filter((d) => d.grupo === g).map((d) => (
                <CaixaVerificacao key={d.id} id={`al-d-${d.id}`} rotulo={ALDEIA.dimensoes[d.id]} checked={dimensoes.includes(d.id)} onChange={(e) => mudarDimensoes(d.id, e.target.checked)} />
              ))}
            </fieldset>
          ))}
        </Cartao>
        <Cartao className="grid gap-3">
          <fieldset className="grid gap-1 border-0 p-0 m-0">
            <legend className="text-xl font-bold mb-1" style={{ fontFamily: "var(--fonte-titulo)" }}>{C().identificacao}</legend>
            <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{C().identificacaoAjuda}</p>
            {(["anonimo", "numero", "nome"] as ModoIdentificacao[]).map((m) => (
              <CaixaVerificacao key={m} id={`al-id-${m}`} rotulo={C().modos[m]} checked={identificacao.includes(m)} onChange={(e) => setIdentificacao((l) => (e.target.checked ? [...l, m] : l.filter((x) => x !== m)))} />
            ))}
            {identificacao.length === 0 && <p className="m-0 text-sm font-bold" role="alert" style={{ color: "var(--errado)" }}>{C().identificacao}?</p>}
          </fieldset>
          <fieldset className="grid gap-1 border-0 p-0 m-0">
            <legend className="font-bold">{C().colecao}</legend>
            {(["atuais", "extintos", "escolha"] as Colecao[]).map((c) => (
              <BotaoRadio key={c} id={`al-col-${c}`} name="al-col" rotulo={C().colecoes[c]} checked={colecao === c} onChange={() => setColecao(c)} />
            ))}
          </fieldset>
        </Cartao>
        <Cartao className="grid gap-3">
          <fieldset className="grid gap-1 border-0 p-0 m-0">
            <legend className="text-xl font-bold mb-1" style={{ fontFamily: "var(--fonte-titulo)" }}>{C().ritmo}</legend>
            {(["livre", "guiado"] as Ritmo[]).map((r) => (
              <BotaoRadio key={r} id={`al-ritmo-${r}`} name="al-ritmo" rotulo={C().ritmos[r]} checked={ritmo === r} onChange={() => setRitmo(r)} />
            ))}
          </fieldset>
          <fieldset className="flex gap-4 flex-wrap border-0 p-0 m-0">
            <legend className="font-bold">{C().tempo}</legend>
            {([1, 1.25, 1.5, 2] as Tempo[]).map((x) => (
              <BotaoRadio key={x} id={`al-t-${x}`} name="al-t" rotulo={x === 1 ? C().tempoNormal : `×${x}`} checked={tempo === x} onChange={() => setTempo(x)} />
            ))}
          </fieldset>
          <CampoTexto id="al-fim" type="date" rotulo={C().dataFim} ajuda={C().dataFimAjuda} value={dataFim} min={new Date().toISOString().slice(0, 10)} max={fimAnoLetivo()} onChange={(e) => setDataFim(e.target.value)} />
        </Cartao>
        <Cartao className="grid gap-3">
          <h2 className="text-xl">{C().emailTitulo}</h2>
          {ligacao.estado === "servidor" && ligacao.email ? (
            <>
              <CampoTexto id="al-email" type="email" rotulo={C().emailCampo} ajuda={C().emailAjuda} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" erro={emailInvalido ? ALDEIA.interface.erros.geral : undefined} />
              {email.trim() && (
                <>
                  <Seletor id="al-freq" rotulo={C().frequencia} value={frequencia} onChange={(e) => setFrequencia(e.target.value as FrequenciaEmail)} opcoes={(["semanal", "diario", "marcos", "nenhum"] as FrequenciaEmail[]).map((f) => ({ valor: f, texto: C().frequencias[f] }))} />
                  {identificacao.includes("nome") && <CaixaVerificacao id="al-autorizar" rotulo={C().autorizarNome} checked={autorizarNome} onChange={(e) => setAutorizarNome(e.target.checked)} />}
                </>
              )}
            </>
          ) : (
            <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{C().local}</p>
          )}
        </Cartao>
        <Cartao className="grid gap-3">
          <label className="opcao" style={{ alignItems: "flex-start" }}>
            <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} style={{ marginTop: 3 }} />
            <span><Rico texto={C().termos} /></span>
          </label>
          {erro && <p className="m-0 font-bold" role="alert" style={{ color: "var(--errado)" }}>{erro}</p>}
          <div>
            <Botao grande disabled={ligacao.estado === "indisponivel" || !termos || aCriar || identificacao.length === 0 || emailInvalido || !dataFim} onClick={() => void criar()}>
              {aCriar ? C().aCriar : C().criar}
            </Botao>
          </div>
        </Cartao>
      </div>
      <aside className="grid gap-4 content-start lg:sticky lg:top-4 self-start">
        <Cartao className="grid gap-2" style={{ border: "2px dashed var(--tecla-borda)" }} aria-live="polite">
          <h2 className="text-lg">{C().resumo}</h2>
          <p className="m-0 text-sm">{C().resumoMissoes.replace("{n}", String(missoes.filter((m) => m.tipo !== "evento").length)).replace("{c}", String(caps.length))}</p>
          <p className="m-0 text-sm">{C().resumoAulas.replace("{a}", String(aulas))}</p>
          <ol className="m-0 pl-5 text-sm grid gap-0.5">
            {caps.map((n) => (
              <li key={n} value={n}>
                <strong>{(ALDEIA.capitulos as Record<string, { titulo: string }>)[`c${n}`].titulo}</strong>: {missoes.filter((m) => m.capitulo === n && m.tipo !== "evento").map((m) => nomeMissao(m.id)).join(", ") || "—"}
              </li>
            ))}
          </ol>
        </Cartao>
      </aside>
    </div>
  );
}

function TurmaCriada({ turma, professor, token, nome, lugares, email, emailEndereco, aoNova }: { turma: string; professor: string; token: string; nome: string; lugares: number; email: boolean; emailEndereco: string; aoNova: () => void }) {
  const K = ALDEIA.professor.criada;
  const nav = useNavigate();
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState("");
  const [guardei, setGuardei] = useState(false);
  const [projetar, setProjetar] = useState(false);
  const ligacaoAluno = `${window.location.origin}/aldeia/${turma}`;
  useEffect(() => {
    QRCode.toString(ligacaoAluno, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(""));
  }, [ligacaoAluno]);
  const copiar = (t: string, q: string) => navigator.clipboard?.writeText(t).then(() => setCopiado(q), () => setCopiado(""));
  void token;
  return (
    <div className="grid gap-5">
      <h2 className="text-3xl">{K.titulo}</h2>
      {email && <p className="cartao p-3 m-0" role="status" style={{ borderColor: "var(--certo)" }}>{K.emailEnviado.replace("{email}", emailEndereco)}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        <Cartao className="grid gap-3 justify-items-center text-center">
          <div className="text-sm" style={{ color: "var(--suave)" }}>{K.codigoTurma}</div>
          <div className="text-5xl font-extrabold tracking-wider" style={{ fontFamily: "var(--fonte-mono)" }}>{formatarTurma(turma)}</div>
          <div className="text-sm" style={{ color: "var(--suave)" }}>{K.ligacao} <span style={{ fontFamily: "var(--fonte-mono)" }}>{ligacaoAluno}</span></div>
          {qr && <div className="w-44 h-44 p-2 rounded-lg" style={{ background: "#fff" }} role="img" aria-label="Código QR com a ligação para os alunos" dangerouslySetInnerHTML={{ __html: qr }} />}
          <div className="flex gap-2 flex-wrap justify-center">
            <Botao onClick={() => setProjetar(true)}>{K.projetar}</Botao>
            <Botao variante="contorno" onClick={() => copiar(formatarTurma(turma), "turma")}>{copiado === "turma" ? K.copiado : K.copiar}</Botao>
          </div>
        </Cartao>
        <Cartao className="grid gap-3" style={{ borderColor: "var(--aviso)", borderWidth: 2 }}>
          <div className="text-sm" style={{ color: "var(--suave)" }}>{K.codigoProfessor}</div>
          <div className="text-3xl font-extrabold" style={{ fontFamily: "var(--fonte-mono)", letterSpacing: ".04em" }}>{formatarProfessor(professor)}</div>
          <p className="m-0 font-bold" role="note">{K.codigoProfessorAviso}</p>
          <div className="flex gap-2 flex-wrap">
            <Botao variante="contorno" onClick={() => copiar(formatarProfessor(professor), "prof")}>{copiado === "prof" ? K.copiado : K.copiar}</Botao>
            <Botao variante="contorno" onClick={async () => (await import("./pdf")).pdfCodigoProfessor(turma, professor, nome)}>{K.guardarPdf}</Botao>
          </div>
          <CaixaVerificacao id="guardei" rotulo={K.guardeiCodigo} checked={guardei} onChange={(e) => setGuardei(e.target.checked)} />
        </Cartao>
      </div>
      <Cartao className="flex gap-2 flex-wrap items-center">
        <Botao variante="contorno" onClick={async () => (await import("./pdf")).pdfCartoes(turma, lugares)}>{K.cartoes}</Botao>
        <Botao variante="contorno" onClick={async () => (await import("./pdf")).pdfCarta(turma, nome)}>{K.carta}</Botao>
        <Botao disabled={!guardei} onClick={() => nav("/professor/aldeia/painel")}>{K.painel}</Botao>
        <Botao variante="discreto" onClick={aoNova}>{K.outra}</Botao>
      </Cartao>
      {projetar && <Projetar codigo={turma} aoFechar={() => setProjetar(false)} />}
    </div>
  );
}
