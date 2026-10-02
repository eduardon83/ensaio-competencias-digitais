// ─── Atividade 4 · O Arquivo / Arquivo de Amostras (navegação) ───────────────
// Quatro rondas numa interface simulada: pastas (abrir, mover, mudar o nome, mais recente), separadores,
// histórico (retroceder/avançar) e fim de uma página longa. Tudo é gerado em cada tentativa.
// Pontuação por tarefa: sucesso × min(1, ações ótimas / ações feitas). Resultado = média × 100.
import { useMemo, useRef, useState } from "react";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, BotaoRadio, ForcarClaro } from "../../ui";
import { gerarArtigo, gerarArvore, gerarHistorico, gerarSeparadores, type No } from "./gerar";

export interface ConfigArquivo {
  profundidade: number; // pastas até ao ficheiro alvo
  procurar: boolean; // caixa de procura no explorador
  moverRenomear: boolean;
  extensoes: boolean; // mostra extensões, datas e a tarefa "mais recente"
  separadores: number;
  fecharSeparador: boolean;
  historico: number; // páginas visitadas
  avancar: boolean;
  paragrafos: number;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigArquivo> = {
  1: { profundidade: 2, procurar: false, moverRenomear: false, extensoes: false, separadores: 2, fecharSeparador: false, historico: 3, avancar: false, paragrafos: 3 },
  2: { profundidade: 3, procurar: false, moverRenomear: false, extensoes: false, separadores: 3, fecharSeparador: true, historico: 4, avancar: false, paragrafos: 4 },
  3: { profundidade: 4, procurar: true, moverRenomear: true, extensoes: false, separadores: 3, fecharSeparador: true, historico: 5, avancar: true, paragrafos: 6 },
  4: { profundidade: 5, procurar: true, moverRenomear: true, extensoes: true, separadores: 4, fecharSeparador: true, historico: 6, avancar: true, paragrafos: 8 },
  5: { profundidade: 5, procurar: true, moverRenomear: true, extensoes: true, separadores: 4, fecharSeparador: true, historico: 6, avancar: true, paragrafos: 12 },
};

type Resultado = { tarefa: string; pontos: number };

function Arquivo({ config, contexto, aoTerminar }: PropsAtividade<ConfigArquivo>) {
  const [ronda, setRonda] = useState(0);
  const resultados = useRef<Resultado[]>([]);
  const inicio = useRef(performance.now());
  const rondas = ["pastas", "separadores", "historico", "fim"] as const;

  function registar(rs: Resultado[]) {
    resultados.current.push(...rs);
    if (ronda + 1 >= rondas.length) {
      const total = resultados.current.reduce((s, r) => s + r.pontos, 0);
      aoTerminar({
        pontuacao: limitar((100 * total) / resultados.current.length),
        duracaoMs: performance.now() - inicio.current,
        metricas: Object.fromEntries(resultados.current.map((r) => [r.tarefa, Math.round(r.pontos * 100)])),
      });
      return;
    }
    setRonda(ronda + 1);
  }

  const endereco = contexto === "laboratorio" ? "arquivo.laboratorio3.escola.pt" : "arquivo.orecreio.escola.pt";
  return (
    <div className="grid gap-4">
      <p className="m-0" style={{ color: "var(--suave)" }}>
        Ronda {ronda + 1} de {rondas.length}. As tarefas fazem-se na interface simulada abaixo.
      </p>
      {rondas[ronda] === "pastas" && <RondaPastas key="p" config={config} contexto={contexto} endereco={endereco} aoConcluir={registar} />}
      {rondas[ronda] === "separadores" && <RondaSeparadores key="s" config={config} contexto={contexto} aoConcluir={registar} />}
      {rondas[ronda] === "historico" && <RondaHistorico key="h" config={config} contexto={contexto} aoConcluir={registar} />}
      {rondas[ronda] === "fim" && <RondaFim key="f" config={config} contexto={contexto} endereco={endereco} aoConcluir={registar} />}
    </div>
  );
}

function Janela({ endereco, children }: { endereco: string; children: React.ReactNode }) {
  return (
    <ForcarClaro>
      <div className="janela-simulada" role="region" aria-label="Interface simulada da tarefa">
        <div className="janela-barra" aria-hidden="true">
          <span className="pontos">
            <span />
            <span />
            <span />
          </span>
          <span className="endereco">https://{endereco}</span>
          <span className="etiqueta">Interface simulada</span>
        </div>
        <div className="superficie-clara">{children}</div>
      </div>
    </ForcarClaro>
  );
}

// ── Ronda 1: pastas ──────────────────────────────────────────────────────────
type TarefaPasta = { id: string; texto: string; otimo: number };

function RondaPastas({ config, contexto, endereco, aoConcluir }: { config: ConfigArquivo; contexto: "jornal" | "laboratorio"; endereco: string; aoConcluir: (r: Resultado[]) => void }) {
  const [arv] = useState(() => gerarArvore(contexto, config.profundidade));
  const [raiz, setRaiz] = useState<No[]>(arv.raiz);
  const nomeF = (n: No) => (config.extensoes ? n.nome + n.ext : n.nome);
  const tarefas = useMemo<TarefaPasta[]>(() => {
    const t: TarefaPasta[] = [
      {
        id: "abrir",
        texto: config.procurar
          ? `Abre o ficheiro “${nomeF(arv.alvo.no)}”. Podes procurá-lo pelas pastas ou usar a caixa de procura.`
          : `Abre o ficheiro “${nomeF(arv.alvo.no)}”, que está em ${arv.alvo.caminho.join(" › ")}.`,
        otimo: config.procurar ? 3 : arv.alvo.caminho.length + 2,
      },
    ];
    if (config.moverRenomear && arv.mover && arv.renomear) {
      t.push({ id: "mover", texto: `Move o ficheiro “${nomeF(arv.mover.no)}” (na pasta Recebidos) para a pasta ${arv.mover.destino.nome}.`, otimo: 5 });
      t.push({ id: "renomear", texto: `Muda o nome do ficheiro “${nomeF(arv.renomear.no)}” (na pasta Recebidos) para “${arv.renomear.novoNome}”.`, otimo: 4 });
    }
    if (config.extensoes && arv.recente) t.push({ id: "recente", texto: "Na pasta Recebidos, abre o ficheiro mais recente. Podes ordenar por data.", otimo: 3 });
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arv]);
  const [indice, setIndice] = useState(0);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [procura, setProcura] = useState("");
  const [dialogo, setDialogo] = useState<null | "mover" | "renomear">(null);
  const [destino, setDestino] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [ordenarData, setOrdenarData] = useState(false);
  const [aberto, setAberto] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const acoes = useRef(0);
  const resultados = useRef<Resultado[]>([]);
  const tarefa = tarefas[indice];

  const acao = () => (acoes.current += 1);
  function concluir(sucesso: boolean) {
    const pontos = sucesso ? Math.min(1, tarefa.otimo / Math.max(1, acoes.current)) : 0;
    resultados.current.push({ tarefa: tarefa.id, pontos });
    setFeedback(sucesso ? (pontos >= 1 ? "Certo, pelo caminho mais curto." : "Certo.") : "Tarefa passada.");
    window.setTimeout(() => {
      setFeedback(null);
      acoes.current = 0;
      setSelecionado(null);
      setAberto(null);
      setDialogo(null);
      setProcura("");
      setAbertas(new Set());
      if (indice + 1 >= tarefas.length) aoConcluir(resultados.current);
      else setIndice(indice + 1);
    }, 900);
  }

  const todos = useMemo(() => {
    const l: { no: No; caminho: string[] }[] = [];
    const ir = (nos: No[], c: string[]) => nos.forEach((n) => (n.tipo === "pasta" ? ir(n.filhos, [...c, n.nome]) : l.push({ no: n, caminho: c })));
    ir(raiz, []);
    return l;
  }, [raiz]);
  const sel = todos.find((x) => x.no.id === selecionado)?.no ?? null;

  function abrir(n: No) {
    acao();
    setAberto(nomeF(n));
    if (tarefa.id === "abrir" && n.id === arv.alvo.no.id) concluir(true);
    else if (tarefa.id === "recente" && n.id === arv.recente?.no.id) concluir(true);
  }
  function confirmarMover() {
    acao();
    if (!sel || !destino) return;
    setRaiz((r) => {
      const semFicheiro = (nos: No[]): No[] => nos.map((p) => (p.tipo === "pasta" ? { ...p, filhos: semFicheiro(p.filhos.filter((f) => f.id !== sel.id)) } : p));
      const comFicheiro = (nos: No[]): No[] => nos.map((p) => (p.id === destino ? { ...p, filhos: [...p.filhos, sel] } : p.tipo === "pasta" ? { ...p, filhos: comFicheiro(p.filhos) } : p));
      return comFicheiro(semFicheiro(r));
    });
    setDialogo(null);
    if (tarefa.id === "mover" && sel.id === arv.mover?.no.id && destino === arv.mover?.destino.id) concluir(true);
  }
  function confirmarRenomear() {
    acao();
    if (!sel) return;
    const limpo = novoNome.trim().replace(/\.[a-z0-9]+$/i, "");
    setRaiz((r) => {
      const ren = (nos: No[]): No[] => nos.map((p) => (p.id === sel.id ? { ...p, nome: limpo } : p.tipo === "pasta" ? { ...p, filhos: ren(p.filhos) } : p));
      return ren(r);
    });
    setDialogo(null);
    if (tarefa.id === "renomear" && sel.id === arv.renomear?.no.id && limpo === arv.renomear?.novoNome) concluir(true);
  }

  const pastas = useMemo(() => {
    const l: { id: string; nome: string }[] = [];
    const ir = (nos: No[], c: string[]) => nos.forEach((n) => n.tipo === "pasta" && (l.push({ id: n.id, nome: [...c, n.nome].join(" › ") }), ir(n.filhos, [...c, n.nome])));
    ir(raiz, []);
    return l;
  }, [raiz]);

  function linhas(nos: No[], nivel: number): React.ReactNode[] {
    const ordenados = ordenarData ? [...nos].sort((a, b) => (a.tipo !== b.tipo ? (a.tipo === "pasta" ? -1 : 1) : a.data < b.data ? 1 : -1)) : nos;
    return ordenados.flatMap((n) => {
      const aberta = abertas.has(n.id);
      const linha = (
        <li key={n.id} role="treeitem" aria-level={nivel + 1} aria-expanded={n.tipo === "pasta" ? aberta : undefined} aria-selected={n.tipo === "ficheiro" ? selecionado === n.id : undefined}>
          <button
            type="button"
            className="w-full text-left flex items-center gap-2 px-2 rounded"
            style={{ paddingLeft: 8 + nivel * 20, minHeight: 36, background: selecionado === n.id ? "var(--acento-suave)" : "transparent", border: 0, color: "var(--tinta)", font: "inherit", cursor: "pointer" }}
            onClick={() => {
              acao();
              if (n.tipo === "pasta") setAbertas((s) => { const x = new Set(s); if (x.has(n.id)) x.delete(n.id); else x.add(n.id); return x; });
              else setSelecionado(n.id);
            }}
            onDoubleClick={() => n.tipo === "ficheiro" && abrir(n)}
            onKeyDown={(e) => e.key === "Enter" && n.tipo === "ficheiro" && selecionado === n.id && (e.preventDefault(), abrir(n))}
          >
            <span aria-hidden="true">{n.tipo === "pasta" ? (aberta ? "📂" : "📁") : "📄"}</span>
            <span className="flex-1">{n.tipo === "pasta" ? n.nome : nomeF(n)}</span>
            {config.extensoes && n.tipo === "ficheiro" && <span className="text-xs tabular-nums" style={{ color: "var(--suave)" }}>{n.data.split("-").reverse().join("/")}</span>}
          </button>
        </li>
      );
      return n.tipo === "pasta" && aberta ? [linha, ...linhas(n.filhos, nivel + 1)] : [linha];
    });
  }

  const resultadosProcura = procura.trim().length >= 2 ? todos.filter((x) => nomeF(x.no).toLowerCase().includes(procura.trim().toLowerCase())) : [];

  return (
    <div className="grid gap-3">
      <Instrucao numero={indice + 1} total={tarefas.length}>{feedback ?? tarefa.texto}</Instrucao>
      <Janela endereco={endereco}>
        <div className="flex flex-wrap gap-2 items-center p-3 border-b" style={{ borderColor: "var(--linha)", background: "var(--tecla)" }}>
          <Botao variante="contorno" disabled={!sel} onClick={() => sel && abrir(sel)}>Abrir</Botao>
          {config.moverRenomear && (
            <>
              <Botao variante="contorno" disabled={!sel} onClick={() => { acao(); setDestino(""); setDialogo("mover"); }}>Mover para…</Botao>
              <Botao variante="contorno" disabled={!sel} onClick={() => { acao(); setNovoNome(sel?.nome ?? ""); setDialogo("renomear"); }}>Mudar o nome</Botao>
            </>
          )}
          {config.extensoes && (
            <Botao variante="discreto" onClick={() => { acao(); setOrdenarData((v) => !v); }} aria-pressed={ordenarData}>
              {ordenarData ? "Ordenado por data ↓" : "Ordenar por data"}
            </Botao>
          )}
          {config.procurar && (
            <span className="ml-auto flex items-center gap-2">
              <label htmlFor="arq-procura" className="text-sm font-bold">Procurar</label>
              <input id="arq-procura" type="search" value={procura} onFocus={acao} onChange={(e) => setProcura(e.target.value)} className="px-2 py-1 rounded border" style={{ borderColor: "var(--tecla-borda)", minHeight: 36, background: "var(--superficie)", color: "var(--tinta)" }} />
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-[2fr_1fr]">
          <div className="p-2" style={{ minHeight: 280 }}>
            {resultadosProcura.length > 0 ? (
              <ul className="list-none m-0 p-0" aria-label="Resultados da procura">
                {resultadosProcura.map((x) => (
                  <li key={x.no.id}>
                    <button type="button" className="w-full text-left px-2 rounded grid" style={{ minHeight: 40, background: selecionado === x.no.id ? "var(--acento-suave)" : "transparent", border: 0, color: "var(--tinta)", font: "inherit", cursor: "pointer" }} onClick={() => { acao(); setSelecionado(x.no.id); }} onDoubleClick={() => abrir(x.no)}>
                      <span>📄 {nomeF(x.no)}</span>
                      <span className="text-xs" style={{ color: "var(--suave)" }}>{x.caminho.join(" › ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul role="tree" aria-label="Pastas e ficheiros" className="list-none m-0 p-0">{linhas(raiz, 0)}</ul>
            )}
          </div>
          <div className="p-3 border-l text-sm grid gap-2 content-start" style={{ borderColor: "var(--linha)", color: "var(--suave)" }}>
            <strong style={{ color: "var(--tinta)" }}>Detalhes</strong>
            {sel ? (
              <>
                <span>Nome: {nomeF(sel)}</span>
                <span>Data: {sel.data.split("-").reverse().join("/")}</span>
              </>
            ) : (
              <span>Seleciona um ficheiro para ver os detalhes. Para abrir, faz duplo clique ou usa o botão Abrir.</span>
            )}
            {aberto && <span role="status" style={{ color: "var(--tinta)" }}>Aberto: {aberto}</span>}
          </div>
        </div>
        {dialogo && (
          <div className="p-4 border-t grid gap-3" role="dialog" aria-label={dialogo === "mover" ? "Mover ficheiro" : "Mudar o nome"} style={{ borderColor: "var(--linha)", background: "var(--fundo)" }}>
            {dialogo === "mover" ? (
              <div className="campo max-w-md">
                <label htmlFor="arq-destino">Mover “{sel && nomeF(sel)}” para</label>
                <select id="arq-destino" value={destino} onChange={(e) => setDestino(e.target.value)}>
                  <option value="">Escolhe a pasta</option>
                  {pastas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
            ) : (
              <div className="campo max-w-md">
                <label htmlFor="arq-nome">Novo nome</label>
                <input id="arq-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), confirmarRenomear())} autoFocus />
              </div>
            )}
            <div className="flex gap-2">
              <Botao onClick={dialogo === "mover" ? confirmarMover : confirmarRenomear}>Confirmar</Botao>
              <Botao variante="discreto" onClick={() => { acao(); setDialogo(null); }}>Cancelar</Botao>
            </div>
          </div>
        )}
      </Janela>
      <div>
        <Botao variante="discreto" onClick={() => concluir(false)} disabled={!!feedback}>Não consigo, passar à seguinte</Botao>
      </div>
    </div>
  );
}

// ── Ronda 2: separadores ─────────────────────────────────────────────────────
function RondaSeparadores({ config, contexto, aoConcluir }: { config: ConfigArquivo; contexto: "jornal" | "laboratorio"; aoConcluir: (r: Resultado[]) => void }) {
  const [dados] = useState(() => gerarSeparadores(contexto, config.separadores));
  const [seps, setSeps] = useState(dados.separadores);
  const [ativo, setAtivo] = useState(() => dados.separadores.find((s) => s.id !== dados.alvo)!.id);
  const [fase, setFase] = useState<"mudar" | "fechar">("mudar");
  const [feedback, setFeedback] = useState<string | null>(null);
  const acoes = useRef(0);
  const resultados = useRef<Resultado[]>([]);
  const total = config.fecharSeparador ? 2 : 1;

  function concluir(id: string, sucesso: boolean) {
    resultados.current.push({ tarefa: id, pontos: sucesso ? Math.min(1, 1 / Math.max(1, acoes.current)) : 0 });
    acoes.current = 0;
    setFeedback(sucesso ? "Certo." : "Tarefa passada.");
    window.setTimeout(() => {
      setFeedback(null);
      if (id === "separador" && config.fecharSeparador) setFase("fechar");
      else aoConcluir(resultados.current);
    }, 800);
  }
  const atual = seps.find((s) => s.id === ativo) ?? seps[0];
  const texto = fase === "mudar" ? `Precisas de ${dados.pedido}. Muda para o separador onde essa informação está.` : "Agora fecha o separador de publicidade (o botão × no próprio separador).";

  return (
    <div className="grid gap-3">
      <Instrucao numero={fase === "mudar" ? 1 : 2} total={total}>{feedback ?? texto}</Instrucao>
      <ForcarClaro>
        <div className="janela-simulada" role="region" aria-label="Navegador simulado">
          <div className="flex items-end gap-1 px-2 pt-2 flex-wrap" style={{ background: "var(--tecla)" }} role="tablist" aria-label="Separadores do navegador">
            {seps.map((s) => (
              <div key={s.id} role="presentation" className="flex items-center rounded-t-lg" style={{ background: s.id === ativo ? "var(--superficie)" : "transparent", border: "1px solid var(--linha)", borderBottom: s.id === ativo ? "1px solid var(--superficie)" : undefined }}>
                <button type="button" role="tab" aria-selected={s.id === ativo} className="px-3 text-sm" style={{ minHeight: 40, border: 0, background: "transparent", color: "var(--tinta)", font: "inherit", cursor: "pointer", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} onClick={() => { acoes.current++; setAtivo(s.id); if (fase === "mudar" && s.id === dados.alvo) concluir("separador", true); }}>
                  {s.titulo}
                </button>
                <button type="button" aria-label={`Fechar separador ${s.titulo}`} className="px-2" style={{ minHeight: 40, minWidth: 32, border: 0, background: "transparent", color: "var(--suave)", cursor: "pointer" }} onClick={() => {
                  acoes.current++;
                  if (seps.length <= 1) return;
                  const resto = seps.filter((x) => x.id !== s.id);
                  setSeps(resto);
                  if (ativo === s.id) setAtivo(resto[0].id);
                  if (fase === "fechar" && s.publicidade) concluir("fechar", true);
                  else if (s.id === dados.alvo) concluir(fase === "mudar" ? "separador" : "fechar", false);
                }}>×</button>
              </div>
            ))}
          </div>
          <div className="superficie-clara p-6 grid gap-2" style={{ minHeight: 180 }} role="tabpanel">
            <h3 className="text-xl">{atual.titulo}</h3>
            <p className="m-0">{atual.conteudo}</p>
          </div>
        </div>
      </ForcarClaro>
      <div>
        <Botao variante="discreto" disabled={!!feedback} onClick={() => concluir(fase === "mudar" ? "separador" : "fechar", false)}>Não consigo, passar à seguinte</Botao>
      </div>
    </div>
  );
}

// ── Ronda 3: histórico (retroceder e avançar) ────────────────────────────────
function RondaHistorico({ config, contexto, aoConcluir }: { config: ConfigArquivo; contexto: "jornal" | "laboratorio"; aoConcluir: (r: Resultado[]) => void }) {
  const [dados] = useState(() => gerarHistorico(contexto, config.historico));
  const [hist, setHist] = useState(dados.paginas.map((p) => p.id));
  const [pos, setPos] = useState(dados.paginas.length - 1);
  const [fase, setFase] = useState<"atras" | "frente">("atras");
  const [feedback, setFeedback] = useState<string | null>(null);
  const acoes = useRef(0);
  const resultados = useRef<Resultado[]>([]);
  const pag = (id: string) => dados.todas.find((p) => p.id === id)!;
  const alvoAtras = dados.paginas[dados.alvoAtras];
  const alvoFrente = dados.paginas[dados.alvoFrente];
  const temFrente = config.avancar && dados.alvoFrente > dados.alvoAtras;
  const total = temFrente ? 2 : 1;

  function verificar(novaPos: number, novoHist: string[]) {
    const atual = novoHist[novaPos];
    if (fase === "atras" && atual === alvoAtras.id) concluir("retroceder", true, dados.paginas.length - 1 - dados.alvoAtras);
    else if (fase === "frente" && atual === alvoFrente.id) concluir("avancar", true, dados.alvoFrente - dados.alvoAtras);
  }
  function concluir(id: string, sucesso: boolean, otimo = 1) {
    resultados.current.push({ tarefa: id, pontos: sucesso ? Math.min(1, otimo / Math.max(1, acoes.current)) : 0 });
    acoes.current = 0;
    setFeedback(sucesso ? "Certo." : "Tarefa passada.");
    window.setTimeout(() => {
      setFeedback(null);
      if (id === "retroceder" && temFrente) setFase("frente");
      else aoConcluir(resultados.current);
    }, 800);
  }
  const visitadas = dados.paginas.map((p) => p.titulo).join(" → ");
  const texto =
    fase === "atras"
      ? `Visitaste estas páginas, por esta ordem: ${visitadas}. Volta à página “${alvoAtras.titulo}” usando o botão Retroceder (←) do navegador.`
      : `Agora avança até à página “${alvoFrente.titulo}” usando o botão Avançar (→).`;
  const atual = pag(hist[pos]);

  return (
    <div className="grid gap-3">
      <Instrucao numero={fase === "atras" ? 1 : 2} total={total}>{feedback ?? texto}</Instrucao>
      <ForcarClaro>
        <div className="janela-simulada" role="region" aria-label="Navegador simulado">
          <div className="janela-barra">
            <button type="button" aria-label="Retroceder" disabled={pos === 0} className="botao botao--contorno" style={{ minHeight: 36, minWidth: 40, padding: "2px 10px" }} onClick={() => { acoes.current++; const n = pos - 1; setPos(n); verificar(n, hist); }}>←</button>
            <button type="button" aria-label="Avançar" disabled={pos >= hist.length - 1} className="botao botao--contorno" style={{ minHeight: 36, minWidth: 40, padding: "2px 10px" }} onClick={() => { acoes.current++; const n = pos + 1; setPos(n); verificar(n, hist); }}>→</button>
            <span className="endereco">https://{contexto === "laboratorio" ? "laboratorio3" : "orecreio"}.escola.pt/{atual.id}</span>
          </div>
          <div className="superficie-clara p-6 grid gap-3" style={{ minHeight: 200 }}>
            <h3 className="text-2xl">{atual.titulo}</h3>
            <p className="m-0">{atual.texto}</p>
            <nav aria-label="Ligações da página" className="flex gap-4 flex-wrap text-sm">
              {dados.todas.filter((p) => p.id !== atual.id).slice(0, 3).map((p) => (
                <a key={p.id} href={`#${p.id}`} onClick={(e) => { e.preventDefault(); acoes.current++; const novo = [...hist.slice(0, pos + 1), p.id]; setHist(novo); setPos(novo.length - 1); verificar(novo.length - 1, novo); }}>{p.titulo}</a>
              ))}
            </nav>
          </div>
        </div>
      </ForcarClaro>
      <div>
        <Botao variante="discreto" disabled={!!feedback} onClick={() => concluir(fase === "atras" ? "retroceder" : "avancar", false)}>Não consigo, passar à seguinte</Botao>
      </div>
    </div>
  );
}

// ── Ronda 4: fim da página ───────────────────────────────────────────────────
function RondaFim({ config, contexto, endereco, aoConcluir }: { config: ConfigArquivo; contexto: "jornal" | "laboratorio"; endereco: string; aoConcluir: (r: Resultado[]) => void }) {
  const [art] = useState(() => gerarArtigo(contexto, config.paragrafos));
  const [escolha, setEscolha] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);
  return (
    <div className="grid gap-3">
      <Instrucao numero={1} total={1}>{feito ? (escolha === art.correta ? "Certo." : `Não. A última palavra era “${art.correta}”.`) : "Qual é a última palavra deste artigo? Desce até ao fim da página para descobrir."}</Instrucao>
      <Janela endereco={endereco}>
        <div style={{ maxHeight: 320, overflowY: "auto" }} tabIndex={0} aria-label="Artigo (área com deslocamento)">
          <div className="px-6 py-3 font-bold" style={{ position: "sticky", top: 0, background: "var(--tecla)", borderBottom: "1px solid var(--linha)", zIndex: 1 }}>
            {contexto === "laboratorio" ? "Caderno de Laboratório · Reunião da equipa" : "O Recreio · Reunião da redação"}
          </div>
          <div className="px-6 py-4 grid gap-3">
            {art.paragrafos.map((p, i) => <p key={i} className="m-0">{p}</p>)}
          </div>
        </div>
      </Janela>
      <fieldset className="cartao p-4 grid gap-1 border-0">
        <legend className="font-bold">A última palavra é:</legend>
        {art.opcoes.map((o) => <BotaoRadio key={o} id={`fim-${o}`} name="fim" rotulo={o} checked={escolha === o} disabled={feito} onChange={() => setEscolha(o)} />)}
      </fieldset>
      <div>
        <Botao disabled={!escolha || feito} onClick={() => { setFeito(true); window.setTimeout(() => aoConcluir([{ tarefa: "fim_pagina", pontos: escolha === art.correta ? 1 : 0 }]), 1000); }}>Responder</Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigArquivo>({
  slug: "arquivo",
  numero: 4,
  dominio: "navegacao",
  titulo: { jornal: "O Arquivo", laboratorio: "Arquivo de Amostras" },
  descricao: "Encontrar ficheiros em pastas, mover e mudar o nome, mudar e fechar separadores, usar o histórico e chegar ao fim de uma página longa.",
  duracao: "3 a 5 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ profundidade: 1, procurar: false, moverRenomear: false, extensoes: false, separadores: 2, fecharSeparador: false, historico: 2, avancar: false, paragrafos: 1 }),
  Componente: ArquivoPratica,
  dica: (m) => {
    if (Number(m.abrir ?? 100) < 70) return "Antes de clicar, lê o caminho completo (por exemplo Fotos › 2026 › Torneio) e abre as pastas por essa ordem. Menos cliques, mais pontos.";
    if (Number(m.retroceder ?? 100) < 70) return "O botão Retroceder (←) volta uma página de cada vez. Conta quantas páginas precisas de recuar antes de clicar.";
    return "Em pastas com muitos ficheiros, ordena por data ou usa a procura em vez de abrir pasta a pasta.";
  },
});

/** Na prática fazemos só a ronda das pastas, para não repetir as outras. */
function ArquivoPratica(p: PropsAtividade<ConfigArquivo>) {
  if (p.modo === "pratica") {
    return <RondaPastas config={p.config} contexto={p.contexto} endereco="arquivo.escola.pt" aoConcluir={() => p.aoTerminar({ pontuacao: 0, duracaoMs: 0, metricas: {} })} />;
  }
  return <Arquivo {...p} />;
}
