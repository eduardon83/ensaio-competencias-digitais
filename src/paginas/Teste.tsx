// ─── Preparação para provas e exames digitais e sequências de atividades (também usadas pelos códigos do professor) ──
import { Rico, preencher } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { Caminho } from "../componentes/Caminho";
import { qualquerPorSlug as porSlug } from "../registo";
import { frase } from "../motor/frases";
import { SeletorContexto } from "../componentes/SeletorContexto";
import { contexto as defContexto } from "../contextos";
import { guardarPercurso, lerPercurso, repositorioLocal, type Percurso as EstadoPercurso, type Tentativa } from "../dados/repositorio";
import { Atividade } from "../motor/Atividade";
import { CICLOS, FAIXAS, NOME_DOMINIO, cicloPorId, faixaDe, limitar, CARIMBO_MINIMO, type Ciclo, type DefinicaoAtividade, type Dominio, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao, Cartao, Etiqueta, LigacaoBotao } from "../ui";

export function EscolherNivel() {
  const { prefs } = usePreferencias();
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual={PAGINAS.provas.caminho} />
        <h1 className="text-4xl">{PAGINAS.provas.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.provas.introducao} /></p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CICLOS.map((c) => {
          const progresso = lerPercurso(c.id);
          const atividades = c.atividades.map((s) => porSlug(s)).filter((a) => a && a.disponivel);
          return (
            <Cartao key={c.id} className="grid gap-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-2xl">{preencher(PAGINAS.provas.cartao, { nome: c.nome })}</h2>
                <Etiqueta>{c.anos}</Etiqueta>
                <span className="ml-auto text-sm" style={{ color: "var(--suave)" }}>
                  {c.duracao}
                </span>
              </div>
              <p className="m-0">{c.prova}</p>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {preencher(PAGINAS.provas.atividades, { nivel: c.nivel, n: atividades.length, lista: atividades.map((a) => a!.titulo[prefs.contexto]).join(", ") })}
              </p>
              <div className="flex gap-3 flex-wrap">
                <LigacaoBotao para={`/teste/${c.id}`}>{progresso ? preencher(PAGINAS.provas.retomar, { i: progresso.indice, n: atividades.length }) : PAGINAS.provas.comecar}</LigacaoBotao>
              </div>
            </Cartao>
          );
        })}
      </div>
      <p className="text-sm m-0" style={{ color: "var(--suave)" }}>
        <Rico texto={PAGINAS.provas.nota} />
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
  if (fim) return <PrimeiraPagina tentativas={fim} ciclo={ciclo.id} titulo={`a preparação para ${ciclo.titulo}`} nivel={ciclo.nivel} />;
  return (
    <Sequencia
      chave={ciclo.id}
      titulo={`Preparação · ${ciclo.nome}`}
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
  const folha = useRef<HTMLElement>(null);
  const [aGuardar, setAGuardar] = useState(false);
  // Média por competência (várias atividades da mesma competência fazem média).
  const somas: Record<string, { s: number; n: number; slug: string; melhor: number }> = {};
  for (const t of tentativas) {
    const d = porSlug(t.atividade)?.dominio ?? "todas";
    const e = (somas[d] ??= { s: 0, n: 0, slug: t.atividade, melhor: -1 });
    e.s += t.pontuacao;
    e.n++;
    if (e.melhor < 0 || t.pontuacao < e.melhor) {
      e.melhor = t.pontuacao;
      e.slug = t.atividade; // a atividade mais fraca da competência é a que se propõe treinar
    }
  }
  const porDominio: Record<string, number> = Object.fromEntries(Object.entries(somas).map(([d, e]) => [d, Math.round(e.s / e.n)]));
  // Média das atividades; o Simulador de Prova conta a dobrar, porque combina as outras competências.
  const peso = (t: Tentativa) => (t.atividade === "simulador" ? 2 : 1);
  const global = limitar(tentativas.reduce((s, t) => s + peso(t) * t.pontuacao, 0) / Math.max(1, tentativas.reduce((s, t) => s + peso(t), 0)));
  const faixa = faixaDe(global);
  const guardado = useMemo(() => repositorioLocal.guardarTeste({ ciclo, pontuacaoGlobal: global, faixa: faixa.nome, porDominio, tentativas: tentativas.map((t) => t.id), codigo, aluno }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const maisFraca = Object.entries(porDominio).sort((a, b) => a[1] - b[1])[0];
  const slugFraco = maisFraca ? somas[maisFraca[0]].slug : undefined;
  const defFraca = slugFraco ? porSlug(slugFraco) : undefined;
  const tFraca = slugFraco ? tentativas.find((t) => t.atividade === slugFraco) : undefined;
  const dica = defFraca && tFraca ? defFraca.dica(tFraca.metricas, tFraca.pontuacao) : "";
  // Número de turma → "Repórter n.º 7" (ou "Investigador n.º 7"); alcunha ou nome ficam como estão.
  const ident = aluno?.trim() || prefs.nome.trim();
  const nome = !ident ? ctx.papelAnonimo : /^\d+$/.test(ident) ? `${ctx.papel} n.º ${ident}` : ident;
  const contrair = (t: string) => t.replace(/^(a|o|as|os) /, (m) => ({ "a ": "na ", "o ": "no ", "as ": "nas ", "os ": "nos " })[m]!);
  const data = new Date(guardado.concluidoEm).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
  const nomeCiclo = ciclo === "codigo" ? `nível ${nivel}` : (cicloPorId(ciclo)?.nome ?? "");
  const verbo = prefs.contexto === "jornal" ? "fecha a edição" : "conclui a experiência";
  const comCarimbo = tentativas.some((t) => t.pontuacao >= CARIMBO_MINIMO);

  async function guardarImagem() {
    if (!folha.current) return;
    setAGuardar(true);
    try {
      const { toPng } = await import("html-to-image");
      const fundo = getComputedStyle(folha.current).backgroundColor;
      const url = await toPng(folha.current, { pixelRatio: 2, backgroundColor: fundo, skipFonts: true, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `ecd-${ctx.publicacao(nivel).toLowerCase().replace(/\s+/g, "-")}-${guardado.concluidoEm.slice(0, 10)}.png`;
      a.click();
    } catch {
      window.print();
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="sr-only">{ctx.resultado.titulo}</h1>
      <article ref={folha} className="jornal grid gap-5" aria-label={ctx.resultado.titulo}>
        <div className="cabecalho">
          <span className="font-extrabold" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", lineHeight: 1 }}>
            {ctx.publicacao(nivel)}
          </span>
          <span className="text-sm self-end" style={{ fontFamily: "var(--fonte-mono)", color: "var(--suave)" }}>
            Edição especial · {data} · {nomeCiclo}
            {codigo ? ` · sessão ${codigo}` : ""}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
          <div className="grid gap-2">
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--acento)", fontFamily: "var(--fonte-mono)" }}>
              {prefs.contexto === "jornal" ? "Manchete" : "Conclusão"}
            </div>
            <div className="manchete">
              {nome} {verbo} com {global} pontos
            </div>
            <p className="coluna m-0">
              Faixa <strong>{faixa.nome}</strong>. Por {nome}, com {ctx.personagens.responsavel === "Diretora Graça" ? "a Diretora Graça" : `a ${ctx.personagens.responsavel}`}. {tentativas.length} atividade{tentativas.length === 1 ? "" : "s"} {contrair(titulo)}.
            </p>
          </div>
          <div className="font-extrabold tabular-nums text-right" style={{ fontSize: "clamp(4rem, 12vw, 7.5rem)", lineHeight: 0.9, letterSpacing: "-.04em" }} aria-hidden="true">
            {global}
          </div>
        </div>
        <ul className="m-0 p-0 list-none grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4" style={{ borderTop: "1px solid var(--tinta)" }} aria-label="Resultado por competência">
          {Object.entries(porDominio).map(([d, p]) => (
            <li key={d} className="grid gap-1 coluna content-start">
              <div className="flex justify-between items-baseline gap-2">
                <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{NOME_DOMINIO[d as Dominio]}</strong>
                <strong className="tabular-nums" style={{ fontFamily: "var(--fonte-mono)" }}>{p}</strong>
              </div>
              <div className="barra" aria-hidden="true">
                <div style={{ width: `${p}%`, background: p >= 85 ? "var(--b4)" : p >= 65 ? "var(--b3)" : p >= 40 ? "var(--b2)" : "var(--b1)" }} />
              </div>
              <span className="text-sm" style={{ color: "var(--suave)" }}>{frase(d as Dominio, p)}</span>
            </li>
          ))}
        </ul>
        {maisFraca && (
          <p className="m-0 coluna rounded-lg p-3" style={{ background: "var(--marca)", color: "var(--marca-tinta)" }}>
            <strong>Para treinar:</strong> {NOME_DOMINIO[maisFraca[0] as Dominio]}. {dica}
          </p>
        )}
      </article>
      <div className="faixa" role="list" aria-label="Faixas">
        {FAIXAS.map((f) => (
          <div key={f.nome} role="listitem" style={{ outline: f.nome === faixa.nome ? "3px solid var(--acento)" : undefined }}>
            <b style={{ fontFamily: "var(--fonte-titulo)" }}>{f.nome}</b>
            {f.nome === faixa.nome && <span className="sr-only"> (a tua faixa)</span>}
            <br />
            <span className="text-xs tabular-nums" style={{ color: "var(--suave)" }}>
              {f.min} a {f.max}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap items-center">
        <Botao onClick={() => void guardarImagem()} disabled={aGuardar}>
          {aGuardar ? "A preparar a imagem…" : "Guardar como imagem"}
        </Botao>
        {defFraca && maisFraca && (
          <LigacaoBotao para={`/atividades/${defFraca.slug}/${nivel}`} variante="contorno">
            Treinar {NOME_DOMINIO[maisFraca[0] as Dominio].toLowerCase()}
          </LigacaoBotao>
        )}
        <Botao variante="contorno" onClick={() => window.print()}>
          Imprimir
        </Botao>
        {comCarimbo && (
          <LigacaoBotao para="/cartao" variante="discreto">
            Ver o meu {ctx.resultado.cartao}
          </LigacaoBotao>
        )}
        <LigacaoBotao para="/treinar" variante="discreto">
          Voltar a Treinar
        </LigacaoBotao>
      </div>
    </div>
  );
}
