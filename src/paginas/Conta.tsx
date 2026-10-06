// ─── Os meus resultados (só neste navegador) ──
import { Rico } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { Caminho } from "../componentes/Caminho";
import { useState } from "react";
import { qualquerPorSlug as porSlug } from "../registo";
import { repositorioLocal } from "../dados/repositorio";
import { NOME_NIVEL, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao } from "../ui";

export function Resultados() {
  const { prefs } = usePreferencias();
  const [, forcar] = useState(0);
  const tentativas = repositorioLocal.listarTentativas().slice().reverse();
  const testes = repositorioLocal.listarTestes().slice().reverse();

  function exportar() {
    const linhas = [["data", "atividade", "nivel", "pontuacao", "duracao_s", "origem", "contexto", "formato", "extensao_tempo"].join(";")];
    for (const t of tentativas) linhas.push([t.concluidaEm, t.atividade, t.nivel, t.pontuacao, Math.round(t.duracaoMs / 1000), t.origem, t.contexto, t.formato, t.extensaoTempo].join(";"));
    const blob = new Blob(["﻿" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ecd-resultados.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[]} atual={PAGINAS.resultados.titulo} />
        <h1 className="text-4xl">{PAGINAS.resultados.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.resultados.introducao} /></p>
      </header>

      {testes.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-2xl">Testes completos</h2>
          <div className="cartao" style={{ overflowX: "auto" }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Nível</th>
                  <th scope="col">Pontuação</th>
                  <th scope="col">Faixa</th>
                </tr>
              </thead>
              <tbody>
                {testes.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.concluidoEm).toLocaleString("pt-PT")}</td>
                    <td>{t.ciclo}</td>
                    <td className="tabular-nums">{t.pontuacaoGlobal}</td>
                    <td>{t.faixa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="grid gap-2">
        <h2 className="text-2xl">Tentativas</h2>
        {tentativas.length === 0 ? (
          <p className="m-0" style={{ color: "var(--suave)" }}>
            Ainda não há tentativas. Começa pelo Treino.
          </p>
        ) : (
          <div className="cartao" style={{ overflowX: "auto" }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Atividade</th>
                  <th scope="col">Nível</th>
                  <th scope="col">Pontuação</th>
                  <th scope="col">Tempo</th>
                  <th scope="col">Origem</th>
                </tr>
              </thead>
              <tbody>
                {tentativas.slice(0, 100).map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.concluidaEm).toLocaleString("pt-PT")}</td>
                    <td>{porSlug(t.atividade)?.titulo[prefs.contexto] ?? t.atividade}</td>
                    <td>
                      {t.nivel} · {NOME_NIVEL[t.nivel as Nivel]}
                    </td>
                    <td className="tabular-nums font-bold">{t.pontuacao}</td>
                    <td className="tabular-nums">{Math.round(t.duracaoMs / 1000)} s</td>
                    <td>{t.origem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex gap-3 flex-wrap">
        <Botao variante="contorno" onClick={exportar} disabled={tentativas.length === 0}>
          Exportar CSV
        </Botao>
        <Botao
          variante="perigo"
          onClick={() => {
            if (window.confirm("Apagar todos os resultados guardados neste navegador? Não é possível recuperar.")) {
              repositorioLocal.apagarTudo();
              forcar((n) => n + 1);
            }
          }}
          disabled={tentativas.length === 0 && testes.length === 0}
        >
          Apagar tudo
        </Botao>
      </div>
    </div>
  );
}
