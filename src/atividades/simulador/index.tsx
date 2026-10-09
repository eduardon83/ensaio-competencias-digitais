// ─── Atividade 10 · Simulador de Prova (todas as competências) ───────────────
// Interface de prova genérica (sem imitar plataformas oficiais): lista de itens, marcar para rever, áudio com
// transcrição, zoom, calculadora, resposta curta, ordenar, resumo antes de submeter, confirmação e, nos
// níveis altos, duas secções com bloqueio.
// score = 100 × (0,7 × certos / itens + 0,15 × [abriu o resumo antes de submeter] + 0,15 × [nada por responder])
import { useEffect, useMemo, useRef, useState } from "react";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, useTemporizador } from "../../motor/util";
import { misturar } from "../../motor/aleatorio";
import { Botao, BotaoRadio, ForcarClaro } from "../../ui";
import { Icone } from "../../componentes/Icone";
import { gerarProva, type ItemProva } from "./itens";

export interface ConfigSimulador {
  itens: number;
  minutos: number;
  calculadora: boolean;
  seccoes: boolean; // duas secções com bloqueio entre elas
}

export const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigSimulador> = {
  1: { itens: 6, minutos: 8, calculadora: false, seccoes: false },
  2: { itens: 8, minutos: 10, calculadora: false, seccoes: false },
  3: { itens: 10, minutos: 12, calculadora: true, seccoes: false },
  4: { itens: 12, minutos: 15, calculadora: true, seccoes: true },
  5: { itens: 14, minutos: 15, calculadora: true, seccoes: true },
};

type Resposta = number | string | string[] | undefined;

function semAcentos(t: string) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function correta(it: ItemProva, r: Resposta): boolean {
  switch (it.tipo) {
    case "escolha":
    case "audio":
    case "tabela":
      return r === it.correta;
    case "curta":
      return typeof r === "string" && it.aceita.some((a) => semAcentos(a) === semAcentos(r));
    case "calculo":
      return typeof r === "string" && Number(r.replace(",", ".").replace(/\s/g, "")) === it.resultado;
    case "ordenar":
      return Array.isArray(r) && r.join("|") === it.itens.join("|");
  }
}
function respondida(_it: ItemProva, r: Resposta): boolean {
  if (r === undefined) return false;
  if (typeof r === "string") return r.trim() !== "";
  if (Array.isArray(r)) return true;
  return true;
}

function Simulador({ config, extensaoTempo, aoTerminar }: PropsAtividade<ConfigSimulador>) {
  const [itens] = useState(() => gerarProva("jornal", config.itens, config.calculadora));
  const meio = config.seccoes ? Math.ceil(itens.length / 2) : itens.length;
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<Resposta[]>(() => itens.map((it) => (it.tipo === "ordenar" ? undefined : undefined)));
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [calc, setCalc] = useState(false);
  const [ecra, setEcra] = useState<"prova" | "resumo" | "bloqueio">("prova");
  const [confirmar, setConfirmar] = useState(false);
  const [seccaoB, setSeccaoB] = useState(false);
  const abriuResumo = useRef(false);
  const [terminou, setTerminou] = useState(false);
  const totalMs = config.minutos * 60_000 * extensaoTempo;
  const { restanteMs, decorridoExato } = useTemporizador(!terminou, totalMs, () => submeter(true));

  const visiveis = config.seccoes ? (seccaoB ? itens.map((_, i) => i).slice(meio) : itens.map((_, i) => i).slice(0, meio)) : itens.map((_, i) => i);
  const porResponder = itens.filter((it, i) => !respondida(it, respostas[i])).length;

  function submeter(tempoEsgotado = false) {
    if (terminou) return;
    setTerminou(true);
    const certos = itens.filter((it, i) => correta(it, respostas[i])).length;
    const mostrar = (it: ItemProva, r: Resposta): string | undefined => {
      if (r === undefined) return undefined;
      if (Array.isArray(r)) return r.join(" → ");
      if (typeof r === "number" && "opcoes" in it) return it.opcoes[r];
      return String(r);
    };
    const certaDe = (it: ItemProva): string =>
      it.tipo === "curta" ? it.aceita[0] : it.tipo === "calculo" ? String(it.resultado) : it.tipo === "ordenar" ? it.itens.join(" → ") : it.opcoes[it.correta];
    const DICA: Record<ItemProva["tipo"], string> = {
      escolha: "Lê todas as opções antes de escolher.",
      audio: "Ouve outra vez, ou abre a transcrição se precisares.",
      curta: "Confirma a ortografia da resposta antes de avançar.",
      calculo: "Usa a calculadora da prova e confirma o resultado.",
      ordenar: "Usa ▲▼ até a ordem estar certa; a ordem inicial nunca está certa.",
      tabela: "Usa o zoom (A+) para ler a tabela sem erros.",
    };
    const relatorio: LinhaRelatorio[] = itens.map((it, i) => {
      const r = respostas[i];
      const ok = correta(it, r);
      return { tarefa: it.enunciado, resultado: ok ? "certo" : respondida(it, r) ? "errado" : "saltado", resposta: mostrar(it, r), certa: certaDe(it), feedback: ok ? undefined : respondida(it, r) ? DICA[it.tipo] : undefined };
    });
    relatorio.push({ tarefa: "Abrir o resumo antes de submeter", resultado: abriuResumo.current ? "certo" : "errado", feedback: abriuResumo.current ? undefined : "O resumo mostra os itens por responder e os marcados para rever." });
    relatorio.push({ tarefa: "Submeter sem itens por responder", resultado: porResponder === 0 ? "certo" : "errado", resposta: porResponder === 0 ? "Tudo respondido" : `${porResponder} por responder`, feedback: porResponder === 0 ? undefined : "Antes de submeter, volta aos itens em branco." });
    aoTerminar({
      relatorio,
      pontuacao: limitar(100 * (0.7 * (certos / itens.length) + 0.15 * (abriuResumo.current ? 1 : 0) + 0.15 * (porResponder === 0 ? 1 : 0))),
      duracaoMs: decorridoExato(),
      metricas: { certos, itens: itens.length, abriuResumo: abriuResumo.current, porResponder, marcados: marcados.size, tempoEsgotado, usouCalculadora: calcUsada.current, usouZoom: zoomUsado.current },
    });
  }
  const calcUsada = useRef(false);
  const zoomUsado = useRef(false);

  const it = itens[atual];
  const definirResposta = (r: Resposta) => setRespostas((rs) => rs.map((x, i) => (i === atual ? r : x)));
  const pos = visiveis.indexOf(atual);

  return (
    <ForcarClaro>
      <div className="janela-simulada" role="region" aria-label="Simulador de prova">
        <div className="superficie-clara" style={{ position: "relative" }}>
          <header className="flex flex-wrap gap-3 items-center p-3 border-b" style={{ borderColor: "var(--linha)", background: "var(--tecla)" }}>
            <strong style={{ fontFamily: "var(--fonte-titulo)" }}>Prova de treino{config.seccoes ? ` · Secção ${seccaoB ? "B" : "A"}` : ""}</strong>
            <div className="flex-1 min-w-40">{restanteMs !== null && <BarraTempo restanteMs={restanteMs} totalMs={totalMs} />}</div>
            <div className="flex gap-1" role="group" aria-label="Ferramentas">
              <button type="button" className="botao botao--contorno" style={{ minHeight: 40, padding: "4px 10px" }} aria-label="Diminuir o texto" onClick={() => { zoomUsado.current = true; setZoom((z) => Math.max(1, z - 0.25)); }}>A−</button>
              <button type="button" className="botao botao--contorno" style={{ minHeight: 40, padding: "4px 10px" }} aria-label="Aumentar o texto" onClick={() => { zoomUsado.current = true; setZoom((z) => Math.min(2, z + 0.25)); }}>A+</button>
              {config.calculadora && (
                <button type="button" className="botao botao--contorno" style={{ minHeight: 40, padding: "4px 10px" }} aria-expanded={calc} onClick={() => { calcUsada.current = true; setCalc((c) => !c); }}>Calculadora</button>
              )}
            </div>
          </header>

          {ecra === "prova" && (
            <div className="grid md:grid-cols-[180px_1fr]">
              <nav aria-label="Itens da prova" className="p-3 border-r" style={{ borderColor: "var(--linha)" }}>
                <ol className="list-none m-0 p-0 grid gap-1" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                  {visiveis.map((i) => {
                    const feito = respondida(itens[i], respostas[i]);
                    return (
                      <li key={i}>
                        <button type="button" onClick={() => setAtual(i)} aria-current={i === atual ? "step" : undefined} aria-label={`Item ${i + 1}${feito ? ", respondido" : ", por responder"}${marcados.has(i) ? ", marcado para rever" : ""}`} className="w-full rounded font-bold tabular-nums" style={{ minHeight: 40, border: i === atual ? "3px solid var(--acento)" : "1px solid var(--tecla-borda)", background: feito ? "var(--acento-suave)" : "var(--superficie)", color: "var(--tinta)", position: "relative", cursor: "pointer" }}>
                          {i + 1}
                          {marcados.has(i) && <span aria-hidden="true" style={{ position: "absolute", top: -4, right: -2 }}>🚩</span>}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="text-xs mt-3 mb-0" style={{ color: "var(--suave)" }}>Azul claro: respondido. 🚩: marcado para rever.</p>
              </nav>
              <section className="p-5 grid gap-4 content-start" aria-labelledby="sim-enunciado" style={{ fontSize: `${zoom}rem` }}>
                <div className="flex justify-between items-baseline gap-2 flex-wrap">
                  <h3 id="sim-enunciado" className="m-0" style={{ fontSize: "1.15em" }}>Item {atual + 1}. {it.enunciado}</h3>
                  <label className="opcao text-sm">
                    <input type="checkbox" checked={marcados.has(atual)} onChange={(e) => setMarcados((m) => { const n = new Set(m); if (e.target.checked) n.add(atual); else n.delete(atual); return n; })} />
                    <span>Marcar para rever</span>
                  </label>
                </div>
                <ItemVista key={atual} it={it} resposta={respostas[atual]} aoResponder={definirResposta} />
                <div className="flex gap-2 flex-wrap">
                  <Botao variante="contorno" disabled={pos <= 0} onClick={() => setAtual(visiveis[pos - 1])}>Anterior</Botao>
                  {pos < visiveis.length - 1 ? (
                    <Botao onClick={() => setAtual(visiveis[pos + 1])}>Seguinte</Botao>
                  ) : config.seccoes && !seccaoB ? (
                    <Botao onClick={() => setEcra("bloqueio")}>Terminar a secção A</Botao>
                  ) : (
                    <Botao onClick={() => { abriuResumo.current = true; setEcra("resumo"); }}>Rever e submeter</Botao>
                  )}
                </div>
              </section>
            </div>
          )}

          {ecra === "bloqueio" && (
            <div className="p-6 grid gap-3" role="alertdialog" aria-labelledby="sim-bloq">
              <h3 id="sim-bloq" className="text-xl">Passar à secção B?</h3>
              <p className="m-0">Depois de passares à secção B não poderás voltar à secção A. Tens {visiveis.filter((i) => !respondida(itens[i], respostas[i])).length} itens por responder e {visiveis.filter((i) => marcados.has(i)).length} marcados para rever nesta secção.</p>
              <div className="flex gap-2 flex-wrap">
                <Botao onClick={() => { setSeccaoB(true); setAtual(meio); setEcra("prova"); }}>Sim, passar à secção B</Botao>
                <Botao variante="contorno" onClick={() => setEcra("prova")}>Voltar à secção A</Botao>
              </div>
            </div>
          )}

          {ecra === "resumo" && (
            <div className="p-6 grid gap-4">
              <h3 className="text-xl">Resumo antes de submeter</h3>
              <p className="m-0">{porResponder === 0 ? "Respondeste a todos os itens." : `Tens ${porResponder} ${porResponder === 1 ? "item" : "itens"} por responder.`} {marcados.size > 0 && `Marcaste ${marcados.size} para rever.`}</p>
              <ul className="list-none m-0 p-0 grid gap-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
                {visiveis.map((i) => (
                  <li key={i}>
                    <button type="button" className="w-full text-left rounded px-2" style={{ minHeight: 40, border: "1px solid var(--tecla-borda)", background: respondida(itens[i], respostas[i]) ? "var(--superficie)" : "#fff3bf", color: "var(--tinta)", cursor: "pointer" }} onClick={() => { setAtual(i); setEcra("prova"); }}>
                      Item {i + 1}: {respondida(itens[i], respostas[i]) ? "respondido" : "por responder"}{marcados.has(i) ? " 🚩" : ""}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 flex-wrap">
                <Botao onClick={() => setConfirmar(true)} disabled={terminou}>Submeter a prova</Botao>
                <Botao variante="contorno" onClick={() => setEcra("prova")}>Voltar à prova</Botao>
              </div>
              {confirmar && (
                <div role="alertdialog" aria-labelledby="sim-conf" className="cartao p-4 grid gap-2" style={{ borderColor: "var(--aviso)", borderWidth: 2 }}>
                  <p id="sim-conf" className="m-0 font-bold">Tens a certeza? Depois de submeter não podes alterar as respostas.</p>
                  <div className="flex gap-2">
                    <Botao onClick={() => submeter()}>Sim, submeter</Botao>
                    <Botao variante="contorno" onClick={() => setConfirmar(false)}>Cancelar</Botao>
                  </div>
                </div>
              )}
            </div>
          )}

          {calc && <Calculadora aoFechar={() => setCalc(false)} />}
        </div>
      </div>
    </ForcarClaro>
  );
}

function ItemVista({ it, resposta, aoResponder }: { it: ItemProva; resposta: Resposta; aoResponder: (r: Resposta) => void }) {
  if (it.tipo === "escolha" || it.tipo === "audio" || it.tipo === "tabela") {
    return (
      <div className="grid gap-3">
        {it.tipo === "audio" && <Audio fala={it.fala} />}
        {it.tipo === "tabela" && (
          <table className="tabela" style={{ fontSize: "0.7em", maxWidth: 320 }}>
            <thead><tr>{it.cabecalho.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>{it.linhas.map((l) => <tr key={l[0]}>{l.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        )}
        <fieldset className="border-0 p-0 m-0 grid gap-1">
          <legend className="sr-only">Opções</legend>
          {it.opcoes.map((o, i) => <BotaoRadio key={i} id={`op-${i}`} name="sim-op" rotulo={o} checked={resposta === i} onChange={() => aoResponder(i)} />)}
        </fieldset>
      </div>
    );
  }
  if (it.tipo === "curta" || it.tipo === "calculo") {
    return (
      <div className="campo max-w-sm">
        <label htmlFor="sim-curta">A tua resposta</label>
        <input id="sim-curta" value={typeof resposta === "string" ? resposta : ""} onChange={(e) => aoResponder(e.target.value)} autoComplete="off" inputMode={it.tipo === "calculo" ? "numeric" : undefined} />
      </div>
    );
  }
  return <Ordenar itens={it.itens} resposta={Array.isArray(resposta) ? resposta : undefined} aoResponder={aoResponder} />;
}

function Ordenar({ itens, resposta, aoResponder }: { itens: string[]; resposta?: string[]; aoResponder: (r: string[]) => void }) {
  const [ordem, setOrdem] = useState(() => {
    if (resposta) return resposta;
    let o = misturar(itens);
    for (let k = 0; o.join() === itens.join() && k < 10; k++) o = misturar(itens);
    return o;
  });
  const mover = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= ordem.length) return;
    const n = [...ordem];
    [n[i], n[j]] = [n[j], n[i]];
    setOrdem(n);
    aoResponder(n);
  };
  return (
    <ol className="grid gap-2 m-0 pl-0 list-none max-w-md">
      {ordem.map((t, i) => (
        <li key={t} className="ficha" style={{ cursor: "default" }}>
          <span className="flex-1">{i + 1}. {t}</span>
          <button type="button" className="botao botao--contorno" style={{ minHeight: 36, minWidth: 36, padding: 2 }} aria-label={`Mover “${t}” para cima`} onClick={() => mover(i, -1)}>▲</button>
          <button type="button" className="botao botao--contorno" style={{ minHeight: 36, minWidth: 36, padding: 2 }} aria-label={`Mover “${t}” para baixo`} onClick={() => mover(i, 1)}>▼</button>
        </li>
      ))}
    </ol>
  );
}

function Audio({ fala }: { fala: string }) {
  const [transcricao, setTranscricao] = useState(false);
  const [aFalar, setAFalar] = useState(false);
  const disponivel = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => () => { if (disponivel) window.speechSynthesis.cancel(); }, [disponivel]);
  function ouvir() {
    if (!disponivel) { setTranscricao(true); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fala);
    u.lang = "pt-PT";
    const voz = window.speechSynthesis.getVoices().find((v) => v.lang === "pt-PT") ?? window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("pt"));
    if (voz) u.voice = voz;
    u.rate = 0.95;
    u.onend = () => setAFalar(false);
    setAFalar(true);
    window.speechSynthesis.speak(u);
  }
  return (
    <div className="cartao p-3 flex flex-wrap gap-2 items-center">
      <Botao onClick={ouvir}>{aFalar ? "A reproduzir…" : <><Icone nome="ouvir" /> Ouvir</>}</Botao>
      <Botao variante="discreto" onClick={() => setTranscricao((t) => !t)} aria-expanded={transcricao}>{transcricao ? "Esconder transcrição" : "Ver transcrição"}</Botao>
      {!disponivel && <span className="text-sm">O teu navegador não reproduz áudio: usa a transcrição.</span>}
      {transcricao && <p className="m-0 w-full" style={{ fontStyle: "italic" }}>“{fala}”</p>}
    </div>
  );
}

function Calculadora({ aoFechar }: { aoFechar: () => void }) {
  const [ecra, setEcra] = useState("0");
  const teclas = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ",", "=", "+"];
  function carregar(t: string) {
    if (t === "=") {
      try {
        const expr = ecra.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".");
        if (!/^[\d+\-*/. ]+$/.test(expr)) return;
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict"; return (${expr})`)() as number;
        setEcra(Number.isFinite(v) ? String(Math.round(v * 1e6) / 1e6).replace(".", ",") : "Erro");
      } catch {
        setEcra("Erro");
      }
      return;
    }
    setEcra((e) => (e === "0" || e === "Erro" ? t : e + t));
  }
  const ultimo = useMemo(() => ecra, [ecra]);
  return (
    <div role="dialog" aria-label="Calculadora" className="cartao p-3 grid gap-2" style={{ position: "absolute", right: 16, top: 70, width: 220, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
      <div className="flex justify-between items-center">
        <strong>Calculadora</strong>
        <button type="button" aria-label="Fechar calculadora" onClick={aoFechar} style={{ border: 0, background: "transparent", fontSize: "1.2rem", cursor: "pointer", color: "var(--tinta)", minWidth: 32, minHeight: 32 }}>×</button>
      </div>
      <output aria-live="polite" className="tabular-nums text-right px-2 rounded" style={{ background: "var(--tecla)", fontFamily: "var(--fonte-mono)", fontSize: "1.2rem", minHeight: 36, display: "block" }}>{ultimo}</output>
      <div className="grid grid-cols-4 gap-1">
        {teclas.map((t) => (
          <button key={t} type="button" onClick={() => carregar(t)} className="rounded" style={{ minHeight: 40, border: "1px solid var(--tecla-borda)", background: "var(--superficie)", color: "var(--tinta)", cursor: "pointer", fontWeight: 700 }}>{t}</button>
        ))}
      </div>
      <button type="button" onClick={() => setEcra("0")} className="botao botao--discreto">Limpar</button>
    </div>
  );
}

export const definicao = definir<ConfigSimulador>({
  slug: "simulador",
  numero: 10,
  dominio: "todas",
  titulo: { jornal: "Simulador de Prova", laboratorio: "Simulador de Prova" },
  descricao: "Uma interface de prova genérica: lista de itens, marcar para rever, áudio, zoom, calculadora, resposta curta, ordenar e confirmação antes de submeter.",
  duracao: "8 a 15 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ itens: 4, minutos: 4, calculadora: false, seccoes: false }),
  Componente: Simulador,
  dica: (m) => {
    if (!m.abriuResumo) return "Antes de submeter, abre sempre o resumo: mostra os itens por responder e os que marcaste para rever.";
    if (Number(m.porResponder) > 0) return "Ficaram itens por responder. Numa prova, uma resposta em branco vale sempre zero: responde a tudo, mesmo que tenhas dúvidas.";
    return "Bom uso da interface. Experimenta também o zoom e a transcrição do áudio: estão lá para te ajudar.";
  },
});
