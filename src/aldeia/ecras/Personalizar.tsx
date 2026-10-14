// ─── Aldeia Digital · personalizar a cara e o cabelo; "Guarda o teu nome" ────
import { useRef, useState } from "react";
import { Botao, Cartao } from "../../ui";
import { Avatar } from "../arte/componentes";
import { CABELOS, CORES_CABELO, ITENS_SEMPRE, PADROES_LENCO, PELES } from "../nucleo/catalogo";
import { formatarTurma } from "../nucleo/codigos";
import type { Aparencia } from "../nucleo/modelo";
import { nomeVisivel } from "../nucleo/nomes";
import { urlPixel } from "../arte/pixel";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia, texto } from "./comum";
import type { CicloTexto } from "../nucleo/catalogo";

function Opcoes<T extends string>({ legenda, valores, rotulo, valor, aoMudar, amostra }: { legenda: string; valores: T[]; rotulo: (v: T) => string; valor: T; aoMudar: (v: T) => void; amostra?: (v: T) => string | null }) {
  return (
    <fieldset className="border-0 p-0 m-0 grid gap-2">
      <legend className="font-bold mb-1">{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {valores.map((v) => (
          <label key={v} className={`aldeia-chip ${valor === v ? "aldeia-escolha--ativa" : ""}`}>
            <input type="radio" className="sr-only" name={legenda} checked={valor === v} onChange={() => aoMudar(v)} />
            {amostra?.(v) && <span aria-hidden="true" className="aldeia-chip__cor" style={{ background: amostra(v)! }} />}
            {rotulo(v)}
            {valor === v && <span aria-hidden="true">✓</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const TONS_PELE: Record<string, string> = { "pele-1": "#fde4d0", "pele-2": "#f4c9a4", "pele-3": "#dfa676", "pele-4": "#c0855a", "pele-5": "#93603f", "pele-6": "#664231" };
const TONS_CABELO: Record<string, string> = { castanho: "#6b4430", preto: "#33293f", ruivo: "#c4602f", loiro: "#e6b85a", amarelo: "#f2c94c", azul: "#6f9fd8", rosa: "#f5a9c4", verde: "#7fc9a0" };

export function Personalizar({ aparencia, nome, aoGuardar }: { aparencia: Aparencia; nome: string; aoGuardar: (a: Aparencia) => void }) {
  const [a, setA] = useState(aparencia);
  const T = ALDEIA.personalizar;
  const mudar = (p: Partial<Aparencia>) => setA((x) => ({ ...x, ...p }));
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
        <Cartao className="grid justify-items-center gap-2 aldeia-vitrine">
          <Avatar aparencia={a} anim="vestir" escala={4} />
          <strong>{nomeVisivel(nome)}</strong>
        </Cartao>
        <Cartao className="grid gap-4">
          <h1 className="text-3xl">{T.titulo}</h1>
          <p className="m-0">{T.intro}</p>
          <Opcoes legenda={T.pele} valores={PELES} valor={a.pele} rotulo={(v) => (T.peles as Record<string, string>)[v] ?? v} amostra={(v) => TONS_PELE[v]} aoMudar={(v) => mudar({ pele: v })} />
          <Opcoes legenda={T.cabelo} valores={CABELOS} valor={a.cabelo} rotulo={(v) => (T.cabelos as Record<string, string>)[v] ?? v} aoMudar={(v) => mudar({ cabelo: v, corCabelo: v === "lenco" ? PADROES_LENCO[0] : CORES_CABELO.includes(a.corCabelo) ? a.corCabelo : CORES_CABELO[0] })} />
          {a.cabelo !== "rapado" && (
            <Opcoes
              legenda={a.cabelo === "lenco" ? T.padraoLenco : T.corCabelo}
              valores={a.cabelo === "lenco" ? PADROES_LENCO : CORES_CABELO}
              valor={a.corCabelo}
              rotulo={(v) => ((a.cabelo === "lenco" ? T.lencos : T.coresCabelo) as Record<string, string>)[v] ?? v}
              amostra={(v) => TONS_CABELO[v]}
              aoMudar={(v) => mudar({ corCabelo: v })}
            />
          )}
          <Opcoes legenda={T.ver} valores={["", ...ITENS_SEMPRE]} valor={a.ver ?? ""} rotulo={(v) => (v ? (ALDEIA.premios.itens[v] ?? v) : T.semOculos)} aoMudar={(v) => mudar({ ver: v || null })} />
          <div>
            <Botao grande onClick={() => aoGuardar(a)}>{T.pronto}</Botao>
          </div>
        </Cartao>
      </main>
    </div>
  );
}

/** Cartão para guardar: código da turma, nome e avatar. "Guardar imagem" e "Imprimir". */
export function GuardaNome({ codigo, nome, aparencia, ciclo, aoContinuar }: { codigo: string; nome: string; aparencia: Aparencia; ciclo: CicloTexto; aoContinuar: () => void }) {
  const T = ALDEIA.guardaNome;
  const cartao = useRef<HTMLDivElement>(null);
  const [aGuardar, setAGuardar] = useState(false);
  async function guardarImagem() {
    if (!cartao.current) return;
    setAGuardar(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(cartao.current, { pixelRatio: 2, backgroundColor: getComputedStyle(cartao.current).backgroundColor, skipFonts: true });
      const l = document.createElement("a");
      l.href = url;
      l.download = `aldeia-${codigo}.png`;
      l.click();
    } catch {
      window.print();
    } finally {
      setAGuardar(false);
    }
  }
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={T.titulo} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-5" style={{ maxWidth: 720 }}>
        <h1 className="text-3xl">{T.titulo}</h1>
        <p className="m-0">{texto(T.texto, ciclo)}</p>
        <div ref={cartao} className="cartao p-5 aldeia-cartao-nome">
          <Avatar aparencia={aparencia} anim="acenar" escala={3} animar={false} />
          <dl className="m-0 grid gap-2">
            <dt className="text-sm" style={{ color: "var(--suave)" }}>{T.codigo}</dt>
            <dd className="m-0 text-4xl font-extrabold" style={{ fontFamily: "var(--fonte-mono)", letterSpacing: ".06em" }}>{formatarTurma(codigo)}</dd>
            <dt className="text-sm" style={{ color: "var(--suave)" }}>{T.nome}</dt>
            <dd className="m-0 text-2xl font-bold">{nomeVisivel(nome)}</dd>
            <dd className="m-0 text-sm" style={{ color: "var(--suave)" }}>{`${window.location.host}/aldeia`}</dd>
          </dl>
          <img src={urlPixel("ui/icones/icone-casa")} alt="" width={32} height={32} style={{ imageRendering: "pixelated", position: "absolute", right: 16, top: 16 }} />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Botao variante="contorno" onClick={() => void guardarImagem()} disabled={aGuardar}>{T.guardarImagem}</Botao>
          <Botao variante="contorno" onClick={() => window.print()}>{T.imprimir}</Botao>
          <Botao grande onClick={aoContinuar}>{T.continuar}</Botao>
        </div>
      </main>
    </div>
  );
}
