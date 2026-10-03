// ─── Catálogo de atividades (por ciclo) e Treino de competências (5 níveis por atividade) ──
import { useState } from "react";
import { Link } from "react-router";
import { Caminho } from "../componentes/Caminho";
import { ATIVIDADES } from "../atividades";
import { repositorioLocal } from "../dados/repositorio";
import { CICLOS, NIVEIS, NOME_DOMINIO, NOME_NIVEL, estrelasDe, type Ciclo, type Nivel } from "../motor/tipos";
import { usePreferencias } from "../preferencias/preferencias";
import { Cartao, Etiqueta } from "../ui";

export function Catalogo() {
  const { prefs } = usePreferencias();
  const [ciclo, setCiclo] = useState<Ciclo>("c3");
  const def = CICLOS.find((c) => c.id === ciclo)!;
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual="Atividades" />
        <h1 className="text-4xl">Atividades</h1>
        <p className="m-0">As atividades do ECD. Escolhe a prova para ver as atividades que entram na preparação e em que nível. Para os cinco níveis de dificuldade, vai a Treino.</p>
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
                <span className="tabular-nums text-sm" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>
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
  const [nivel, setNivel] = useState<Nivel>(2);
  const tentativas = repositorioLocal.listarTentativas();
  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual="Atividades" />
        <h1 className="text-4xl">Treino de competências</h1>
        <p className="m-0">Cada atividade tem cinco níveis, do 1 (Iniciação) ao 5 (Perito). Podes repetir sempre que precisares. O teu melhor desempenho fica guardado neste navegador, por nível, com as estrelas respetivas: abaixo de 50 pontos convém tentar novamente; de 50 a 74, 1 estrela; de 75 a 90, 2 estrelas; de 91 a 100, 3 estrelas.</p>
      </header>
      <div role="tablist" aria-label="Nível de dificuldade" className="flex gap-1 flex-wrap border-b" style={{ borderColor: "var(--linha)" }}>
        {NIVEIS.map((n) => (
          <button key={n} type="button" role="tab" className="separador" aria-selected={nivel === n} onClick={() => setNivel(n)}>
            Nível {n} · {NOME_NIVEL[n]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ATIVIDADES.filter((a) => a.disponivel).map((a) => {
          const melhor = repositorioLocal.melhor(a.slug, nivel);
          const n = tentativas.filter((t) => t.atividade === a.slug && t.nivel === nivel).length;
          const estrelas = melhor ? estrelasDe(melhor.pontuacao) : 0;
          return (
            <Cartao key={a.slug} className="grid gap-2 content-start">
              <div className="flex gap-2 items-baseline">
                <span className="tabular-nums text-sm" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>
                  {String(a.numero).padStart(2, "0")}
                </span>
                <h2 className="text-xl">{a.titulo[prefs.contexto]}</h2>
                {a.slug === "maqueta" && <span className="etiqueta" style={{ background: "var(--marca)", color: "var(--marca-tinta)" }}>Novo · 3D</span>}
                <span className="ml-auto text-lg" role="img" aria-label={`${estrelas} de 3 estrelas`}>
                  {"★".repeat(estrelas)}
                  <span aria-hidden="true" style={{ color: "var(--suave)" }}>{"☆".repeat(3 - estrelas)}</span>
                </span>
              </div>
              <Etiqueta>{NOME_DOMINIO[a.dominio]}</Etiqueta>
              <div className="grid grid-cols-5 gap-1 mt-1" role="group" aria-label="Melhor por nível">
                {NIVEIS.map((k) => {
                  const m = repositorioLocal.melhor(a.slug, k);
                  return (
                    <Link key={k} to={`/atividades/${a.slug}/${k}`} className="text-center rounded py-1 text-xs no-underline" style={{ background: k === nivel ? "var(--acento-suave)" : "var(--tecla)", color: "var(--tinta)", border: k === nivel ? "2px solid var(--acento)" : "1px solid var(--linha)", minHeight: 44, display: "grid", alignContent: "center" }} aria-label={`Nível ${k}${m ? `, melhor ${m.pontuacao}` : ""}`}>
                      <span className="font-bold">{k}</span>
                      <span style={{ color: "var(--suave)" }}>{m ? m.pontuacao : "–"}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <Link to={`/atividades/${a.slug}/${nivel}`} className="botao" style={{ minHeight: 40, padding: "6px 14px" }}>
                  Treinar nível {nivel}
                </Link>
                <span className="text-sm" style={{ color: "var(--suave)" }}>
                  {n === 0 ? "ainda não jogado" : `${n} tentativa${n === 1 ? "" : "s"}`}
                </span>
              </div>
            </Cartao>
          );
        })}
      </div>
    </div>
  );
}
