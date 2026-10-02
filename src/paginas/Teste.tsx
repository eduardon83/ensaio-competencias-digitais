// ─── Teste de competências: escolher nível e percorrer a sequência de atividades ──
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { porSlug } from "../atividades";
import { contexto as defContexto } from "../contextos";
import { guardarPercurso, lerPercurso, repositorioLocal, type Tentativa } from "../dados/repositorio";
import { Atividade } from "../motor/Atividade";
import { CICLOS, FAIXAS, NOME_DOMINIO, cicloPorId, faixaDe, limitar, type Dominio } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao, Cartao, Etiqueta, LigacaoBotao } from "../ui";

export function EscolherNivel() {
  const { prefs } = usePreferencias();
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <h1 className="text-4xl">Teste de competências</h1>
        <p className="m-0">Escolhe o teu nível de ensino. O teste é uma sequência de atividades curtas. Podes pausar entre atividades e retomar neste dispositivo.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {CICLOS.map((c) => {
          const progresso = lerPercurso(c.id);
          const atividades = c.atividades.map((s) => porSlug(s)).filter((a) => a && a.disponivel);
          return (
            <Cartao key={c.id} className="grid gap-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl">{c.nome}</h2>
                <Etiqueta>{c.anos}</Etiqueta>
                <span className="ml-auto text-sm" style={{ color: "var(--suave)" }}>
                  {c.duracao}
                </span>
              </div>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {atividades.length} atividades: {atividades.map((a) => a!.titulo[prefs.contexto]).join(", ")}.
              </p>
              <div className="flex gap-3 flex-wrap">
                <LigacaoBotao para={`/teste/${c.id}`}>{progresso ? `Retomar (${progresso.indice}/${atividades.length})` : "Começar"}</LigacaoBotao>
              </div>
            </Cartao>
          );
        })}
      </div>
      <p className="text-sm m-0" style={{ color: "var(--suave)" }}>
        Ensino secundário (10.º a 12.º): usa o percurso do 3.º ciclo ou do Ensino Superior. Para treinar níveis mais altos (até ao nível 5), vai a <Link to="/treino">Treino</Link>.
      </p>
    </div>
  );
}

export function Percurso() {
  const { ciclo: cicloId = "" } = useParams();
  const ciclo = cicloPorId(cicloId);
  const navegar = useNavigate();
  const { prefs } = usePreferencias();
  const atividades = useMemo(() => (ciclo ? ciclo.atividades.map((s) => porSlug(s)!).filter((a) => a.disponivel) : []), [ciclo]);
  const [percurso, setPercurso] = useState(() => (ciclo ? lerPercurso(ciclo.id) : null));
  const [pausa, setPausa] = useState(() => (percurso?.indice ?? 0) > 0);
  const [fim, setFim] = useState<Tentativa[] | null>(null);

  if (!ciclo) return <p>Nível desconhecido.</p>;
  const indice = percurso?.indice ?? 0;

  function iniciar() {
    const p = { ciclo: ciclo!.id, indice: 0, tentativas: [], iniciadoEm: new Date().toISOString() };
    guardarPercurso(p);
    setPercurso(p);
    setPausa(false);
  }

  function concluiu(t: Tentativa) {
    const novo = { ...(percurso ?? { ciclo: ciclo!.id, indice: 0, tentativas: [], iniciadoEm: new Date().toISOString() }), indice: indice + 1, tentativas: [...(percurso?.tentativas ?? []), t.id] };
    if (novo.indice >= atividades.length) {
      const todas = repositorioLocal.listarTentativas().filter((x) => novo.tentativas.includes(x.id));
      guardarPercurso(null);
      setPercurso(null);
      setFim(todas);
      return;
    }
    guardarPercurso(novo);
    setPercurso(novo);
    setPausa(true);
  }

  if (fim) return <ResultadoFinal tentativas={fim} cicloId={ciclo.id} />;

  if (!percurso) {
    return (
      <div className="grid gap-5 max-w-3xl">
        <h1 className="text-4xl">Teste · {ciclo.nome}</h1>
        <p className="m-0">
          Vais fazer {atividades.length} atividades, pela ordem: {atividades.map((a) => a.titulo[prefs.contexto]).join(" → ")}. Cada uma começa com um briefing e um item de prática.
        </p>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          Duração estimada {ciclo.duracao}. O progresso fica guardado neste navegador: podes pausar entre atividades.
        </p>
        <div className="flex gap-3">
          <Botao grande onClick={iniciar}>
            Começar o teste
          </Botao>
          <Botao variante="contorno" onClick={() => navegar("/teste")}>
            Voltar
          </Botao>
        </div>
      </div>
    );
  }

  if (pausa) {
    const prox = atividades[indice];
    return (
      <div className="grid gap-5 max-w-3xl">
        <h1 className="text-3xl">Pausa</h1>
        <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={atividades.length} aria-valuenow={indice} aria-label="Progresso do teste">
          <div style={{ width: `${(100 * indice) / atividades.length}%` }} />
        </div>
        <p className="m-0">
          {indice} de {atividades.length} atividades feitas. A seguir: <strong>{prox.titulo[prefs.contexto]}</strong> ({NOME_DOMINIO[prox.dominio]}).
        </p>
        <div className="flex gap-3 flex-wrap">
          <Botao grande onClick={() => setPausa(false)}>
            Continuar
          </Botao>
          <LigacaoBotao para="/" variante="contorno">
            Sair e retomar mais tarde
          </LigacaoBotao>
          <Botao
            variante="discreto"
            onClick={() => {
              guardarPercurso(null);
              setPercurso(null);
              setPausa(false);
            }}
          >
            Recomeçar do início
          </Botao>
        </div>
      </div>
    );
  }

  const atual = atividades[indice];
  return (
    <div className="grid gap-4">
      <div className="text-sm flex gap-3 items-center" style={{ color: "var(--suave)" }}>
        <span>
          Teste {ciclo.nome} · atividade {indice + 1} de {atividades.length}
        </span>
        <div className="barra flex-1" aria-hidden="true">
          <div style={{ width: `${(100 * indice) / atividades.length}%` }} />
        </div>
      </div>
      <Atividade key={`${ciclo.id}-${indice}`} definicao={atual} nivel={ciclo.nivel} origem="teste" aoConcluir={concluiu} rotuloContinuar={indice + 1 >= atividades.length ? "Ver o resultado do teste" : "Continuar o teste"} />
    </div>
  );
}

function ResultadoFinal({ tentativas, cicloId }: { tentativas: Tentativa[]; cicloId: string }) {
  const { prefs } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const ciclo = cicloPorId(cicloId)!;
  const porDominio: Record<string, number> = {};
  for (const t of tentativas) {
    const d = porSlug(t.atividade)?.dominio ?? "todas";
    porDominio[d] = t.pontuacao;
  }
  const global = limitar(tentativas.reduce((s, t) => s + t.pontuacao, 0) / Math.max(1, tentativas.length));
  const faixa = faixaDe(global);
  const guardado = useMemo(() => repositorioLocal.guardarTeste({ ciclo: ciclo.id, pontuacaoGlobal: global, faixa: faixa.nome, porDominio, tentativas: tentativas.map((t) => t.id) }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const maisFraca = Object.entries(porDominio).sort((a, b) => a[1] - b[1])[0];
  const defFraca = maisFraca ? tentativas.find((t) => porSlug(t.atividade)?.dominio === maisFraca[0]) : undefined;
  const dica = defFraca ? porSlug(defFraca.atividade)!.dica(defFraca.metricas, defFraca.pontuacao) : "";
  const nome = prefs.nome.trim() || ctx.papelAnonimo;
  const data = new Date(guardado.concluidoEm).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl">{ctx.resultado.titulo}</h1>
      <article className="jornal grid gap-4" aria-label={ctx.resultado.titulo}>
        <div className="cabecalho">
          <span className="font-extrabold text-2xl">{ctx.publicacao(ciclo.nivel)}</span>
          <span className="text-sm self-end" style={{ fontFamily: "var(--fonte-mono)" }}>
            {data} · edição especial
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="grid gap-2">
            <div className="manchete">
              {nome} termina o teste do {ciclo.nome} com {global} pontos
            </div>
            <div className="text-sm" style={{ color: "var(--suave)" }}>
              Por {nome} · {ctx.papel}
            </div>
            <p className="coluna m-0">
              Nível «{faixa.nome}». {tentativas.length} atividades concluídas. {dica}
            </p>
          </div>
          <div className="grid gap-2 content-start">
            {Object.entries(porDominio).map(([d, p]) => (
              <div key={d} className="grid gap-1 text-sm coluna">
                <div className="flex justify-between">
                  <span>{NOME_DOMINIO[d as Dominio]}</span>
                  <strong className="tabular-nums">{p}</strong>
                </div>
                <div className="barra" aria-hidden="true">
                  <div style={{ width: `${p}%`, background: p >= 85 ? "var(--b4)" : p >= 65 ? "var(--b3)" : p >= 40 ? "var(--b2)" : "var(--b1)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
      <div className="faixa" role="list" aria-label="Faixas">
        {FAIXAS.map((f) => (
          <div key={f.nome} role="listitem" style={{ outline: f.nome === faixa.nome ? "3px solid var(--acento)" : undefined }}>
            <b style={{ fontFamily: "var(--fonte-titulo)" }}>{f.nome}</b>
            <br />
            <span className="text-xs tabular-nums" style={{ color: "var(--suave)" }}>
              {f.min} a {f.max}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <Botao onClick={() => window.print()}>Guardar / imprimir</Botao>
        <LigacaoBotao para="/treino" variante="contorno">
          Treinar a competência mais fraca
        </LigacaoBotao>
        <LigacaoBotao para="/teste" variante="discreto">
          Outro nível
        </LigacaoBotao>
      </div>
    </div>
  );
}
