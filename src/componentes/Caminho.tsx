// ─── Caminho (breadcrumb) com botão de regresso ao nível anterior ────────────
import { Link } from "react-router";

/** `itens`: ligações [rota, nome] pela ordem (o Início é acrescentado no princípio); `atual`: página atual.
 *  "← Voltar" leva ao último item (o nível imediatamente acima). Usado em todas as páginas abaixo do Início. */
export function Caminho({ itens: dados = [], atual }: { itens?: [string, string][]; atual: string }) {
  const itens: [string, string][] = dados[0]?.[0] === "/" ? dados : [["/", "Início"], ...dados];
  const [rotaAnterior, nomeAnterior] = itens[itens.length - 1];
  return (
    <nav aria-label="Caminho" className="text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
      <Link to={rotaAnterior} className="botao botao--contorno" style={{ minHeight: 36, padding: "2px 12px" }} aria-label={`Voltar a ${nomeAnterior}`}>
        <span aria-hidden="true">←</span>&nbsp;Voltar
      </Link>
      <ol className="m-0 p-0 list-none flex flex-wrap items-center gap-x-2">
        {itens.map(([rota, nome]) => (
          <li key={rota} className="flex items-center gap-2">
            <Link to={rota}>{nome}</Link>
            <span aria-hidden="true" style={{ color: "var(--suave)" }}>›</span>
          </li>
        ))}
        <li aria-current="page" style={{ color: "var(--suave)" }}>
          {atual}
        </li>
      </ol>
    </nav>
  );
}
