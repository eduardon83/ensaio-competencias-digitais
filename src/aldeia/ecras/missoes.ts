// ─── Aldeia Digital · títulos e briefings das missões ────────────────────────
import { TODOS } from "../../registo";
import type { CicloTexto, DefMissao } from "../nucleo/catalogo";
import { CIDADANIA } from "../cidadania/conteudo";
import { ALDEIA, porCiclo } from "../textos";

/** Título (da atividade ou da missão de cidadania, por ciclo) e briefing da aldeia. */
export function titulosMissao(m: DefMissao, ciclo: CicloTexto): { titulo: string; briefing: string } {
  if (m.tipo === "cidadania") {
    const c = CIDADANIA[m.id];
    return { titulo: c ? porCiclo(c.titulo, ciclo) : m.id, briefing: c ? porCiclo(c.intro, ciclo) : "" };
  }
  if (m.tipo === "evento") return { titulo: m.id === "festa" ? ALDEIA.capitulos.c8.titulo : m.id, briefing: "" };
  const def = TODOS.find((d) => d.slug === m.slug);
  const contexto = m.edificio === "laboratorio" ? "laboratorio" : "jornal";
  const b = ALDEIA.missoes.briefings[m.id];
  return { titulo: def?.titulo[contexto] ?? m.id, briefing: b ? porCiclo(b, ciclo) : (def?.descricao ?? "") };
}

/** Nome curto de uma missão (painel do professor, relatórios, emails). */
export function nomeMissao(id: string): string {
  if (id.startsWith("cid-")) return CIDADANIA[id] ? porCiclo(CIDADANIA[id].titulo, "c23") : id;
  if (id === "nascimento") return "Nascimento";
  if (id === "tutorial") return "Tutorial";
  if (id === "festa") return "Festa";
  if (id === "pratica") return "Prática";
  return TODOS.find((d) => d.slug === id)?.titulo.jornal ?? id;
}
