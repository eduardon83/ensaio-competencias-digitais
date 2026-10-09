// ─── Jogos: lista dos jogos disponíveis (com 5 níveis) e dos jogos propostos ──
import { Rico } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Caminho } from "../componentes/Caminho";
import { JOGOS, META_JOGOS, jogoPorSlug } from "../jogos";
import { TEXTOS } from "../jogos/leitura/textos";
import { Atividade } from "../motor/Atividade";
import { estrelasDe, type Nivel } from "../motor/tipos";
import { repositorioLocal } from "../dados/repositorio";
import { usePreferencias } from "../preferencias/preferencias";
import { Cartao, Etiqueta } from "../ui";
import { Icone } from "../componentes/Icone";
import { SeletorNivel } from "../componentes/SeletorNivel";

export function Jogos() {
  const { prefs } = usePreferencias();
  const autores = [...new Set(TEXTOS.map((t) => t.autor.replace(/ (.*)$/, "")))];
  return (
    <div className="grid gap-[2rem]">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[["/treinar", "Treinar"]]} atual={PAGINAS.jogos.titulo} />
        <h1 className="text-4xl">{PAGINAS.jogos.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.jogos.introducao} /></p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {JOGOS.map((j) => (
          <CartaoJogo key={j.slug} slug={j.slug} titulo={j.titulo[prefs.contexto]} descricao={j.descricao} duracao={j.duracao} nota={j.slug === "leitura" ? `Autores: ${autores.join(", ")}. O texto cresce e fica mais antigo e complexo a cada nível.` : META_JOGOS[j.slug]?.nota} />
        ))}
      </section>

      <p className="m-0 max-w-3xl" style={{ color: "var(--suave)" }}>
        Os jogos sobre emails falsos e notícias falsas estão em <Link to="/seguranca">Segurança digital</Link>.
      </p>
    </div>
  );
}

/** Cartão de um jogo: o nível escolhe-se na lista do próprio cartão. */
function CartaoJogo({ slug, titulo, descricao, duracao, nota }: { slug: string; titulo: string; descricao: string; duracao: string; nota?: string }) {
  const [nivel, setNivel] = useState<Nivel>(2);
  const melhor = repositorioLocal.melhor(slug, nivel);
  const estrelas = melhor ? estrelasDe(melhor.pontuacao) : 0;
  const meta = META_JOGOS[slug];
  return (
    <Cartao className="grid grid-rows-subgrid row-span-5 gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl flex items-center gap-2">
          {meta && <Icone nome={meta.icone} />} {titulo}
        </h2>
        <span className="ml-auto text-lg" role="img" aria-label={`${estrelas} de 3 estrelas no nível ${nivel}`}>
          {"★".repeat(estrelas)}
          <span aria-hidden="true" style={{ color: "var(--suave)" }}>{"☆".repeat(3 - estrelas)}</span>
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {meta?.etiquetas.map((e) => (
          <Etiqueta key={e}>{e}</Etiqueta>
        ))}
      </div>
      <p className="m-0">{descricao}</p>
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
        {nota}
      </p>
      <div className="grid gap-3 self-end">
        <SeletorNivel id={`nivel-${slug}`} slug={slug} valor={nivel} aoMudar={setNivel} />
        <div className="flex gap-3 items-center flex-wrap">
          <Link to={`/jogos/${slug}/${nivel}`} className="botao">
            Jogar · nível {nivel}
          </Link>
          <span className="text-sm" style={{ color: "var(--suave)" }}>
            {duracao}
            {melhor && <> · melhor {melhor.pontuacao}</>}
          </span>
        </div>
      </div>
    </Cartao>
  );
}

export function JogoPagina() {
  const { slug = "", nivel: n = "1" } = useParams();
  const jogo = jogoPorSlug(slug);
  const nivel = Math.min(5, Math.max(1, Number(n) || 1)) as Nivel;
  if (!jogo)
    return (
      <p>
        Jogo desconhecido. <Link to="/jogos">Ver os jogos</Link>.
      </p>
    );
  return <Atividade key={`${slug}-${nivel}`} definicao={jogo} nivel={nivel} origem="treino" />;
}
