// ─── Aldeia Digital · peças comuns dos ecrãs do aluno ────────────────────────
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { lerEmVozAlta, VOZ_DISPONIVEL } from "../../componentes/Ouvir";
import { Icone } from "../../componentes/Icone";
import { Botao } from "../../ui";
import { Retrato, type Expressao } from "../arte/componentes";
import { FATO, type CicloTexto } from "../nucleo/catalogo";
import { generoDoNome, nomeVisivel } from "../nucleo/nomes";
import { ALDEIA, porCiclo, type PorCiclo } from "../textos";

/** Preenche {nome}, {animal}, {o} e {bemvindo} com a concordância do nome anónimo (frases neutras nos outros casos). */
export function preencherAluno(texto: string, a: { nome: string; aparencia: { fato: string } }, extra: Record<string, string | number> = {}): string {
  const g = generoDoNome(a.nome, a.aparencia.fato);
  const animal = (FATO.get(a.aparencia.fato)?.nome ?? "").toLowerCase();
  const v: Record<string, string> = { nome: nomeVisivel(a.nome), animal, o: g === "f" ? "a" : "o", bemvindo: g === "f" ? "Bem-vinda" : g === "m" ? "Bem-vindo" : "Olá! Boas-vindas", ...Object.fromEntries(Object.entries(extra).map(([k, x]) => [k, String(x)])) };
  return texto.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);
}

export function texto(t: PorCiclo | string, ciclo: CicloTexto): string {
  return porCiclo(t, ciclo);
}

/** Barra de topo das páginas da Aldeia (fora do mapa): "Aldeia Digital · secção" e regresso à aldeia. */
export function CabecalhoAldeia({ seccao, voltar, extra }: { seccao: string; voltar?: string; extra?: ReactNode }) {
  return (
    <header className="aldeia-barra">
      <div className="aldeia-barra__dentro">
        <span className="aldeia-barra__nome">{ALDEIA.nome}</span>
        <span className="aldeia-barra__seccao">· {seccao}</span>
        <span className="ml-auto flex items-center gap-2">
          {extra}
          {voltar && (
            <Link to={voltar} className="aldeia-barra__voltar">
              <span aria-hidden="true">←</span> {ALDEIA.interface.jornal.voltar}
            </Link>
          )}
        </span>
      </div>
    </header>
  );
}

/** Balão de diálogo em baixo: retrato numa moldura, nome, texto (18 px ou mais), Ouvir e Continuar. Sem avanço automático. */
export function Dialogo({ personagem, expressao = "neutra", fala, progresso, acoes, aoContinuar, rotuloContinuar, focar = true, fixo = true }: {
  personagem: string;
  expressao?: Expressao;
  fala: string;
  progresso?: string;
  acoes?: ReactNode;
  aoContinuar?: () => void;
  rotuloContinuar?: string;
  focar?: boolean;
  fixo?: boolean;
}) {
  const botao = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focar) botao.current?.focus({ preventScroll: true });
  }, [fala, focar]);
  const nome = (ALDEIA.personagens as Record<string, string>)[personagem] ?? personagem;
  return (
    <section className={`aldeia-dialogo ${fixo ? "aldeia-dialogo--fixo" : ""}`} aria-label={nome} data-ouvir="">
      <Retrato id={personagem} expr={expressao} escala={2} />
      <div className="grid gap-2 min-w-0">
        {progresso && <div className="text-sm" style={{ color: "var(--suave)" }}>{progresso}</div>}
        <div className="aldeia-dialogo__nome">{nome}</div>
        <p className="aldeia-dialogo__fala" aria-live="polite">
          {fala}
        </p>
        <div className="flex flex-wrap gap-2">
          {VOZ_DISPONIVEL && (
            <Botao variante="contorno" onClick={() => lerEmVozAlta(`${nome}: ${fala}`)}>
              <Icone nome="ouvir" /> {ALDEIA.tutorial.ouvir}
            </Botao>
          )}
          {aoContinuar && (
            <Botao ref={botao} onClick={aoContinuar}>
              {rotuloContinuar ?? ALDEIA.tutorial.continuar}
            </Botao>
          )}
          {acoes}
        </div>
      </div>
    </section>
  );
}

/** Modal simples, acessível (foco no título, Escape fecha, fundo escurece 200 ms). */
export function Modal({ titulo, children, aoFechar, largura = 560, rotulo }: { titulo: string; children: ReactNode; aoFechar?: () => void; largura?: number; rotulo?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const anterior = useRef<Element | null>(null);
  useEffect(() => {
    anterior.current = document.activeElement;
    ref.current?.querySelector<HTMLElement>("h2")?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aoFechar) aoFechar();
      if (e.key === "Tab" && ref.current) {
        const f = [...ref.current.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((x) => !x.hasAttribute("disabled"));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("keydown", esc);
      (anterior.current as HTMLElement | null)?.focus?.();
    };
  }, [aoFechar]);
  return (
    <div className="modal-fundo aldeia-modal-fundo" onClick={(e) => e.target === e.currentTarget && aoFechar?.()}>
      <div ref={ref} className="modal aldeia-modal" role="dialog" aria-modal="true" aria-label={rotulo ?? titulo} style={{ maxWidth: largura }}>
        <h2 tabIndex={-1} className="sr-only">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
