// ─── Teste de competências e sequências de atividades (também usadas pelos códigos do professor) ──
import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { porSlug } from "../atividades";
import { SeletorContexto } from "../componentes/SeletorContexto";
import { contexto as defContexto } from "../contextos";
import { guardarPercurso, lerPercurso, repositorioLocal, type Percurso as EstadoPercurso, type Tentativa } from "../dados/repositorio";
import { Atividade } from "../motor/Atividade";
import { CICLOS, FAIXAS, NOME_DOMINIO, cicloPorId, faixaDe, limitar, type Ciclo, type DefinicaoAtividade, type Dominio, type Nivel } from "../motor/tipos";
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
                <LigacaoBotao para={`/teste/${c.id}`}>{progresso ? `Retomar (${progresso.indice}/${atividades.length})` : "Escolher"}</LigacaoBotao>
              </div>
            </Cartao>
          );
        })}
      </div>
      <p className="text-sm m-0" style={{ color: "var(--suave)" }}>
        Ensino secundário (10.º a 12.º): usa o percurso do 3.º ciclo ou do Ensino Superior. Para treinar níveis mais altos (até ao nível 5), vai a <Link to="/treino">Atividade</Link>.
      </p>
    </div>
  );
}

export function Percurso() {
  const { ciclo: cicloId = "" } = useParams();
  const ciclo = cicloPorId(cicloId);
  const navegar = useNavigate();
  const atividades = useMemo(() => (ciclo ? ciclo.atividades.map((s) => porSlug(s)!).filter((a) => a.disponivel) : []), [ciclo]);
  const [fim, setFim] = useState<Tentativa[] | null>(null);
  if (!ciclo) return <p>Nível desconhecido.</p>;
  if (fim) return <PrimeiraPagina tentativas={fim} ciclo={ciclo.id} titulo={`o teste do ${ciclo.nome}`} nivel={ciclo.nivel} />;
  return (
    <Sequencia
      chave={ciclo.id}
      titulo={`Teste · ${ciclo.nome}`}
      atividades={atividades}
      nivel={ciclo.nivel}
      origem="teste"
      duracao={ciclo.duracao}
      aoVoltar={() => navegar("/teste")}
      aoTerminar={setFim}
    />
  );
}

/** Percorre uma lista de atividades com ecrã de início (cenário), pausas entre atividades e retoma no mesmo navegador. */
export function Sequencia({
  chave,
  titulo,
  atividades,
  nivel,
  origem,
  duracao,
  extensaoTempo,
  etiquetas,
  antesDeComecar,
  podeComecar = true,
  aoVoltar,
  aoTerminar,
}: {
  chave: string;
  titulo: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atividades: DefinicaoAtividade<any>[];
  nivel: Nivel;
  origem: "teste" | "codigo";
  duracao?: string;
  extensaoTempo?: number;
  etiquetas?: { codigo?: string; aluno?: string };
  /** Conteúdo extra no ecrã de início (ex.: identificação pedida pelo professor). */
  antesDeComecar?: ReactNode;
  podeComecar?: boolean;
  aoVoltar: () => void;
  aoTerminar: (tentativas: Tentativa[]) => void;
}) {
  const { prefs } = usePreferencias();
  const [percurso, setPercurso] = useState<EstadoPercurso | null>(() => lerPercurso(chave));
  const [pausa, setPausa] = useState(() => (percurso?.indice ?? 0) > 0);
  const indice = percurso?.indice ?? 0;

  function iniciar() {
    const p = { ciclo: chave, indice: 0, tentativas: [], iniciadoEm: new Date().toISOString() };
    guardarPercurso(p);
    setPercurso(p);
    setPausa(false);
  }

  function concluiu(t: Tentativa) {
    const base = percurso ?? { ciclo: chave, indice: 0, tentativas: [], iniciadoEm: new Date().toISOString() };
    const novo = { ...base, indice: indice + 1, tentativas: [...base.tentativas, t.id] };
    if (novo.indice >= atividades.length) {
      const todas = repositorioLocal.listarTentativas().filter((x) => novo.tentativas.includes(x.id));
      guardarPercurso(null);
      setPercurso(null);
      aoTerminar(todas);
      return;
    }
    guardarPercurso(novo);
    setPercurso(novo);
    setPausa(true);
  }

  if (!percurso) {
    return (
      <div className="grid gap-5 max-w-3xl">
        <h1 className="text-4xl">{titulo}</h1>
        <p className="m-0">
          Vais fazer {atividades.length} atividade{atividades.length === 1 ? "" : "s"}, pela ordem: {atividades.map((a) => a.titulo[prefs.contexto]).join(" → ")}. Cada uma começa com um briefing e um item de prática que não conta.
        </p>
        {duracao && (
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            Duração estimada {duracao}. O progresso fica guardado neste navegador: podes pausar entre atividades.
          </p>
        )}
        {antesDeComecar}
        <div className="cartao p-5">
          <SeletorContexto />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Botao grande onClick={iniciar} disabled={!podeComecar}>
            Começar
          </Botao>
          <Botao variante="contorno" onClick={aoVoltar}>
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
        <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={atividades.length} aria-valuenow={indice} aria-label="Progresso">
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
          {titulo} · atividade {indice + 1} de {atividades.length}
        </span>
        <div className="barra flex-1" aria-hidden="true">
          <div style={{ width: `${(100 * indice) / atividades.length}%` }} />
        </div>
      </div>
      <Atividade
        key={`${chave}-${indice}`}
        definicao={atual}
        nivel={nivel}
        origem={origem}
        aoConcluir={concluiu}
        escolherContexto={false}
        extensaoTempo={extensaoTempo}
        etiquetas={etiquetas}
        rotuloContinuar={indice + 1 >= atividades.length ? "Ver o resultado" : "Continuar"}
      />
    </div>
  );
}

/** Ecrã final: "primeira página" (jornal) ou "relatório da experiência" (laboratório). */
export function PrimeiraPagina({ tentativas, ciclo, titulo, nivel, codigo, aluno }: { tentativas: Tentativa[]; ciclo: Ciclo | "codigo"; titulo: string; nivel: Nivel; codigo?: string; aluno?: string }) {
  const { prefs } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const porDominio: Record<string, number> = {};
  for (const t of tentativas) {
    const d = porSlug(t.atividade)?.dominio ?? "todas";
    porDominio[d] = t.pontuacao;
  }
  // Média das atividades; o Simulador de Prova conta a dobrar, porque combina as outras competências.
  const peso = (t: Tentativa) => (t.atividade === "simulador" ? 2 : 1);
  const global = limitar(tentativas.reduce((s, t) => s + peso(t) * t.pontuacao, 0) / Math.max(1, tentativas.reduce((s, t) => s + peso(t), 0)));
  const faixa = faixaDe(global);
  const guardado = useMemo(() => repositorioLocal.guardarTeste({ ciclo, pontuacaoGlobal: global, faixa: faixa.nome, porDominio, tentativas: tentativas.map((t) => t.id), codigo, aluno }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const maisFraca = Object.entries(porDominio).sort((a, b) => a[1] - b[1])[0];
  const defFraca = maisFraca ? tentativas.find((t) => porSlug(t.atividade)?.dominio === maisFraca[0]) : undefined;
  const dica = defFraca ? porSlug(defFraca.atividade)!.dica(defFraca.metricas, defFraca.pontuacao) : "";
  const nome = aluno?.trim() || prefs.nome.trim() || ctx.papelAnonimo;
  const data = new Date(guardado.concluidoEm).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl">{ctx.resultado.titulo}</h1>
      <article className="jornal grid gap-4" aria-label={ctx.resultado.titulo}>
        <div className="cabecalho">
          <span className="font-extrabold text-2xl">{ctx.publicacao(nivel)}</span>
          <span className="text-sm self-end" style={{ fontFamily: "var(--fonte-mono)" }}>
            {data} · edição especial{codigo ? ` · sessão ${codigo}` : ""}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="grid gap-2">
            <div className="manchete">
              {nome} termina {titulo} com {global} pontos
            </div>
            <div className="text-sm" style={{ color: "var(--suave)" }}>
              Por {nome} · {ctx.papel}
            </div>
            <p className="coluna m-0">
              Nível “{faixa.nome}”. {tentativas.length} atividade{tentativas.length === 1 ? "" : "s"} concluída{tentativas.length === 1 ? "" : "s"}. {dica}
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
        <LigacaoBotao para="/treinar" variante="discreto">
          Voltar a Treinar
        </LigacaoBotao>
      </div>
    </div>
  );
}
