// ─── A minha conta (histórico local) e Observatório (estatísticas anónimas) ──
import { useState } from "react";
import { ATIVIDADES, porSlug } from "../atividades";
import { repositorioLocal } from "../dados/repositorio";
import { NOME_DOMINIO, NOME_NIVEL, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao } from "../ui";

export function Conta() {
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
    a.download = "ecd-tentativas.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">O meu histórico</h1>
        <p className="m-0">
          Nesta versão o histórico vive só neste navegador, sem conta. As contas (ligação mágica por email, certificados, sincronização) chegam na fase 4. Sessão anónima: <code style={{ fontFamily: "var(--fonte-mono)", fontSize: ".85em" }}>{repositorioLocal.sessaoId().slice(0, 8)}…</code>
        </p>
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
            if (window.confirm("Apagar todo o histórico deste navegador? Não é possível recuperar.")) {
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

export function Observatorio() {
  const e = repositorioLocal.estatisticas();
  const MINIMO = 20;
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Observatório</h1>
        <p className="m-0">Estatísticas anónimas sobre as competências avaliadas. Na versão publicada, estes números vêm de todas as sessões (agregados no servidor) e qualquer valor com menos de {MINIMO} tentativas fica oculto. Nesta versão local mostram-se apenas os dados deste navegador.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="cartao p-5">
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            Tentativas
          </div>
          <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>
            {e.totalTentativas}
          </div>
        </div>
        <div className="cartao p-5">
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            Testes completos
          </div>
          <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>
            {e.totalTestes}
          </div>
        </div>
        <div className="cartao p-5">
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            Por dispositivo
          </div>
          <div className="text-sm">{Object.entries(e.porDispositivo).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}</div>
        </div>
      </div>
      <section className="grid gap-2">
        <h2 className="text-2xl">Média por competência</h2>
        <div className="cartao p-4 grid gap-3">
          {ATIVIDADES.filter((a) => a.disponivel).map((a) => {
            const m = e.mediaPorAtividade[a.slug];
            return (
              <div key={a.slug} className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{NOME_DOMINIO[a.dominio]}</span>
                  <span className="tabular-nums" style={{ color: "var(--suave)" }}>
                    {m ? `${m.media} (n=${m.n})` : "sem dados"}
                  </span>
                </div>
                <div className="barra" aria-hidden="true">
                  <div style={{ width: `${m?.media ?? 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-2xl">Tentativas por nível</h2>
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="cartao p-3 text-center min-w-24">
              <div className="text-xs" style={{ color: "var(--suave)" }}>
                Nível {n}
              </div>
              <div className="text-2xl font-bold tabular-nums">{e.porNivel[n] ?? 0}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
