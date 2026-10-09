// ─── Jogo · Biblioteca Viva (leitura e escrita com literatura portuguesa) ────
// Um texto de um autor português em domínio público, com tamanho e complexidade adaptados ao nível.
// Rondas: ler (com glossário) → compreender → completar palavras em falta → ordenar versos/frases → ditado.
// Tudo é sorteado por tentativa: o texto do nível, as palavras em falta, o bloco a ordenar e a frase do ditado.
// Pontuação: 40 % compreensão + 30 % palavras + 15 % ordem + 15 % ditado (sem ditado: 45/35/20).
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { baralharOpcoes, escolher, misturar } from "../../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, BotaoRadio } from "../../ui";
import { Icone } from "../../componentes/Icone";
import { explicarErro } from "../../atividades/noticia/pontuacao";
import { TEXTOS, TEXTO_PRATICA, type TextoLiterario } from "./textos";
import { fraseDitado, gerarLacunas, palavraCerta, semAcentos, unidadesOrdenar } from "./gerar";

export interface ConfigLeitura {
  lacunas: number;
  banco: boolean; // mostra as palavras em falta (banco de palavras)
  acentos: boolean; // os acentos contam
  ordenar: number;
  ditado: number; // frases de ditado (0 = sem ditado)
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigLeitura> = {
  1: { lacunas: 3, banco: true, acentos: false, ordenar: 3, ditado: 0 },
  2: { lacunas: 4, banco: true, acentos: false, ordenar: 4, ditado: 1 },
  3: { lacunas: 5, banco: false, acentos: true, ordenar: 5, ditado: 1 },
  4: { lacunas: 6, banco: false, acentos: true, ordenar: 6, ditado: 1 },
  5: { lacunas: 8, banco: false, acentos: true, ordenar: 6, ditado: 2 },
};

type Ronda = "ler" | "perguntas" | "lacunas" | "ordenar" | "ditado";
type Parcial = { pontos: number; linhas: LinhaRelatorio[] };

function Leitura({ config, nivel, modo, aoTerminar }: PropsAtividade<ConfigLeitura>) {
  const [texto] = useState<TextoLiterario>(() => (modo === "pratica" ? TEXTO_PRATICA : escolher(TEXTOS.filter((t) => t.nivel === nivel))));
  const rondas = useMemo<Ronda[]>(() => (modo === "pratica" ? ["lacunas"] : ["ler", "perguntas", "lacunas", "ordenar", ...(config.ditado > 0 ? (["ditado"] as Ronda[]) : [])]), [modo, config.ditado]);
  const [ri, setRi] = useState(0);
  const resultados = useRef<Partial<Record<Ronda, Parcial>>>({});
  const inicio = useRef(performance.now());

  function concluir(r: Ronda, p: Parcial) {
    resultados.current[r] = p;
    if (ri + 1 < rondas.length) {
      setRi(ri + 1);
      return;
    }
    const v = (k: Ronda) => resultados.current[k]?.pontos ?? 0;
    const pesos = config.ditado > 0 ? { perguntas: 0.4, lacunas: 0.3, ordenar: 0.15, ditado: 0.15 } : { perguntas: 0.45, lacunas: 0.35, ordenar: 0.2, ditado: 0 };
    const pontuacao = modo === "pratica" ? limitar(100 * v("lacunas")) : limitar(100 * (pesos.perguntas * v("perguntas") + pesos.lacunas * v("lacunas") + pesos.ordenar * v("ordenar") + pesos.ditado * v("ditado")));
    aoTerminar({
      pontuacao,
      duracaoMs: performance.now() - inicio.current,
      metricas: { texto: texto.id, perguntas: Math.round(100 * v("perguntas")), lacunas: Math.round(100 * v("lacunas")), ordenar: Math.round(100 * v("ordenar")), ditado: config.ditado > 0 ? Math.round(100 * v("ditado")) : "nao_aplicavel" },
      relatorio: rondas.flatMap((k) => resultados.current[k]?.linhas ?? []),
    });
  }

  const ronda = rondas[ri];
  return (
    <div className="grid gap-4">
      {modo !== "pratica" && (
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
          Ronda {ri + 1} de {rondas.length} · {NOME_RONDA[ronda]}
        </div>
      )}
      {ronda === "ler" && <RondaLer texto={texto} aoConcluir={() => concluir("ler", { pontos: 1, linhas: [] })} />}
      {ronda === "perguntas" && <RondaPerguntas texto={texto} nivel={nivel} aoConcluir={(p) => concluir("perguntas", p)} />}
      {ronda === "lacunas" && <RondaLacunas texto={texto} config={config} aoConcluir={(p) => concluir("lacunas", p)} />}
      {ronda === "ordenar" && <RondaOrdenar texto={texto} n={config.ordenar} aoConcluir={(p) => concluir("ordenar", p)} />}
      {ronda === "ditado" && <RondaDitado texto={texto} config={config} aoConcluir={(p) => concluir("ditado", p)} />}
    </div>
  );
}

const NOME_RONDA: Record<Ronda, string> = { ler: "Ler", perguntas: "Compreender", lacunas: "Palavras em falta", ordenar: "Pôr por ordem", ditado: "Ditado" };

// ── Ficha do texto e texto com glossário ─────────────────────────────────────
function FichaTexto({ texto }: { texto: TextoLiterario }) {
  return (
    <div className="text-sm grid gap-0.5" style={{ color: "var(--suave)" }}>
      <span>
        <strong style={{ color: "var(--tinta)" }}>{texto.autor}</strong> · {texto.obra} · {texto.ano}
        {texto.excerto && " · excerto"}
      </span>
      <span>Domínio público. Ortografia atualizada.</span>
    </div>
  );
}

/** Mostra o texto com as palavras do glossário clicáveis; a explicação aparece num quadro ao lado. */
function TextoComGlossario({ texto, tamanho = "1.1rem" }: { texto: TextoLiterario; tamanho?: string }) {
  const [aberta, setAberta] = useState<string | null>(null);
  const chaves = Object.keys(texto.glossario).sort((a, b) => b.length - a.length);
  const partes = useMemo(() => {
    if (!chaves.length) return [texto.texto];
    const re = new RegExp(`(${chaves.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    const usadas = new Set<string>();
    return texto.texto.split(re).map((p, i) => {
      if (texto.glossario[p] && !usadas.has(p)) {
        usadas.add(p);
        return (
          <button key={i} type="button" className="palavra" style={{ textDecoration: "underline dotted", textUnderlineOffset: 4, color: "var(--acento)", padding: 0 }} aria-expanded={aberta === p} onClick={() => setAberta(aberta === p ? null : p)}>
            {p}
          </button>
        );
      }
      return <span key={i}>{p}</span>;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, aberta]);
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
      <div className="cartao superficie-clara p-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: tamanho, lineHeight: 1.75, whiteSpace: "pre-wrap", background: "#fffdf6", color: "#2b2418" }}>
        {partes}
      </div>
      <aside className="cartao p-4 text-sm grid gap-2 content-start" aria-live="polite" aria-label="Glossário">
        <strong>Glossário</strong>
        {aberta ? (
          <span>
            <em>{aberta}</em>: {texto.glossario[aberta]}
          </span>
        ) : (
          <span style={{ color: "var(--suave)" }}>Clica numa palavra sublinhada para ver o que quer dizer.</span>
        )}
      </aside>
    </div>
  );
}

function RondaLer({ texto, aoConcluir }: { texto: TextoLiterario; aoConcluir: () => void }) {
  return (
    <div className="grid gap-3">
      <Instrucao>Lê o texto com atenção. As palavras sublinhadas têm explicação no glossário. Quando acabares, carrega em “Já li”.</Instrucao>
      <FichaTexto texto={texto} />
      <TextoComGlossario texto={texto} />
      <div>
        <Botao onClick={aoConcluir}>Já li</Botao>
      </div>
    </div>
  );
}

// ── Compreensão ──────────────────────────────────────────────────────────────
function RondaPerguntas({ texto, nivel, aoConcluir }: { texto: TextoLiterario; nivel: number; aoConcluir: (p: Parcial) => void }) {
  const [qs] = useState(() => misturar(texto.perguntas).map((q) => ({ ...q, ...baralharOpcoes(q.opcoes, q.correta) })));
  const [resp, setResp] = useState<(number | null)[]>(() => qs.map(() => null));
  const [verTexto, setVerTexto] = useState(nivel <= 3);
  const [feito, setFeito] = useState(false);
  const certas = qs.filter((q, i) => resp[i] === q.correta).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Responde às perguntas sobre o texto.{nivel > 3 && " Podes voltar a abrir o texto se precisares."}</Instrucao>
      <details className="cartao p-3" open={verTexto} onToggle={(e) => setVerTexto((e.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer font-bold">Ver o texto</summary>
        <div className="mt-3">
          <TextoComGlossario texto={texto} tamanho="1rem" />
        </div>
      </details>
      {qs.map((q, i) => (
        <fieldset key={i} className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === q.correta ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">
            {i + 1}. {q.pergunta}
          </legend>
          {q.opcoes.map((o, j) => (
            <BotaoRadio key={j} id={`lq-${i}-${j}`} name={`lq-${i}`} rotulo={o} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
          ))}
          {feito && resp[i] !== q.correta && <span className="text-sm" style={{ color: "var(--errado)" }}>Resposta certa: {q.opcoes[q.correta]}</span>}
        </fieldset>
      ))}
      <div className="flex gap-3 items-center flex-wrap">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>
            Verificar
          </Botao>
        ) : (
          <Botao
            onClick={() =>
              aoConcluir({
                pontos: certas / qs.length,
                linhas: qs.map((q, i) => ({ tarefa: q.pergunta, resultado: resp[i] === q.correta ? "certo" : "errado", resposta: resp[i] === null ? undefined : q.opcoes[resp[i]!], certa: q.opcoes[q.correta], feedback: resp[i] === q.correta ? undefined : "Volta ao texto e procura as palavras da pergunta: a resposta está lá escrita." })),
              })
            }
          >
            Continuar
          </Botao>
        )}
        {feito && (
          <span>
            {certas} de {qs.length} certas.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Palavras em falta ────────────────────────────────────────────────────────
function RondaLacunas({ texto, config, aoConcluir }: { texto: TextoLiterario; config: ConfigLeitura; aoConcluir: (p: Parcial) => void }) {
  const [dados] = useState(() => gerarLacunas(texto.texto, config.lacunas));
  const [valores, setValores] = useState<Record<number, string>>({});
  const [feito, setFeito] = useState(false);
  const banco = useMemo(() => misturar(dados.lacunas.map((l) => l.certa)), [dados]);
  const certa = (l: { indice: number; certa: string }) => palavraCerta(valores[l.indice] ?? "", l.certa, config.acentos);
  const nCertas = dados.lacunas.filter(certa).length;
  const ordemLacuna = new Map(dados.lacunas.map((l, k) => [l.indice, k + 1]));

  const conteudo: ReactNode[] = dados.partes.map((p, i) => {
    const l = dados.lacunas.find((x) => x.indice === i);
    if (!l) return <span key={i}>{p.t}</span>;
    const ok = feito ? certa(l) : null;
    return (
      <span key={i} className="inline-flex items-baseline gap-1">
        <label className="sr-only" htmlFor={`lac-${i}`}>
          Palavra em falta {ordemLacuna.get(i)}
        </label>
        <input
          id={`lac-${i}`}
          value={valores[i] ?? ""}
          onChange={(e) => setValores((v) => ({ ...v, [i]: e.target.value }))}
          disabled={feito}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={config.banco ? `(${ordemLacuna.get(i)})` : `${l.certa[0]}…`}
          size={Math.max(4, l.certa.length + 1)}
          className="px-1 rounded"
          style={{ font: "inherit", border: `2px solid ${ok === null ? "var(--tecla-borda)" : ok ? "var(--certo)" : "var(--errado)"}`, background: "#fff", color: "#2b2418", minHeight: 36 }}
        />
        {feito && !ok && <span className="text-sm" style={{ color: "var(--errado)", fontFamily: "var(--fonte-texto)" }}>({l.certa})</span>}
      </span>
    );
  });

  return (
    <div className="grid gap-3">
      <Instrucao>
        Escreve as palavras que faltam no texto.{config.banco ? " As palavras estão no quadro, por ordem baralhada." : " A primeira letra de cada palavra está no espaço."}
        {config.acentos ? " Os acentos contam." : ""}
      </Instrucao>
      <FichaTexto texto={texto} />
      {config.banco && (
        <div className="cartao p-3 flex flex-wrap gap-2 items-center" aria-label="Banco de palavras">
          <strong className="text-sm">Palavras:</strong>
          {banco.map((w, k) => (
            <span key={k} className="etiqueta" style={{ textTransform: "none", fontSize: ".9rem", letterSpacing: 0 }}>
              {w}
            </span>
          ))}
        </div>
      )}
      <div className="cartao superficie-clara p-5" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", lineHeight: 2.1, whiteSpace: "pre-wrap", background: "#fffdf6", color: "#2b2418" }}>
        {conteudo}
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        {!feito ? (
          <Botao onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao
            onClick={() =>
              aoConcluir({
                pontos: nCertas / Math.max(1, dados.lacunas.length),
                linhas: dados.lacunas.map((l, k) => {
                  const v = valores[l.indice] ?? "";
                  const ok = certa(l);
                  return { tarefa: `Palavra em falta ${k + 1}`, resultado: ok ? "certo" : "errado", resposta: v, certa: l.certa, feedback: ok ? (v !== l.certa && config.acentos === false && semAcentos(v) === semAcentos(l.certa) && v.toLowerCase() !== l.certa.toLowerCase() ? "Aceite, mas com acento em falta: neste nível os acentos não contam." : undefined) : explicarErro(l.certa, v.trim()) };
                }),
              })
            }
          >
            Continuar
          </Botao>
        )}
        {feito && (
          <span>
            {nCertas} de {dados.lacunas.length} certas.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Pôr por ordem ────────────────────────────────────────────────────────────
function RondaOrdenar({ texto, n, aoConcluir }: { texto: TextoLiterario; n: number; aoConcluir: (p: Parcial) => void }) {
  const [certa] = useState(() => unidadesOrdenar(texto, n));
  const [ordem, setOrdem] = useState(() => {
    let o = misturar(certa);
    for (let k = 0; o.join("|") === certa.join("|") && k < 10; k++) o = misturar(certa);
    return o;
  });
  const [feito, setFeito] = useState(false);
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ordem.length) return;
    const x = [...ordem];
    [x[i], x[j]] = [x[j], x[i]];
    setOrdem(x);
  };
  const certos = ordem.filter((u, i) => u === certa[i]).length;
  const unidade = texto.tipo === "poema" ? "versos" : "partes do texto";
  return (
    <div className="grid gap-3">
      <Instrucao>
        Põe os {unidade} pela ordem em que aparecem no texto. Usa os botões ▲ e ▼.
      </Instrucao>
      <FichaTexto texto={texto} />
      <ol className="grid gap-2 list-none m-0 p-0">
        {ordem.map((u, i) => (
          <li key={u} className={`ficha ${feito ? (u === certa[i] ? "ficha--certa" : "ficha--errada") : ""}`} style={{ cursor: "default" }}>
            <span className="tabular-nums font-bold" style={{ color: "var(--suave)", minWidth: 24 }}>
              {i + 1}.
            </span>
            <span className="flex-1" style={{ fontFamily: "Georgia, serif" }}>
              {u}
            </span>
            <button type="button" className="botao botao--contorno" style={{ minHeight: 36, minWidth: 36, padding: 2 }} aria-label={`Subir: ${u}`} disabled={feito} onClick={() => mover(i, -1)}>
              ▲
            </button>
            <button type="button" className="botao botao--contorno" style={{ minHeight: 36, minWidth: 36, padding: 2 }} aria-label={`Descer: ${u}`} disabled={feito} onClick={() => mover(i, 1)}>
              ▼
            </button>
          </li>
        ))}
      </ol>
      <div className="flex gap-3 items-center flex-wrap">
        {!feito ? (
          <Botao onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao
            onClick={() =>
              aoConcluir({
                pontos: certos / certa.length,
                linhas: [{ tarefa: `Pôr ${certa.length} ${unidade} por ordem`, resultado: certos === certa.length ? "certo" : certos >= certa.length / 2 ? "parcial" : "errado", resposta: `${certos} de ${certa.length} no lugar certo`, certa: certa.join(" / "), feedback: certos === certa.length ? undefined : "Procura pistas de ligação: rimas, pontuação no fim do verso e palavras que continuam a ideia anterior." }],
              })
            }
          >
            Continuar
          </Botao>
        )}
        {feito && (
          <span>
            {certos} de {certa.length} no lugar certo.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Ditado (síntese de voz do navegador; sem voz, mostra a frase durante 4 segundos) ──
function RondaDitado({ texto, config, aoConcluir }: { texto: TextoLiterario; config: ConfigLeitura; aoConcluir: (p: Parcial) => void }) {
  const [frases] = useState(() => {
    const l: string[] = [];
    for (let k = 0; k < config.ditado; k++) l.push(fraseDitado(texto, Math.random, l));
    return l;
  });
  const [k, setK] = useState(0);
  const [escrito, setEscrito] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [usouMostrar, setUsouMostrar] = useState(false);
  const [feito, setFeito] = useState(false);
  const linhas = useRef<LinhaRelatorio[]>([]);
  const pontos = useRef<number[]>([]);
  const voz = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => () => { if (voz) window.speechSynthesis.cancel(); }, [voz]);

  function ouvir() {
    if (!voz) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(frases[k]);
    u.lang = "pt-PT";
    const v = window.speechSynthesis.getVoices();
    const pt = v.find((x) => x.lang === "pt-PT") ?? v.find((x) => x.lang.startsWith("pt"));
    if (pt) u.voice = pt;
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
  function mostrarFrase() {
    setUsouMostrar(true);
    setMostrar(true);
    window.setTimeout(() => setMostrar(false), 4000);
  }
  const limpar = (s: string) => s.replace(/[.,;:!?…—“”"«»()]/g, " ").split(/\s+/).filter(Boolean);
  const certaPal = limpar(frases[k]);
  const escritaPal = limpar(escrito);
  const nCertas = certaPal.filter((w, i) => palavraCerta(escritaPal[i] ?? "", w, config.acentos)).length;

  function seguinte() {
    pontos.current.push(nCertas / certaPal.length);
    const erradas = certaPal.map((w, i) => ({ w, e: escritaPal[i] ?? "" })).filter(({ w, e }) => !palavraCerta(e, w, config.acentos));
    linhas.current.push({ tarefa: `Ditado ${k + 1}`, resultado: erradas.length === 0 ? "certo" : nCertas >= certaPal.length * 0.7 ? "parcial" : "errado", resposta: escrito, certa: frases[k], feedback: erradas.length === 0 ? (usouMostrar ? "Certo (com a frase mostrada no ecrã)." : undefined) : feedbackDitado(erradas, certaPal.length) });
    if (k + 1 < frases.length) {
      setK(k + 1);
      setEscrito("");
      setFeito(false);
      setUsouMostrar(false);
      return;
    }
    aoConcluir({ pontos: pontos.current.reduce((a, b) => a + b, 0) / pontos.current.length, linhas: linhas.current });
  }

  return (
    <div className="grid gap-3">
      <Instrucao numero={k + 1} total={frases.length}>
        Ouve a frase do texto e escreve-a. Podes ouvir as vezes que precisares. A pontuação não conta{config.acentos ? "; os acentos contam" : ""}.
      </Instrucao>
      <div className="cartao p-4 flex flex-wrap gap-2 items-center">
        {voz && <Botao onClick={ouvir}><Icone nome="ouvir" /> Ouvir a frase</Botao>}
        <Botao variante={voz ? "discreto" : "primario"} onClick={mostrarFrase} disabled={mostrar}>
          {voz ? "Não consigo ouvir: mostrar 4 segundos" : "Mostrar a frase durante 4 segundos"}
        </Botao>
        {mostrar && (
          <p className="m-0 w-full" style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem" }} aria-live="polite">
            {frases[k]}
          </p>
        )}
      </div>
      <div className="campo">
        <label htmlFor="ditado">A tua escrita</label>
        <textarea id="ditado" rows={3} value={escrito} onChange={(e) => setEscrito(e.target.value)} disabled={feito} spellCheck={false} autoCapitalize="off" style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem" }} />
      </div>
      {feito && (
        <p className="m-0">
          Frase: <em>{frases[k]}</em> · {nCertas} de {certaPal.length} palavras certas.
        </p>
      )}
      <div>
        {!feito ? (
          <Botao disabled={!escrito.trim()} onClick={() => setFeito(true)}>
            Verificar
          </Botao>
        ) : (
          <Botao onClick={seguinte}>{k + 1 < frases.length ? "Frase seguinte" : "Continuar"}</Botao>
        )}
      </div>
    </div>
  );
}

/** Agrupa as palavras erradas do ditado pelo tipo de erro; se a frase for quase toda diferente, uma só mensagem. */
function feedbackDitado(erradas: { w: string; e: string }[], total: number): string {
  if (erradas.length >= total * 0.7) return "A frase escrita é muito diferente da que foi ditada. Ouve outra vez com atenção e escreve palavra a palavra.";
  const grupos = new Map<string, string[]>();
  for (const { w, e } of erradas) {
    const m = explicarErro(w, e);
    grupos.set(m, [...(grupos.get(m) ?? []), `“${w}”`]);
  }
  return [...grupos.entries()].map(([m, ws]) => `${ws.join(", ")}: ${m}`).join(" ");
}

export const definicao = definir<ConfigLeitura>({
  slug: "leitura",
  numero: 101,
  dominio: "leitura",
  titulo: { jornal: "Biblioteca Viva", laboratorio: "Biblioteca Viva" },
  descricao: "Ler, compreender e escrever com textos de autores portugueses em domínio público: glossário, perguntas, palavras em falta, ordem dos versos e ditado.",
  duracao: "5 a 10 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ lacunas: 1, banco: true, acentos: false, ordenar: 2, ditado: 0 }),
  Componente: Leitura,
  dica: (m) => {
    const fracos: [string, number][] = [["perguntas", Number(m.perguntas)], ["lacunas", Number(m.lacunas)], ["ordenar", Number(m.ordenar)]];
    if (typeof m.ditado === "number") fracos.push(["ditado", m.ditado]);
    const [pior] = fracos.sort((a, b) => a[1] - b[1]);
    if (pior[1] >= 90) return "Leste e escreveste muito bem. Experimenta o nível seguinte: os textos ficam mais longos e mais antigos.";
    return {
      perguntas: "Antes de responder, volta a ler a parte do texto de que fala a pergunta. Usa o glossário para as palavras difíceis.",
      lacunas: "Lê a frase toda à volta do espaço em branco: o sentido, a rima e a concordância ajudam a encontrar a palavra.",
      ordenar: "Num poema, as rimas e a pontuação no fim dos versos ajudam a encontrar a ordem.",
      ditado: "No ditado, escreve primeiro o que ouviste e depois relê com atenção aos acentos.",
    }[pior[0]]!;
  },
});
