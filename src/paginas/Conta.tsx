// ─── Os meus resultados (só neste navegador) e Observatório (agregados anónimos) ──
import { useEffect, useState } from "react";
import { ATIVIDADES, porSlug } from "../atividades";
import { repositorioLocal } from "../dados/repositorio";
import { obterAgregados, telemetriaConfigurada, type Agregados } from "../dados/telemetria";
import { NOME_DOMINIO, NOME_NIVEL, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao } from "../ui";
import { Painel } from "./Admin";

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
        <h1 className="text-4xl">Os meus resultados</h1>
        <p className="m-0">Não há contas: os teus resultados ficam só neste navegador, para veres a evolução e os melhores por nível. Podes exportá-los ou apagá-los quando quiseres.</p>
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

export function Observatorio() {
  const [remoto, setRemoto] = useState<Agregados | null>(null);
  const [estado, setEstado] = useState<"a_carregar" | "ok" | "erro" | "local">(telemetriaConfigurada ? "a_carregar" : "local");

  useEffect(() => {
    if (!telemetriaConfigurada) return;
    obterAgregados().then((r) => {
      if (r && !("erro" in r)) {
        setRemoto(r);
        setEstado("ok");
      } else setEstado("erro");
    });
  }, []);

  const local = repositorioLocal.estatisticas();

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Observatório</h1>
        <p className="m-0">Estatísticas anónimas sobre as competências avaliadas por todas as pessoas que usaram a aplicação. Qualquer grupo com menos de {remoto?.limiar ?? 20} tentativas fica oculto. Nada aqui identifica alguém.</p>
      </header>

      {estado === "a_carregar" && <p className="m-0" style={{ color: "var(--suave)" }}>A obter os agregados…</p>}
      {estado === "ok" && remoto && <Painel dados={remoto} />}
      {(estado === "erro" || estado === "local") && (
        <>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            {estado === "erro" ? "Não foi possível obter os agregados globais agora. " : "Esta instalação não tem recolha de estatísticas configurada. "}
            Mostram-se apenas os dados deste navegador.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="cartao p-5">
              <div className="text-sm" style={{ color: "var(--suave)" }}>
                Tentativas neste navegador
              </div>
              <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>
                {local.totalTentativas}
              </div>
            </div>
            <div className="cartao p-5">
              <div className="text-sm" style={{ color: "var(--suave)" }}>
                Testes completos
              </div>
              <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>
                {local.totalTestes}
              </div>
            </div>
          </div>
          <section className="cartao p-4 grid gap-3">
            <h2 className="text-xl">Média por competência</h2>
            {ATIVIDADES.filter((a) => a.disponivel).map((a) => {
              const m = local.mediaPorAtividade[a.slug];
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
          </section>
        </>
      )}
    </div>
  );
}
