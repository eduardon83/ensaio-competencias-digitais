// ─── Catálogo de atividades (por ciclo) e Treino de competências (5 níveis por atividade) ──
import { Rico } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { useState } from "react";
import { Link } from "react-router";
import { Caminho } from "../componentes/Caminho";
import { ATIVIDADES } from "../atividades";
import { repositorioLocal } from "../dados/repositorio";
import { CICLOS, NOME_DOMINIO, estrelasDe, type Ciclo, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Cartao, Etiqueta } from "../ui";
import { SeletorNivel } from "../componentes/SeletorNivel";
import type { Tentativa } from "../dados/repositorio";

export function Catalogo() {
  const { prefs } = usePreferencias();
  const [ciclo, setCiclo] = useState<Ciclo>("c3");
  const def = CICLOS.find((c) => c.id === ciclo)!;
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual="Atividades" />
        <h1 className="text-4xl">{PAGINAS.atividades.tituloCatalogo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.atividades.introducaoCatalogo} /></p>
      </header>
      <div role="tablist" aria-label="Prova" className="flex gap-1 flex-wrap border-b" style={{ borderColor: "var(--linha)" }}>
        {CICLOS.map((c) => (
          <button key={c.id} type="button" role="tab" className="separador" aria-selected={ciclo === c.id} onClick={() => setCiclo(c.id)}>
            {c.nome}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ATIVIDADES.map((a) => {
          const noTeste = def.atividades.includes(a.slug);
          const melhor = repositorioLocal.melhor(a.slug, def.nivel);
          return (
            <Cartao key={a.slug} className="grid gap-2 content-start" style={{ opacity: a.disponivel ? 1 : 0.7 }}>
              <div className="flex gap-2 items-baseline flex-wrap">
                <span className="tabular-nums text-sm" style={{ color: "var(--suave)", fontFamily: "var(--fonte-rotulo)" }}>
                  {String(a.numero).padStart(2, "0")}
                </span>
                <h2 className="text-xl">{a.titulo[prefs.contexto]}</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Etiqueta>{NOME_DOMINIO[a.dominio]}</Etiqueta>
                {a.slug === "maqueta" && <span className="etiqueta" style={{ background: "var(--marca)", color: "var(--marca-tinta)" }}>Novo · 3D</span>}
                {noTeste && <Etiqueta>Na preparação {def.nome}</Etiqueta>}
              </div>
              <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
                {a.descricao}
              </p>
              <div className="flex items-center gap-3 flex-wrap mt-auto">
                {a.disponivel ? (
                  <Link to={`/atividades/${a.slug}/${def.nivel}`} className="botao" style={{ minHeight: 40, padding: "6px 14px" }}>
                    Jogar · nível {def.nivel}
                  </Link>
                ) : (
                  <span className="etiqueta">Em breve</span>
                )}
                <span className="text-sm" style={{ color: "var(--suave)" }}>
                  {a.duracao}
                  {melhor && <> · melhor {melhor.pontuacao}</>}
                </span>
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}

export function Treino() {
  const { prefs } = usePreferencias();
  const tentativas = repositorioLocal.listarTentativas();
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual={PAGINAS.atividades.caminho} />
        <h1 className="text-4xl">{PAGINAS.atividades.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.atividades.introducao} /></p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ATIVIDADES.filter((a) => a.disponivel).map((a) => (
          <CartaoDesafio key={a.slug} atividade={a} titulo={a.titulo[prefs.contexto]} tentativas={tentativas} />
        ))}
      </div>
    </div>
  );
}

/** Cartão de um desafio: o nível escolhe-se na lista do próprio cartão. */
function CartaoDesafio({ atividade: a, titulo, tentativas }: { atividade: (typeof ATIVIDADES)[number]; titulo: string; tentativas: Tentativa[] }) {
  const [nivel, setNivel] = useState<Nivel>(2);
  const melhor = repositorioLocal.melhor(a.slug, nivel);
  const n = tentativas.filter((t) => t.atividade === a.slug && t.nivel === nivel).length;
  const estrelas = melhor ? estrelasDe(melhor.pontuacao) : 0;
  return (
    <Cartao className="grid gap-3 content-start">
      <div className="flex gap-2 items-baseline">
        <span className="tabular-nums text-sm" style={{ color: "var(--suave)" }}>
          {String(a.numero).padStart(2, "0")}
        </span>
        <h2 className="text-xl">{titulo}</h2>
        {a.slug === "maqueta" && <span className="etiqueta" style={{ background: "var(--marca)", color: "var(--marca-tinta)" }}>Novo · 3D</span>}
        <span className="ml-auto text-lg" role="img" aria-label={`${estrelas} de 3 estrelas no nível ${nivel}`}>
          {"★".repeat(estrelas)}
          <span aria-hidden="true" style={{ color: "var(--suave)" }}>{"☆".repeat(3 - estrelas)}</span>
        </span>
      </div>
      <Etiqueta>{NOME_DOMINIO[a.dominio]}</Etiqueta>
      <SeletorNivel id={`nivel-${a.slug}`} slug={a.slug} valor={nivel} aoMudar={setNivel} />
      <div className="flex items-center gap-3 flex-wrap">
        <Link to={`/atividades/${a.slug}/${nivel}`} className="botao">
          Treinar nível {nivel}
        </Link>
        <span className="text-sm" style={{ color: "var(--suave)" }}>
          {n === 0 ? "ainda não jogado" : `${n} tentativa${n === 1 ? "" : "s"}`}
        </span>
      </div>
    </Cartao>
  );
}
