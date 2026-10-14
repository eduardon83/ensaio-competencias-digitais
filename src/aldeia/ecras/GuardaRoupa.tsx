// ─── Aldeia Digital · guarda-roupa ───────────────────────────────────────────
// Avatar grande a rodar, categorias em separadores, itens com nome; bloqueados com cadeado e "o que falta".
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { Botao } from "../../ui";
import { Avatar, descricaoAvatar } from "../arte/componentes";
import { urlPixel } from "../arte/pixel";
import { CORES, CORES_POR_ESTRELAS, EMBLEMAS, FESTA, ITENS, OFERTAS, PADROES, PADROES_POR_ESTRELAS, type CategoriaItem } from "../nucleo/catalogo";
import type { Aparencia } from "../nucleo/modelo";
import { nomeVisivel } from "../nucleo/nomes";
import { useAldeia } from "../cliente/estado";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia } from "./comum";
import { nomeMissao } from "./missoes";

type Separador = "padroes" | CategoriaItem | "cores" | "emblemas";
const SEPARADORES: Separador[] = ["chapeu", "oculos", "mochila", "objeto", "calcado", "cores", "padroes", "emblemas", "ver"];

interface Opcao {
  id: string | null;
  nome: string;
  livre: boolean;
  falta?: string;
  amostra?: Partial<Aparencia>;
  imagem?: string;
}

export function GuardaRoupa() {
  const { vista, d, missoes, enviar, codigo } = useAldeia();
  const [a, setA] = useState<Aparencia>(vista.aluno.aparencia);
  const [sep, setSep] = useState<Separador>("chapeu");
  const [aviso, setAviso] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const T = ALDEIA.interface.guardaRoupa;
  const C = ALDEIA.interface.categorias;
  const daTurma = new Set(missoes.map((m) => m.id));

  const faltaItem = (id: string) => {
    if (id === FESTA.item) return T.bloqueado.replace("{o_que}", T.festa);
    const de = Object.entries(OFERTAS).filter(([m, l]) => l.includes(id) && daTurma.has(m)).map(([m]) => nomeMissao(m));
    return T.bloqueado.replace("{o_que}", de.length ? T.premioDe.replace("{missoes}", de.slice(0, 3).join(", ")) : T.festa);
  };

  const opcoes: Opcao[] = useMemo(() => {
    if (sep === "cores") {
      return ["original", ...CORES].map((c) => {
        const e = CORES_POR_ESTRELAS.find(([, x]) => x === c)?.[0];
        return { id: c, nome: (ALDEIA.interface.cores as Record<string, string>)[c] ?? c, livre: d.cores.includes(c), falta: d.cores.includes(c) ? undefined : T.bloqueado.replace("{o_que}", e ? T.estrelas.replace("{n}", String(e)) : T.festa), amostra: { cor: c } };
      });
    }
    if (sep === "padroes") {
      return [{ id: null, nome: T.nada, livre: true, amostra: { padrao: null } }, ...PADROES.map((p) => {
        const e = PADROES_POR_ESTRELAS.find(([, x]) => x === p)?.[0];
        return { id: p, nome: (ALDEIA.interface.padroes as Record<string, string>)[p] ?? p, livre: d.padroes.includes(p), falta: d.padroes.includes(p) ? undefined : T.bloqueado.replace("{o_que}", e ? T.estrelas.replace("{n}", String(e)) : T.festa), amostra: { padrao: p } };
      })];
    }
    if (sep === "emblemas") {
      return [{ id: null, nome: T.nada, livre: true, amostra: { emblema: null } }, ...EMBLEMAS.map((e) => ({ id: e, nome: ALDEIA.premios.emblemas[e] ?? e, livre: d.emblemas.includes(e), falta: d.emblemas.includes(e) ? undefined : T.bloqueado.replace("{o_que}", `85 em ${ALDEIA.premios.emblemas[e] ?? e}`), imagem: `avatares/emblemas/emblema-${e}`, amostra: { emblema: e } }))];
    }
    const cat = sep;
    return [{ id: null, nome: T.nada, livre: true, amostra: { [cat]: null } }, ...ITENS.filter((i) => i.cat === cat).map((i) => ({ id: i.id, nome: ALDEIA.premios.itens[i.id] ?? i.nome, livre: d.itens.includes(i.id), falta: d.itens.includes(i.id) ? undefined : faltaItem(i.id), amostra: { [cat]: i.id } }))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sep, d]);

  const campo: keyof Aparencia = sep === "cores" ? "cor" : sep === "padroes" ? "padrao" : sep === "emblemas" ? "emblema" : sep;
  const mudouAlgo = JSON.stringify(a) !== JSON.stringify(vista.aluno.aparencia);

  function teclaSeparador(e: KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? SEPARADORES.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const k = (n + SEPARADORES.length) % SEPARADORES.length;
    setSep(SEPARADORES[k]);
    tabs.current[k]?.focus();
  }

  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
        <h1 className="sr-only">{T.titulo}</h1>
        <section className="cartao p-5 grid justify-items-center gap-2 text-center aldeia-vitrine lg:sticky lg:top-4">
          <Avatar aparencia={a} anim="vestir" escala={4} />
          <strong className="text-lg">{nomeVisivel(vista.aluno.nome)}</strong>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{descricaoAvatar(a)}</p>
          <Botao disabled={!mudouAlgo} onClick={async () => { await enviar([{ op: "aparencia", valor: a }]); setAviso(T.guardado); }}>{T.guardar}</Botao>
          <p className="m-0 text-sm" role="status">{aviso}</p>
        </section>
        <section className="cartao p-4 grid gap-3">
          <div role="tablist" aria-label={T.titulo} className="flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--linha)" }}>
            {SEPARADORES.map((s, i) => (
              <button key={s} ref={(el) => { tabs.current[i] = el; }} role="tab" id={`gr-tab-${s}`} aria-selected={sep === s} aria-controls="gr-painel" tabIndex={sep === s ? 0 : -1} className="separador" onClick={() => setSep(s)} onKeyDown={(e) => teclaSeparador(e, i)}>
                {(C as Record<string, string>)[s]}
              </button>
            ))}
          </div>
          <div role="tabpanel" id="gr-painel" aria-labelledby={`gr-tab-${sep}`}>
            <ul className="m-0 p-0 list-none aldeia-itens">
              {opcoes.map((o) => {
                const vestido = (a[campo] ?? null) === o.id;
                return (
                  <li key={o.id ?? "nada"}>
                    <button
                      type="button"
                      className={`aldeia-item ${vestido ? "aldeia-escolha--ativa" : ""} ${o.livre ? "" : "aldeia-item--bloqueado"}`}
                      aria-pressed={vestido}
                      aria-disabled={!o.livre}
                      aria-describedby={o.falta ? `falta-${o.id}` : undefined}
                      onClick={() => o.livre && setA((x) => ({ ...x, ...o.amostra }))}
                    >
                      {o.imagem ? <img src={urlPixel(o.imagem)} alt="" width={44} height={44} style={{ imageRendering: "pixelated", margin: "18px 0" }} /> : <Avatar aparencia={{ ...a, ...o.amostra }} escala={2} animar={false} rotulo="" style={{ filter: o.livre ? undefined : "grayscale(1) opacity(.5)" }} />}
                      <strong>{o.nome}</strong>
                      {vestido && <span className="etiqueta">{T.vestido}</span>}
                      {o.falta && (
                        <span id={`falta-${o.id}`} className="text-sm inline-flex items-center gap-1" style={{ color: "var(--suave)" }}>
                          <LockKeyhole size={14} aria-hidden="true" /> {o.falta}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
