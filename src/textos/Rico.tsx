// ─── Texto rico mínimo para textos editáveis ─────────────────────────────────
// **negrito**, [texto](/rota) (ligação interna) ou [texto](https://…) (externa), ^1^ (índice superior).
// Permite ao professor manter ligações e destaques sem escrever HTML.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

const PADRAO = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\^([^^]+)\^/g;

export function rico(texto: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  for (const m of texto.matchAll(PADRAO)) {
    if (m.index! > i) out.push(texto.slice(i, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] !== undefined) {
      const destino = m[3];
      // Só ligações internas (/rota) e externas seguras: os textos vêm do backoffice e não devem poder correr código.
      if (!destino.startsWith("/") && !/^(https?:|mailto:)/i.test(destino)) {
        out.push(m[2]);
        i = m.index! + m[0].length;
        continue;
      }
      out.push(
        destino.startsWith("/") ? (
          <Link key={k++} to={destino}>
            {m[2]}
          </Link>
        ) : (
          <a key={k++} href={destino} target="_blank" rel="noreferrer">
            {m[2]}
          </a>
        ),
      );
    } else out.push(<sup key={k++}>{m[4]}</sup>);
    i = m.index! + m[0].length;
  }
  if (i < texto.length) out.push(texto.slice(i));
  return out;
}

export function Rico({ texto }: { texto: string }) {
  return <Fragment>{rico(texto)}</Fragment>;
}

/** Substitui {nome} pelos valores dados (variáveis que o código preenche, como a versão ou a pontuação). */
export function preencher(texto: string, valores: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (m, k: string) => (k in valores ? String(valores[k]) : m));
}
