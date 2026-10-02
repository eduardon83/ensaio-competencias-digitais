// ─── Motor: corre uma atividade em quatro etapas (intro → prática → avaliação → resultado) ──
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { contexto as defContexto } from "../contextos";
import { repositorioLocal, type Origem, type Tentativa } from "../dados/repositorio";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao, Etiqueta, LigacaoBotao } from "../ui";
import { DISPONIVEIS } from "../atividades";
import { SeletorContexto } from "../componentes/SeletorContexto";
import { CARIMBO_MINIMO, NOME_DOMINIO, NOME_NIVEL, estrelasDe, type DefinicaoAtividade, type Nivel, type ResultadoAtividade } from "./tipos";

type Etapa = "intro" | "pratica" | "avaliacao" | "resultado";

export function Atividade({
  definicao,
  nivel,
  origem,
  aoConcluir,
  rotuloContinuar,
  escolherContexto = true,
  extensaoTempo: extensaoForcada,
  etiquetas,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definicao: DefinicaoAtividade<any>;
  nivel: Nivel;
  origem: Origem;
  /** Quando presente (percurso de teste), o botão "Continuar" chama-o com a tentativa guardada. */
  aoConcluir?: (t: Tentativa) => void;
  rotuloContinuar?: string;
  /** Mostra a escolha do cenário no briefing (falso dentro de um teste/sessão, onde já foi escolhido). */
  escolherContexto?: boolean;
  /** Tempo alargado imposto pela sessão do professor (sobrepõe-se às definições). */
  extensaoTempo?: number;
  /** Marcas da sessão do professor, enviadas com a tentativa. */
  etiquetas?: { codigo?: string; aluno?: string };
}) {
  const { prefs } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const extensao = extensaoForcada ?? prefs.extensaoTempo;
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [chave, setChave] = useState(0); // força remontagem ao repetir
  const [tentativa, setTentativa] = useState<Tentativa | null>(null);
  const config = definicao.niveis[nivel];
  const configPratica = useMemo(() => definicao.pratica(config), [definicao, config]);
  const melhorAnterior = useMemo(() => repositorioLocal.melhor(definicao.slug, nivel), [definicao.slug, nivel, chave]);

  function terminarAvaliacao(r: ResultadoAtividade) {
    const t = repositorioLocal.guardarTentativa({
      atividade: definicao.slug,
      nivel,
      pontuacao: r.pontuacao,
      duracaoMs: Math.round(r.duracaoMs),
      metricas: r.metricas,
      origem,
      contexto: prefs.contexto,
      formato: prefs.formato,
      extensaoTempo: extensao,
      codigo: etiquetas?.codigo,
      aluno: etiquetas?.aluno,
    });
    setTentativa(t);
    setEtapa("resultado");
  }

  const Componente = definicao.Componente;
  const titulo = definicao.titulo[prefs.contexto];

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-3xl">{titulo}</h1>
        <Etiqueta>{NOME_DOMINIO[definicao.dominio]}</Etiqueta>
        <Etiqueta>
          Nível {nivel} · {NOME_NIVEL[nivel]}
        </Etiqueta>
        <span className="text-sm ml-auto" style={{ color: "var(--suave)" }}>
          {etapa === "intro" && "Briefing"}
          {etapa === "pratica" && "Prática (não conta)"}
          {etapa === "avaliacao" && "A contar"}
          {etapa === "resultado" && "Resultado"}
        </span>
      </header>

      {etapa === "intro" && (
        <section className="cartao p-6 grid gap-4" aria-labelledby="brief-t">
          <div className="flex items-start gap-4">
            <div aria-hidden="true" className="grid place-items-center rounded-full font-bold" style={{ width: 56, height: 56, background: "var(--acento-suave)", color: "var(--acento)", fontFamily: "var(--fonte-titulo)", flex: "none" }}>
              {ctx.personagens.responsavel.split(" ").pop()?.[0]}
            </div>
            <div>
              <div id="brief-t" className="text-sm font-bold" style={{ color: "var(--suave)" }}>
                {ctx.personagens.responsavel} · {ctx.publicacao(nivel)}
              </div>
              <p className="text-xl m-0" style={{ fontFamily: "var(--fonte-titulo)" }}>
                “{ctx.briefs[definicao.slug] ?? definicao.descricao}”
              </p>
            </div>
          </div>
          <p className="m-0" style={{ color: "var(--suave)" }}>
            {definicao.descricao} Primeiro fazes um item de prática que não conta. Depois começa a avaliação.
            {extensao !== 1 && <> Tempo alargado ×{extensao} ativo.</>}
          </p>
          {escolherContexto && (
            <div className="pt-2 border-t" style={{ borderColor: "var(--linha)" }}>
              <SeletorContexto compacto />
            </div>
          )}
          {melhorAnterior && (
            <p className="m-0 text-sm">
              O teu melhor neste nível: <strong>{melhorAnterior.pontuacao}</strong> pontos.
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            <Botao grande onClick={() => setEtapa("pratica")}>
              Começar a prática
            </Botao>
            <Botao variante="contorno" onClick={() => setEtapa("avaliacao")}>
              Saltar a prática
            </Botao>
          </div>
        </section>
      )}

      {etapa === "pratica" && (
        <section aria-label="Prática" className="grid gap-3">
          <Componente key={`p${chave}`} config={configPratica} modo="pratica" nivel={nivel} contexto={prefs.contexto} extensaoTempo={extensao} aoTerminar={() => setEtapa("avaliacao")} />
          <div>
            <Botao variante="discreto" onClick={() => setEtapa("avaliacao")}>
              Passar à avaliação
            </Botao>
          </div>
        </section>
      )}

      {etapa === "avaliacao" && (
        <section aria-label="Avaliação">
          <Componente key={`a${chave}`} config={config} modo="avaliacao" nivel={nivel} contexto={prefs.contexto} extensaoTempo={extensao} aoTerminar={terminarAvaliacao} />
        </section>
      )}

      {etapa === "resultado" && tentativa && (
        <Resultado
          tentativa={tentativa}
          definicao={definicao}
          nivel={nivel}
          melhorAnterior={melhorAnterior}
          aoRepetir={() => {
            setChave((k) => k + 1);
            setTentativa(null);
            setEtapa("avaliacao");
          }}
          aoContinuar={aoConcluir ? () => aoConcluir(tentativa) : undefined}
          rotuloContinuar={rotuloContinuar}
        />
      )}
    </div>
  );
}

function Resultado({
  tentativa,
  definicao,
  nivel,
  melhorAnterior,
  aoRepetir,
  aoContinuar,
  rotuloContinuar,
}: {
  tentativa: Tentativa;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definicao: DefinicaoAtividade<any>;
  nivel: Nivel;
  melhorAnterior: Tentativa | undefined;
  aoRepetir: () => void;
  aoContinuar?: () => void;
  rotuloContinuar?: string;
}) {
  const { prefs } = usePreferencias();
  const ctx = defContexto(prefs.contexto);
  const estrelas = estrelasDe(tentativa.pontuacao);
  const recorde = !melhorAnterior || tentativa.pontuacao > melhorAnterior.pontuacao;
  const proxima = DISPONIVEIS.find((a) => a.numero > definicao.numero) ?? DISPONIVEIS[0];
  const dica = definicao.dica(tentativa.metricas, tentativa.pontuacao);

  return (
    <section className="grid gap-4" aria-labelledby="res-t">
      <div className="cartao p-6 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
        <div className="text-center md:pr-6 md:border-r" style={{ borderColor: "var(--linha)" }}>
          <div className="text-6xl font-extrabold tabular-nums" style={{ fontFamily: "var(--fonte-titulo)", color: "var(--acento)" }} aria-label={`${tentativa.pontuacao} pontos`}>
            {tentativa.pontuacao}
          </div>
          <div className="text-sm" style={{ color: "var(--suave)" }}>
            em 100
          </div>
          <div className="text-2xl mt-1" aria-label={`${estrelas} de 3 estrelas`}>
            {"★".repeat(estrelas)}
            <span style={{ color: "var(--linha)" }}>{"★".repeat(3 - estrelas)}</span>
          </div>
        </div>
        <div className="grid gap-2">
          <h2 id="res-t" className="text-2xl">
            {tentativa.pontuacao >= CARIMBO_MINIMO ? `Ganhaste o ${ctx.resultado.carimbo} de ${NOME_DOMINIO[definicao.dominio].toLowerCase()}.` : tentativa.pontuacao >= 50 ? "Bom trabalho." : "Um bom começo."}
          </h2>
          {tentativa.pontuacao >= CARIMBO_MINIMO && (
            <p className="m-0">
              <Link to="/cartao">Ver o meu {ctx.resultado.cartao}</Link>
            </p>
          )}
          {recorde && melhorAnterior && <p className="m-0 font-bold" style={{ color: "var(--certo)" }}>Novo recorde pessoal (antes: {melhorAnterior.pontuacao}).</p>}
          <p className="m-0">
            <strong>Dica:</strong> {dica}
          </p>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            Tempo: {Math.round(tentativa.duracaoMs / 1000)} s · Nível {nivel} ({NOME_NIVEL[nivel]})
            {tentativa.extensaoTempo !== 1 && <> · tempo alargado ×{tentativa.extensaoTempo}</>}
          </p>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap">
        {aoContinuar ? (
          <Botao grande onClick={aoContinuar}>
            {rotuloContinuar ?? "Continuar"}
          </Botao>
        ) : (
          <>
            <Botao onClick={aoRepetir}>Repetir</Botao>
            {proxima && (
              <LigacaoBotao para={`/atividades/${proxima.slug}/${nivel}`} variante="contorno">
                Próxima atividade: {proxima.titulo[prefs.contexto]}
              </LigacaoBotao>
            )}
            <Link to="/treino" className="botao botao--discreto">
              Voltar ao treino
            </Link>
          </>
        )}
        {aoContinuar && (
          <Botao variante="discreto" onClick={aoRepetir}>
            Repetir esta atividade
          </Botao>
        )}
      </div>
    </section>
  );
}
