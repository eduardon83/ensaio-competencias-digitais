// ─── Jogo · O Robô da Bancada (pensamento computacional) ─────────────────────
// Montar um programa (avançar, virar, apanhar, repetir, avançar até bloquear) para o robô apanhar os itens e
// chegar ao destino na bancada. Os mapas são gerados em cada tentativa e têm sempre solução.
// Pontuação por desafio: resolvido = 70 + 30 × eficiência (meta ÷ instruções, até 1) − 5 por execução falhada
// (máx. −20); não resolvido = até 30, pelos itens apanhados. Resultado = média dos desafios.
import { useEffect, useRef, useState } from "react";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, Seletor } from "../../ui";
import { Janela } from "../../componentes/Janela";
import { Icone } from "../../componentes/Icone";
import { custo, executar, gerarMapa, NOME_DIR, NOME_INSTR, nomeCelula, textoPrograma, type ConfigRobo, type Estado, type Instr, type Mapa } from "./gerar";

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigRobo> = {
  1: { desafios: 2, lado: 5, segmentos: [2, 2], comprimento: [1, 3], itens: 0, obstaculos: 2, repetir: false, ate: false, escada: false },
  2: { desafios: 2, lado: 6, segmentos: [3, 3], comprimento: [1, 3], itens: 1, obstaculos: 4, repetir: false, ate: false, escada: false },
  3: { desafios: 2, lado: 6, segmentos: [2, 3], comprimento: [3, 5], itens: 1, obstaculos: 4, repetir: true, ate: false, escada: false },
  4: { desafios: 2, lado: 7, segmentos: [3, 3], comprimento: [1, 2], itens: 0, obstaculos: 6, repetir: true, ate: false, escada: true },
  5: { desafios: 2, lado: 7, segmentos: [3, 4], comprimento: [2, 5], itens: 2, obstaculos: 5, repetir: true, ate: true, escada: false },
};
const SETA = ["▲", "▶", "▼", "◀"];

interface Resultado {
  resolvido: boolean;
  instrucoes: number;
  falhadas: number;
  itens: number;
  programa: string;
}

function Robo({ config, modo, contexto, aoTerminar }: PropsAtividade<ConfigRobo>) {
  const n = modo === "pratica" ? 1 : config.desafios;
  const [mapas] = useState(() => Array.from({ length: n }, () => gerarMapa(config)));
  const [k, setK] = useState(0);
  const resultados = useRef<Resultado[]>([]);
  const inicio = useRef(performance.now());
  const item = contexto === "jornal" ? { emoji: "📰", nome: "jornal", plural: "jornais" } : { emoji: "🧪", nome: "tubo de ensaio", plural: "tubos de ensaio" };
  const destino = contexto === "jornal" ? { emoji: "📮", nome: "ao marco do correio" } : { emoji: "🧊", nome: "ao frigorífico" };

  function seguinte(r: Resultado) {
    resultados.current.push(r);
    if (k + 1 < mapas.length) return setK(k + 1);
    const pontos = resultados.current.map((x, i) => (x.resolvido ? 70 + 30 * Math.min(1, mapas[i].meta / Math.max(1, x.instrucoes)) - 5 * Math.min(4, x.falhadas) : 30 * (mapas[i].itens.length ? x.itens / mapas[i].itens.length : 0)));
    aoTerminar({
      pontuacao: limitar(pontos.reduce((s, p) => s + p, 0) / pontos.length),
      duracaoMs: performance.now() - inicio.current,
      metricas: { resolvidos: resultados.current.filter((x) => x.resolvido).length, desafios: mapas.length, acimaDaMeta: resultados.current.filter((x, i) => x.resolvido && x.instrucoes > mapas[i].meta).length, falhadas: resultados.current.reduce((s, x) => s + x.falhadas, 0), repetir: config.repetir },
      relatorio: resultados.current.map<LinhaRelatorio>((x, i) => ({
        tarefa: `Desafio ${i + 1}: ${mapas[i].itens.length ? `apanhar ${mapas[i].itens.length} ${mapas[i].itens.length === 1 ? item.nome : item.plural} e ` : ""}chegar a ${nomeCelula(mapas[i].objetivo)}`,
        resultado: x.resolvido ? (x.instrucoes <= mapas[i].meta && !x.falhadas ? "certo" : "parcial") : "errado",
        resposta: x.programa ? `${x.programa} (${x.instrucoes} instruções)` : undefined,
        certa: `${textoPrograma(mapas[i].referencia)} (${mapas[i].meta} instruções)`,
        feedback: !x.resolvido ? "Executa o programa aos bocados: vê onde o robô se engana e corrige essa parte." : x.instrucoes > mapas[i].meta ? `Resolveste com ${x.instrucoes} instruções; dá para fazer com ${mapas[i].meta}.${config.repetir ? " Procura partes que se repetem e usa “Repetir”." : ""}` : x.falhadas ? "Resolvido com o número ideal de instruções, depois de algumas execuções falhadas." : undefined,
      })),
    });
  }

  return (
    <div className="grid gap-4">
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
        Desafio {k + 1} de {mapas.length}
      </div>
      <Desafio key={k} mapa={mapas[k]} config={config} item={item} destino={destino} ultimo={k + 1 === mapas.length} aoConcluir={seguinte} />
    </div>
  );
}

function Desafio({ mapa, config, item, destino, ultimo, aoConcluir }: { mapa: Mapa; config: ConfigRobo; item: { emoji: string; nome: string; plural: string }; destino: { emoji: string; nome: string }; ultimo: boolean; aoConcluir: (r: Resultado) => void }) {
  const [prog, setProg] = useState<Instr[]>([]);
  const [vezes, setVezes] = useState("2");
  const [estado, setEstado] = useState<Estado>({ ...mapa.inicio, apanhados: [] });
  const [aCorrer, setACorrer] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "certo" | "errado" | "info"; texto: string } | null>(null);
  const [falhadas, setFalhadas] = useState(0);
  const [melhorItens, setMelhorItens] = useState(0);
  const [resolvido, setResolvido] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(temporizador.current), []);

  const add = (i: Instr) => setProg((p) => [...p, i]);
  const mover = (i: number, d: -1 | 1) => setProg((p) => {
    const j = i + d;
    if (j < 0 || j >= p.length) return p;
    const c = [...p];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  });

  function correr() {
    const ex = executar(prog, mapa);
    setMsg(null);
    setACorrer(true);
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    window.clearInterval(temporizador.current);
    temporizador.current = window.setInterval(() => {
      i++;
      if (i >= ex.passos.length) {
        window.clearInterval(temporizador.current);
        setACorrer(false);
        const fim = ex.passos[ex.passos.length - 1];
        setMelhorItens((m) => Math.max(m, fim.apanhados.length));
        if (ex.sucesso) {
          setResolvido(true);
          setMsg({ tipo: "certo", texto: `Conseguiste com ${custo(prog)} instruções.${custo(prog) > mapa.meta ? ` Dá para fazer com ${mapa.meta}: queres tentar outra vez?` : " Número ideal de instruções!"}` });
        } else {
          setFalhadas((f) => f + 1);
          const falta = fim.apanhados.length < mapa.itens.length ? `Faltam ${mapa.itens.length - fim.apanhados.length} ${item.plural}.` : `O robô parou em ${nomeCelula(fim)}, não em ${nomeCelula(mapa.objetivo)}.`;
          setMsg({ tipo: "errado", texto: ex.erro ?? falta });
        }
        return;
      }
      setEstado(ex.passos[i]);
    }, reduzido ? 40 : 320);
    setEstado(ex.passos[0]);
  }

  const celula = (x: number, y: number) => {
    const k = `${x},${y}`;
    if (estado.x === x && estado.y === y) return <span title="robô">🤖<span className="robo-seta">{SETA[estado.d]}</span></span>;
    if (mapa.obstaculos.some((o) => o.x === x && o.y === y)) return "📦";
    if (mapa.itens.some((o) => o.x === x && o.y === y) && !estado.apanhados.includes(k)) return item.emoji;
    if (mapa.objetivo.x === x && mapa.objetivo.y === y) return destino.emoji;
    return "";
  };
  const itensPorApanhar = mapa.itens.filter((p) => !estado.apanhados.includes(`${p.x},${p.y}`));
  const nivelBlocos = (() => {
    let d = 0;
    return prog.map((i) => {
      if (i.t === "fim") d = Math.max(0, d - 1);
      const n = d;
      if (i.t === "repetir") d++;
      return n;
    });
  })();

  return (
    <div className="grid gap-4">
      <Instrucao>
        Monta um programa para o robô {mapa.itens.length ? `apanhar ${mapa.itens.length === 1 ? `o ${item.nome}` : `os ${item.plural}`} (${item.emoji}) e ` : ""}chegar {destino.nome} ({destino.emoji}), sem bater nas caixas (📦) nem sair da bancada. Meta: {mapa.meta} instruções ou menos.
      </Instrucao>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr] items-start">
        <Janela endereco="robo.escola-exemplo.pt/bancada" rotulo="Bancada do robô simulada">
          <div className="p-3 grid gap-2 justify-items-center" style={{ background: "var(--superficie)" }}>
            <div className="robo-grelha" style={{ gridTemplateColumns: `1.5rem repeat(${mapa.lado}, var(--celula))` }} aria-hidden="true">
              <span />
              {Array.from({ length: mapa.lado }, (_, x) => (
                <span key={x} className="robo-eixo">{String.fromCharCode(65 + x)}</span>
              ))}
              {Array.from({ length: mapa.lado }, (_, y) => [
                <span key={`l${y}`} className="robo-eixo">{y + 1}</span>,
                ...Array.from({ length: mapa.lado }, (_, x) => (
                  <span key={`${x}-${y}`} className="robo-celula">{celula(x, y)}</span>
                )),
              ])}
            </div>
            <p className="m-0 text-sm max-w-sm" aria-live="polite">
              Robô em {nomeCelula(estado)}, virado para {NOME_DIR[estado.d]}. Destino: {nomeCelula(mapa.objetivo)}.
              {itensPorApanhar.length > 0 && ` Por apanhar: ${itensPorApanhar.map(nomeCelula).join(", ")}.`} Caixas: {mapa.obstaculos.map(nomeCelula).join(", ") || "nenhuma"}.
            </p>
          </div>
        </Janela>
        <div className="grid gap-3">
          <section className="cartao p-4 grid gap-2" aria-labelledby="blocos-t">
            <h3 id="blocos-t" className="text-base">Instruções</h3>
            <div className="flex gap-2 flex-wrap">
              {(["avancar", "esquerda", "direita"] as const).map((t) => (
                <Botao key={t} variante="contorno" disabled={aCorrer || resolvido} onClick={() => add({ t })}>
                  <Icone nome={t === "avancar" ? "avancar" : t} /> {NOME_INSTR[t]}
                </Botao>
              ))}
              {(mapa.itens.length > 0 || config.itens > 0) && (
                <Botao variante="contorno" disabled={aCorrer || resolvido} onClick={() => add({ t: "apanhar" })}>
                  <Icone nome="mao" /> {NOME_INSTR.apanhar}
                </Botao>
              )}
              {config.ate && (
                <Botao variante="contorno" disabled={aCorrer || resolvido} onClick={() => add({ t: "ate" })}>
                  <Icone nome="ate" /> {NOME_INSTR.ate}
                </Botao>
              )}
            </div>
            {config.repetir && (
              <div className="flex gap-2 flex-wrap items-end">
                <div style={{ width: "8rem" }}>
                  <Seletor id="robo-vezes" rotulo="Vezes" value={vezes} onChange={(e) => setVezes(e.target.value)} opcoes={["2", "3", "4", "5", "6"].map((v) => ({ valor: v, texto: `${v} vezes` }))} />
                </div>
                <Botao variante="contorno" disabled={aCorrer || resolvido} onClick={() => add({ t: "repetir", n: Number(vezes) })}>
                  <Icone nome="repetir" /> Repetir
                </Botao>
                <Botao variante="contorno" disabled={aCorrer || resolvido} onClick={() => add({ t: "fim" })}>
                  <Icone nome="parar" /> {NOME_INSTR.fim}
                </Botao>
              </div>
            )}
          </section>
          <section className="cartao p-4 grid gap-2" aria-labelledby="prog-t">
            <h3 id="prog-t" className="text-base">
              Programa · {custo(prog)} instruç{custo(prog) === 1 ? "ão" : "ões"} (meta {mapa.meta})
            </h3>
            {prog.length === 0 ? (
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>Ainda vazio. Carrega nas instruções para as juntar.</p>
            ) : (
              <ol className="m-0 p-0 list-none grid gap-1">
                {prog.map((i, j) => (
                  <li key={j} className="flex gap-1 items-center flex-wrap" style={{ paddingLeft: `${nivelBlocos[j] * 1.5}rem` }}>
                    <span className="tabular-nums text-sm" style={{ color: "var(--suave)", minWidth: "1.8rem" }}>{j + 1}.</span>
                    <span className="flex-1" style={{ fontWeight: i.t === "repetir" || i.t === "fim" ? 700 : 400 }}>
                      {i.t === "repetir" ? `Repetir ${i.n} vezes:` : NOME_INSTR[i.t]}
                    </span>
                    <button type="button" className="botao botao--discreto" style={{ minHeight: 44, minWidth: 44, padding: "0 8px" }} disabled={aCorrer || resolvido || j === 0} onClick={() => mover(j, -1)} aria-label={`Subir a instrução ${j + 1}`}>↑</button>
                    <button type="button" className="botao botao--discreto" style={{ minHeight: 44, minWidth: 44, padding: "0 8px" }} disabled={aCorrer || resolvido || j === prog.length - 1} onClick={() => mover(j, 1)} aria-label={`Descer a instrução ${j + 1}`}>↓</button>
                    <button type="button" className="botao botao--discreto" style={{ minHeight: 44, minWidth: 44, padding: "0 8px" }} disabled={aCorrer || resolvido} onClick={() => setProg((p) => p.filter((_, m) => m !== j))} aria-label={`Apagar a instrução ${j + 1}`}>✕</button>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex gap-2 flex-wrap">
              {!resolvido ? (
                <>
                  <Botao disabled={aCorrer || prog.length === 0} onClick={correr}><Icone nome="jogar" /> Executar</Botao>
                  <Botao variante="discreto" disabled={aCorrer || prog.length === 0} onClick={() => { setProg([]); setEstado({ ...mapa.inicio, apanhados: [] }); setMsg(null); }}>Limpar</Botao>
                  {falhadas > 0 && <Botao variante="discreto" disabled={aCorrer} onClick={() => aoConcluir({ resolvido: false, instrucoes: custo(prog), falhadas, itens: melhorItens, programa: textoPrograma(prog) })}>Desistir deste desafio</Botao>}
                </>
              ) : (
                <>
                  <Botao onClick={() => aoConcluir({ resolvido: true, instrucoes: custo(prog), falhadas, itens: mapa.itens.length, programa: textoPrograma(prog) })}>{ultimo ? "Terminar" : "Desafio seguinte"}</Botao>
                  {custo(prog) > mapa.meta && <Botao variante="discreto" onClick={() => { setResolvido(false); setEstado({ ...mapa.inicio, apanhados: [] }); setMsg(null); }}>Melhorar o programa</Botao>}
                </>
              )}
            </div>
            <p className="m-0" aria-live="polite" style={{ color: msg ? (msg.tipo === "certo" ? "var(--certo)" : "var(--errado)") : undefined, fontWeight: 700 }}>
              {msg?.texto}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigRobo>({
  slug: "robo",
  numero: 106,
  dominio: "programacao",
  titulo: { jornal: "O Robô da Redação", laboratorio: "O Robô da Bancada" },
  descricao: "Programar um robô com instruções em sequência, repetições e “avançar até bloquear” para apanhar itens e chegar ao destino com o menor número de instruções.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ ...NIVEIS[1], desafios: 1, lado: 4, segmentos: [1, 2], comprimento: [1, 2], obstaculos: 1 }),
  Componente: Robo,
  dica: (m) => {
    if (Number(m.resolvidos) < Number(m.desafios)) return "Antes de executar, segue o caminho com o dedo e diz em voz alta cada instrução. Atenção ao lado para onde o robô está virado: “esquerda” é a esquerda dele.";
    if (Number(m.acimaDaMeta) > 0) return m.repetir === true ? "Procura padrões: quando as mesmas instruções aparecem várias vezes seguidas, junta-as num “Repetir”." : "Tenta chegar ao destino pelo caminho mais curto, sem voltas a mais.";
    if (Number(m.falhadas) > 0) return "Resolveste tudo! Para a próxima, planeia o programa todo antes de carregar em Executar.";
    return "Programação exemplar: à primeira e com o número ideal de instruções.";
  },
});
