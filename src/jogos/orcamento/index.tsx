// ─── Jogo · Orçamento da Visita de Estudo (folha de cálculo) ─────────────────
// Uma folha de cálculo simulada com os custos da visita. O aluno escreve fórmulas nas células assinaladas:
// totais (preço × quantidade), soma, custo por aluno, desconto, o que sobra do orçamento, máximo e média.
// Os preços, o número de alunos, o desconto, o orçamento e o destino mudam em cada tentativa.
// Pontuação: cada célula vale o mesmo; valor certo escrito à mão (sem fórmula) conta metade.
import { useState } from "react";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao } from "../../ui";
import { Janela } from "../../componentes/Janela";
import { ErroFormula, formatar, valorCelula } from "./formula";
import { corrigir, gerarFolha, type ConfigOrcamento } from "./gerar";

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigOrcamento> = {
  1: { despesas: 3, porAluno: false, desconto: false, restante: false, estatisticas: false, exemplos: true, exemploFeito: true },
  2: { despesas: 3, porAluno: true, desconto: false, restante: false, estatisticas: false, exemplos: true, exemploFeito: true },
  3: { despesas: 3, porAluno: true, desconto: true, restante: false, estatisticas: false, exemplos: false, exemploFeito: true },
  4: { despesas: 4, porAluno: true, desconto: true, restante: true, estatisticas: false, exemplos: false, exemploFeito: false },
  5: { despesas: 4, porAluno: true, desconto: true, restante: true, estatisticas: true, exemplos: false, exemploFeito: false },
};
const COLUNAS = ["A", "B", "C", "D", "E", "F", "G"];

function Orcamento({ config, modo, aoTerminar }: PropsAtividade<ConfigOrcamento>) {
  const [folha] = useState(() => gerarFolha(config));
  const tarefas = modo === "pratica" ? folha.tarefas.slice(0, 1) : folha.tarefas;
  const [valores, setValores] = useState<Record<string, string>>({});
  const [ativa, setAtiva] = useState(tarefas[0].celula);
  const [foco, setFoco] = useState<string | null>(null);
  const [inicio] = useState(() => performance.now());
  const celulas = { ...folha.fixas, ...valores };
  const eTarefa = new Map(tarefas.map((t) => [t.celula, t]));

  const mostrar = (ref: string): string => {
    const bruto = celulas[ref];
    if (bruto === undefined || bruto === "") return "";
    try {
      const v = valorCelula(ref, celulas);
      return typeof v === "number" ? formatar(v) : v;
    } catch (e) {
      return e instanceof ErroFormula ? e.codigo : "#ERRO!";
    }
  };

  function entregar() {
    const cs = tarefas.map((t) => ({ t, c: corrigir(t, valores[t.celula] ?? "", folha) }));
    const pontos = cs.reduce((s, { c }) => s + (c.estado === "certo" ? 1 : c.estado === "parcial" ? 0.5 : 0), 0);
    aoTerminar({
      pontuacao: limitar((100 * pontos) / tarefas.length),
      duracaoMs: performance.now() - inicio,
      metricas: { certas: cs.filter(({ c }) => c.estado === "certo").length, semFormula: cs.filter(({ c }) => c.estado === "parcial").length, tarefas: tarefas.length, erroFuncao: cs.some(({ t, c }) => c.estado !== "certo" && /SOMA|MÁXIMO|MÉDIA/.test(t.solucao)) },
      relatorio: cs.map(({ t, c }) => ({
        tarefa: `${t.celula} · ${t.rotulo}: ${t.pedido}`,
        resultado: c.estado,
        resposta: valores[t.celula]?.trim() || undefined,
        certa: `${t.solucao} (= ${formatar(c.esperado)})`,
        feedback: c.estado === "certo" ? undefined : c.mensagem,
      })),
    });
  }

  const bruto = celulas[ativa];
  return (
    <div className="grid gap-4">
      <Instrucao>
        A turma de {folha.alunos} alunos vai {folha.destino}. Completa a folha do orçamento: escreve uma fórmula em cada célula assinalada (a azul). Uma fórmula começa por <code>=</code>, por exemplo <code>=B2*C2</code>.
      </Instrucao>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] items-start">
        <Janela endereco="folhas.escola.pt/visita-de-estudo" rotulo="Folha de cálculo simulada">
          <div className="barra-formula" aria-live="polite">
            <span className="ref">{ativa}</span>
            <span>
              <span className="sr-only">Conteúdo da célula: </span>
              {bruto === undefined || bruto === "" ? "" : String(bruto)}
            </span>
          </div>
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Grelha da folha (desliza na horizontal se precisares)">
            <table className="folha-grelha" aria-label="Orçamento da visita">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Linha</span>
                  </th>
                  {COLUNAS.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: folha.linhas }, (_, i) => i + 1).map((l) => (
                  <tr key={l}>
                    <th scope="row">{l}</th>
                    {COLUNAS.map((c) => {
                      const ref = `${c}${l}`;
                      const t = eTarefa.get(ref);
                      if (t)
                        return (
                          <td key={ref} className={`tarefa${ativa === ref ? " ativa" : ""}`}>
                            <input
                              aria-label={`Célula ${ref}: ${t.rotulo}`}
                              value={foco === ref ? (valores[ref] ?? "") : mostrar(ref)}
                              onFocus={() => {
                                setFoco(ref);
                                setAtiva(ref);
                              }}
                              onBlur={() => setFoco(null)}
                              onChange={(e) => setValores((v) => ({ ...v, [ref]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                              autoComplete="off"
                              spellCheck={false}
                            />
                          </td>
                        );
                      const v = folha.fixas[ref];
                      const formula = typeof v === "string" && v.startsWith("=");
                      return (
                        <td key={ref} className={formula ? "formula-feita" : typeof v === "number" ? "numero" : undefined} style={l === 1 || c === "A" || c === "F" ? { fontWeight: 700 } : undefined} onClick={() => setAtiva(ref)}>
                          {mostrar(ref)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Janela>
        <section className="cartao p-4 grid gap-3" aria-labelledby="tarefas-t">
          <h3 id="tarefas-t" className="text-lg">Tarefas</h3>
          {config.exemploFeito && modo !== "pratica" && <p className="m-0 text-sm">A célula D2 já tem a fórmula <code>=B2*C2</code>. Faz o mesmo nas outras linhas.</p>}
          <ol className="m-0 pl-5 grid gap-2">
            {tarefas.map((t) => (
              <li key={t.celula}>
                <strong>{t.celula}</strong>: {t.pedido}
                {config.exemplos && t.exemplo && t.celula !== tarefas[0].celula && !/^=B\d+\*C\d+$/.test(t.solucao) && (
                  <span className="block text-sm" style={{ color: "var(--suave)" }}>
                    Ajuda: usa {/SOMA/.test(t.solucao) ? <code>=SOMA(primeira:última)</code> : "as células das tarefas anteriores"}.
                  </span>
                )}
              </li>
            ))}
          </ol>
          <details>
            <summary>Funções disponíveis</summary>
            <ul className="m-0 pl-5 text-sm grid gap-1 mt-2">
              <li>
                <code>+ - * /</code> somar, subtrair, multiplicar, dividir
              </li>
              <li>
                <code>=SOMA(D2:D4)</code> soma de D2 a D4
              </li>
              <li>
                <code>=MÉDIA(D2:D4)</code>, <code>=MÁXIMO(…)</code>, <code>=MÍNIMO(…)</code>
              </li>
              <li>
                <code>10%</code> é o mesmo que <code>0,1</code>
              </li>
            </ul>
          </details>
          <Botao onClick={entregar}>Entregar a folha</Botao>
        </section>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigOrcamento>({
  slug: "orcamento",
  numero: 104,
  dominio: "folhas",
  titulo: { jornal: "Orçamento da Visita de Estudo", laboratorio: "Orçamento da Visita de Estudo" },
  descricao: "Organizar os custos de uma visita de estudo numa folha de cálculo: fórmulas, somas, custo por aluno, descontos, máximo e média.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: (c) => ({ ...c, despesas: 3, exemploFeito: true, exemplos: true }),
  Componente: Orcamento,
  dica: (m) => {
    if (Number(m.semFormula) > 0) return "Escreve sempre uma fórmula (começa por =) em vez do resultado: se um preço mudar, a folha atualiza-se sozinha.";
    if (m.erroFuncao === true) return "Para somar muitas células usa =SOMA(D2:D5): os dois pontos querem dizer “de D2 até D5”.";
    if (Number(m.certas) < Number(m.tarefas)) return "Confirma em que célula está cada valor (o número de alunos está em G2, o desconto em G4) e usa parênteses quando precisares.";
    return "Folha impecável. No nível seguinte há mais despesas e novas funções.";
  },
});
