// ─── Jogo · Quem Apagou o Ficheiro? (mistério) ───────────────────────────────
// Investigar pistas em quatro aplicações (registo do servidor, reservas, mensagens, fotografias), marcar as
// provas e acusar um suspeito. O caso é gerado em cada tentativa (nomes, computadores, horas, trocas).
// Pontuação: 60 % culpado certo + 40 % provas (essenciais marcadas, com penalização por provas irrelevantes).
import { useState } from "react";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, BotaoRadio } from "../../ui";
import { Janela, Separadores } from "../../componentes/Janela";
import { gerarMisterio, pontuarProvas, type ConfigMisterio, type Fonte, type Prova } from "./gerar";

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigMisterio> = {
  1: { suspeitos: 3, motivo: false, troca: "nunca", doisHorarios: false, fotografias: false, ficheiroParecido: false },
  2: { suspeitos: 4, motivo: true, troca: "nunca", doisHorarios: false, fotografias: false, ficheiroParecido: false },
  3: { suspeitos: 4, motivo: true, troca: "sempre", doisHorarios: false, fotografias: false, ficheiroParecido: false },
  4: { suspeitos: 4, motivo: true, troca: "talvez", doisHorarios: true, fotografias: true, ficheiroParecido: false },
  5: { suspeitos: 5, motivo: true, troca: "sempre", doisHorarios: true, fotografias: true, ficheiroParecido: true },
};

const NOME_FONTE: Record<Fonte, string> = { registo: "Registo do servidor", reservas: "Reservas dos computadores", mensagens: "Mensagens da equipa", fotografias: "Fotografias" };

function Misterio({ config, contexto, aoTerminar }: PropsAtividade<ConfigMisterio>) {
  const [caso] = useState(() => gerarMisterio(config, contexto));
  const fontes = (Object.keys(NOME_FONTE) as Fonte[]).filter((f) => caso.provas.some((p) => p.fonte === f));
  const [fonte, setFonte] = useState<Fonte>("registo");
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [acusado, setAcusado] = useState<string | null>(null);
  const [inicio] = useState(() => performance.now());
  const alternar = (id: string) => setMarcadas((m) => (m.has(id) ? new Set([...m].filter((x) => x !== id)) : new Set([...m, id])));

  function acusar() {
    const certo = acusado === caso.culpado;
    const fp = pontuarProvas(caso.provas, marcadas);
    const linhas: LinhaRelatorio[] = [
      { tarefa: "Quem apagou o ficheiro?", resultado: certo ? "certo" : "errado", resposta: acusado ?? undefined, certa: caso.culpado, feedback: certo ? undefined : caso.explicacao },
      ...caso.provas
        .filter((p) => p.peso === "essencial" || (p.peso === "irrelevante" && marcadas.has(p.id)))
        .map<LinhaRelatorio>((p) =>
          p.peso === "essencial"
            ? { tarefa: `Prova essencial (${NOME_FONTE[p.fonte].toLowerCase()})`, resultado: marcadas.has(p.id) ? "certo" : "errado", resposta: marcadas.has(p.id) ? "marcada" : "não marcada", certa: `${p.autor ? `${p.autor}: ` : ""}${p.texto}`, feedback: marcadas.has(p.id) ? undefined : "Esta pista era necessária para provar o caso." }
            : { tarefa: `Prova sem valor (${NOME_FONTE[p.fonte].toLowerCase()})`, resultado: "errado", resposta: `${p.autor ? `${p.autor}: ` : ""}${p.texto}`, certa: "Não marcar", feedback: "Esta pista não prova quem apagou o ficheiro (outra hora, outro computador, outro ficheiro ou só uma opinião)." },
        ),
    ];
    aoTerminar({
      pontuacao: limitar(60 * (certo ? 1 : 0) + 40 * fp),
      duracaoMs: performance.now() - inicio,
      metricas: { culpado: certo, provas: Math.round(100 * fp), marcadas: marcadas.size, troca: caso.provas.some((p) => p.peso === "essencial" && p.fonte === "mensagens") },
      relatorio: linhas,
    });
  }

  const daFonte = caso.provas.filter((p) => p.fonte === fonte);
  const ordenadas = fonte === "reservas" ? daFonte : [...daFonte].sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? "", "pt", { numeric: true }));
  const BotaoProva = ({ p }: { p: Prova }) => (
    <button type="button" className="botao botao--contorno marcar-prova" style={{ minHeight: 36, padding: "2px 10px" }} aria-pressed={marcadas.has(p.id)} onClick={() => alternar(p.id)}>
      {marcadas.has(p.id) ? "📌 Prova marcada" : "Marcar como prova"}
    </button>
  );

  return (
    <div className="grid gap-4">
      <Instrucao>
        O ficheiro “{caso.ficheiro}” desapareceu da {caso.local}. Investiga as pistas, marca as que provam o caso e acusa quem o apagou. Atenção: nem todas as pistas são úteis.
      </Instrucao>
      <Janela endereco={`investigacao.escola-exemplo.pt/${caso.ficheiro}`} rotulo="Ferramentas de investigação simuladas">
        <Separadores itens={fontes.map((f) => ({ id: f, nome: NOME_FONTE[f], marca: String(caso.provas.filter((p) => p.fonte === f && marcadas.has(p.id)).length || "") || undefined }))} ativo={fonte} aoMudar={setFonte} rotulo="Fontes de pistas" />
        <div role="tabpanel" aria-label={NOME_FONTE[fonte]} className="app-lista" style={{ background: "var(--superficie)" }}>
          {fonte === "reservas" && (
            <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
              Horário · computador · quem reservou
            </p>
          )}
          {ordenadas.map((p) => (
            <div key={p.id} className="flex gap-3 items-center flex-wrap">
              <div className="flex-1 min-w-[14rem]">
                {p.fonte === "mensagens" ? (
                  <>
                    <strong>{p.autor}</strong> <span className="text-sm" style={{ color: "var(--suave)" }}>{p.hora}</span>
                    <div>{p.texto}</div>
                  </>
                ) : p.fonte === "fotografias" ? (
                  <div className="flex gap-3 items-center">
                    <span aria-hidden="true" style={{ fontSize: "2rem" }}>🖼️</span>
                    <span>
                      <strong>Propriedades da imagem:</strong> {p.texto}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontFamily: "var(--fonte-mono)" }}>{p.texto}</span>
                )}
              </div>
              <BotaoProva p={p} />
            </div>
          ))}
        </div>
      </Janela>
      <fieldset className="cartao p-4 grid gap-2 border-0">
        <legend className="font-bold px-1">Acusação</legend>
        <p className="m-0 text-sm">Provas marcadas: {marcadas.size}. Quem apagou o ficheiro?</p>
        <div className="flex gap-x-4 flex-wrap">
          {caso.suspeitos.map((s) => (
            <BotaoRadio key={s} id={`susp-${s}`} name="suspeito" rotulo={s} checked={acusado === s} onChange={() => setAcusado(s)} />
          ))}
        </div>
        <div>
          <Botao disabled={!acusado || marcadas.size === 0} onClick={acusar}>
            Acusar
          </Botao>
        </div>
      </fieldset>
    </div>
  );
}

export const definicao = definir<ConfigMisterio>({
  slug: "misterio",
  numero: 103,
  dominio: "pensamento",
  titulo: { jornal: "Quem Apagou a Reportagem?", laboratorio: "Quem Apagou o Relatório?" },
  descricao: "Um mistério para resolver com pistas digitais: registos do servidor, reservas, mensagens e metadados de fotografias. Acusa o culpado e justifica com provas.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => NIVEIS[1],
  Componente: Misterio,
  dica: (m) => {
    if (m.culpado === false && m.troca === true) return "Lê as mensagens com atenção: alguém trocou de computador. A reserva diz quem devia estar no computador, não quem lá estava.";
    if (m.culpado === false) return "Começa pelo registo: em que computador e a que horas foi apagado? Depois procura nas reservas quem estava nesse computador a essa hora.";
    if (Number(m.provas) < 100) return "Marca só as pistas que provam o caso (o registo da eliminação, a reserva certa e, se houver, a troca de lugar). Opiniões e queixas não são provas.";
    return "Investigação exemplar: culpado certo e provas sólidas.";
  },
});
