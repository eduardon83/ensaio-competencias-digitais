// ─── Aldeia Digital · uma missão (atividade, jogo, teste de segurança ou cidadania) ──
// Corre o motor normal do ECD com o edifício e a personagem da aldeia. O resultado vai para o progresso do aluno
// (fila de envio), com origem "aldeia" na telemetria anónima. "Treinar aqui" corre a mesma atividade sem contar.
import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Atividade } from "../../motor/Atividade";
import { NOME_NIVEL } from "../../motor/tipos";
import { usePreferencias } from "../../preferencias/preferencias";
import { qualquerPorSlug } from "../../registo";
import { LigacaoBotao } from "../../ui";
import { MISSOES_CIDADANIA } from "../cidadania";
import { CENAS } from "../cidadania/conteudo";
import { MISSAO } from "../nucleo/catalogo";
import { missaoDisponivel } from "../nucleo/regras";
import { useAldeia } from "../cliente/estado";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia } from "./comum";
import { NPC_EDIFICIO, type DepoisMissao } from "./Jogo";
import { titulosMissao } from "./missoes";

export function Missao({ treino = false }: { treino?: boolean }) {
  const { id = "" } = useParams();
  const { vista, ciclo, enviar, novoId, codigo } = useAldeia();
  const { prefs } = usePreferencias();
  const nav = useNavigate();
  const ultimo = useRef(0);
  const m = MISSAO.get(id);
  const config = vista.turma.config;
  const disponivel = m && (treino ? Boolean(vista.aluno.progresso[id]) : missaoDisponivel(config, vista.turma.capitulosAbertos, vista.aluno, id));
  const def = m?.tipo === "cidadania" ? MISSOES_CIDADANIA[id] : m?.slug ? qualquerPorSlug(m.slug) : undefined;
  const nomeEdificio = m ? (m.edificio === "casa" ? ALDEIA.edificios.casa.nome : ALDEIA.edificios[m.edificio].nome) : "";
  if (!m || !def || !disponivel) {
    return (
      <div className="aldeia-pagina">
        <CabecalhoAldeia seccao={nomeEdificio || ALDEIA.nome} voltar={`/aldeia/${codigo}`} />
        <main id="conteudo" tabIndex={-1} className="aldeia-conteudo grid gap-3">
          <p className="m-0">{ALDEIA.interface.cartao.semMissoes}</p>
          <div>
            <LigacaoBotao para={`/aldeia/${codigo}`}>{ALDEIA.interface.resultado.proxima}</LigacaoBotao>
          </div>
        </main>
      </div>
    );
  }
  const personagem = m.tipo === "cidadania" ? CENAS[id].personagem : (NPC_EDIFICIO[m.edificio] ?? "dona-cegonha");
  const t = titulosMissao(m, ciclo);
  const edificioBanda = m.edificio === "casa" ? "largo" : m.edificio;
  const melhor = vista.aluno.progresso[id]?.melhor;
  return (
    <div className="aldeia-pagina">
      <CabecalhoAldeia seccao={nomeEdificio} voltar={`/aldeia/${codigo}`} />
      <main id="conteudo" tabIndex={-1} className="aldeia-conteudo">
        <Atividade
          key={`${id}-${treino}`}
          definicao={def}
          nivel={config.nivel}
          origem="aldeia"
          escolherContexto={false}
          contexto={m.edificio === "laboratorio" ? "laboratorio" : "jornal"}
          extensaoTempo={Math.max(config.tempo, prefs.extensaoTempo)}
          aldeia={{
            edificio: edificioBanda,
            personagem,
            nomePersonagem: (ALDEIA.personagens as Record<string, string>)[personagem] ?? personagem,
            briefing: t.briefing,
            etiqueta: `${ALDEIA.interface.cartao.nivelTexto.replace("{nivel}", String(config.nivel))} · ${NOME_NIVEL[config.nivel]}${treino ? ` · ${ALDEIA.interface.cartao.treinar}` : ""}`,
            melhor,
            aparencia: vista.aluno.aparencia,
            treino,
            guardar: (r) => {
              ultimo.current = r.pontuacao;
              void enviar([treino ? { op: "treino", id: novoId(), missao: id } : { op: "resultado", id: novoId(), missao: id, pontuacao: r.pontuacao, duracaoMs: Math.max(0, Math.round(r.duracaoMs)) }]);
            },
            rotuloVoltar: ALDEIA.interface.resultado.proxima,
            aoVoltar: () => nav(`/aldeia/${codigo}`, { state: { depoisMissao: { missao: id, pontuacao: ultimo.current, treino } satisfies DepoisMissao } }),
          }}
        />
      </main>
    </div>
  );
}
