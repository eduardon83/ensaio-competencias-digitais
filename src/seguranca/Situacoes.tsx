// ─── Segurança · Situações de escolha múltipla com explicação (partilhado pelos testes) ──
import { useState } from "react";
import { amostra, baralharOpcoes } from "../motor/aleatorio";
import type { LinhaRelatorio } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio } from "../ui";

export interface Situacao {
  pergunta: string;
  opcoes: string[]; // a primeira é a certa
  porque: string;
}

export function Situacoes({ lista, n, prefixo, instrucao, aoConcluir }: { lista: Situacao[]; n: number; prefixo: string; instrucao: string; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [qs] = useState(() => amostra(lista, n).map((s) => ({ ...s, ...baralharOpcoes(s.opcoes, 0) })));
  const [resp, setResp] = useState<(number | null)[]>(() => qs.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = qs.filter((q, i) => resp[i] === q.correta).length;
  return (
    <div className="grid gap-3">
      <Instrucao>{instrucao}</Instrucao>
      {qs.map((q, i) => (
        <fieldset key={i} className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === q.correta ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">{i + 1}. {q.pergunta}</legend>
          {q.opcoes.map((o, j) => (
            <BotaoRadio key={j} id={`${prefixo}-${i}-${j}`} name={`${prefixo}-${i}`} rotulo={o} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
          ))}
          {feito && <p className="m-0 text-sm" style={{ color: resp[i] === q.correta ? "var(--certo)" : "var(--errado)" }}>{resp[i] === q.correta ? "Certo. " : `A opção mais segura: ${q.opcoes[q.correta]}. `}{q.porque}</p>}
        </fieldset>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(certas / qs.length, qs.map((q, i) => ({ tarefa: q.pergunta, resultado: resp[i] === q.correta ? "certo" : "errado", resposta: resp[i] === null ? undefined : q.opcoes[resp[i]!], certa: q.opcoes[q.correta], feedback: q.porque })))}>Continuar</Botao>
        )}
        {feito && <span>{certas} de {qs.length} certas.</span>}
      </div>
    </div>
  );
}

/** Parte n de total, com o nome da parte. */
export function CabecalhoParte({ i, total, nome }: { i: number; total: number; nome: string }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
      Parte {i + 1} de {total} · {nome}
    </div>
  );
}
