// ─── Atividade 7 · Fecho de Edição / Fim da Sessão (gestão do tempo) ─────────
// Secções de itens curtos com relógio global e tempo sugerido por secção. Mede o ritmo: ver o relógio,
// avançar quando se fica preso, chegar a todas as secções, perceber que uma secção vale mais.
// score = 100 × (0,6 × certos ponderados / total ponderado + 0,3 × secções alcançadas / secções
//               + 0,1 × [nenhuma secção acima de 1,5 × o tempo sugerido])
import { useEffect, useMemo, useRef, useState } from "react";
import { contexto as defContexto } from "../../contextos";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, formatarTempo, useTemporizador } from "../../motor/util";
import { escolher } from "../../motor/aleatorio";
import { Botao, BotaoRadio } from "../../ui";
import { usePreferencias } from "../../preferencias/preferencias";
import { gerarSecao, type Item } from "./itens";

export interface ConfigFecho {
  secoes: number;
  itensPorSecao: number;
  minutos: number;
  digitos: boolean; // relógio com mm:ss (senão só barra)
  pesos: "nenhum" | "sempre" | "inicio"; // uma secção vale o dobro: indicado sempre, ou só no ecrã inicial
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigFecho> = {
  1: { secoes: 2, itensPorSecao: 5, minutos: 4, digitos: false, pesos: "nenhum" },
  2: { secoes: 3, itensPorSecao: 5, minutos: 5, digitos: true, pesos: "nenhum" },
  3: { secoes: 3, itensPorSecao: 7, minutos: 6, digitos: true, pesos: "sempre" },
  4: { secoes: 4, itensPorSecao: 7, minutos: 8, digitos: true, pesos: "inicio" },
  5: { secoes: 4, itensPorSecao: 8, minutos: 7, digitos: true, pesos: "inicio" },
};

export const NOMES: Record<"jornal" | "laboratorio", string[]> = {
  jornal: ["Primeira página", "Desporto", "Cultura", "Escola"],
  laboratorio: ["Medições", "Registo", "Materiais", "Conclusões"],
};

interface Secao {
  nome: string;
  peso: number;
  itens: Item[];
}

function Fecho({ config, contexto, extensaoTempo, aoTerminar }: PropsAtividade<ConfigFecho>) {
  const ctx = defContexto(contexto);
  const { prefs } = usePreferencias();
  const [secoes] = useState<Secao[]>(() => {
    const dupla = config.pesos !== "nenhum" ? Math.floor(Math.random() * config.secoes) : -1;
    const usados = new Set<string>(); // temas já usados nesta tentativa, partilhados entre secções
    return NOMES[contexto].slice(0, config.secoes).map((nome, i) => ({ nome, peso: i === dupla ? 2 : 1, itens: gerarSecao(contexto, config.itensPorSecao, Math.random, usados) }));
  });
  const totalMs = config.minutos * 60_000 * extensaoTempo;
  const sugeridoMs = totalMs / config.secoes;
  const [comecou, setComecou] = useState(false);
  const [terminou, setTerminou] = useState(false);
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [rever, setRever] = useState<Set<string>>(new Set());
  const [confirmar, setConfirmar] = useState(false);
  const tempoSecao = useRef<number[]>(secoes.map(() => 0));
  const marca = useRef(performance.now());
  const { restanteMs } = useTemporizador(comecou && !terminou, totalMs, () => entregar());

  // Tempo gasto em cada secção (enquanto está aberta).
  function acumular() {
    const agora = performance.now();
    tempoSecao.current[atual] += agora - marca.current;
    marca.current = agora;
  }
  function mudarSecao(i: number) {
    acumular();
    setAtual(i);
  }

  const [aviso, setAviso] = useState("");
  const avisados = useRef(new Set<string>());
  useEffect(() => {
    if (!comecou || restanteMs === null) return;
    const marcas: [string, boolean, string][] = [
      ["metade", restanteMs <= totalMs / 2, "Já passou metade do tempo."],
      ["2min", restanteMs <= 120_000 && totalMs > 150_000, "Faltam 2 minutos."],
      ["30s", restanteMs <= 30_000, "Faltam 30 segundos!"],
    ];
    for (const [k, cond, msg] of marcas) if (cond && !avisados.current.has(k)) { avisados.current.add(k); setAviso(msg); }
  }, [restanteMs, comecou, totalMs]);

  function entregar() {
    if (terminou) return;
    acumular();
    setTerminou(true);
    let certo = 0, total = 0, alcancadas = 0;
    secoes.forEach((s, i) => {
      let respondidas = 0;
      s.itens.forEach((it, j) => {
        total += s.peso;
        const r = respostas[`${i}:${j}`];
        if (r !== undefined) respondidas++;
        if (r === it.correta) certo += s.peso;
      });
      if (respondidas > 0) alcancadas++;
    });
    const excedeu = tempoSecao.current.some((t) => t > 1.5 * sugeridoMs);
    const dicaItem = (pergunta: string) =>
      pergunta.startsWith("Qual destas palavras") ? "Repara nos acentos e nas letras duplas." : pergunta.startsWith("Escolhe a frase") ? "Compara as frases palavra a palavra: só uma não tem erros." : pergunta.includes("legenda") ? "A legenda tem de dizer o que a fotografia mostra." : pergunta.startsWith("Em que unidade") ? "Massa em gramas, volume em mililitros, temperatura em graus Celsius." : "Faz a conta com calma antes de responder.";
    const relatorio: LinhaRelatorio[] = [];
    secoes.forEach((s, i) => {
      s.itens.forEach((it, j) => {
        const r = respostas[`${i}:${j}`];
        relatorio.push({
          tarefa: `${s.nome}${s.peso === 2 ? " (vale o dobro)" : ""}: ${it.pergunta.replace(/^\S+\s(?=A fotografia)/u, "")}`,
          resultado: r === undefined ? "saltado" : r === it.correta ? "certo" : "errado",
          resposta: r === undefined ? undefined : it.opcoes[r],
          certa: it.opcoes[it.correta],
          feedback: r === undefined ? "Não chegaste a responder: numa prova, responde primeiro ao que é rápido em todas as secções." : r === it.correta ? undefined : dicaItem(it.pergunta),
        });
      });
      if (tempoSecao.current[i] > 1.5 * sugeridoMs)
        relatorio.push({ tarefa: `Tempo na secção ${s.nome}`, resultado: "errado", resposta: formatarTempo(tempoSecao.current[i]), certa: `Até ${formatarTempo(1.5 * sugeridoMs)}`, feedback: "Ficaste demasiado tempo nesta secção. Quando passares o tempo sugerido, marca “Rever mais tarde” e avança." });
    });
    aoTerminar({
      pontuacao: limitar(100 * (0.6 * (certo / total) + 0.3 * (alcancadas / secoes.length) + 0.1 * (excedeu ? 0 : 1))),
      duracaoMs: totalMs - (restanteMs ?? 0),
      relatorio,
      metricas: { certoPonderado: certo, totalPonderado: total, secoesAlcancadas: alcancadas, secoes: secoes.length, excedeuTempoSecao: excedeu, marcadosParaRever: rever.size, porResponder: secoes.reduce((s, x, i) => s + x.itens.filter((_, j) => respostas[`${i}:${j}`] === undefined).length, 0) },
    });
  }

  const porResponder = useMemo(() => secoes.reduce((s, x, i) => s + x.itens.filter((_, j) => respostas[`${i}:${j}`] === undefined).length, 0), [respostas, secoes]);
  const mostrarPesos = config.pesos === "sempre";

  if (!comecou) {
    return (
      <div className="cartao p-6 grid gap-4">
        <h2 className="text-2xl">{contexto === "jornal" ? "A gráfica está à espera" : "A sessão está quase a acabar"}</h2>
        <p className="m-0">
          Tens <strong>{formatarTempo(totalMs)}</strong> para {secoes.length} secções com {config.itensPorSecao} perguntas fáceis cada. O {ctx.personagens.relogio} sugere cerca de <strong>{formatarTempo(sugeridoMs)}</strong> por secção. Se ficares preso, marca “Rever mais tarde” e avança.
        </p>
        {config.pesos !== "nenhum" && (
          <ul className="m-0 pl-5">
            {secoes.map((s) => (
              <li key={s.nome}>
                {s.nome}: {s.peso === 2 ? <strong>vale o dobro</strong> : "valor normal"}
              </li>
            ))}
          </ul>
        )}
        {config.pesos === "inicio" && <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>Este quadro não volta a aparecer. Memoriza qual é a secção que vale mais.</p>}
        <div>
          <Botao grande onClick={() => { marca.current = performance.now(); setComecou(true); }}>Começar</Botao>
        </div>
      </div>
    );
  }

  const s = secoes[atual];
  const decorridoSecao = tempoSecao.current[atual] + (performance.now() - marca.current);
  return (
    <div className="grid gap-4">
      <div className="cartao p-4 grid gap-2" style={{ position: "sticky", top: 0, zIndex: 5 }}>
        {restanteMs !== null && (config.digitos ? <BarraTempo restanteMs={restanteMs} totalMs={totalMs} /> : <BarraTempo restanteMs={restanteMs} totalMs={totalMs} soBarra />)}
        {aviso && <div role="status" className="text-sm font-bold" style={{ color: "var(--aviso)" }}>{aviso}</div>}
        <div role="tablist" aria-label="Secções" className="flex gap-1 flex-wrap">
          {secoes.map((x, i) => {
            const feitas = x.itens.filter((_, j) => respostas[`${i}:${j}`] !== undefined).length;
            const marcadas = x.itens.filter((_, j) => rever.has(`${i}:${j}`)).length;
            return (
              <button key={x.nome} type="button" role="tab" aria-selected={i === atual} className="separador" onClick={() => mudarSecao(i)}>
                {x.nome} <span className="text-xs" style={{ color: "var(--suave)" }}>({feitas}/{x.itens.length}{marcadas ? ` · ${marcadas} a rever` : ""})</span>
                {mostrarPesos && x.peso === 2 && <span className="etiqueta ml-1">×2</span>}
              </button>
            );
          })}
        </div>
        <div className="text-sm" style={{ color: "var(--suave)" }}>
          Tempo sugerido para esta secção: {formatarTempo(sugeridoMs)}{config.digitos && !prefs.calmo && <> · já usaste {formatarTempo(decorridoSecao)}</>}
        </div>
      </div>
      <section aria-label={s.nome} className="grid gap-3">
        {s.itens.map((it, j) => {
          const k = `${atual}:${j}`;
          return (
            <fieldset key={k} className="cartao p-4 grid gap-1 border-0" style={{ outline: rever.has(k) ? "2px dashed var(--aviso)" : undefined }}>
              <legend className="font-bold px-1">{j + 1}. {it.pergunta}</legend>
              {it.opcoes.map((o, i) => (
                <BotaoRadio key={i} id={`fe-${k}-${i}`} name={`fe-${k}`} rotulo={o} checked={respostas[k] === i} disabled={terminou} onChange={() => setRespostas((r) => ({ ...r, [k]: i }))} />
              ))}
              <label className="opcao text-sm" style={{ minHeight: 36 }}>
                <input type="checkbox" checked={rever.has(k)} onChange={(e) => setRever((x) => { const n = new Set(x); if (e.target.checked) n.add(k); else n.delete(k); return n; })} />
                <span>Rever mais tarde</span>
              </label>
            </fieldset>
          );
        })}
      </section>
      <div className="flex gap-3 flex-wrap items-center">
        {atual + 1 < secoes.length && <Botao onClick={() => mudarSecao(atual + 1)}>Secção seguinte: {secoes[atual + 1].nome}</Botao>}
        <Botao variante={atual + 1 < secoes.length ? "contorno" : "primario"} onClick={() => (porResponder > 0 ? setConfirmar(true) : entregar())} disabled={terminou}>
          {contexto === "jornal" ? "Fechar a edição" : "Fechar a sessão"}
        </Botao>
      </div>
      {confirmar && !terminou && (
        <div role="alertdialog" aria-labelledby="fe-conf" className="cartao p-4 grid gap-2" style={{ borderColor: "var(--aviso)", borderWidth: 2 }}>
          <p id="fe-conf" className="m-0 font-bold">Ainda tens {porResponder} {porResponder === 1 ? "pergunta" : "perguntas"} por responder. Queres mesmo terminar?</p>
          <div className="flex gap-2">
            <Botao onClick={entregar}>Sim, terminar</Botao>
            <Botao variante="contorno" onClick={() => setConfirmar(false)}>Continuar a responder</Botao>
          </div>
        </div>
      )}
    </div>
  );
}

export const definicao = definir<ConfigFecho>({
  slug: "fecho",
  numero: 7,
  dominio: "tempo",
  titulo: { jornal: "Fecho de Edição", laboratorio: "Fim da Sessão" },
  descricao: "Muitas perguntas curtas, um relógio global e tempos sugeridos por secção. Mede o ritmo, não a dificuldade.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ secoes: 1, itensPorSecao: 2, minutos: 1, digitos: true, pesos: "nenhum" }),
  Componente: Fecho,
  dica: (m) => {
    if (Number(m.secoesAlcancadas) < Number(m.secoes)) return "Chegaste ao fim sem passar por todas as secções. Numa prova, responde primeiro ao que sabes em todas as partes e volta depois ao que ficou marcado.";
    if (m.excedeuTempoSecao === true) return "Passaste muito tempo numa só secção. Olha para o tempo sugerido e, quando o ultrapassares, marca “Rever mais tarde” e avança.";
    return escolher(["Bom ritmo. Na prova real, guarda os últimos minutos para rever as perguntas marcadas.", "Bom ritmo. Lembra-te de ver primeiro quanto vale cada parte da prova."]);
  },
});
