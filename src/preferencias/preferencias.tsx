// ─── Preferências do utilizador (guardadas no navegador) ─────────────────────
// formato: aspeto da interface ("original" editorial ou "mosaico" = Ágora Design System da AMA)
// contexto: narrativa de aprendizagem ("jornal" = redação do jornal da escola, "laboratorio" = laboratório de experiências)
// tema: claro/escuro/auto · tamanho: texto normal/grande · extensaoTempo: acomodação de tempo (x1, x1.25, x1.5, x2)
// telemetria: enviar estatísticas anónimas (sem conta, sem identificação) para o ponto de recolha configurado

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Formato = "original" | "mosaico";
export type Contexto = "jornal" | "laboratorio";
export type Tema = "auto" | "claro" | "escuro";
export type Tamanho = "normal" | "grande";
export type Contraste = "normal" | "reforcado";
export type ExtensaoTempo = 1 | 1.25 | 1.5 | 2;

export interface Preferencias {
  formato: Formato;
  contexto: Contexto;
  tema: Tema;
  tamanho: Tamanho;
  contraste: Contraste; // "reforcado" = cores com contraste de nível AAA
  extensaoTempo: ExtensaoTempo;
  nome: string; // nome a mostrar na "primeira página" (opcional, só local)
  telemetria: boolean;
}

const CHAVE = "ecd.preferencias.v1";

export const PREFERENCIAS_INICIAIS: Preferencias = {
  formato: "mosaico",
  contexto: "jornal",
  tema: "auto",
  tamanho: "normal",
  contraste: "normal",
  extensaoTempo: 1,
  nome: "",
  telemetria: true,
};

export function lerPreferencias(): Preferencias {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return PREFERENCIAS_INICIAIS;
    const lidas = JSON.parse(bruto) as Partial<Preferencias> & { formato?: string };
    if (lidas.formato === "original") lidas.formato = "original"; // nome antigo do aspeto Original
    return { ...PREFERENCIAS_INICIAIS, ...(lidas as Partial<Preferencias>) };
  } catch {
    return PREFERENCIAS_INICIAIS;
  }
}

function guardar(p: Preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch {
    /* armazenamento indisponível: a sessão continua sem persistência */
  }
}

/** Aplica os atributos no <html> que o CSS usa (formato, tema, tamanho). */
export function aplicarNoDocumento(p: Preferencias) {
  const raiz = document.documentElement;
  raiz.dataset.formato = p.formato;
  raiz.dataset.tema = p.tema;
  raiz.dataset.tamanho = p.tamanho;
  raiz.dataset.contraste = p.contraste;
}

interface Valor {
  prefs: Preferencias;
  definir: (parcial: Partial<Preferencias>) => void;
  /** Verdadeiro quando o tema efetivo é escuro (escolha explícita, ou "auto" com o sistema em escuro). */
  escuro: boolean;
}

const Ctx = createContext<Valor | null>(null);

function sistemaEscuro(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function PreferenciasProvider({ children, iniciais }: { children: ReactNode; iniciais: Preferencias }) {
  const [prefs, setPrefs] = useState<Preferencias>(iniciais);
  const [sistema, setSistema] = useState(sistemaEscuro);

  useEffect(() => {
    aplicarNoDocumento(prefs);
    guardar(prefs);
  }, [prefs]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const ouvir = (e: MediaQueryListEvent) => setSistema(e.matches);
    mq.addEventListener("change", ouvir);
    return () => mq.removeEventListener("change", ouvir);
  }, []);

  const definir = useCallback((parcial: Partial<Preferencias>) => {
    setPrefs((atual) => {
      const novo = { ...atual, ...parcial };
      // O formato troca módulos e folhas de estilo inteiras (Ágora): recarregar é o caminho limpo.
      if (parcial.formato && parcial.formato !== atual.formato) {
        guardar(novo);
        window.location.reload();
      }
      return novo;
    });
  }, []);

  const escuro = prefs.tema === "escuro" || (prefs.tema === "auto" && sistema);
  const valor = useMemo(() => ({ prefs, definir, escuro }), [prefs, definir, escuro]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function usePreferencias(): Valor {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePreferencias fora de PreferenciasProvider");
  return v;
}

/** Deteta Mac para mostrar ⌘ em vez de Ctrl. */
export const E_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "");
export const TECLA_CTRL = E_MAC ? "⌘" : "Ctrl";
