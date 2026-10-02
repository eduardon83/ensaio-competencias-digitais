// ─── Administração: agregados completos da telemetria, protegidos pela chave verificada no ponto de recolha ──
import { useEffect, useState } from "react";
import { ATIVIDADES } from "../atividades";
import { obterAgregados, telemetriaConfigurada, type Agregados } from "../dados/telemetria";
import { NOME_DOMINIO } from "../motor/tipos";
import { Botao, CampoTexto } from "../ui";

const CHAVE_SESSAO = "ecd.admin.chave";

export function Admin() {
  const [chave, setChave] = useState(() => {
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) ?? "";
    } catch {
      return "";
    }
  });
  const [dados, setDados] = useState<Agregados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(false);

  async function carregar(c: string) {
    setACarregar(true);
    setErro(null);
    const r = await obterAgregados(c);
    setACarregar(false);
    if (!r) return setErro("Ponto de recolha não configurado (VITE_TELEMETRIA_URL).");
    if ("erro" in r) {
      setDados(null);
      setErro(r.erro === "chave" ? "Chave incorreta." : `Não foi possível obter os dados (${r.erro}).`);
      return;
    }
    if (!r.completo) {
      setDados(null);
      setErro("Chave incorreta.");
      return;
    }
    try {
      sessionStorage.setItem(CHAVE_SESSAO, c);
    } catch {
      /* nada */
    }
    setDados(r);
  }

  useEffect(() => {
    if (chave) void carregar(chave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!telemetriaConfigurada) {
    return (
      <div className="grid gap-3 max-w-2xl">
        <h1 className="text-4xl">Administração</h1>
        <p className="m-0">A recolha de estatísticas não está configurada nesta instalação. Define `VITE_TELEMETRIA_URL` (ver `telemetria/README.md`) e volta a fazer o build.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Administração</h1>
        <p className="m-0">Estatísticas completas da recolha anónima (sem limiar). A chave é verificada no ponto de recolha e fica só nesta sessão do navegador.</p>
      </header>
      {!dados && (
        <form
          className="flex gap-3 items-end flex-wrap max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            void carregar(chave);
          }}
        >
          <CampoTexto id="chave" rotulo="Chave de administração" type="password" value={chave} onChange={(e) => setChave(e.target.value)} autoComplete="current-password" erro={erro} className="flex-1" />
          <Botao type="submit" disabled={!chave || aCarregar}>
            {aCarregar ? "A verificar…" : "Entrar"}
          </Botao>
        </form>
      )}
      {dados && (
        <>
          <div className="flex gap-3 items-center flex-wrap text-sm" style={{ color: "var(--suave)" }}>
            <span>Gerado em {new Date(dados.gerado_em).toLocaleString("pt-PT")}</span>
            <Botao variante="discreto" onClick={() => void carregar(chave)}>
              Atualizar
            </Botao>
            <Botao
              variante="discreto"
              onClick={() => {
                setDados(null);
                setChave("");
                try {
                  sessionStorage.removeItem(CHAVE_SESSAO);
                } catch {
                  /* nada */
                }
              }}
            >
              Sair
            </Botao>
          </div>
          <Painel dados={dados} />
        </>
      )}
    </div>
  );
}

export function Painel({ dados }: { dados: Agregados }) {
  const nomeAtividade = (slug: string) => ATIVIDADES.find((a) => a.slug === slug)?.titulo.jornal ?? slug;
  const dias = Object.entries(dados.por_dia).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, 30);
  const maxDia = Math.max(1, ...dias.map(([, v]) => v));
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Numero rotulo="Tentativas" valor={dados.total_tentativas} />
        <Numero rotulo="Testes completos" valor={dados.total_testes} />
        <Numero rotulo="Sessões (navegadores)" valor={dados.sessoes} />
        <Numero rotulo="Limiar aplicado" valor={dados.limiar} />
      </div>
      <section className="grid gap-2">
        <h2 className="text-2xl">Média por atividade</h2>
        <div className="cartao" style={{ overflowX: "auto" }}>
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Atividade</th>
                <th scope="col">Competência</th>
                <th scope="col">Tentativas</th>
                <th scope="col">Média</th>
                <th scope="col">Por nível (n · média)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dados.por_atividade)
                .sort((a, b) => b[1].n - a[1].n)
                .map(([slug, g]) => (
                  <tr key={slug}>
                    <td>{nomeAtividade(slug)}</td>
                    <td>{NOME_DOMINIO[ATIVIDADES.find((a) => a.slug === slug)?.dominio ?? "todas"]}</td>
                    <td className="tabular-nums">{g.n}</td>
                    <td className="tabular-nums font-bold">{g.media}</td>
                    <td className="tabular-nums text-sm">
                      {[1, 2, 3, 4, 5]
                        .map((n) => {
                          const k = dados.por_atividade_nivel[`${slug}:${n}`];
                          return k ? `N${n}: ${k.n} · ${k.media}` : null;
                        })
                        .filter(Boolean)
                        .join("   ")}
                    </td>
                  </tr>
                ))}
              {Object.keys(dados.por_atividade).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--suave)" }}>
                    Ainda sem dados suficientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Lista titulo="Por nível" mapa={dados.por_nivel} prefixo="Nível " />
        <Lista titulo="Por dispositivo" mapa={dados.por_dispositivo} />
        <Lista titulo="Por contexto" mapa={dados.por_contexto} />
        <Lista titulo="Por formato" mapa={dados.por_formato} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Lista titulo="Por origem" mapa={dados.por_origem} />
        <section className="cartao p-4 grid gap-2">
          <h3 className="text-base">Testes por ciclo (n · média)</h3>
          <ul className="m-0 p-0 list-none grid gap-1 text-sm">
            {Object.entries(dados.testes_por_ciclo).map(([k, g]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="tabular-nums">
                  {g.n} · {g.media}
                </span>
              </li>
            ))}
            {Object.keys(dados.testes_por_ciclo).length === 0 && <li style={{ color: "var(--suave)" }}>Sem dados.</li>}
          </ul>
        </section>
      </div>
      <section className="cartao p-4 grid gap-2">
        <h3 className="text-base">Tentativas por dia (últimos 30 dias com dados)</h3>
        <ul className="m-0 p-0 list-none grid gap-1 text-sm">
          {dias.map(([d, v]) => (
            <li key={d} className="grid items-center gap-2" style={{ gridTemplateColumns: "6.5rem 1fr 3rem" }}>
              <span className="tabular-nums">{d}</span>
              <div className="barra" aria-hidden="true">
                <div style={{ width: `${(100 * v) / maxDia}%` }} />
              </div>
              <span className="tabular-nums text-right">{v}</span>
            </li>
          ))}
          {dias.length === 0 && <li style={{ color: "var(--suave)" }}>Sem dados.</li>}
        </ul>
      </section>
    </div>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="cartao p-5">
      <div className="text-sm" style={{ color: "var(--suave)" }}>
        {rotulo}
      </div>
      <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>
        {valor}
      </div>
    </div>
  );
}

function Lista({ titulo, mapa, prefixo = "" }: { titulo: string; mapa: Record<string, number>; prefixo?: string }) {
  const entradas = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
  return (
    <section className="cartao p-4 grid gap-2">
      <h3 className="text-base">{titulo}</h3>
      <ul className="m-0 p-0 list-none grid gap-1 text-sm">
        {entradas.map(([k, v]) => (
          <li key={k} className="flex justify-between">
            <span>
              {prefixo}
              {k}
            </span>
            <span className="tabular-nums">{v}</span>
          </li>
        ))}
        {entradas.length === 0 && <li style={{ color: "var(--suave)" }}>Sem dados.</li>}
      </ul>
    </section>
  );
}
