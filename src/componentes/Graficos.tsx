// ─── Gráficos simples em SVG (Observatório) ──────────────────────────────────
// Sem bibliotecas: barras horizontais e colunas com as cores dos tokens. Cada gráfico tem uma descrição para leitores
// de ecrã e uma tabela com os mesmos dados ("Ver os dados"), para nunca depender só da imagem nem da cor.
import { useId, type ReactNode } from "react";

export interface Ponto {
  rotulo: string;
  valor: number;
  nota?: string; // por exemplo "n = 34"
}

function Quadro({ titulo, descricao, dados, unidade, children }: { titulo: string; descricao: string; dados: Ponto[]; unidade: string; children: ReactNode }) {
  const id = useId();
  return (
    <figure className="cartao p-4 grid gap-2 m-0" aria-labelledby={`${id}-t`}>
      <figcaption id={`${id}-t`} className="font-bold" style={{ fontFamily: "var(--fonte-titulo)" }}>
        {titulo}
      </figcaption>
      {dados.length === 0 ? (
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>Sem dados suficientes para este gráfico.</p>
      ) : (
        <>
          <div role="img" aria-label={descricao}>{children}</div>
          <details className="text-sm">
            <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Ver os dados</summary>
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">{titulo}</th>
                  <th scope="col">{unidade}</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((d) => (
                  <tr key={d.rotulo}>
                    <td>{d.rotulo}</td>
                    <td className="tabular-nums">
                      {d.valor}
                      {d.nota && <span style={{ color: "var(--suave)" }}> ({d.nota})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </figure>
  );
}

/** Barras horizontais: uma linha por categoria, com o valor escrito à direita. Em HTML, para o texto manter o tamanho
 *  real (e acompanhar o zoom e o texto grande) em qualquer largura. */
export function Barras({ titulo, dados, max, unidade = "Valor" }: { titulo: string; dados: Ponto[]; max?: number; unidade?: string }) {
  const m = max ?? Math.max(1, ...dados.map((d) => d.valor));
  const descricao = `${titulo}. ${dados.map((d) => `${d.rotulo}: ${d.valor}${d.nota ? ` (${d.nota})` : ""}`).join("; ")}.`;
  return (
    <Quadro titulo={titulo} descricao={descricao} dados={dados} unidade={unidade}>
      <div className="grafico-barras" aria-hidden="true">
        {dados.map((d) => (
          <div key={d.rotulo} className="grafico-barras__linha">
            <span className="grafico-barras__rotulo" title={d.rotulo}>{d.rotulo}</span>
            <span className="grafico-barras__pista">
              <span className="grafico-barras__barra" style={{ width: `${Math.max(1, (100 * d.valor) / m)}%` }} />
            </span>
            <span className="grafico-barras__valor">
              <strong>{d.valor}</strong>
              {d.nota && <span style={{ color: "var(--suave)" }}> {d.nota}</span>}
            </span>
          </div>
        ))}
      </div>
    </Quadro>
  );
}

/** Colunas verticais (por exemplo, tentativas por mês). Mostra no máximo `limite` colunas, as mais recentes. */
export function Colunas({ titulo, dados, unidade = "Valor", limite = 36 }: { titulo: string; dados: Ponto[]; unidade?: string; limite?: number }) {
  const ds = dados.slice(-limite);
  const m = Math.max(1, ...ds.map((d) => d.valor));
  const cada = Math.max(1, Math.ceil(ds.length / 8));
  const descricao = `${titulo}. ${ds.map((d) => `${d.rotulo}: ${d.valor}`).join("; ")}.`;
  return (
    <Quadro titulo={titulo} descricao={descricao} dados={ds} unidade={unidade}>
      <div className="grafico-colunas" aria-hidden="true">
        <div className="grafico-colunas__area">
          {ds.map((d) => (
            <div key={d.rotulo} className="grafico-colunas__coluna" title={`${d.rotulo}: ${d.valor}`}>
              {ds.length <= 12 && <span className="grafico-colunas__valor">{d.valor}</span>}
              <span className="grafico-colunas__barra" style={{ height: `${Math.max(1, (100 * d.valor) / m)}%` }} />
            </div>
          ))}
        </div>
        <div className="grafico-colunas__eixo">
          {ds.map((d, i) => (
            <span key={d.rotulo}>{i % cada === 0 ? d.rotulo : ""}</span>
          ))}
        </div>
      </div>
    </Quadro>
  );
}
