import { Link, useParams } from "react-router";
import { porSlug } from "../atividades";
import { Atividade } from "../motor/Atividade";
import type { Nivel } from "../motor/tipos";

export function AtividadePagina() {
  const { slug = "", nivel: nivelParam = "1" } = useParams();
  const definicao = porSlug(slug);
  const nivel = Math.min(5, Math.max(1, Number(nivelParam) || 1)) as Nivel;
  if (!definicao) {
    return (
      <p>
        Atividade desconhecida. <Link to="/atividades">Ver o catálogo</Link>.
      </p>
    );
  }
  if (!definicao.disponivel) {
    return (
      <div className="grid gap-3 max-w-2xl">
        <h1 className="text-3xl">{definicao.titulo.jornal}</h1>
        <p className="m-0">Esta atividade ainda está em construção (fase 2). {definicao.descricao}</p>
        <Link to="/atividades">Voltar ao catálogo</Link>
      </div>
    );
  }
  return <Atividade key={`${slug}-${nivel}`} definicao={definicao} nivel={nivel} origem="treino" />;
}
