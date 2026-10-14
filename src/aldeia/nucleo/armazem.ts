// ─── Aldeia Digital · armazéns para o serviço da turma ───────────────────────
// Memória (testes) e localStorage (modo local, sem Worker). O Durable Object tem o seu, em worker/aldeia/turma.ts.
import type { Armazem } from "./servico";

const copia = <T,>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

export function armazemMemoria(): Armazem & { dados: Map<string, unknown> } {
  const dados = new Map<string, unknown>();
  return {
    dados,
    async obter<T>(k: string) {
      return copia(dados.get(k)) as T | undefined;
    },
    async guardar(k, v) {
      dados.set(k, copia(v));
    },
    async apagar(k) {
      dados.delete(k);
    },
    async listar<T>(prefixo: string) {
      const m = new Map<string, T>();
      for (const [k, v] of dados) if (k.startsWith(prefixo)) m.set(k, copia(v) as T);
      return m;
    },
    async apagarTudo() {
      dados.clear();
    },
  };
}

/** Uma turma local guardada no localStorage, com o prefixo dado (um por turma). */
export function armazemLocal(prefixo: string): Armazem {
  const chave = (k: string) => `${prefixo}${k}`;
  const todas = () => {
    const l: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefixo)) l.push(k);
    }
    return l;
  };
  return {
    async obter<T>(k: string) {
      try {
        const v = localStorage.getItem(chave(k));
        return v ? (JSON.parse(v) as T) : undefined;
      } catch {
        return undefined;
      }
    },
    async guardar(k, v) {
      localStorage.setItem(chave(k), JSON.stringify(v));
    },
    async apagar(k) {
      localStorage.removeItem(chave(k));
    },
    async listar<T>(p: string) {
      const m = new Map<string, T>();
      for (const k of todas()) {
        const curto = k.slice(prefixo.length);
        if (!curto.startsWith(p)) continue;
        try {
          m.set(curto, JSON.parse(localStorage.getItem(k) ?? "null") as T);
        } catch {
          /* entrada estragada: ignora */
        }
      }
      return m;
    },
    async apagarTudo() {
      for (const k of todas()) localStorage.removeItem(k);
    },
  };
}
