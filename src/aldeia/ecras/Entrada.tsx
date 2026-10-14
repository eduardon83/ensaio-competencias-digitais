// ─── Aldeia Digital · entrada do aluno (código da turma, nome, fato) ─────────
// Sem contas nem emails: código da turma + nome. Nome único na turma (sem maiúsculas nem acentos). O fato escolhe-se
// entre os lugares livres; com nome de animal, o animal do nome é o fato proposto. Noutro computador: código + nome.
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Botao, BotaoRadio, CampoTexto, Cartao } from "../../ui";
import { Cabeca } from "../arte/componentes";
import { codigoTurmaValido, formatarTurma } from "../nucleo/codigos";
import { FATO, fatosDaColecao, type ModoIdentificacao } from "../nucleo/catalogo";
import type { VistaPublica } from "../nucleo/modelo";
import { fatoDoNomeAnonimo, nomeVisivel, proporNomesAnonimos, validarNome } from "../nucleo/nomes";
import { ALDEIA } from "../textos";
import type { Entrada as EntradaServidor, Ligacao } from "../cliente/servidor";
import { sessoesAluno } from "../cliente/sessao";
import { CabecalhoAldeia } from "./comum";

const E = () => ALDEIA.interface.entrada;

/** /aldeia: escrever o código da turma, ou continuar uma sessão guardada neste computador. */
export function EntradaCodigo({ aviso }: { aviso?: string }) {
  const nav = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(aviso ?? "");
  const sessoes = Object.values(sessoesAluno());
  function entrar(e: FormEvent) {
    e.preventDefault();
    const c = codigoTurmaValido(codigo);
    if (!c) return setErro(E().invalido);
    nav(`/aldeia/${c}`);
  }
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={E().titulo} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5" style={{ maxWidth: 640 }}>
        <h1 className="text-4xl">{E().titulo}</h1>
        <form onSubmit={entrar} className="cartao p-5 grid gap-3" noValidate>
          <p className="m-0">{E().intro}</p>
          <CampoTexto id="aldeia-codigo" rotulo={E().codigo} ajuda={E().ajudaCodigo} value={codigo} onChange={(e) => { setCodigo(formatarTurma(e.target.value).slice(0, 8)); setErro(""); }} autoComplete="off" autoCapitalize="characters" spellCheck={false} erro={erro || undefined} style={{ fontFamily: "var(--fonte-mono)", fontSize: "1.4rem", letterSpacing: ".08em" }} />
          <div>
            <Botao type="submit" grande>{E().entrar}</Botao>
          </div>
        </form>
        {sessoes.length > 0 && (
          <Cartao className="grid gap-2">
            <h2 className="text-lg">{E().sessoes}</h2>
            <ul className="m-0 p-0 list-none grid gap-2">
              {sessoes.map((s) => (
                <li key={s.codigo}>
                  <button type="button" className="aldeia-sessao" onClick={() => nav(`/aldeia/${s.codigo}`)}>
                    <Cabeca fato={s.fato} tamanho={40} />
                    <span>
                      <strong>{E().continuarComo.replace("{nome}", nomeVisivel(s.nome))}</strong>
                      <br />
                      <span style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>{formatarTurma(s.codigo)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Cartao>
        )}
      </main>
    </div>
  );
}

type Passo = "modo" | "nome" | "fato" | "existe";

/** Primeira entrada nesta turma (ou entrada noutro computador). */
export function Identificacao({ ligacao, publico, aoEntrar }: { ligacao: Ligacao; publico: VistaPublica; aoEntrar: (r: EntradaServidor, nome: string) => void }) {
  const modos = publico.config.identificacao;
  const [modo, setModo] = useState<ModoIdentificacao>(modos.includes("anonimo") ? "anonimo" : modos[0]);
  const [passo, setPasso] = useState<Passo>(modos.length > 1 ? "modo" : "nome");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);
  const [jaEntrei, setJaEntrei] = useState(false);
  const livres = useMemo(() => fatosDaColecao(publico.config.colecao).filter((f) => !publico.fatosOcupados.includes(f.id)).map((f) => f.id), [publico]);
  const [propostas, setPropostas] = useState(() => proporNomesAnonimos(livres));
  const [fato, setFato] = useState<string>("");
  const cheia = publico.lugaresLivres <= 0;

  function validar(): string | null {
    const v = validarNome(nome, modo);
    if ("erro" in v) {
      setErro((E().erros as Record<string, string>)[v.erro] ?? E().erros.vazio);
      return null;
    }
    return v.nome;
  }

  async function entrarExistente() {
    const n = validar();
    if (!n) return;
    setAEnviar(true);
    const r = await ligacao.servidor.entrar(publico.codigo, { nome: n, modo });
    setAEnviar(false);
    if (r.ok) return aoEntrar(r.valor, n);
    setErro(r.erro === "bloqueado" || r.estado === 429 ? E().limite : r.rede ? ALDEIA.interface.erros.rede : E().naoConhecido);
  }

  function seguinteNome(e?: FormEvent) {
    e?.preventDefault();
    if (jaEntrei) return void entrarExistente();
    const n = validar();
    if (!n) return;
    setNome(n);
    const proposto = modo === "anonimo" ? fatoDoNomeAnonimo(n) : null;
    setFato(proposto && livres.includes(proposto) ? proposto : (livres[0] ?? ""));
    setPasso("fato");
  }

  async function registar() {
    setAEnviar(true);
    const r = await ligacao.servidor.registar(publico.codigo, { nome, modo, fato });
    setAEnviar(false);
    if (r.ok) return aoEntrar(r.valor, nome);
    if (r.erro === "nome-existe") return setPasso("existe");
    if (r.erro === "fato-ocupado") return setErro(E().fatoOcupado);
    if (r.erro === "sem-lugar") return setErro(E().semLugar);
    if (r.erro === "nome-invalido") {
      setPasso("nome");
      return setErro((E().erros as Record<string, string>)[r.detalhe ?? "vazio"] ?? E().erros.vazio);
    }
    setErro(r.rede ? ALDEIA.interface.erros.rede : ALDEIA.interface.erros.geral);
  }

  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={formatarTurma(publico.codigo)} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5" style={{ maxWidth: 760 }}>
        <h1 className="text-3xl">{passo === "fato" ? E().fato : E().comoTeChamas}</h1>
        {ligacao.estado !== "servidor" && <p className="cartao p-3 m-0 text-sm" role="note">{E().local}</p>}
        {cheia && !jaEntrei && <p className="cartao p-3 m-0 font-bold" role="alert" style={{ borderColor: "var(--aviso)" }}>{E().semLugar}</p>}

        {passo === "modo" && (
          <Cartao className="grid gap-3">
            <fieldset className="grid gap-1 border-0 p-0 m-0">
              <legend className="font-bold mb-1">{E().comoTeChamas}</legend>
              {modos.map((m) => (
                <BotaoRadio key={m} id={`modo-${m}`} name="modo" rotulo={E().modos[m]} checked={modo === m} onChange={() => setModo(m)} />
              ))}
            </fieldset>
            <div className="flex gap-3 flex-wrap">
              <Botao onClick={() => setPasso("nome")}>{E().seguinte}</Botao>
            </div>
          </Cartao>
        )}

        {passo === "nome" && (
          <form className="cartao p-5 grid gap-4" onSubmit={seguinteNome} noValidate>
            {modo === "anonimo" && !jaEntrei ? (
              <fieldset className="grid gap-2 border-0 p-0 m-0">
                <legend className="font-bold mb-1">{E().propostas}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {propostas.map((p) => {
                    const f = fatoDoNomeAnonimo(p);
                    return (
                      <label key={p} className={`aldeia-escolha ${nome === p ? "aldeia-escolha--ativa" : ""}`}>
                        <input type="radio" name="anonimo" className="sr-only" checked={nome === p} onChange={() => { setNome(p); setErro(""); }} />
                        {f && <Cabeca fato={f} tamanho={48} />}
                        <span className="font-bold">{p}</span>
                        {nome === p && <span className="aldeia-escolha__marca" aria-hidden="true">✓</span>}
                      </label>
                    );
                  })}
                </div>
                <div>
                  <Botao variante="discreto" onClick={() => { setPropostas(proporNomesAnonimos(livres)); setNome(""); }}>{E().outrosNomes}</Botao>
                </div>
                {erro && <p className="m-0 font-bold" role="alert" style={{ color: "var(--errado)" }}>{erro}</p>}
              </fieldset>
            ) : (
              <CampoTexto
                id="aldeia-nome"
                rotulo={modo === "numero" ? E().numeroTurma : modo === "nome" ? E().nomeProprio : E().modos.anonimo}
                ajuda={modo === "nome" ? E().soPrimeiro : undefined}
                value={nome}
                inputMode={modo === "numero" ? "numeric" : "text"}
                maxLength={modo === "numero" ? 2 : 20}
                autoComplete="off"
                onChange={(e) => { setNome(e.target.value); setErro(""); }}
                erro={erro || undefined}
              />
            )}
            <div className="flex gap-3 flex-wrap items-center">
              <Botao type="submit" disabled={aEnviar || (!jaEntrei && cheia)}>{jaEntrei ? E().entrar : E().seguinte}</Botao>
              {modos.length > 1 && <Botao variante="discreto" onClick={() => { setPasso("modo"); setErro(""); }}>{E().voltar}</Botao>}
              <label className="opcao">
                <input type="checkbox" checked={jaEntrei} onChange={(e) => { setJaEntrei(e.target.checked); setErro(""); }} />
                {E().outroComputador}
              </label>
            </div>
          </form>
        )}

        {passo === "fato" && (
          <Cartao className="grid gap-4">
            <p className="m-0">
              <strong>{nomeVisivel(nome)}</strong>
              {modo === "anonimo" && fato === fatoDoNomeAnonimo(nome) && <> · {E().fatoProposto}</>}
            </p>
            <fieldset className="border-0 p-0 m-0">
              <legend className="sr-only">{E().fato}</legend>
              <div className="aldeia-grelha-fatos">
                {fatosDaColecao(publico.config.colecao).map((f) => {
                  const ocupado = publico.fatosOcupados.includes(f.id);
                  return (
                    <label key={f.id} className={`aldeia-fato ${fato === f.id ? "aldeia-escolha--ativa" : ""} ${ocupado ? "aldeia-fato--ocupado" : ""}`}>
                      <input type="radio" name="fato" className="sr-only" disabled={ocupado} checked={fato === f.id} onChange={() => setFato(f.id)} />
                      <Cabeca fato={f.id} tamanho={64} />
                      <span>{f.nome}</span>
                      {ocupado && <span className="text-xs">{E().fatoOcupado}</span>}
                      {f.nota && <span className="text-xs" style={{ color: "var(--suave)" }}>{f.nota}</span>}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {erro && <p className="m-0 font-bold" role="alert" style={{ color: "var(--errado)" }}>{erro}</p>}
            <div className="flex gap-3 flex-wrap">
              <Botao grande disabled={!fato || aEnviar || !FATO.has(fato)} onClick={() => void registar()}>{E().seguinte}</Botao>
              <Botao variante="discreto" onClick={() => setPasso("nome")}>{E().voltar}</Botao>
            </div>
          </Cartao>
        )}

        {passo === "existe" && (
          <Cartao className="grid gap-3" role="alertdialog" aria-labelledby="aldeia-existe">
            <h2 id="aldeia-existe" className="text-xl">{E().jaExiste}</h2>
            <p className="m-0"><strong>{nomeVisivel(nome)}</strong></p>
            {erro && <p className="m-0 font-bold" role="alert" style={{ color: "var(--errado)" }}>{erro}</p>}
            <div className="flex gap-3 flex-wrap">
              <Botao onClick={() => void entrarExistente()} disabled={aEnviar}>{E().souEu}</Botao>
              <Botao variante="contorno" onClick={() => { setNome(""); setPasso("nome"); setErro(""); setPropostas(proporNomesAnonimos(livres)); }}>{E().escolherOutro}</Botao>
            </div>
          </Cartao>
        )}
      </main>
    </div>
  );
}
