// ─── Janela simulada (navegador/aplicação) partilhada pelas atividades, jogos e testes de segurança ──
import type { ReactNode } from "react";
import { ForcarClaro } from "../ui";

export function Janela({ endereco, children, rotulo = "Interface simulada da tarefa" }: { endereco: string; children: ReactNode; rotulo?: string }) {
  return (
    <ForcarClaro>
      <div className="janela-simulada" role="region" aria-label={rotulo}>
        <div className="janela-barra" aria-hidden="true">
          <span className="pontos">
            <span />
            <span />
            <span />
          </span>
          <span className="endereco">https://{endereco}</span>
          <span className="etiqueta">Interface simulada</span>
        </div>
        <div className="superficie-clara" style={{ position: "relative" }}>{children}</div>
      </div>
    </ForcarClaro>
  );
}

/** Separadores simples (aplicações dentro da janela). */
export function Separadores<T extends string>({ itens, ativo, aoMudar, rotulo }: { itens: { id: T; nome: string; marca?: string }[]; ativo: T; aoMudar: (id: T) => void; rotulo: string }) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex gap-1 flex-wrap px-2 pt-2 border-b" style={{ borderColor: "var(--linha)", background: "var(--tecla)" }}>
      {itens.map((s) => (
        <button key={s.id} type="button" role="tab" aria-selected={ativo === s.id} className="separador" onClick={() => aoMudar(s.id)}>
          {s.nome}
          {s.marca && <span className="etiqueta ml-1">{s.marca}</span>}
        </button>
      ))}
    </div>
  );
}
