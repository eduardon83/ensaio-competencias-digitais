// ─── Jogo · A Sala Trancada (escape room digital) ────────────────────────────
// Uma secretária digital com aplicações (Ficheiros, Email, Documento, Folha, Nota bloqueada). Cada enigma dá
// um algarismo do código do cofre. Os enigmas, os ficheiros, os emails e os algarismos mudam em cada tentativa.
// Ajudas opcionais (custam pontos); três tentativas para abrir o cofre.
import { useState, type ReactNode } from "react";
import { definir, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, BotaoRadio } from "../../ui";
import { Janela, Separadores } from "../../componentes/Janela";
import { gerarSala, pontuarSala, type App, type ConfigSala, type DadosEnigma } from "./gerar";

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigSala> = {
  1: { enigmas: 3, nota: false, dificil: false, contagemCertos: true },
  2: { enigmas: 3, nota: true, dificil: false, contagemCertos: true },
  3: { enigmas: 4, nota: true, dificil: false, contagemCertos: true },
  4: { enigmas: 4, nota: true, dificil: true, contagemCertos: false },
  5: { enigmas: 5, nota: true, dificil: true, contagemCertos: false },
};
const NOME_APP: Record<App, string> = { ficheiros: "Ficheiros", email: "Email", documento: "Documento", folha: "Folha", nota: "Nota bloqueada" };
const MAX_TENTATIVAS = 3;
type Separador = "notas" | App | "cofre";

function Sala({ config, aoTerminar }: PropsAtividade<ConfigSala>) {
  const [enigmas] = useState(() => gerarSala(config));
  const [sep, setSep] = useState<Separador>("notas");
  const [ajudas, setAjudas] = useState<Set<number>>(new Set());
  const [codigo, setCodigo] = useState<string[]>(() => enigmas.map(() => ""));
  const [falhadas, setFalhadas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errosNota, setErrosNota] = useState(0);
  const [inicio] = useState(() => performance.now());

  function terminar(aberto: boolean, tentativa: string[], nFalhadas: number) {
    const certos = enigmas.filter((e, i) => Number(tentativa[i]) === e.digito).length;
    const linhas: LinhaRelatorio[] = enigmas.map((e, i) => {
      const ok = Number(tentativa[i]) === e.digito;
      return { tarefa: `${i + 1}.º algarismo (${NOME_APP[e.app]}): ${e.pista}`, resultado: ok ? (ajudas.has(i) ? "parcial" : "certo") : "errado", resposta: tentativa[i] || undefined, certa: String(e.digito), feedback: ok ? (ajudas.has(i) ? "Certo, com ajuda." : undefined) : e.ajuda };
    });
    linhas.push({ tarefa: "Abrir o cofre", resultado: aberto ? (nFalhadas ? "parcial" : "certo") : "errado", resposta: aberto ? `Aberto à ${nFalhadas + 1}.ª tentativa` : "Não abriu", certa: enigmas.map((e) => e.digito).join(""), feedback: aberto && !nFalhadas ? undefined : "Antes de tentar, confirma cada algarismo na aplicação certa e pela ordem das notas." });
    if (errosNota) linhas.push({ tarefa: "Palavra-passe da nota", resultado: "parcial", resposta: `${errosNota} tentativa(s) errada(s)`, feedback: "A palavra-passe mais forte é longa, com várias palavras, números ou símbolos, e sem dados pessoais." });
    aoTerminar({
      pontuacao: pontuarSala(aberto, certos, enigmas.length, ajudas.size, nFalhadas, errosNota),
      duracaoMs: performance.now() - inicio,
      metricas: { aberto, certos, ajudas: ajudas.size, falhadas: nFalhadas, errosNota },
      relatorio: linhas,
    });
  }

  function abrir() {
    if (enigmas.every((e, i) => Number(codigo[i]) === e.digito)) return terminar(true, codigo, falhadas);
    const f = falhadas + 1;
    setFalhadas(f);
    if (f >= MAX_TENTATIVAS) return terminar(false, codigo, f);
    const certos = enigmas.filter((e, i) => Number(codigo[i]) === e.digito).length;
    setAviso(`🔒 O cofre não abriu.${config.contagemCertos ? ` ${certos} de ${enigmas.length} algarismos certos.` : ""} Tentativas restantes: ${MAX_TENTATIVAS - f}.`);
  }

  const separadores: { id: Separador; nome: string }[] = [{ id: "notas", nome: "📝 Notas" }, ...enigmas.map((e) => ({ id: e.app as Separador, nome: NOME_APP[e.app] })), { id: "cofre", nome: "🔐 Cofre" }];

  return (
    <div className="grid gap-4">
      <Instrucao>Estás fechado numa sala. Para sair, abre o cofre com um código de {enigmas.length} algarismos. As notas dizem onde está cada algarismo: explora as aplicações da secretária digital.</Instrucao>
      <Janela endereco="secretaria.escola-exemplo.pt" rotulo="Secretária digital simulada">
        <Separadores itens={separadores} ativo={sep} aoMudar={setSep} rotulo="Aplicações" />
        <div role="tabpanel" aria-label={separadores.find((s) => s.id === sep)?.nome} className="p-4" style={{ background: "var(--superficie)", minHeight: 280 }}>
          {sep === "notas" && (
            <ol className="m-0 p-0 list-none grid gap-3 sm:grid-cols-2">
              {enigmas.map((e, i) => (
                <li key={i} className="p-3 grid gap-2 content-start" style={{ background: "#fff6c2", color: "#14232e", borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,.15)" }}>
                  <strong>
                    {i + 1}.º algarismo · {NOME_APP[e.app]}
                  </strong>
                  <span>{e.pista}</span>
                  {ajudas.has(i) ? (
                    <span className="text-sm">💡 {e.ajuda}</span>
                  ) : (
                    <button type="button" className="ligacao-simples text-sm" style={{ color: "#034ad8" }} onClick={() => setAjudas((a) => new Set([...a, i]))}>
                      Pedir ajuda (custa 10 pontos)
                    </button>
                  )}
                </li>
              ))}
            </ol>
          )}
          {enigmas.map((e) => (
            <div key={e.app} hidden={sep !== e.app}>
              <AppEnigma dados={e.dados} digito={e.digito} aoErrarNota={() => setErrosNota((n) => n + 1)} />
            </div>
          ))}
          {sep === "cofre" && (
            <div className="grid gap-3 justify-items-start">
              <fieldset className="border-0 p-0 m-0 flex gap-2 flex-wrap">
                <legend className="font-bold mb-2">Código do cofre</legend>
                {enigmas.map((e, i) => (
                  <input
                    key={i}
                    aria-label={`${i + 1}.º algarismo (${NOME_APP[e.app]})`}
                    inputMode="numeric"
                    maxLength={1}
                    value={codigo[i]}
                    onChange={(ev) => setCodigo((c) => c.map((x, k) => (k === i ? ev.target.value.replace(/\D/g, "").slice(-1) : x)))}
                    className="text-center text-2xl font-bold"
                    style={{ width: 56, height: 64, border: "2px solid var(--tecla-borda)", borderRadius: 8, fontFamily: "var(--fonte-mono)", background: "var(--superficie)", color: "var(--tinta)" }}
                  />
                ))}
              </fieldset>
              <div className="flex gap-2 flex-wrap">
                <Botao onClick={abrir} disabled={codigo.some((c) => c === "")}>
                  Abrir o cofre
                </Botao>
                <Botao variante="discreto" onClick={() => terminar(false, codigo, falhadas)}>
                  Desistir
                </Botao>
              </div>
              <p className="m-0" aria-live="polite" style={{ color: aviso ? "var(--errado)" : undefined }}>
                {aviso}
              </p>
            </div>
          )}
        </div>
      </Janela>
    </div>
  );
}

function Realce({ texto, termo }: { texto: string; termo: string }) {
  if (!termo.trim()) return <>{texto}</>;
  const partes: ReactNode[] = [];
  const t = termo.trim().toLowerCase();
  let i = 0;
  const baixo = texto.toLowerCase();
  for (let j = baixo.indexOf(t); j >= 0; j = baixo.indexOf(t, i)) {
    partes.push(texto.slice(i, j), <mark key={j} className="realce">{texto.slice(j, j + t.length)}</mark>);
    i = j + t.length;
  }
  partes.push(texto.slice(i));
  return <>{partes}</>;
}

function AppEnigma({ dados, digito, aoErrarNota }: { dados: DadosEnigma; digito: number; aoErrarNota: () => void }) {
  const [pasta, setPasta] = useState("Documentos");
  const [aberto, setAberto] = useState<number | null>(null);
  const [termo, setTermo] = useState("");
  const [opcao, setOpcao] = useState<number | null>(null);
  const [nota, setNota] = useState<"fechada" | "aberta" | string>("fechada");

  if (dados.app === "ficheiros") {
    const pastas = [...new Set(dados.ficheiros.map((f) => f.pasta))].sort();
    const atual = pastas.includes(pasta) ? pasta : pastas[0];
    return (
      <div className="grid sm:grid-cols-[10rem_1fr] gap-3">
        <nav aria-label="Pastas" className="grid gap-1 content-start">
          {pastas.map((p) => (
            <button key={p} type="button" className="separador text-left" data-ativo={p === atual} aria-current={p === atual ? "true" : undefined} onClick={() => setPasta(p)}>
              📁 {p}
            </button>
          ))}
        </nav>
        <div style={{ overflowX: "auto" }}>
          <table className="tabela" aria-label={`Ficheiros da pasta ${atual}`}>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Criado em</th>
                <th scope="col">Tamanho</th>
              </tr>
            </thead>
            <tbody>
              {dados.ficheiros
                .filter((f) => f.pasta === atual)
                .map((f) => (
                  <tr key={f.nome}>
                    <td style={{ fontFamily: "var(--fonte-mono)" }}>{f.nome}</td>
                    <td>{f.data}</td>
                    <td>{f.tamanho}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (dados.app === "email") {
    return (
      <div className="grid md:grid-cols-[1fr_1fr] gap-3">
        <ul className="m-0 p-0 list-none app-lista" aria-label="Caixa de entrada">
          {dados.mensagens.map((m, i) => (
            <li key={i}>
              <button type="button" className="w-full text-left grid gap-0.5" style={{ background: aberto === i ? "var(--tecla)" : "transparent", border: 0, font: "inherit", color: "inherit", cursor: "pointer", padding: 4, minHeight: 44 }} aria-pressed={aberto === i} onClick={() => setAberto(i)}>
                <span className="flex gap-2">
                  <strong>{m.de}</strong>
                  <span className="ml-auto text-sm" style={{ color: "var(--suave)" }}>{m.hora}</span>
                </span>
                <span className="flex gap-2 text-sm">
                  {m.assunto}
                  {m.etiqueta && <span className="etiqueta">{m.etiqueta}</span>}
                  {m.anexos > 0 && <span className="ml-auto" aria-label={`${m.anexos} anexos`}>📎 {m.anexos}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="cartao p-3" aria-live="polite">
          {aberto === null ? (
            <p className="m-0" style={{ color: "var(--suave)" }}>Escolhe um email para o ler.</p>
          ) : (
            <div className="grid gap-2">
              <div className="text-sm">
                <strong>De:</strong> {dados.mensagens[aberto].de} · <strong>Assunto:</strong> {dados.mensagens[aberto].assunto}
              </div>
              <p className="m-0">{dados.mensagens[aberto].corpo}</p>
              {dados.mensagens[aberto].anexos > 0 && (
                <p className="m-0 text-sm">
                  📎 {dados.mensagens[aberto].anexos} anexo{dados.mensagens[aberto].anexos > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (dados.app === "documento") {
    const n = termo.trim() ? dados.paragrafos.join(" ").toLowerCase().split(termo.trim().toLowerCase()).length - 1 : 0;
    return (
      <div className="grid gap-3">
        <div className="flex gap-2 items-center flex-wrap">
          <label htmlFor="procurar-doc" className="font-bold text-sm">
            🔎 Procurar no documento
          </label>
          <input id="procurar-doc" value={termo} onChange={(e) => setTermo(e.target.value)} style={{ border: "2px solid var(--tecla-borda)", borderRadius: 8, padding: "6px 10px", minHeight: 40, background: "var(--superficie)", color: "var(--tinta)" }} />
          <span className="text-sm" aria-live="polite">
            {termo.trim() ? `${n} resultado${n === 1 ? "" : "s"}` : ""}
          </span>
        </div>
        <article className="cartao p-4 grid gap-3" style={{ maxHeight: 320, overflowY: "auto" }} tabIndex={0} aria-label={dados.titulo}>
          <h3 className="text-lg">{dados.titulo}</h3>
          {dados.paragrafos.map((p, i) => (
            <p key={i} className="m-0">
              <Realce texto={p} termo={termo} />
            </p>
          ))}
        </article>
      </div>
    );
  }
  if (dados.app === "folha") {
    return (
      <table className="folha-grelha" aria-label="Folha de cálculo">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Linha</span>
            </th>
            <th scope="col">A</th>
            <th scope="col">B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td style={{ fontWeight: 700 }}>{dados.cabecalho[0]}</td>
            <td style={{ fontWeight: 700 }}>{dados.cabecalho[1]}</td>
          </tr>
          {dados.linhas.map(([a, b], i) => (
            <tr key={i}>
              <th scope="row">{i + 2}</th>
              <td>{a}</td>
              <td className={typeof b === "number" ? "numero" : undefined}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  // Nota bloqueada
  return (
    <div className="grid gap-3 justify-items-start">
      {nota === "aberta" ? (
        <p className="m-0 text-xl">🔓 Nota desbloqueada: “O algarismo é o {digito}.”</p>
      ) : (
        <>
          <fieldset className="border-0 p-0 m-0 grid gap-1">
            <legend className="font-bold">🔒 Escolhe a palavra-passe mais forte para desbloquear a nota</legend>
            {dados.opcoes.map((o, i) => (
              <BotaoRadio key={o} id={`nota-${i}`} name="nota" rotulo={o} checked={opcao === i} onChange={() => setOpcao(i)} />
            ))}
          </fieldset>
          <Botao
            disabled={opcao === null}
            onClick={() => {
              if (opcao === dados.correta) setNota("aberta");
              else {
                aoErrarNota();
                setNota(`Palavra-passe errada. ${dados.porque[opcao!] ?? ""}`);
              }
            }}
          >
            Desbloquear
          </Botao>
          {nota !== "fechada" && (
            <p className="m-0" aria-live="polite" style={{ color: "var(--errado)" }}>
              {nota}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export const definicao = definir<ConfigSala>({
  slug: "sala-trancada",
  numero: 102,
  dominio: "navegacao",
  titulo: { jornal: "A Sala Trancada", laboratorio: "A Sala Trancada" },
  descricao: "Escape room numa secretária digital: encontra os algarismos do código em ficheiros, emails, documentos, folhas de cálculo e numa nota protegida por palavra-passe.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ enigmas: 1, nota: false, dificil: false, contagemCertos: true }),
  Componente: Sala,
  dica: (m) => {
    if (m.aberto === false) return "Lê cada nota com atenção e abre a aplicação indicada. Se ficares sem saber, pede ajuda: custa pontos, mas é melhor do que ficar trancado.";
    if (Number(m.falhadas) > 0) return "Antes de experimentar o código, confirma cada algarismo. No documento, usa Ctrl+F; nos ficheiros, lê o nome completo (com a extensão).";
    if (Number(m.ajudas) > 0) return "Conseguiste sair! Tenta agora sem ajudas para ganhares mais pontos.";
    return "Saíste à primeira e sem ajudas. Experimenta o nível seguinte: os enigmas têm armadilhas.";
  },
});
