// ─── Quem Apagou o Ficheiro? Geração de um mistério coerente ─────────────────
// O culpado é quem estava sentado no computador de onde o ficheiro foi apagado, à hora do registo.
// Pistas: registo do servidor, reservas dos computadores, mensagens (trocas de lugar, álibis, motivos
// falsos) e fotografias com metadados. Cada pista tem um peso: essencial (prova o caso), apoio (ajuda,
// mas não é necessária) ou irrelevante (não prova nada; marcá-la penaliza).
import { amostra, escolher, inteiro, misturar, type Gerador } from "../../motor/aleatorio";
import type { Contexto } from "../../preferencias/preferencias";

export type Fonte = "registo" | "reservas" | "mensagens" | "fotografias";
export type Peso = "essencial" | "apoio" | "irrelevante";

export interface Prova {
  id: string;
  fonte: Fonte;
  texto: string;
  autor?: string; // mensagens
  hora?: string;
  peso: Peso;
}

export interface Misterio {
  ficheiro: string;
  local: string;
  pc: string;
  hora: string;
  suspeitos: string[];
  culpado: string;
  provas: Prova[];
  explicacao: string;
}

export interface ConfigMisterio {
  suspeitos: number;
  motivo: boolean; // suspeito com motivo aparente (pista falsa)
  troca: "nunca" | "talvez" | "sempre"; // troca de computador
  doisHorarios: boolean; // reservas de duas horas seguidas
  fotografias: boolean;
  ficheiroParecido: boolean; // outro ficheiro com nome parecido apagado noutro PC
}

const NOMES = ["Ana", "Bruno", "Carla", "Diogo", "Eva", "Filipe", "Gonçalo", "Helena", "Inês", "João", "Leonor", "Miguel", "Rita", "Tiago", "Vasco", "Sara"];
const LUGARES = ["na biblioteca", "no ginásio", "na cantina", "no bar", "na sala de música", "no pátio"];
const hh = (h: number, m: number) => `${h}h${String(m).padStart(2, "0")}`;

export function gerarMisterio(cfg: ConfigMisterio, contexto: Contexto, r: Gerador = Math.random): Misterio {
  const ficheiro = contexto === "jornal" ? "reportagem_final.docx" : "relatorio_final.xlsx";
  const parecido = contexto === "jornal" ? "reportagem_final_v1.docx" : "relatorio_final_v1.xlsx";
  const trabalho = contexto === "jornal" ? "reportagem" : "relatório";
  const local = contexto === "jornal" ? "redação" : "laboratório";
  const suspeitos = amostra(NOMES, cfg.suspeitos, r);
  const pcs = amostra(["PC-1", "PC-2", "PC-3", "PC-4", "PC-5", "PC-6"], cfg.suspeitos, r);
  const h = inteiro(10, 15, r);
  const m = inteiro(12, 50, r);
  const hora = hh(h, m);
  const lugarDe = new Map(suspeitos.map((s, i) => [s, pcs[i]]));
  const titular = suspeitos[0];
  const pc = pcs[0];
  const troca = cfg.troca === "sempre" || (cfg.troca === "talvez" && r() < 0.5);
  const culpado = troca ? suspeitos[1] : titular;
  const provas: Prova[] = [];
  let n = 0;
  const add = (p: Omit<Prova, "id">) => provas.push({ ...p, id: `p${++n}` });

  // ── Registo do servidor
  add({ fonte: "registo", hora, texto: `${hora} · ${pc} · apagou “${ficheiro}”`, peso: "essencial" });
  add({ fonte: "registo", hora: hh(h, m - 9), texto: `${hh(h, m - 9)} · ${pc} · abriu “${ficheiro}”`, peso: "apoio" });
  const outrosPcs = pcs.slice(1);
  add({ fonte: "registo", hora: hh(h, m - 6), texto: `${hh(h, m - 6)} · ${escolher(outrosPcs, r)} · guardou “agenda_semana.docx”`, peso: "irrelevante" });
  add({ fonte: "registo", hora: hh(h, Math.min(59, m + 4)), texto: `${hh(h, Math.min(59, m + 4))} · ${escolher(outrosPcs, r)} · abriu “fotografias_visita”`, peso: "irrelevante" });
  if (cfg.ficheiroParecido) {
    const outroPc = escolher(outrosPcs, r);
    add({ fonte: "registo", hora: hh(h, m - 3), texto: `${hh(h, m - 3)} · ${outroPc} · apagou “${parecido}”`, peso: "irrelevante" });
  }

  // ── Reservas
  const slot = `${h}h–${h + 1}h`;
  suspeitos.forEach((s) => add({ fonte: "reservas", texto: `${slot} · ${lugarDe.get(s)} · ${s}`, peso: s === titular ? "essencial" : s === culpado ? "apoio" : "irrelevante" }));
  if (cfg.doisHorarios) {
    // Na hora anterior, o PC do caso estava reservado por outra pessoa (pista falsa para quem não vê a hora).
    const antes = escolher(suspeitos.filter((s) => s !== titular && s !== culpado), r) ?? suspeitos[suspeitos.length - 1];
    add({ fonte: "reservas", texto: `${h - 1}h–${h}h · ${pc} · ${antes}`, peso: "irrelevante" });
    add({ fonte: "reservas", texto: `${h - 1}h–${h}h · ${escolher(outrosPcs, r)} · ${titular}`, peso: "irrelevante" });
  }

  // ── Mensagens
  if (troca) {
    const outro = lugarDe.get(culpado)!;
    add({ fonte: "mensagens", autor: titular, hora: hh(h, 3), texto: `Precisava do programa que só está no ${outro}, por isso às ${hh(h, 3)} troquei de computador com ${culpado}. Fiquei no ${outro}.`, peso: "essencial" });
  }
  const inocentes = suspeitos.filter((s) => s !== culpado && s !== titular);
  let comMotivo: string | null = null;
  if (cfg.motivo && inocentes.length) {
    comMotivo = escolher(inocentes, r);
    add({ fonte: "mensagens", autor: comMotivo, hora: hh(h - 1, inteiro(10, 50, r)), texto: `Esta ${trabalho} está péssima… apetecia-me apagá-la e começar de novo! 😤`, peso: "irrelevante" });
  }
  const lugares = misturar(LUGARES, r);
  inocentes.filter((s) => s !== comMotivo).forEach((s, i) => add({ fonte: "mensagens", autor: s, hora: hh(h, inteiro(0, 10, r)), texto: `Estou ${lugares[i]} até às ${h + 1}h, se precisarem de mim.`, peso: "apoio" }));
  if (troca) add({ fonte: "mensagens", autor: titular, hora: hh(h, Math.min(59, m + 8)), texto: `Alguém viu a ${trabalho}? Desapareceu!`, peso: "irrelevante" });
  add({ fonte: "mensagens", autor: culpado, hora: hh(h, Math.min(59, m + 10)), texto: `Que estranho, não sei de nada. Estive sempre a trabalhar no meu lugar.`, peso: "irrelevante" });

  // ── Fotografias (metadados: hora e local)
  if (cfg.fotografias) {
    const alibi = comMotivo ?? inocentes[0];
    if (alibi) add({ fonte: "fotografias", texto: `Fotografia de ${alibi} ${comMotivo ? lugares[5] : lugares[0]} · tirada às ${hh(h, m - 1)} · telemóvel da escola`, peso: "apoio" });
    add({ fonte: "fotografias", texto: `Fotografia da ${local} vazia · tirada às ${hh(h - 1, 55)}`, peso: "irrelevante" });
  }

  const explicacao = troca
    ? `O ficheiro foi apagado às ${hora} no ${pc}. O ${pc} estava reservado para ${titular}, mas ${titular} trocou de computador com ${culpado} às ${hh(h, 3)}. Quem estava no ${pc} era ${culpado}.`
    : `O ficheiro foi apagado às ${hora} no ${pc}, que estava reservado das ${h}h às ${h + 1}h para ${culpado}.${comMotivo ? ` ${comMotivo} queixou-se da ${trabalho}, mas queixar-se não é prova.` : ""}`;
  return { ficheiro, local, pc, hora, suspeitos: misturar(suspeitos, r), culpado, provas, explicacao };
}

/** Pontuação das provas: (essenciais marcadas − irrelevantes marcadas) / essenciais; as de apoio não contam. */
export function pontuarProvas(provas: Prova[], marcadas: Set<string>): number {
  const ess = provas.filter((p) => p.peso === "essencial");
  const tp = ess.filter((p) => marcadas.has(p.id)).length;
  const fp = provas.filter((p) => p.peso === "irrelevante" && marcadas.has(p.id)).length;
  return Math.max(0, (tp - fp) / ess.length);
}
