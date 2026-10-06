// ─── Observatório: estatísticas anónimas com filtros, período, gráficos e exportação (CSV e PDF) ──
// Com ponto de recolha: agregados de todas as pessoas (grupos com menos de 20 tentativas ocultos; com a chave de
// administração, completos). Sem ponto de recolha: os dados deste navegador, com a mesma agregação.
import { useEffect, useMemo, useState } from "react";
import { Rico } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { Caminho } from "../componentes/Caminho";
import { Barras, Colunas, type Ponto } from "../componentes/Graficos";
import { GRUPOS, qualquerPorSlug } from "../registo";
import { repositorioLocal } from "../dados/repositorio";
import { obterAgregados, telemetriaConfigurada } from "../dados/telemetria";
import { agregar, FILTROS_INICIAIS, parametros, paraCsv, periodoPorId, periodos, type Agregados, type Filtros } from "../dados/observatorio";
import { CICLOS, NIVEIS, NOME_NIVEL } from "../motor/tipos";
import { Botao, Cartao } from "../ui";

const ROTULOS: Record<string, Record<string, string>> = {
  dispositivo: { desktop: "Computador", tablet: "Tablet", telemovel: "Telemóvel" },
  contexto: { jornal: "Redação do jornal", laboratorio: "Laboratório" },
  formato: { mosaico: "Mosaico", original: "Original" },
  origem: { treino: "Treino livre (desafios, jogos, segurança)", teste: "Preparação para provas", codigo: "Prova do professor" },
};

export function rotulo(campo: string, valor: string): string {
  if (campo === "nivel") return `Nível ${valor}${NOME_NIVEL[Number(valor) as 1] ? ` · ${NOME_NIVEL[Number(valor) as 1]}` : ""}`;
  if (campo === "ciclo") return CICLOS.find((c) => c.id === valor)?.nome ?? (valor === "codigo" ? "Prova do professor" : valor);
  if (campo === "mes") {
    const [a, m] = valor.split("-");
    return `${m}/${a}`;
  }
  if (campo === "dia") return valor.split("-").reverse().join("/");
  return ROTULOS[campo]?.[valor] ?? valor;
}

const nome = (slug: string) => qualquerPorSlug(slug)?.titulo.jornal ?? slug;

function descreverFiltros(f: Filtros): string[] {
  const p = periodoPorId(f.periodo);
  const r = [`Período: ${p.nome}${p.desde ? ` (${p.desde.split("-").reverse().join("/")} a ${(p.ate ?? "").split("-").reverse().join("/")})` : ""}`];
  if (f.atividade) r.push(`Desafio, teste ou jogo: ${nome(f.atividade)}`);
  if (f.nivel) r.push(`Nível: ${rotulo("nivel", f.nivel)}`);
  for (const k of ["dispositivo", "contexto", "origem"] as const) if (f[k]) r.push(`${{ dispositivo: "Dispositivo", contexto: "Cenário", origem: "Origem" }[k]}: ${rotulo(k, f[k])}`);
  return r;
}

function descarregar(blob: Blob, ficheiro: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ficheiro;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Dados deste navegador no formato das linhas do ponto de recolha. */
function agregarLocal(f: Filtros): Agregados {
  const ts = repositorioLocal.listarTentativas().map((t) => ({ data: t.concluidaEm, sessao: t.sessaoId, atividade: t.atividade, nivel: t.nivel, pontuacao: t.pontuacao, dispositivo: t.dispositivo, contexto: t.contexto, formato: t.formato, origem: t.origem }));
  const xs = repositorioLocal.listarTestes().map((t) => ({ data: t.concluidoEm, ciclo: t.ciclo, pontuacao: t.pontuacaoGlobal }));
  return agregar(ts, xs, parametros(f), 1, false); // os próprios dados: sem limiar
}

export function PainelObservatorio({ chave }: { chave?: string }) {
  const [f, setF] = useState<Filtros>(FILTROS_INICIAIS);
  const [dados, setDados] = useState<Agregados | null>(null);
  const [estado, setEstado] = useState<"a_carregar" | "ok" | "erro" | "local">(telemetriaConfigurada ? "a_carregar" : "local");
  const [aExportar, setAExportar] = useState(false);
  const lista = useMemo(() => periodos(), []);

  useEffect(() => {
    if (!telemetriaConfigurada) {
      setDados(agregarLocal(f));
      setEstado("local");
      return;
    }
    let ativo = true;
    setEstado("a_carregar");
    obterAgregados(chave, parametros(f)).then((r) => {
      if (!ativo) return;
      if (r && !("erro" in r)) {
        setDados(r);
        setEstado("ok");
      } else {
        setDados(agregarLocal(f));
        setEstado("erro");
      }
    });
    return () => {
      ativo = false;
    };
  }, [f, chave]);

  const mudar = (k: keyof Filtros, v: string) => setF((x) => ({ ...x, [k]: v }));
  const periodo = periodoPorId(f.periodo);
  const curto = periodo.desde !== null && (new Date(periodo.ate ?? "").getTime() - new Date(periodo.desde).getTime()) / 864e5 <= 100;

  const pontos = (campo: string, m: Record<string, number>, ordenarPorChave = false): Ponto[] =>
    Object.entries(m)
      .sort((a, b) => (ordenarPorChave ? (a[0] < b[0] ? -1 : 1) : b[1] - a[1]))
      .map(([k, v]) => ({ rotulo: rotulo(campo, k), valor: v }));
  const medias: Ponto[] = dados ? Object.entries(dados.por_atividade).sort((a, b) => b[1].media - a[1].media).map(([s, g]) => ({ rotulo: nome(s), valor: g.media, nota: `n = ${g.n}` })) : [];
  const ciclos: Ponto[] = dados ? Object.entries(dados.testes_por_ciclo).map(([k, g]) => ({ rotulo: rotulo("ciclo", k), valor: g.media, nota: `n = ${g.n}` })) : [];
  const tempo = dados ? (curto ? pontos("dia", dados.por_dia, true) : pontos("mes", dados.por_mes, true)) : [];
  const niveis = dados ? NIVEIS.filter((n) => dados.por_nivel[n]).map((n) => ({ rotulo: `N${n}`, valor: dados.por_nivel[n] })) : [];

  async function exportarPdf() {
    if (!dados) return;
    setAExportar(true);
    try {
      const { gerarRelatorioPdf } = await import("../dados/relatorioPdf");
      const blob = gerarRelatorioPdf(
        dados,
        [estado === "ok" ? "Fonte: todas as pessoas que usaram a aplicação (anónimo)" : "Fonte: só os dados deste navegador", ...descreverFiltros(f)],
        [
          { titulo: "Média por desafio, teste e jogo (0 a 100)", linhas: medias, max: 100 },
          { titulo: "Preparação para provas (média)", linhas: ciclos, max: 100 },
          { titulo: "Tentativas por nível", linhas: pontos("nivel", dados.por_nivel, true) },
          { titulo: "Tentativas por dispositivo", linhas: pontos("dispositivo", dados.por_dispositivo) },
          { titulo: "Tentativas por cenário", linhas: pontos("contexto", dados.por_contexto) },
          { titulo: "Tentativas por origem", linhas: pontos("origem", dados.por_origem) },
        ],
        { titulo: curto ? "Tentativas por dia" : "Tentativas por mês", pontos: tempo },
      );
      descarregar(blob, `ecd-observatorio-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setAExportar(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Cartao className="grid gap-3" aria-labelledby="filtros-t">
        <h2 id="filtros-t" className="text-xl">Filtros</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="campo">
            <label htmlFor="obs-periodo">Período</label>
            <select id="obs-periodo" value={f.periodo} onChange={(e) => mudar("periodo", e.target.value)}>
              <optgroup label="Recentes">
                {lista.filter((p) => !p.id.startsWith("letivo")).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </optgroup>
              <optgroup label="Anos letivos (1 de setembro a 31 de agosto)">
                {lista.filter((p) => p.id.startsWith("letivo")).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="obs-atividade">Desafio, teste ou jogo</label>
            <select id="obs-atividade" value={f.atividade} onChange={(e) => mudar("atividade", e.target.value)}>
              <option value="">Todos</option>
              {GRUPOS.map((g) => (
                <optgroup key={g.id} label={g.nome === "Atividades" ? "Desafios" : g.nome}>
                  {g.itens.map((a) => <option key={a.slug} value={a.slug}>{a.titulo.jornal}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <Escolha id="obs-nivel" rotulo="Nível" valor={f.nivel} aoMudar={(v) => mudar("nivel", v)} opcoes={NIVEIS.map((n) => [String(n), rotulo("nivel", String(n))])} />
          <Escolha id="obs-dispositivo" rotulo="Dispositivo" valor={f.dispositivo} aoMudar={(v) => mudar("dispositivo", v)} opcoes={Object.entries(ROTULOS.dispositivo)} />
          <Escolha id="obs-contexto" rotulo="Cenário" valor={f.contexto} aoMudar={(v) => mudar("contexto", v)} opcoes={Object.entries(ROTULOS.contexto)} />
          <Escolha id="obs-origem" rotulo="Origem" valor={f.origem} aoMudar={(v) => mudar("origem", v)} opcoes={Object.entries(ROTULOS.origem)} />
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Botao variante="discreto" onClick={() => setF(FILTROS_INICIAIS)} disabled={JSON.stringify(f) === JSON.stringify(FILTROS_INICIAIS)}>
            Limpar filtros
          </Botao>
          <Botao variante="contorno" disabled={!dados} onClick={() => dados && descarregar(new Blob([paraCsv(dados, descreverFiltros(f), nome, rotulo)], { type: "text/csv;charset=utf-8" }), `ecd-observatorio-${new Date().toISOString().slice(0, 10)}.csv`)}>
            Exportar CSV
          </Botao>
          <Botao variante="contorno" disabled={!dados || aExportar} onClick={() => void exportarPdf()}>
            {aExportar ? "A preparar o PDF…" : "Exportar PDF"}
          </Botao>
        </div>
      </Cartao>

      <p className="m-0 text-sm" role="status" style={{ color: "var(--suave)" }}>
        {estado === "a_carregar" && "A obter os dados…"}
        {estado === "ok" && (dados?.completo ? "Dados completos de todas as pessoas (administração, sem limiar)." : `Dados anónimos de todas as pessoas. Grupos com menos de ${dados?.limiar ?? 20} tentativas ficam ocultos.`)}
        {estado === "erro" && "Não foi possível obter os dados globais agora. Mostram-se apenas os dados deste navegador."}
        {estado === "local" && "Esta instalação não tem recolha de estatísticas configurada. Mostram-se apenas os dados deste navegador."}
      </p>

      {dados && (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Numero rotulo="Tentativas" valor={dados.abaixo_limiar ? `< ${dados.limiar}` : dados.total_tentativas} />
            <Numero rotulo="Testes completos" valor={dados.total_testes} />
            <Numero rotulo="Navegadores" valor={dados.abaixo_limiar ? "–" : dados.sessoes} />
            <Numero rotulo="Média geral" valor={dados.media_geral ?? "–"} />
          </div>
          <Barras titulo="Média por desafio, teste e jogo (0 a 100)" dados={medias} max={100} unidade="Média" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Colunas titulo={curto ? "Tentativas por dia" : "Tentativas por mês"} dados={tempo} unidade="Tentativas" />
            <Colunas titulo="Tentativas por nível" dados={niveis} unidade="Tentativas" />
            <Barras titulo="Por dispositivo" dados={pontos("dispositivo", dados.por_dispositivo)} unidade="Tentativas" />
            <Barras titulo="Por origem" dados={pontos("origem", dados.por_origem)} unidade="Tentativas" />
            <Barras titulo="Por cenário" dados={pontos("contexto", dados.por_contexto)} unidade="Tentativas" />
            <Barras titulo="Preparação para provas (média)" dados={ciclos} max={100} unidade="Média" />
          </div>
          <section className="grid gap-2">
            <h2 className="text-2xl">Média por nível</h2>
            <div className="cartao" style={{ overflowX: "auto" }}>
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">Desafio, teste ou jogo</th>
                    <th scope="col">Tentativas</th>
                    <th scope="col">Média</th>
                    {NIVEIS.map((n) => <th key={n} scope="col">N{n} (n · média)</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(dados.por_atividade)
                    .sort((a, b) => b[1].n - a[1].n)
                    .map(([slug, g]) => (
                      <tr key={slug}>
                        <td>{nome(slug)}</td>
                        <td className="tabular-nums">{g.n}</td>
                        <td className="tabular-nums font-bold">{g.media}</td>
                        {NIVEIS.map((n) => {
                          const k = dados.por_atividade_nivel[`${slug}:${n}`];
                          return <td key={n} className="tabular-nums text-sm">{k ? `${k.n} · ${k.media}` : "–"}</td>;
                        })}
                      </tr>
                    ))}
                  {Object.keys(dados.por_atividade).length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ color: "var(--suave)" }}>Ainda sem dados suficientes para estes filtros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Escolha({ id, rotulo: r, valor, aoMudar, opcoes }: { id: string; rotulo: string; valor: string; aoMudar: (v: string) => void; opcoes: [string, string][] }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{r}</label>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)}>
        <option value="">Todos</option>
        {opcoes.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );
}

function Numero({ rotulo: r, valor }: { rotulo: string; valor: number | string }) {
  return (
    <div className="cartao p-5">
      <div className="text-sm" style={{ color: "var(--suave)" }}>{r}</div>
      <div className="text-4xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)" }}>{valor}</div>
    </div>
  );
}

export function Observatorio() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[]} atual={PAGINAS.observatorio.titulo} />
        <h1 className="text-4xl">{PAGINAS.observatorio.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.observatorio.introducao} /></p>
      </header>
      <PainelObservatorio />
    </div>
  );
}
