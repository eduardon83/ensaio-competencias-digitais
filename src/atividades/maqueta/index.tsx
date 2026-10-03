// ─── Atividade 12 · A Maqueta / O Modelo da Estufa (manipulação 3D) ──────────
// Uma maqueta 3D desarrumada: rodar e aproximar a câmara, mover, rodar, colar, separar, dividir, apagar e criar
// objetos, e ver de cima ou em projeção ortográfica. Tudo funciona com rato, toque ou teclado (atalhos), e a
// lista de objetos permite fazer tudo sem usar a cena 3D. As posições mudam em cada tentativa.
// Pontuação: 90 % tarefas cumpridas + 10 % uso de atalhos de teclado (3 atalhos diferentes = máximo).
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, Instrucao, useTemporizador } from "../../motor/util";
import { Botao } from "../../ui";
import {
  apagar, aproximar, CAMARA_INICIAL, colar, conjunto, criarCubo, criarMaqueta, deslocar, dividir, encaixar, mover, moverPara, orbitar, ordemTarefas, rodar, separar, SINAIS_INICIAIS, sinaisDaCamara, TAREFAS, textoTarefa, verificar, VISTAS,
  type Camara, type ConfigMaqueta, type Ferramenta, type IdTarefa, type Maqueta, type Sinais, type Vista,
} from "./modelo";

const Cena = lazy(() => import("./Cena"));

const BASE: Ferramenta[] = ["selecionar", "mover", "orbita", "deslocar", "criar", "apagar", "desfazer"];
const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigMaqueta> = {
  1: { tarefas: ["orbita", "aproximar", "telhado", "apagar", "criar"], ferramentas: BASE, ortografica: false, segundos: 360, aleatorio: false, caixoteColado: false },
  2: { tarefas: ["orbita", "aproximar", "telhado", "colar", "separar", "apagar", "criar", "topo"], ferramentas: [...BASE, "rodar", "colar", "separar"], ortografica: false, segundos: 360, aleatorio: false, caixoteColado: true },
  3: { tarefas: ["orbita", "aproximar", "telhado", "colar", "rodar", "dividir", "separar", "apagar", "criar", "topo"], ferramentas: [...BASE, "rodar", "colar", "separar", "dividir"], ortografica: false, segundos: 360, aleatorio: true, caixoteColado: true },
  4: { tarefas: ["orbita", "aproximar", "telhado", "colar", "rodar", "dividir", "separar", "apagar", "criar", "topo", "orto"], ferramentas: [...BASE, "rodar", "colar", "separar", "dividir"], ortografica: true, segundos: 360, aleatorio: true, caixoteColado: true },
  5: { tarefas: ["orbita", "aproximar", "telhado", "colar", "rodar", "dividir", "separar", "apagar", "criar", "topo", "orto"], ferramentas: [...BASE, "rodar", "colar", "separar", "dividir"], ortografica: true, segundos: 270, aleatorio: true, caixoteColado: true },
};

const FERR: Record<Ferramenta, { nome: string; tecla: string }> = {
  selecionar: { nome: "Selecionar", tecla: "V" },
  mover: { nome: "Mover", tecla: "G" },
  rodar: { nome: "Rodar", tecla: "R" },
  orbita: { nome: "Órbita", tecla: "O" },
  deslocar: { nome: "Deslocar", tecla: "H" },
  criar: { nome: "+ Criar", tecla: "N" },
  colar: { nome: "Colar", tecla: "J" },
  separar: { nome: "Separar", tecla: "P" },
  dividir: { nome: "Dividir", tecla: "K" },
  apagar: { nome: "Apagar", tecla: "Del" },
  desfazer: { nome: "Desfazer", tecla: "Ctrl+Z" },
};
const MODOS: Ferramenta[] = ["selecionar", "mover", "orbita", "deslocar"]; // ferramentas que ficam ativas
const ORDEM_BARRA: Ferramenta[] = ["selecionar", "mover", "rodar", "orbita", "deslocar", "criar", "colar", "separar", "dividir", "apagar", "desfazer"];

function Maquete({ config, modo, extensaoTempo, aoTerminar }: PropsAtividade<ConfigMaqueta>) {
  const cfg = useMemo<ConfigMaqueta>(() => (modo === "pratica" ? { ...config, tarefas: ["criar", "aproximar"], segundos: 120 } : config), [config, modo]);
  const [tarefas] = useState<IdTarefa[]>(() => ordemTarefas(cfg));
  const [hist, setHist] = useState<Maqueta[]>(() => [criarMaqueta(cfg)]);
  const [m, setM] = useState<Maqueta>(hist[0]);
  const [cam, setCam] = useState<Camara>(CAMARA_INICIAL);
  const [sel, setSel] = useState<string[]>([]);
  const [ferr, setFerr] = useState<Ferramenta>("selecionar");
  const [sinais, setSinais] = useState<Sinais>(SINAIS_INICIAIS);
  const [estado, setEstado] = useState("Maqueta pronta.");
  const [feitas, setFeitas] = useState<Set<IdTarefa>>(new Set());
  const atalhos = useRef(new Set<string>());
  const terminou = useRef(false);
  const total = cfg.segundos * 1000 * extensaoTempo;

  // Estado das tarefas: ficam cumpridas quando alcançadas (desfazer depois não as tira, exceto as do modelo).
  useEffect(() => {
    setFeitas((f) => {
      const n = new Set<IdTarefa>();
      for (const t of tarefas) if (verificar(t, m, sinais) || (["orbita", "aproximar", "topo", "orto"].includes(t) && f.has(t))) n.add(t);
      return n;
    });
  }, [m, sinais, tarefas]);

  const terminar = useCallback(() => {
    if (terminou.current) return;
    terminou.current = true;
    const ok = tarefas.filter((t) => verificar(t, m, sinais) || feitas.has(t));
    const nAtalhos = atalhos.current.size;
    const linhas: LinhaRelatorio[] = tarefas.map((t) => ({ tarefa: textoTarefa(t, m), resultado: ok.includes(t) ? "certo" : "errado", feedback: ok.includes(t) ? undefined : TAREFAS[t].como }));
    linhas.push({ tarefa: "Atalhos de teclado", resultado: nAtalhos >= 3 ? "certo" : nAtalhos > 0 ? "parcial" : "errado", resposta: nAtalhos ? [...atalhos.current].join(", ") : "nenhum", certa: "pelo menos 3 atalhos diferentes", feedback: nAtalhos >= 3 ? undefined : "Experimenta as letras dos botões: G move, R roda, O orbita, N cria, Del apaga, Ctrl+Z desfaz." });
    aoTerminar({
      pontuacao: limitar(90 * (ok.length / tarefas.length) + 10 * Math.min(1, nAtalhos / 3)),
      duracaoMs: performance.now() - inicio.current,
      metricas: { tarefas: tarefas.length, cumpridas: ok.length, atalhos: nAtalhos, desfazer: hist.length },
      relatorio: linhas,
    });
  }, [tarefas, m, sinais, feitas, aoTerminar, hist.length]);
  const inicio = useRef(performance.now());
  const { restanteMs } = useTemporizador(true, total, terminar);

  // ── Alterações ao modelo (com histórico para desfazer)
  const aplicar = (novo: Maqueta, msg: string, guardar = true) => {
    const comEncaixe = encaixar(novo);
    setM(comEncaixe);
    if (guardar) setHist((h) => [...h.slice(-40), comEncaixe]);
    setEstado(msg);
  };
  const nomesSel = () => m.objetos.filter((o) => sel.includes(o.id)).map((o) => o.nome).join(", ");
  const precisaSel = () => {
    if (sel.length) return false;
    setEstado("Primeiro escolhe um objeto (na maqueta ou na lista de objetos).");
    return true;
  };
  const selecionar = (id: string | null, juntar: boolean) => {
    if (!id) {
      setSel([]);
      setEstado("Nada selecionado.");
      return;
    }
    const o = m.objetos.find((k) => k.id === id);
    if (!o || o.fixo) {
      setSel([]);
      setEstado(o ? `${o.nome}: não se pode mexer.` : "Nada selecionado.");
      return;
    }
    const ids = conjunto(m, [id]);
    const novo = juntar ? [...new Set([...sel, ...ids])] : ids;
    setSel(novo);
    setEstado(`Selecionado: ${m.objetos.filter((k) => novo.includes(k.id)).map((k) => k.nome).join(", ")}${ids.length > 1 ? " (colados)" : ""}.`);
  };
  const mudarCamara = (c: Camara, msg?: string) => {
    setCam(c);
    setSinais((s) => sinaisDaCamara(c, s));
    if (msg) setEstado(msg);
  };

  const acao = (f: Ferramenta) => {
    if (MODOS.includes(f)) {
      setFerr(f);
      setEstado(`Ferramenta: ${FERR[f].nome}.${f === "mover" ? " Arrasta um objeto ou usa as setas." : f === "orbita" ? " Arrasta na maqueta ou usa as setas." : f === "deslocar" ? " Arrasta para deslocar a vista." : ""}`);
      return;
    }
    if (f === "criar") return aplicar(criarCubo(m), "Cubo novo criado.");
    if (f === "desfazer") {
      if (hist.length < 2) return setEstado("Não há nada para desfazer.");
      const h = hist.slice(0, -1);
      setHist(h);
      setM(h[h.length - 1]);
      setSel((s) => s.filter((id) => h[h.length - 1].objetos.some((o) => o.id === id)));
      return setEstado("Desfeito.");
    }
    if (precisaSel()) return;
    if (f === "rodar") return aplicar(rodar(m, sel, 90), `${nomesSel()}: rodado 90 graus.`);
    if (f === "colar") {
      if (conjunto(m, sel).length < 2) return setEstado("Para colar, seleciona dois objetos (Shift + clique).");
      return aplicar(colar(m, sel), `Colados: ${nomesSel()}.`);
    }
    if (f === "separar") {
      if (!m.objetos.some((o) => sel.includes(o.id) && o.grupo)) return setEstado("Estes objetos não estão colados.");
      const n = separar(m, sel);
      setSel([]);
      return aplicar(n, "Separados. Escolhe agora o objeto que queres.");
    }
    if (f === "dividir") {
      if (sel.length !== 1) return setEstado("Para dividir, seleciona só um objeto (separa-o primeiro, se estiver colado).");
      const n = dividir(m, sel[0]);
      if (n === m) return setEstado("Este objeto não se pode dividir.");
      setSel([]);
      return aplicar(n, "Dividido em duas partes.");
    }
    if (f === "apagar") {
      const n = apagar(m, sel);
      const msg = `Apagado: ${nomesSel()}.`;
      setSel([]);
      return aplicar(n, msg);
    }
  };

  const vista = (v: Vista) => mudarCamara({ ...cam, ...VISTAS[v] }, `Vista: ${v === "3d" ? "3D" : v}.`);
  const enquadrar = () => {
    const alvo = m.objetos.filter((o) => (sel.length ? sel.includes(o.id) : !o.fixo));
    if (!alvo.length) return;
    const cx = alvo.reduce((s, o) => s + o.pos.x, 0) / alvo.length;
    const cz = alvo.reduce((s, o) => s + o.pos.z, 0) / alvo.length;
    const ext = Math.max(...alvo.map((o) => Math.max(Math.abs(o.pos.x - cx), Math.abs(o.pos.z - cz)) + Math.max(o.tam.x, o.tam.z)));
    mudarCamara({ ...cam, alvo: { x: cx, y: 0.5, z: cz }, dist: Math.max(5, Math.min(24, ext * 2.6)) }, "Enquadrado.");
  };

  // ── Teclado
  const ref = useRef({ acao, vista, enquadrar, mudarCamara, cam, sel, ferr, m, aplicar });
  ref.current = { acao, vista, enquadrar, mudarCamara, cam, sel, ferr, m, aplicar };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, select, [contenteditable]")) return;
      const r = ref.current;
      const usar = (nome: string, f: () => void) => {
        e.preventDefault();
        atalhos.current.add(nome);
        f();
      };
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "z") return usar("Ctrl+Z", () => r.acao("desfazer"));
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const porTecla: Record<string, Ferramenta> = { v: "selecionar", g: "mover", r: "rodar", o: "orbita", h: "deslocar", n: "criar", j: "colar", p: "separar", k: "dividir", delete: "apagar" };
      if (porTecla[k] && cfg.ferramentas.includes(porTecla[k])) return usar(FERR[porTecla[k]].tecla, () => r.acao(porTecla[k]));
      if (k === "0") return usar("0", () => r.vista("3d"));
      if (k === "1") return usar("1", () => r.vista("frente"));
      if (k === "3") return usar("3", () => r.vista("lado"));
      if (k === "7") return usar("7", () => r.vista("topo"));
      if (k === "5" && cfg.ortografica) return usar("5", () => r.mudarCamara({ ...r.cam, orto: !r.cam.orto }, `Projeção ${!r.cam.orto ? "ortográfica" : "em perspetiva"}.`));
      if (k === "f") return usar("F", () => r.enquadrar());
      if (k === "+" || k === "=") return usar("+", () => r.mudarCamara(aproximar(r.cam, 0.85), "Câmara mais perto."));
      if (k === "-") return usar("-", () => r.mudarCamara(aproximar(r.cam, 1.15), "Câmara mais longe."));
      if (k.startsWith("arrow") && document.activeElement?.closest(".maqueta")) {
        const [dx, dz] = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[k] ?? [0, 0];
        if ((r.ferr === "mover" || r.ferr === "selecionar") && r.sel.length) {
          // Setas movem no sentido do ecrã: rodar o vetor pelo azimute da câmara e arredondar a um eixo.
          const a = (Math.round(r.cam.az / 90) * 90 * Math.PI) / 180;
          const mx = Math.round(dx * Math.cos(a) + dz * Math.sin(a));
          const mz = Math.round(-dx * Math.sin(a) + dz * Math.cos(a));
          return usar("setas", () => r.aplicar(mover(r.m, r.sel, mx * 0.5, mz * 0.5), "Movido."));
        }
        if (r.ferr === "deslocar") return usar("setas", () => r.mudarCamara(deslocar(r.cam, dx, dz)));
        return usar("setas", () => r.mudarCamara(orbitar(r.cam, dx * -15, dz * -10)));
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [cfg]);

  const contagem = (o: Maqueta["objetos"][number]) => (o.fixo ? "fixo" : o.grupo ? `colado (${m.objetos.filter((k) => k.grupo === o.grupo).length})` : `${o.rot}°`);
  const disponivel = (f: Ferramenta) => cfg.ferramentas.includes(f);

  return (
    <div className="grid gap-3 maqueta">
      <Instrucao>
        Faz as tarefas pela ordem que quiseres. Rato, toque ou teclado: todos funcionam. Erraste? Ctrl + Z desfaz. Também podes fazer tudo só com a lista de objetos e os botões.
      </Instrucao>
      <BarraTempo restanteMs={restanteMs ?? total} totalMs={total} />
      <div className="grid gap-4 xl:grid-cols-[1fr_20rem] items-start">
        <div className="grid gap-3">
          <div role="toolbar" aria-label="Ferramentas" className="flex gap-2 flex-wrap">
            {ORDEM_BARRA.filter(disponivel).map((f) => (
              <button
                key={f}
                type="button"
                className={`botao ${MODOS.includes(f) ? (ferr === f ? "" : "botao--contorno") : f === "criar" ? "" : "botao--contorno"}`}
                style={{ minHeight: 40, padding: "4px 12px", ...(f === "apagar" ? { color: "var(--errado)", borderColor: "var(--errado)" } : {}) }}
                aria-pressed={MODOS.includes(f) ? ferr === f : undefined}
                onClick={() => acao(f)}
              >
                {FERR[f].nome} <kbd className="tecla" style={{ marginLeft: 4 }}>{FERR[f].tecla}</kbd>
              </button>
            ))}
          </div>
          <div className="maqueta-palco cartao" style={{ padding: 0, overflow: "hidden" }}>
            <Suspense fallback={<div className="p-6">A preparar a maqueta 3D…</div>}>
              <Cena
                maqueta={m}
                camara={cam}
                selecionados={sel}
                ferramenta={ferr}
                aoSelecionar={selecionar}
                aoArrastar={(id, x, z, fim) => aplicar(moverPara(m, sel.includes(id) ? sel : conjunto(m, [id]), id, x, z), fim ? "Movido." : "A mover…", fim)}
                aoCamara={(c, fim) => mudarCamara(c, fim ? "Câmara mudou." : undefined)}
              />
            </Suspense>
            <div className="maqueta-etiquetas" aria-hidden="true">
              <span className="etiqueta">{cam.orto ? "Ortográfica" : "Perspetiva"}</span>
              <span className="etiqueta">{FERR[ferr].nome}</span>
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <p className="m-0 flex-1" aria-live="polite">
              <strong>Estado:</strong> {estado}
            </p>
            <Botao variante="contorno" onClick={terminar}>
              Terminar atividade
            </Botao>
          </div>
        </div>

        <div className="grid gap-3">
          <section className="cartao p-4 grid gap-2" aria-labelledby="mq-tarefas">
            <h3 id="mq-tarefas" className="text-lg">
              Tarefas · {feitas.size} de {tarefas.length}
            </h3>
            <ul className="m-0 p-0 list-none grid gap-2">
              {tarefas.map((t) => (
                <li key={t} className="flex gap-2 items-start">
                  <span aria-hidden="true" className="grid place-items-center rounded-full" style={{ width: 22, height: 22, flex: "none", border: "2px solid var(--tecla-borda)", background: feitas.has(t) ? "var(--certo)" : "transparent", color: "#fff", fontSize: 13 }}>
                    {feitas.has(t) ? "✓" : ""}
                  </span>
                  <span style={feitas.has(t) ? { textDecoration: "line-through", color: "var(--suave)" } : undefined}>
                    {textoTarefa(t, m)}
                    <span className="sr-only">{feitas.has(t) ? " (feita)" : " (por fazer)"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="cartao p-4 grid gap-2 maqueta-camara" aria-labelledby="mq-camara">
            <h3 id="mq-camara" className="text-lg">Câmara</h3>
            <div className="grid grid-cols-4 gap-1">
              {(["3d", "frente", "lado", "topo"] as Vista[]).map((v, i) => (
                <button key={v} type="button" className="botao botao--contorno" style={{ minHeight: 40, padding: "2px 4px", flexDirection: "column", lineHeight: 1.1 }} onClick={() => vista(v)}>
                  {v === "3d" ? "3D" : v[0].toUpperCase() + v.slice(1)}
                  <kbd className="text-xs" style={{ fontFamily: "var(--fonte-mono)" }}>{["0", "1", "3", "7"][i]}</kbd>
                </button>
              ))}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: "1fr 1.6fr 1fr" }}>
              <button type="button" className="botao botao--contorno" aria-label="Rodar a câmara para a esquerda" onClick={() => mudarCamara(orbitar(cam, 45), "Câmara rodada.")}>↺</button>
              <button type="button" className="botao botao--contorno" onClick={enquadrar}>Enquadrar <kbd className="text-xs">F</kbd></button>
              <button type="button" className="botao botao--contorno" aria-label="Rodar a câmara para a direita" onClick={() => mudarCamara(orbitar(cam, -45), "Câmara rodada.")}>↻</button>
              <button type="button" className="botao botao--contorno" aria-label="Aproximar a câmara" onClick={() => mudarCamara(aproximar(cam, 0.85), "Câmara mais perto.")}>+</button>
              <button type="button" className="botao botao--contorno" onClick={() => mudarCamara({ ...cam, el: cam.el >= 75 ? 15 : cam.el + 15 }, "Câmara inclinada.")}>Inclinar</button>
              <button type="button" className="botao botao--contorno" aria-label="Afastar a câmara" onClick={() => mudarCamara(aproximar(cam, 1.15), "Câmara mais longe.")}>−</button>
            </div>
            {cfg.ortografica && (
              <button type="button" className="botao botao--contorno" aria-pressed={cam.orto} onClick={() => mudarCamara({ ...cam, orto: !cam.orto }, `Projeção ${!cam.orto ? "ortográfica" : "em perspetiva"}.`)}>
                Ortográfica (5): {cam.orto ? "ligada" : "desligada"}
              </button>
            )}
          </section>
          <section className="cartao p-4 grid gap-2" aria-labelledby="mq-objetos">
            <h3 id="mq-objetos" className="text-lg">Objetos</h3>
            <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
              Escolhe aqui ou na maqueta. Shift + clique junta à seleção.
            </p>
            <ul className="m-0 p-0 list-none grid gap-1">
              {m.objetos.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="botao botao--contorno w-full"
                    style={{ justifyContent: "space-between", minHeight: 40, padding: "4px 12px", ...(sel.includes(o.id) ? { background: "var(--acento-suave)" } : {}) }}
                    aria-pressed={sel.includes(o.id)}
                    disabled={o.fixo}
                    onClick={(e) => selecionar(o.id, e.shiftKey)}
                  >
                    <span>{o.nome}</span>
                    <span className="text-xs" style={{ fontFamily: "var(--fonte-mono)", color: "var(--suave)" }}>{contagem(o)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {sel.length > 0 && (
              <div className="grid gap-1" role="group" aria-label="Mover o que está selecionado">
                <span className="text-sm font-bold">Mover a seleção</span>
                <div className="grid grid-cols-3 gap-1" style={{ maxWidth: 200 }}>
                  <span />
                  <button type="button" className="botao botao--contorno" aria-label="Mover para trás" onClick={() => aplicar(mover(m, sel, 0, -0.5), "Movido.")}>↑</button>
                  <span />
                  <button type="button" className="botao botao--contorno" aria-label="Mover para a esquerda" onClick={() => aplicar(mover(m, sel, -0.5, 0), "Movido.")}>←</button>
                  <button type="button" className="botao botao--contorno" aria-label="Mover para a frente" onClick={() => aplicar(mover(m, sel, 0, 0.5), "Movido.")}>↓</button>
                  <button type="button" className="botao botao--contorno" aria-label="Mover para a direita" onClick={() => aplicar(mover(m, sel, 0.5, 0), "Movido.")}>→</button>
                </div>
              </div>
            )}
          </section>
          <details className="cartao p-4">
            <summary className="font-bold">Todos os atalhos</summary>
            <ul className="m-0 pl-5 text-sm grid gap-1 mt-2">
              {ORDEM_BARRA.filter(disponivel).map((f) => (
                <li key={f}>
                  <kbd className="tecla">{FERR[f].tecla}</kbd> {FERR[f].nome.replace("+ ", "")}
                </li>
              ))}
              <li><kbd className="tecla">0</kbd> <kbd className="tecla">1</kbd> <kbd className="tecla">3</kbd> <kbd className="tecla">7</kbd> vistas 3D, frente, lado, topo{cfg.ortografica && <>; <kbd className="tecla">5</kbd> ortográfica</>}</li>
              <li><kbd className="tecla">F</kbd> enquadrar · <kbd className="tecla">+</kbd> <kbd className="tecla">−</kbd> aproximar e afastar</li>
              <li>Setas: mover a seleção (com Mover) ou rodar a câmara</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigMaqueta>({
  slug: "maqueta",
  numero: 12,
  dominio: "tresd",
  titulo: { jornal: "A Maqueta", laboratorio: "O Modelo da Estufa" },
  descricao: "Roda e aproxima a câmara, move, roda, cola, separa, divide, apaga e cria peças numa maqueta 3D.",
  duracao: "4 a 6 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: (c) => c,
  Componente: Maquete,
  dica: (m) => {
    if (Number(m.cumpridas) < Number(m.tarefas)) return "Antes de mexer num objeto, seleciona-o (na maqueta ou na lista). Objetos colados mexem-se juntos: separa-os primeiro para mexer só num.";
    if (Number(m.atalhos) < 3) return "Arrumaste a maqueta, mas sem atalhos. Experimenta G para mover, R para rodar e Ctrl+Z para desfazer.";
    return "Maqueta impecável e com atalhos. Experimenta o nível seguinte.";
  },
});
