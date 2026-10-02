// ─── Relatório da atividade (modelo comum, preenchido por cada atividade) ────
// Resumo (pontuação, estrelas, o que falta para a próxima estrela, contagem de tarefas, indicações para melhorar)
// e tabela "Tarefa · Resultado · A tua resposta · Resposta certa · Feedback".
import { LIMIARES_ESTRELAS, estrelasDe, type EstadoLinha, type LinhaRelatorio } from "./tipos";

const ROTULO: Record<EstadoLinha, { icone: string; texto: string; cor: string }> = {
  certo: { icone: "✓", texto: "Certo", cor: "var(--certo)" },
  parcial: { icone: "◐", texto: "Em parte", cor: "var(--aviso)" },
  errado: { icone: "✗", texto: "Errado", cor: "var(--errado)" },
  saltado: { icone: "–", texto: "Não feito", cor: "var(--suave)" },
};

export function textoEstrelas(p: number): { frase: string; proxima: string } {
  const e = estrelasDe(p);
  const frase = e === 0 ? "Ainda não ganhaste estrelas: vale a pena tentar novamente." : e === 1 ? "Obtiveste 1 estrela." : `Obtiveste ${e} estrelas.`;
  if (e === 3) return { frase, proxima: "Tens as três estrelas. Experimenta o nível seguinte." };
  const alvo = LIMIARES_ESTRELAS[e];
  const falta = alvo - p;
  const nome = e === 0 ? "a primeira estrela" : e === 1 ? "a segunda estrela" : "a terceira estrela";
  return { frase, proxima: `Para ${nome} precisas de ${alvo} pontos: faltam ${falta}.` };
}

export function ResumoRelatorio({ pontuacao, linhas, dica }: { pontuacao: number; linhas?: LinhaRelatorio[]; dica: string }) {
  const { frase, proxima } = textoEstrelas(pontuacao);
  const conta = (r: EstadoLinha) => linhas?.filter((l) => l.resultado === r).length ?? 0;
  // Indicações a partir das respostas erradas ou incompletas (as não feitas já aparecem na contagem).
  const melhorar = [...new Set((linhas ?? []).filter((l) => (l.resultado === "errado" || l.resultado === "parcial") && l.feedback).map((l) => l.feedback!))].slice(0, 3);
  return (
    <div className="grid gap-2">
      <p className="m-0">
        <strong>Resultado: {pontuacao} em 100.</strong> {frase} {proxima}
      </p>
      {linhas && linhas.length > 0 && (
        <p className="m-0">
          Certas: <strong>{conta("certo")}</strong> de {linhas.length}
          {conta("parcial") > 0 && <> · em parte: {conta("parcial")}</>}
          {conta("errado") > 0 && <> · erradas: {conta("errado")}</>}
          {conta("saltado") > 0 && <> · não feitas: {conta("saltado")}</>}.
        </p>
      )}
      <div>
        <strong>Da próxima vez:</strong>
        <ul className="m-0 pl-5">
          <li>{dica}</li>
          {melhorar.filter((m) => m !== dica).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TabelaRelatorio({ linhas }: { linhas: LinhaRelatorio[] }) {
  const temResposta = linhas.some((l) => l.resposta !== undefined);
  const temCerta = linhas.some((l) => l.certa !== undefined);
  return (
    <section className="grid gap-2" aria-labelledby="rel-t">
      <h3 id="rel-t" className="text-xl">Relatório da atividade</h3>
      <div className="cartao" style={{ overflowX: "auto" }}>
        <table className="tabela">
          <thead>
            <tr>
              <th scope="col">Tarefa</th>
              <th scope="col">Resultado</th>
              {temResposta && <th scope="col">A tua resposta</th>}
              {temCerta && <th scope="col">Resposta certa</th>}
              <th scope="col">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => {
              const r = ROTULO[l.resultado];
              return (
                <tr key={i}>
                  <td>
                    <span className="tabular-nums" style={{ color: "var(--suave)" }}>{i + 1}.</span> {l.tarefa}
                  </td>
                  <td style={{ whiteSpace: "nowrap", color: r.cor, fontWeight: 700 }}>
                    <span aria-hidden="true">{r.icone} </span>
                    {r.texto}
                  </td>
                  {temResposta && (
                    <td style={{ wordBreak: "break-word" }}>
                      {l.resposta === "" ? <span style={{ color: "var(--suave)" }}>(vazio)</span> : l.resposta === undefined ? (l.resultado === "saltado" ? <span style={{ color: "var(--suave)" }}>(sem resposta)</span> : null) : l.resposta}
                    </td>
                  )}
                  {temCerta && <td style={{ wordBreak: "break-word" }}>{l.resultado === "certo" && l.certa !== undefined && l.certa === l.resposta ? <span style={{ color: "var(--suave)" }}>igual</span> : l.certa}</td>}
                  <td>{l.feedback ?? (l.resultado === "certo" ? "Bem feito." : l.resultado === "saltado" ? "Por responder: em branco vale zero." : "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
