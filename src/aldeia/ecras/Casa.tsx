// ─── Aldeia Digital · a minha casa (interior privado, fachada, troféus, treino) ──
// Sala 6 × 6 em canvas; a mobília muda-se por lista (sem arrastar). Só o aluno vê o interior; os colegas veem a fachada.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { LockKeyhole } from "lucide-react";
import { Botao, Seletor } from "../../ui";
import { contexto2d, imagem, manifesto } from "../arte/imagens";
import { prepararAvatar } from "../arte/avatar";
import { urlPixel } from "../arte/pixel";
import { CASA_OPCOES, CASA_POR_CAPITULO, CHAOS, JARDINS, LUGARES_MOVEL, MOVEIS, PAPEIS, TROFEUS, VARIANTES_MOVEL, type CategoriaCasa, type Movel } from "../nucleo/catalogo";
import type { Aparencia, Casa as TCasa, Interior } from "../nucleo/modelo";
import { useAldeia } from "../cliente/estado";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia } from "./comum";
import { nomeMissao } from "./missoes";

const SW = 396;
const SH = 252;
const ORIGEM = manifesto.mundo.interior.origem as number[];
const P = (i: number, j: number, z = 0): [number, number] => [ORIGEM[0] + (i - j) * 32, ORIGEM[1] + (i + j) * 16 - z];
const MOVEIS_ARTE = manifesto.mundo.interior.moveis as Record<string, { pivo_esquina_sul: number[]; pegada: number[] }>;
const PRATELEIRAS = manifesto.mundo.interior.trofeus as number[][];
const MOLDURA = manifesto.mundo.interior.moldura as number[][];
const VITRINE = manifesto.trofeus.vitrine.lugares_nativos as number[][];

/** Troféus pela ordem de arrumação (automática: pela ordem do catálogo). */
export function trofeusArrumados(interior: Interior, ganhos: string[]): string[] {
  const auto = TROFEUS.map((t) => t.id).filter((t) => ganhos.includes(t));
  return (interior.trofeus ?? auto).filter((t) => ganhos.includes(t));
}

function Sala({ interior, aparencia, trofeus, vitrine }: { interior: Interior; aparencia: Aparencia; trofeus: string[]; vitrine: boolean }) {
  const tela = useRef<HTMLCanvasElement>(null);
  const [escala, setEscala] = useState(2);
  const caixa = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = caixa.current;
    if (!c) return;
    const ro = new ResizeObserver(() => setEscala(Math.max(1, Math.min(3, Math.floor(c.clientWidth / SW)))));
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    let vivo = true;
    (async () => {
      const [paredes, chao, montar] = await Promise.all([imagem(`mundo/interior/sala-${interior.papel}`), imagem(`mundo/interior/sala-chao-${interior.chao}`), prepararAvatar(aparencia)]);
      const moveis = await Promise.all(MOVEIS.map(async (m) => ({ m, im: await imagem(`mundo/interior/moveis/movel-${interior.moveis[m]?.variante ?? m}`) })));
      const pequenos = await Promise.all(trofeus.map((t) => imagem(`mundo/interior/trofeus/trofeu-${t}-pequeno`).catch(() => null)));
      const vit = vitrine ? await imagem("mundo/interior/moveis/movel-vitrine") : null;
      const c = tela.current;
      if (!vivo || !c) return;
      const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
      c.width = SW * escala * dpr;
      c.height = SH * escala * dpr;
      const ctx = contexto2d(c);
      ctx.setTransform(escala * dpr, 0, 0, escala * dpr, 0, 0);
      ctx.drawImage(paredes, 0, 0);
      // o chão da outra sala por cima, recortado ao losango do chão
      ctx.save();
      ctx.beginPath();
      [P(0, 0), P(6, 0), P(6, 6), P(0, 6)].forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(chao, 0, 0);
      ctx.restore();
      // moldura com o Jornal da Aldeia
      if (interior.moldura) {
        ctx.fillStyle = "#fdf8ec";
        ctx.beginPath();
        MOLDURA.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#8a93a8";
        for (let k = 1; k <= 3; k++) {
          const t = k / 4.5;
          const [a, b, c2, d2] = MOLDURA;
          ctx.beginPath();
          ctx.moveTo(a[0] + (d2[0] - a[0]) * t + 3, a[1] + (d2[1] - a[1]) * t + 3);
          ctx.lineTo(b[0] + (c2[0] - b[0]) * t - 3, b[1] + (c2[1] - b[1]) * t - 3 + 3);
          ctx.stroke();
        }
      }
      // troféus nas prateleiras (18 lugares)
      pequenos.slice(0, 18).forEach((im, k) => im && ctx.drawImage(im, Math.round(PRATELEIRAS[k][0] - 5), Math.round(PRATELEIRAS[k][1] - 12)));
      // mobília e avatar por profundidade
      const objs: { prof: number; f: () => void }[] = [];
      for (const { m, im } of moveis) {
        const arte = MOVEIS_ARTE[m];
        const lugar = LUGARES_MOVEL[m].find((l) => l.id === interior.moveis[m]?.lugar) ?? LUGARES_MOVEL[m][0];
        const [x, y] = P(lugar.i + arte.pegada[0], lugar.j + arte.pegada[1]);
        objs.push({ prof: lugar.i + arte.pegada[0] + lugar.j + arte.pegada[1] - (m === "tapete" ? 10 : 0), f: () => ctx.drawImage(im, Math.round(x - arte.pivo_esquina_sul[0]), Math.round(y - arte.pivo_esquina_sul[1])) });
      }
      if (vit) {
        const [vx, vy] = P(6, 4.6);
        objs.push({ prof: 10.6, f: () => {
          const ox = Math.round(vx - 50);
          const oy = Math.round(vy - 78);
          ctx.drawImage(vit, ox, oy);
          pequenos.slice(18, 30).forEach((im, k) => im && VITRINE[k] && ctx.drawImage(im, Math.round(ox + VITRINE[k][0] - 5), Math.round(oy + VITRINE[k][1] - 12)));
        } });
      }
      const [ax, ay] = P(3.4, 3.4);
      objs.push({ prof: 6.8, f: () => ctx.drawImage(montar("acenar", "se", 3), Math.round(ax - 22), Math.round(ay - 60)) });
      objs.sort((a, b) => a.prof - b.prof).forEach((o) => o.f());
    })();
    return () => {
      vivo = false;
    };
  }, [interior, aparencia, trofeus, vitrine, escala]);
  return (
    <div ref={caixa} className="aldeia-sala">
      <canvas ref={tela} role="img" aria-label={`${ALDEIA.interface.casa.titulo}. ${trofeus.length} ${ALDEIA.interface.casa.trofeus.toLowerCase()}.`} style={{ width: SW * escala, height: SH * escala, imageRendering: "pixelated" }} />
    </div>
  );
}

type Sep = "mobilia" | "paredes" | "chao" | "fachada" | "trofeus" | "treinar";

export function Casa() {
  const { vista, d, missoes, enviar, codigo } = useAldeia();
  const T = ALDEIA.interface.casa;
  const [interior, setInterior] = useState<Interior>(vista.aluno.interior);
  const [casa, setCasa] = useState<TCasa>(vista.aluno.casa);
  const [sep, setSep] = useState<Sep>("mobilia");
  const [aviso, setAviso] = useState("");
  const ganhos = d.trofeus;
  const arrumados = useMemo(() => trofeusArrumados(interior, ganhos), [interior, ganhos]);
  const pode = (c: CategoriaCasa) => d.casa.includes(c);
  const capituloDe = (c: CategoriaCasa) => Number(Object.entries(CASA_POR_CAPITULO).find(([, x]) => x === c)?.[0] ?? 0);
  const bloqueio = (c: CategoriaCasa) => (pode(c) ? null : (
    <p className="m-0 text-sm inline-flex items-center gap-1" style={{ color: "var(--suave)" }}><LockKeyhole size={14} aria-hidden="true" /> {T.bloqueado.replace("{capitulo}", String(capituloDe(c)))}</p>
  ));
  const mudou = JSON.stringify(interior) !== JSON.stringify(vista.aluno.interior) || JSON.stringify(casa) !== JSON.stringify(vista.aluno.casa);
  async function guardar() {
    const ops = [];
    if (JSON.stringify(interior) !== JSON.stringify(vista.aluno.interior)) ops.push({ op: "interior" as const, valor: interior });
    if (JSON.stringify(casa) !== JSON.stringify(vista.aluno.casa)) ops.push({ op: "casa" as const, valor: casa });
    if (ops.length) await enviar(ops);
    setAviso(T.guardado);
  }
  const mover = (m: Movel, lugar: string) => setInterior((x) => ({ ...x, moveis: { ...x.moveis, [m]: { ...x.moveis[m], lugar } } }));
  const SEPS: [Sep, string][] = [["mobilia", T.mobilia], ["paredes", T.paredes], ["chao", T.chao], ["fachada", T.fachada], ["trofeus", T.trofeus], ["treinar", T.treinar]];
  const feitas = missoes.filter((m) => m.tipo === "atividade" && vista.aluno.progresso[m.id]);
  const nomeCor = (c: string) => (ALDEIA.interface.coresCasa as Record<string, string>)[c] ?? c;
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
        <section className="cartao p-3 grid justify-items-center aldeia-vitrine">
          <Sala interior={interior} aparencia={vista.aluno.aparencia} trofeus={arrumados} vitrine={pode("vitrine")} />
        </section>
        <section className="cartao p-4 grid gap-3">
          <h1 className="text-2xl">{T.titulo}</h1>
          <div>
            <strong>{T.trofeus}</strong> {T.trofeusN.replace("{n}", String(ganhos.length)).replace("{total}", String(TROFEUS.length))}
          </div>
          <div role="tablist" aria-label={T.titulo} className="flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--linha)" }}>
            {SEPS.map(([s, r]) => (
              <button key={s} role="tab" aria-selected={sep === s} className="separador" onClick={() => setSep(s)}>
                {r}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="grid gap-2">
            {sep === "mobilia" && (
              <>
                <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{T.ajuda}</p>
                {MOVEIS.map((m) => {
                  const atual = interior.moveis[m]?.lugar ?? LUGARES_MOVEL[m][0].id;
                  const k = LUGARES_MOVEL[m].findIndex((l) => l.id === atual);
                  const prox = LUGARES_MOVEL[m][(k + 1) % LUGARES_MOVEL[m].length];
                  return (
                    <div key={m} className="cartao p-3 flex items-center gap-3 flex-wrap">
                      <div className="grid min-w-0 flex-1">
                        <strong>{(T.moveis as Record<string, string>)[m]}</strong>
                        <span className="text-sm" style={{ color: "var(--suave)" }}>{(T.lugares as Record<string, string>)[atual] ?? atual}</span>
                      </div>
                      {VARIANTES_MOVEL[m] && (
                        <Seletor id={`var-${m}`} rotulo={T.corMovel} value={interior.moveis[m]?.variante ?? m} opcoes={VARIANTES_MOVEL[m].map((v) => ({ valor: v, texto: (T.variantes as Record<string, string>)[v] ?? v }))} onChange={(e) => setInterior((x) => ({ ...x, moveis: { ...x.moveis, [m]: { lugar: atual, variante: e.target.value === m ? undefined : e.target.value } } }))} />
                      )}
                      <Botao variante="contorno" onClick={() => mover(m, prox.id)} aria-label={`${T.mudar}: ${(T.moveis as Record<string, string>)[m]}, para ${(T.lugares as Record<string, string>)[prox.id]}`}>
                        {T.mudar}
                      </Botao>
                    </div>
                  );
                })}
              </>
            )}
            {sep === "paredes" && (
              <>
                {bloqueio("papel")}
                <Escolhas valores={[...PAPEIS]} valor={interior.papel} rotulo={(v) => (T.papeis as Record<string, string>)[v]} desligado={!pode("papel")} aoMudar={(v) => setInterior((x) => ({ ...x, papel: v }))} legenda={T.paredes} />
              </>
            )}
            {sep === "chao" && (
              <>
                {bloqueio("chao")}
                <Escolhas valores={[...CHAOS]} valor={interior.chao} rotulo={(v) => (T.chaos as Record<string, string>)[v]} desligado={!pode("chao")} aoMudar={(v) => setInterior((x) => ({ ...x, chao: v }))} legenda={T.chao} />
              </>
            )}
            {sep === "fachada" && (
              <div className="grid gap-3">
                <Fachada casa={casa} />
                {bloqueio("paredes")}
                <Escolhas legenda={T.paredesCasa} valores={CASA_OPCOES.paredes} valor={casa.paredes} rotulo={nomeCor} desligado={!pode("paredes")} aoMudar={(v) => setCasa((c) => ({ ...c, paredes: v }))} />
                {bloqueio("portas")}
                <Escolhas legenda={T.porta} valores={CASA_OPCOES.portas} valor={casa.porta} rotulo={nomeCor} desligado={!pode("portas")} aoMudar={(v) => setCasa((c) => ({ ...c, porta: v }))} />
                {bloqueio("telhados")}
                <Escolhas legenda={T.telhado} valores={CASA_OPCOES.telhados} valor={casa.telhado} rotulo={nomeCor} desligado={!pode("telhados")} aoMudar={(v) => setCasa((c) => ({ ...c, telhado: v }))} />
                {bloqueio("jardim")}
                <Escolhas legenda={T.jardim} valores={["", ...JARDINS]} valor={casa.jardim ?? ""} rotulo={(v) => (v ? (T.jardins as Record<string, string>)[v] : T.semJardim)} desligado={!pode("jardim")} aoMudar={(v) => setCasa((c) => ({ ...c, jardim: v || null }))} />
              </div>
            )}
            {sep === "trofeus" && (
              <ul className="m-0 p-0 list-none grid gap-2 sm:grid-cols-2">
                {TROFEUS.map((t) => {
                  const tem = ganhos.includes(t.id);
                  return (
                    <li key={t.id} className="cartao p-2 flex items-center gap-3" style={{ opacity: tem ? 1 : 0.7 }}>
                      <img src={urlPixel(`mundo/interior/trofeus/trofeu-${t.id}`)} alt="" width={40} height={52} style={{ imageRendering: "pixelated", filter: tem ? undefined : "grayscale(1) opacity(.5)" }} />
                      <span className="grid text-sm">
                        <strong>{nomeTrofeu(t.id, t.nome)}</strong>
                        <span style={{ color: "var(--suave)" }}>{tem ? "✓" : <LockKeyhole size={12} aria-label="Por ganhar" />} {regraTrofeu(t.id, t.regra)}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {sep === "treinar" && (
              <div className="grid gap-2">
                <p className="m-0 text-sm">{T.treinarTexto}</p>
                {feitas.map((m) => (
                  <Link key={m.id} to={`/aldeia/${codigo}/treinar/${m.id}`} className="botao botao--contorno" style={{ justifyContent: "flex-start" }}>
                    {nomeMissao(m.id)} · {vista.aluno.progresso[m.id].melhor}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <Botao disabled={!mudou} onClick={() => void guardar()}>{T.guardar}</Botao>
            <Link to={`/aldeia/${codigo}`} className="botao botao--contorno">{T.sair}</Link>
            <span role="status" className="text-sm">{aviso}</span>
          </div>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{ALDEIA.interface.mapa.privada}</p>
        </section>
      </main>
    </div>
  );
}

function nomeTrofeu(id: string, nome: string): string {
  const P = ALDEIA.premios.trofeus;
  if (id.startsWith("taca-")) return P.taca.replace("{emblema}", ALDEIA.premios.emblemas[id.slice(5)] ?? id);
  if (id.startsWith("estatueta-cap-")) {
    const n = id.slice(14);
    return P.estatueta.replace("{n}", n).replace("{titulo}", (ALDEIA.capitulos as Record<string, { titulo: string }>)[`c${n}`]?.titulo ?? "");
  }
  if (id.startsWith("roseta-")) return P.roseta.replace("{dimensao}", ALDEIA.dimensoes[id.slice(7)] ?? id);
  return P.especiais[id] ?? nome;
}
function regraTrofeu(id: string, regra: string): string {
  const P = ALDEIA.premios.trofeus;
  if (id.startsWith("taca-")) return P.tacaRegra;
  if (id.startsWith("estatueta-")) return P.estatuetaRegra;
  if (id.startsWith("roseta-")) return P.rosetaRegra;
  return P.regrasEspeciais[id] ?? regra;
}

function Escolhas({ legenda, valores, valor, rotulo, aoMudar, desligado }: { legenda: string; valores: string[]; valor: string; rotulo: (v: string) => string; aoMudar: (v: string) => void; desligado?: boolean }) {
  return (
    <fieldset className="border-0 p-0 m-0 grid gap-2" disabled={desligado}>
      <legend className="font-bold">{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {valores.map((v) => (
          <label key={v} className={`aldeia-chip ${valor === v ? "aldeia-escolha--ativa" : ""}`} style={{ opacity: desligado ? 0.6 : 1 }}>
            <input type="radio" className="sr-only" name={legenda} checked={valor === v} onChange={() => aoMudar(v)} />
            {rotulo(v)}
            {valor === v && <span aria-hidden="true">✓</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Fachada({ casa }: { casa: TCasa }) {
  return (
    <div className="aldeia-fachada" aria-hidden="true">
      {[`mundo/casa/casa-paredes-${casa.paredes}`, `mundo/casa/casa-porta-${casa.porta}`, `mundo/casa/casa-telhado-${casa.telhado}`].map((c) => (
        <img key={c} src={urlPixel(c)} alt="" width={148 * 2} height={142 * 2} style={{ imageRendering: "pixelated", position: "absolute", inset: 0 }} />
      ))}
    </div>
  );
}

