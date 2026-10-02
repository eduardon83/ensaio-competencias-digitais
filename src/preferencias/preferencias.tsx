// ─── Preferências do utilizador (guardadas no navegador) ─────────────────────
// formato: aspeto da interface ("kendir" editorial ou "mosaico" = Ágora Design System da AMA)
// contexto: narrativa de aprendizagem ("jornal" = redação do jornal da escola, "laboratorio" = laboratório de experiências)
// tema: claro/escuro/auto · tamanho: texto normal/grande · extensaoTempo: acomodação de tempo (x1, x1.25, x1.5, x2)

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Formato = "kendir" | "mosaico";
export type Contexto = "jornal" | "laboratorio";
export type Tema = "auto" | "claro" | "escuro";
export type Tamanho = "normal" | "grande";
export type ExtensaoTempo = 1 | 1.25 | 1.5 | 2;

export interface Preferencias {
  formato: Formato;
  contexto: Contexto;
  tema: Tema;
  tamanho: Tamanho;
  extensaoTempo: ExtensaoTempo;
  nome: string; // nome a mostrar na "primeira página" (opcional)
}

const CHAVE = "ecd.preferencias.v1";

export const PREFERENCIAS_INICIAIS: Preferencias = {
  formato: "kendir",
  contexto: "jornal",
  tema: "auto",
  tamanho: "normal",
  extensaoTempo: 1,
  nome: "",
};

export function lerPreferencias(): Preferencias {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return PREFERENCIAS_INICIAIS;
    return { ...PREFERENCIAS_INICIAIS, ...(JSON.parse(bruto) as Partial<Preferencias>) };
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
}

interface Valor {
  prefs: Preferencias;
  definir: (parcial: Partial<Preferencias>) => void;
}

const Ctx = createContext<Valor | null>(null);

export function PreferenciasProvider({ children, iniciais }: { children: ReactNode; iniciais: Preferencias }) {
  const [prefs, setPrefs] = useState<Preferencias>(iniciais);

  useEffect(() => {
    aplicarNoDocumento(prefs);
    guardar(prefs);
  }, [prefs]);

  const definir = useCallback((parcial: Partial<Preferencias>) => {
    setPrefs((atual) => {
      const novo = { ...atual, ...parcial };
      // O formato troca folhas de estilo inteiras (Ágora carrega ~1 MB de CSS): recarregar é o caminho limpo.
      if (parcial.formato && parcial.formato !== atual.formato) {
        guardar(novo);
        window.location.reload();
      }
      return novo;
    });
  }, []);

  const valor = useMemo(() => ({ prefs, definir }), [prefs, definir]);
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
