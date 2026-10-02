// ─── Utilitários partilhados pelas atividades ────────────────────────────────
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Barra } from "../ui";

/** Conta o tempo desde que `ativo` passou a verdadeiro. Com `limiteMs`, chama `aoEsgotar` uma vez. */
export function useTemporizador(ativo: boolean, limiteMs: number | null, aoEsgotar?: () => void) {
  const [decorridoMs, setDecorrido] = useState(0);
  const inicio = useRef<number | null>(null);
  const esgotou = useRef(false);
  const cb = useRef(aoEsgotar);
  cb.current = aoEsgotar;

  useEffect(() => {
    if (!ativo) return;
    inicio.current ??= performance.now();
    const id = window.setInterval(() => {
      const d = performance.now() - (inicio.current ?? performance.now());
      setDecorrido(d);
      if (limiteMs !== null && d >= limiteMs && !esgotou.current) {
        esgotou.current = true;
        cb.current?.();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [ativo, limiteMs]);

  const restanteMs = limiteMs === null ? null : Math.max(0, limiteMs - decorridoMs);
  return { decorridoMs, restanteMs, decorridoExato: () => performance.now() - (inicio.current ?? performance.now()) };
}

export function formatarTempo(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Barra de tempo fina com avisos anunciados a leitores de ecrã (50 %, 30 s, 10 s). */
export function BarraTempo({ restanteMs, totalMs, soBarra }: { restanteMs: number; totalMs: number; soBarra?: boolean }) {
  const fracao = restanteMs / totalMs;
  const tom = fracao < 0.15 ? "errado" : fracao < 0.5 ? "aviso" : "normal";
  const [aviso, setAviso] = useState("");
  useEffect(() => {
    if (restanteMs <= 10_000 && restanteMs > 9_000) setAviso("Faltam 10 segundos.");
    else if (restanteMs <= 30_000 && restanteMs > 29_000) setAviso("Faltam 30 segundos.");
    else if (fracao <= 0.5 && fracao > 0.49) setAviso("Metade do tempo passou.");
  }, [restanteMs, fracao]);
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-sm" style={{ color: "var(--suave)" }}>
        <span>Tempo</span>
        {!soBarra && (
          <span className="tabular-nums" aria-hidden="true">
            {formatarTempo(restanteMs)}
          </span>
        )}
      </div>
      <Barra valor={restanteMs} max={totalMs} rotulo="Tempo restante" tom={tom} />
      <div className="sr-only" aria-live="polite">
        {aviso}
      </div>
    </div>
  );
}

/** Caixa de instrução da tarefa atual. */
export function Instrucao({ numero, total, children }: { numero?: number; total?: number; children: ReactNode }) {
  return (
    <div className="cartao p-4" role="status" aria-live="polite" style={{ borderLeft: "6px solid var(--acento)" }}>
      {numero !== undefined && total !== undefined && (
        <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
          Tarefa {numero} de {total}
        </div>
      )}
      <div className="text-lg font-bold" style={{ fontFamily: "var(--fonte-titulo)" }}>
        {children}
      </div>
    </div>
  );
}

/** Mensagem de feedback após uma ronda. */
export function Feedback({ tipo, children }: { tipo: "certo" | "errado" | "info"; children: ReactNode }) {
  const cor = tipo === "certo" ? "var(--certo)" : tipo === "errado" ? "var(--errado)" : "var(--acento)";
  return (
    <div className="cartao p-3" role="status" style={{ borderColor: cor, color: "var(--tinta)" }}>
      {children}
    </div>
  );
}

/** Divide por espaços mantendo a pontuação agarrada à palavra (para comparar palavra a palavra). */
export function palavras(texto: string): string[] {
  return texto.split(/\s+/).filter(Boolean);
}
