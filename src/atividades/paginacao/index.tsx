// ─── Atividade 6 · Paginação / Bancada (arrastar e largar) ───────────────────
// Três rondas: ordenar, classificar em categorias, ligar pares. Todo o arrasto tem alternativa por teclado
// (sensor de teclado do dnd-kit) e por toque (selecionar o item, depois o destino) — WCAG 2.5.7.
import { useMemo, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Contexto } from "../../preferencias/preferencias";
import { baralhar, definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../../motor/tipos";
import { Feedback, Instrucao } from "../../motor/util";
import { Botao } from "../../ui";

interface Ordenar {
  titulo: string;
  itens: string[]; // pela ordem correta
}
interface Classificar {
  categorias: string[];
  itens: { t: string; c: number }[];
}
interface Ligar {
  pares: [string, string][]; // [alvo fixo, item a arrastar]
}
/** Conjuntos extra para ordenar (por nível e cenário): em cada tentativa sorteia-se um entre estes e o principal. */
const ORDENAR_EXTRA: Record<1 | 2 | 3 | 4 | 5, Record<Contexto, Ordenar[]>> = {
  1: {
    jornal: [
      { titulo: "Põe a história pela ordem certa", itens: ["O Tomé pega na máquina.", "O Tomé tira a fotografia.", "A Lia escolhe a melhor.", "A fotografia sai no jornal."] },
      { titulo: "Põe o dia pela ordem certa", itens: ["De manhã.", "Ao almoço.", "À tarde.", "À noite."] },
    ],
    laboratorio: [
      { titulo: "Põe os passos pela ordem certa", itens: ["Encher o vaso com terra.", "Pôr a semente.", "Regar a terra.", "Ver a planta crescer."] },
      { titulo: "Põe a experiência pela ordem certa", itens: ["Encher o copo.", "Juntar o gelo.", "Esperar um pouco.", "Ver o gelo derreter."] },
    ],
  },
  2: {
    jornal: [
      { titulo: "Ordena as frases da notícia", itens: ["Ontem houve torneio de futebol na escola.", "Jogaram oito equipas de vários anos.", "A final foi muito renhida.", "O 6.º A ganhou nos penáltis.", "A taça vai ficar na biblioteca."] },
      { titulo: "Ordena os passos para escrever uma notícia", itens: ["Escolher o tema.", "Falar com as pessoas.", "Escrever o texto.", "Pedir a alguém para rever.", "Enviar para a Diretora Graça."] },
    ],
    laboratorio: [
      { titulo: "Ordena os passos da experiência", itens: ["Pesa o copo vazio.", "Enche o copo com água.", "Pesa o copo cheio.", "Faz a subtração.", "Regista a massa da água."] },
      { titulo: "Ordena o ciclo da água", itens: ["A água do mar aquece.", "O vapor sobe.", "Formam-se as nuvens.", "Chove.", "A água volta ao mar."] },
    ],
  },
  3: {
    jornal: [
      { titulo: "Ordena os parágrafos da entrevista", itens: ["Título: Dez perguntas à nova diretora.", "Apresentação: Quem é e de onde vem.", "Pergunta sobre os primeiros dias.", "Pergunta sobre os planos para a escola.", "Pergunta sobre os alunos.", "Agradecimento final."] },
      { titulo: "Ordena as etapas de uma reportagem", itens: ["Definir o ângulo.", "Marcar as entrevistas.", "Ir ao local.", "Recolher dados e imagens.", "Escrever e rever.", "Publicar com fotografias."] },
    ],
    laboratorio: [
      { titulo: "Ordena os passos da titulação", itens: ["Lavar a bureta.", "Encher a bureta com a solução.", "Pôr o indicador no balão.", "Abrir a torneira devagar.", "Parar quando a cor muda.", "Registar o volume gasto."] },
      { titulo: "Ordena os passos para usar o microscópio", itens: ["Ligar a luz.", "Pôr a lâmina na platina.", "Escolher a objetiva menor.", "Focar com o parafuso grande.", "Afinar com o parafuso pequeno.", "Mudar para a objetiva maior."] },
    ],
  },
  4: {
    jornal: [
      { titulo: "Ordena as referências por ordem alfabética do apelido", itens: ["Antunes, P. (2020). Rádio escolar.", "Barros, L. (2022). Redes e notícias.", "Correia, J. (2019). O lead.", "Dias, R. (2024). Fotojornalismo.", "Ferreira, A. (2021). Entrevistar.", "Gomes, S. (2023). Desinformação."] },
      { titulo: "Ordena as etapas da verificação de factos", itens: ["Identificar a afirmação.", "Procurar a fonte original.", "Contactar quem fez a afirmação.", "Consultar dados oficiais.", "Classificar a afirmação.", "Publicar a verificação."] },
    ],
    laboratorio: [
      { titulo: "Ordena as etapas da preparação de uma solução", itens: ["Calcular a massa de soluto.", "Tarar a balança.", "Pesar o soluto.", "Dissolver num pouco de água.", "Transferir para o balão volumétrico.", "Completar até ao traço."] },
      { titulo: "Ordena as secções de um artigo científico", itens: ["Resumo", "Introdução", "Métodos", "Resultados", "Discussão", "Referências"] },
    ],
  },
  5: {
    jornal: [
      { titulo: "Ordena as etapas de uma investigação jornalística", itens: ["Receber a pista", "Avaliar a credibilidade", "Recolher documentos", "Cruzar fontes", "Ouvir o visado", "Validar com a direção", "Redigir e rever", "Publicar e acompanhar"] },
    ],
    laboratorio: [
      { titulo: "Ordena as etapas de um projeto de investigação", itens: ["Rever a literatura", "Formular a pergunta", "Definir hipóteses", "Planear o método", "Pedir aprovação ética", "Recolher os dados", "Analisar estatisticamente", "Publicar os resultados"] },
    ],
  },
};

export interface ConfigPaginacao {
  ordenar: Record<Contexto, Ordenar>;
  classificar: Record<Contexto, Classificar>;
  ligar?: Record<Contexto, Ligar>;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigPaginacao> = {
  1: {
    ordenar: {
      jornal: { titulo: "Põe a história pela ordem certa", itens: ["A Rita acorda.", "A Rita toma o pequeno-almoço.", "A Rita vai para a escola.", "A Rita brinca no recreio."] },
      laboratorio: { titulo: "Põe os passos pela ordem certa", itens: ["Lavar as mãos.", "Vestir a bata.", "Pôr os óculos.", "Começar a experiência."] },
    },
    classificar: {
      jornal: { categorias: ["Desporto", "Cultura"], itens: [{ t: "Futebol", c: 0 }, { t: "Teatro", c: 1 }, { t: "Natação", c: 0 }, { t: "Música", c: 1 }, { t: "Pintura", c: 1 }, { t: "Corrida", c: 0 }] },
      laboratorio: { categorias: ["Líquidos", "Sólidos"], itens: [{ t: "Água", c: 0 }, { t: "Pedra", c: 1 }, { t: "Leite", c: 0 }, { t: "Madeira", c: 1 }, { t: "Gelo", c: 1 }, { t: "Sumo", c: 0 }] },
    },
  },
  2: {
    ordenar: {
      jornal: { titulo: "Ordena as frases da notícia", itens: ["Na terça-feira, a turma foi ao museu.", "Primeiro viram a sala das estátuas.", "Depois, a guia mostrou as moedas antigas.", "No fim, lancharam no jardim.", "Todos voltaram cansados mas contentes."] },
      laboratorio: { titulo: "Ordena os passos da experiência", itens: ["Enche o copo com água.", "Mede a temperatura inicial.", "Junta dois cubos de gelo.", "Espera cinco minutos.", "Mede a temperatura final."] },
    },
    classificar: {
      jornal: { categorias: ["Desporto", "Cultura", "Escola"], itens: [{ t: "Torneio de andebol", c: 0 }, { t: "Concerto de Natal", c: 1 }, { t: "Novo horário da cantina", c: 2 }, { t: "Exposição de pintura", c: 1 }, { t: "Corta-mato", c: 0 }, { t: "Eleição da associação", c: 2 }, { t: "Peça de teatro", c: 1 }, { t: "Final de xadrez", c: 0 }] },
      laboratorio: { categorias: ["Material", "Medição", "Segurança"], itens: [{ t: "Proveta", c: 0 }, { t: "Termómetro", c: 1 }, { t: "Óculos", c: 2 }, { t: "Balança", c: 1 }, { t: "Bata", c: 2 }, { t: "Pipeta", c: 0 }, { t: "Cronómetro", c: 1 }, { t: "Luvas", c: 2 }] },
    },
    ligar: {
      jornal: { pares: [["Fotografia da equipa", "A equipa festeja a vitória."], ["Fotografia do palco", "Os atores agradecem ao público."], ["Fotografia da cantina", "O novo menu chegou."], ["Fotografia do jardim", "Plantámos dez árvores."]] },
      laboratorio: { pares: [["Termómetro", "Mede a temperatura."], ["Balança", "Mede a massa."], ["Proveta", "Mede o volume."], ["Cronómetro", "Mede o tempo."]] },
    },
  },
  3: {
    ordenar: {
      jornal: { titulo: "Ordena os parágrafos da reportagem", itens: ["Título: A escola que recicla.", "Lead: Desde setembro, a escola separa todo o lixo.", "Contexto: O projeto nasceu numa aula de Ciências.", "Dados: Já foram recolhidos 400 kg de papel.", "Testemunho: “Foi mais fácil do que pensávamos”, diz a Lia.", "Fecho: A próxima meta é o plástico."] },
      laboratorio: { titulo: "Ordena as secções do relatório", itens: ["Título e autores", "Objetivo", "Material e método", "Resultados", "Discussão", "Conclusão"] },
    },
    classificar: {
      jornal: { categorias: ["Desporto", "Cultura", "Escola", "Opinião"], itens: [{ t: "Crónica: O recreio devia ser maior", c: 3 }, { t: "Resultados do torneio", c: 0 }, { t: "Crítica ao concerto", c: 1 }, { t: "Novas regras da biblioteca", c: 2 }, { t: "Entrevista ao treinador", c: 0 }, { t: "Editorial", c: 3 }, { t: "Clube de leitura", c: 1 }, { t: "Obras no ginásio", c: 2 }, { t: "Carta de um aluno", c: 3 }, { t: "Festival de cinema", c: 1 }] },
      laboratorio: { categorias: ["Grandeza", "Unidade", "Instrumento", "Procedimento"], itens: [{ t: "Massa", c: 0 }, { t: "Grama", c: 1 }, { t: "Balança", c: 2 }, { t: "Tarar a balança", c: 3 }, { t: "Volume", c: 0 }, { t: "Mililitro", c: 1 }, { t: "Proveta", c: 2 }, { t: "Ler ao nível do olho", c: 3 }, { t: "Temperatura", c: 0 }, { t: "Grau Celsius", c: 1 }] },
    },
    ligar: {
      jornal: { pares: [["Lead", "Primeiro parágrafo que resume a notícia."], ["Título", "Frase curta que chama a atenção."], ["Legenda", "Texto curto por baixo da fotografia."], ["Fonte", "Pessoa ou documento de onde vem a informação."], ["Editorial", "Opinião do jornal sobre um tema."], ["Entrevista", "Perguntas e respostas a uma pessoa."]] },
      laboratorio: { pares: [["Hipótese", "Explicação provisória que se vai testar."], ["Variável", "Fator que pode mudar na experiência."], ["Controlo", "Grupo que não recebe o tratamento."], ["Réplica", "Repetição da mesma medição."], ["Conclusão", "Resposta à pergunta inicial."], ["Protocolo", "Lista de passos a seguir."]] },
    },
  },
  4: {
    ordenar: {
      jornal: { titulo: "Ordena a bibliografia por ordem alfabética do apelido", itens: ["Almeida, R. (2021). Jornalismo escolar.", "Costa, B. (2023). Avaliação digital.", "Marques, D. (2025). Verificação de fontes.", "Pires, C. (2020). Ler no ecrã.", "Silva, A. (2024). Literacia mediática.", "Teixeira, M. (2019). Redações jovens."] },
      laboratorio: { titulo: "Ordena os passos do método científico", itens: ["Observar um fenómeno.", "Formular uma pergunta.", "Propor uma hipótese.", "Desenhar a experiência.", "Recolher e analisar dados.", "Concluir e comunicar."] },
    },
    classificar: {
      jornal: { categorias: ["Fonte primária", "Fonte secundária", "Opinião", "Publicidade"], itens: [{ t: "Entrevista gravada", c: 0 }, { t: "Artigo de enciclopédia", c: 1 }, { t: "Crónica semanal", c: 2 }, { t: "Anúncio da papelaria", c: 3 }, { t: "Ata da reunião", c: 0 }, { t: "Resumo de um estudo", c: 1 }, { t: "Carta ao diretor", c: 2 }, { t: "Patrocínio do torneio", c: 3 }, { t: "Fotografia do evento", c: 0 }, { t: "Manual escolar", c: 1 }] },
      laboratorio: { categorias: ["Variável independente", "Variável dependente", "Constante", "Erro"], itens: [{ t: "Quantidade de luz", c: 0 }, { t: "Altura da planta", c: 1 }, { t: "Tipo de solo", c: 2 }, { t: "Leitura mal anotada", c: 3 }, { t: "Temperatura da sala", c: 2 }, { t: "Dose de fertilizante", c: 0 }, { t: "Número de folhas", c: 1 }, { t: "Balança descalibrada", c: 3 }, { t: "Volume de água por dia", c: 2 }, { t: "Massa final", c: 1 }] },
    },
    ligar: {
      jornal: { pares: [["Plágio", "Copiar texto de outros sem citar."], ["Verificação de factos", "Confirmar se uma afirmação é verdadeira."], ["Informação confidencial", "Informação que não pode ser publicada."], ["Pauta", "Lista de temas a cobrir na edição."], ["Prazo de fecho", "Hora limite para entregar o texto."], ["Assinatura", "Nome do autor junto ao título."], ["Infografia", "Informação apresentada em gráfico."], ["Errata", "Correção de um erro publicado."]] },
      laboratorio: { pares: [["Precisão", "Medições repetidas dão valores próximos."], ["Exatidão", "O valor medido aproxima-se do valor real."], ["Calibração", "Ajustar um instrumento a um padrão."], ["Amostra", "Parte do material que se analisa."], ["Reagente", "Substância que participa na reação."], ["Solução", "Mistura homogénea de soluto e solvente."], ["pH", "Medida da acidez de uma solução."], ["Desvio padrão", "Dispersão dos valores à volta da média."]] },
    },
  },
  5: {
    ordenar: {
      jornal: { titulo: "Ordena as etapas de produção de uma edição", itens: ["Reunião de pauta", "Pesquisa e entrevistas", "Escrita do texto", "Revisão e verificação de factos", "Edição e títulos", "Paginação e fotografias", "Aprovação da direção", "Impressão e distribuição"] },
      laboratorio: { titulo: "Ordena as etapas de um ensaio laboratorial", itens: ["Rever o protocolo", "Verificar equipamento e segurança", "Preparar as soluções", "Calibrar os instrumentos", "Executar as medições", "Registar os dados brutos", "Analisar e calcular incertezas", "Redigir o relatório"] },
    },
    classificar: {
      jornal: { categorias: ["Notícia", "Reportagem", "Entrevista", "Opinião"], itens: [{ t: "Factos sobre o torneio de ontem", c: 0 }, { t: "Um dia na cantina da escola", c: 1 }, { t: "Perguntas à nova diretora", c: 2 }, { t: "Porque devíamos ter mais recreio", c: 3 }, { t: "Resultados das eleições", c: 0 }, { t: "Os bastidores do concerto", c: 1 }, { t: "Conversa com o campeão", c: 2 }, { t: "Editorial de maio", c: 3 }, { t: "Horário novo a partir de segunda", c: 0 }, { t: "Três semanas com a equipa de teatro", c: 1 }, { t: "Dez perguntas ao bibliotecário", c: 2 }, { t: "Crítica ao filme", c: 3 }] },
      laboratorio: { categorias: ["Qualitativo", "Quantitativo discreto", "Quantitativo contínuo", "Metadado"], itens: [{ t: "Cor da solução", c: 0 }, { t: "Número de réplicas", c: 1 }, { t: "Massa em gramas", c: 2 }, { t: "Data da medição", c: 3 }, { t: "Cheiro", c: 0 }, { t: "Contagem de colónias", c: 1 }, { t: "Temperatura", c: 2 }, { t: "Nome do operador", c: 3 }, { t: "Textura", c: 0 }, { t: "Número de folhas", c: 1 }, { t: "Volume em ml", c: 2 }, { t: "Código do lote", c: 3 }] },
    },
    ligar: {
      jornal: { pares: [["Pirâmide invertida", "Começar pelo mais importante."], ["Fonte anónima", "Identidade protegida pelo jornalista."], ["Direito de resposta", "Quem é visado pode responder."], ["Embargo", "Informação só pode sair a partir de certa hora."], ["Manchete", "Título principal da primeira página."], ["Cabeçalho", "Nome do jornal, data e número."], ["Coluna", "Espaço fixo de um autor."], ["Caixa", "Texto curto destacado dentro do artigo."]] },
      laboratorio: { pares: [["Incerteza", "Intervalo onde o valor real deve estar."], ["Algarismos significativos", "Dígitos que têm sentido na medição."], ["Branco", "Amostra sem o analito, para comparar."], ["Diluição", "Reduzir a concentração juntando solvente."], ["Titulação", "Determinar concentração por reação controlada."], ["Densidade", "Massa por unidade de volume."], ["Ponto de ebulição", "Temperatura a que um líquido passa a gás."], ["Catalisador", "Acelera a reação sem se consumir."]] },
    },
  },
};

type Ronda = "ordenar" | "classificar" | "ligar";

function Paginacao({ config, contexto, nivel, modo, aoTerminar }: PropsAtividade<ConfigPaginacao>) {
  // Semente nova em cada tentativa: a ordem baralhada e o conjunto a ordenar mudam sempre.
  const [sementeBase] = useState(() => 1 + Math.floor(Math.random() * 1e9));
  const [ordenar] = useState<Ordenar>(() => {
    const opcoes = [config.ordenar[contexto], ...(modo === "avaliacao" ? (ORDENAR_EXTRA[nivel]?.[contexto] ?? []) : [])];
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  });
  const rondas = useMemo<Ronda[]>(() => (config.ligar ? ["ordenar", "classificar", "ligar"] : ["ordenar", "classificar"]), [config.ligar]);
  const [ri, setRi] = useState(0);
  const acertos = useRef(0);
  const total = useRef(0);
  const movimentos = useRef(0);
  const otimo = useRef(0);
  const inicio = useRef(performance.now());
  const relatorio = useRef<LinhaRelatorio[]>([]);

  function proxima(certos: number, n: number, movs: number, linhas: LinhaRelatorio[] = []) {
    relatorio.current.push(...linhas);
    acertos.current += certos;
    total.current += n;
    movimentos.current += movs;
    otimo.current += n;
    if (ri + 1 >= rondas.length) {
      const extra = Math.max(0, movimentos.current - 1.5 * otimo.current);
      aoTerminar({
        pontuacao: limitar(100 * (acertos.current / total.current) - 2 * extra),
        duracaoMs: performance.now() - inicio.current,
        metricas: { acertos: acertos.current, total: total.current, movimentos: movimentos.current, movimentosOtimos: otimo.current },
        relatorio: [
          ...relatorio.current,
          {
            tarefa: "Movimentos",
            resultado: extra === 0 ? "certo" : "parcial",
            resposta: `${movimentos.current} movimentos`,
            certa: `Até ${Math.floor(1.5 * otimo.current)} sem desconto`,
            feedback: extra > 0 ? "Decide o destino antes de mover: cada movimento a mais desconta 2 pontos." : undefined,
          },
        ],
      });
      return;
    }
    setRi(ri + 1);
  }

  const ronda = rondas[ri];
  const semente = sementeBase + ri;
  return (
    <div className="grid gap-4">
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
        Ronda {ri + 1} de {rondas.length}
      </div>
      {ronda === "ordenar" && <RondaOrdenar key="o" dados={ordenar} semente={semente} aoConcluir={proxima} />}
      {ronda === "classificar" && <RondaClassificar key="c" dados={config.classificar[contexto]} semente={semente} aoConcluir={proxima} />}
      {ronda === "ligar" && config.ligar && <RondaLigar key="l" dados={config.ligar[contexto]} semente={semente} aoConcluir={proxima} />}
    </div>
  );
}

// ── Ronda 1: ordenar (lista ordenável) ───────────────────────────────────────
function RondaOrdenar({ dados, semente, aoConcluir }: { dados: Ordenar; semente: number; aoConcluir: (certos: number, n: number, movs: number, linhas: LinhaRelatorio[]) => void }) {
  const [ordem, setOrdem] = useState(() => {
    // Nunca começa já na ordem certa.
    let o = baralhar(dados.itens.map((_, i) => i), semente);
    for (let k = 1; o.every((v, i) => v === i) && k < 10; k++) o = baralhar(o, semente + k);
    return o;
  });
  const [movs, setMovs] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const sensores = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function fim(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setOrdem((o) => arrayMove(o, o.indexOf(Number(active.id)), o.indexOf(Number(over.id))));
    setMovs((m) => m + 1);
  }
  function mover(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= ordem.length) return;
    setOrdem((o) => arrayMove(o, i, j));
    setMovs((m) => m + 1);
  }
  const certos = ordem.filter((v, i) => v === i).length;

  return (
    <div className="grid gap-3">
      <Instrucao>{dados.titulo}. Arrasta os itens, ou usa as setas ▲▼ de cada item. Com o teclado: Espaço para pegar, setas para mover, Espaço para largar.</Instrucao>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={fim}>
        <SortableContext items={ordem} strategy={verticalListSortingStrategy}>
          <ol className="grid gap-2 list-none m-0 p-0">
            {ordem.map((id, i) => (
              <ItemOrdenavel key={id} id={id} texto={dados.itens[id]} posicao={i + 1} estado={confirmado ? (id === i ? "certa" : "errada") : null} aoMover={(d) => mover(i, d)} desativado={confirmado} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {confirmado ? (
        <>
          <Feedback tipo={certos === ordem.length ? "certo" : "errado"}>
            {certos} de {ordem.length} na posição certa.
          </Feedback>
          <div>
            <Botao
              onClick={() =>
                aoConcluir(certos, ordem.length, movs, [
                  {
                    tarefa: dados.titulo,
                    resultado: certos === ordem.length ? "certo" : certos >= ordem.length / 2 ? "parcial" : "errado",
                    resposta: ordem.map((i) => dados.itens[i]).join(" → "),
                    certa: dados.itens.join(" → "),
                    feedback: certos === ordem.length ? undefined : "Procura primeiro o início e o fim; depois encaixa o que fica no meio.",
                  },
                ])
              }
            >
              Continuar
            </Botao>
          </div>
        </>
      ) : (
        <div>
          <Botao onClick={() => setConfirmado(true)}>Confirmar ordem</Botao>
        </div>
      )}
    </div>
  );
}

function ItemOrdenavel({ id, texto, posicao, estado, aoMover, desativado }: { id: number; texto: string; posicao: number; estado: "certa" | "errada" | null; aoMover: (d: -1 | 1) => void; desativado: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled: desativado });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`ficha ${estado === "certa" ? "ficha--certa" : estado === "errada" ? "ficha--errada" : ""}`}>
      <span className="font-bold tabular-nums" style={{ color: "var(--suave)", minWidth: 24 }}>
        {posicao}.
      </span>
      <button type="button" className="flex-1 text-left" style={{ background: "transparent", border: 0, font: "inherit", color: "inherit", cursor: desativado ? "default" : "grab", padding: 0 }} {...attributes} {...listeners} aria-label={`${texto}. Posição ${posicao}. Espaço para pegar.`} disabled={desativado}>
        {texto}
      </button>
      <span className="flex gap-1">
        <button type="button" className="botao botao--contorno" style={{ minWidth: 36, padding: "2px 8px", minHeight: 36 }} aria-label={`Mover "${texto}" para cima`} onClick={() => aoMover(-1)} disabled={desativado}>
          ▲
        </button>
        <button type="button" className="botao botao--contorno" style={{ minWidth: 36, padding: "2px 8px", minHeight: 36 }} aria-label={`Mover "${texto}" para baixo`} onClick={() => aoMover(1)} disabled={desativado}>
          ▼
        </button>
      </span>
    </li>
  );
}

// ── Rondas 2 e 3: colocar itens em zonas (classificar) ou em alvos (ligar) ──
interface Colocacao {
  resumo: string; // nome da ronda no relatório
  dica: string;
  zonas: { id: string; nome: string; capacidade: number | null }[];
  itens: { id: string; texto: string; zonaCerta: string }[];
  titulo: string;
}

function RondaClassificar({ dados, semente, aoConcluir }: { dados: Classificar; semente: number; aoConcluir: (c: number, n: number, m: number, linhas: LinhaRelatorio[]) => void }) {
  const col = useMemo<Colocacao>(
    () => ({
      titulo: "Arrasta cada item para a secção certa. Em alternativa, toca no item e depois na secção.",
      resumo: "Classificar os itens pelas secções",
      dica: "Lê o nome de todas as secções antes de começar e pergunta-te a qual pertence cada item.",
      zonas: dados.categorias.map((c, i) => ({ id: `z${i}`, nome: c, capacidade: null })),
      itens: baralhar(dados.itens, semente).map((it, i) => ({ id: `i${i}`, texto: it.t, zonaCerta: `z${it.c}` })),
    }),
    [dados, semente],
  );
  return <Colocar col={col} aoConcluir={aoConcluir} />;
}

function RondaLigar({ dados, semente, aoConcluir }: { dados: Ligar; semente: number; aoConcluir: (c: number, n: number, m: number, linhas: LinhaRelatorio[]) => void }) {
  const col = useMemo<Colocacao>(
    () => ({
      titulo: "Liga cada descrição ao termo certo: arrasta-a para o termo, ou toca na descrição e depois no termo.",
      resumo: "Ligar cada descrição ao termo",
      dica: "Começa pelos pares de que tens a certeza; os que sobram ficam mais fáceis.",
      zonas: dados.pares.map((p, i) => ({ id: `z${i}`, nome: p[0], capacidade: 1 })),
      itens: baralhar(dados.pares.map((p, i) => ({ texto: p[1], z: `z${i}` })), semente).map((it, i) => ({ id: `i${i}`, texto: it.texto, zonaCerta: it.z })),
    }),
    [dados, semente],
  );
  return <Colocar col={col} aoConcluir={aoConcluir} />;
}

function Colocar({ col, aoConcluir }: { col: Colocacao; aoConcluir: (c: number, n: number, m: number, linhas: LinhaRelatorio[]) => void }) {
  const [onde, setOnde] = useState<Record<string, string | null>>(() => Object.fromEntries(col.itens.map((i) => [i.id, null])));
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [movs, setMovs] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const sensores = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function colocar(itemId: string, zonaId: string | null) {
    setOnde((o) => {
      const n = { ...o, [itemId]: zonaId };
      const zona = col.zonas.find((z) => z.id === zonaId);
      if (zona?.capacidade === 1) {
        for (const [k, v] of Object.entries(o)) if (k !== itemId && v === zonaId) n[k] = null; // devolve o que lá estava
      }
      return n;
    });
    setMovs((m) => m + 1);
    setSelecionado(null);
  }
  function fim(e: DragEndEvent) {
    if (!e.over) return;
    const zona = String(e.over.id);
    colocar(String(e.active.id), zona === "bolsa" ? null : zona);
  }
  const certos = col.itens.filter((i) => onde[i.id] === i.zonaCerta).length;
  const porColocar = col.itens.filter((i) => onde[i.id] === null);

  return (
    <div className="grid gap-3">
      <Instrucao>{col.titulo}</Instrucao>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={fim}>
        <Zona id="bolsa" nome="Por colocar" selecionado={selecionado} aoEscolher={() => selecionado && colocar(selecionado, null)} desativada={confirmado}>
          {porColocar.map((i) => (
            <Ficha key={i.id} id={i.id} texto={i.texto} selecionado={selecionado === i.id} aoSelecionar={() => setSelecionado(selecionado === i.id ? null : i.id)} estado={null} desativada={confirmado} />
          ))}
          {porColocar.length === 0 && <span style={{ color: "var(--suave)" }}>Tudo colocado.</span>}
        </Zona>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${col.zonas.length > 4 ? 200 : 220}px, 1fr))` }}>
          {col.zonas.map((z) => (
            <Zona key={z.id} id={z.id} nome={z.nome} selecionado={selecionado} aoEscolher={() => selecionado && colocar(selecionado, z.id)} desativada={confirmado}>
              {col.itens
                .filter((i) => onde[i.id] === z.id)
                .map((i) => (
                  <Ficha key={i.id} id={i.id} texto={i.texto} selecionado={selecionado === i.id} aoSelecionar={() => setSelecionado(selecionado === i.id ? null : i.id)} estado={confirmado ? (i.zonaCerta === z.id ? "certa" : "errada") : null} desativada={confirmado} />
                ))}
            </Zona>
          ))}
        </div>
      </DndContext>
      {confirmado ? (
        <>
          <Feedback tipo={certos === col.itens.length ? "certo" : "errado"}>
            {certos} de {col.itens.length} no sítio certo.
          </Feedback>
          <div>
            <Botao
              onClick={() => {
                const nomeZona = (id: string | null) => col.zonas.find((z) => z.id === id)?.nome ?? "(sem lugar)";
                const linhas: LinhaRelatorio[] = [
                  { tarefa: col.resumo, resultado: certos === col.itens.length ? "certo" : certos >= col.itens.length / 2 ? "parcial" : "errado", resposta: `${certos} de ${col.itens.length} no sítio certo` },
                  ...col.itens
                    .filter((i) => onde[i.id] !== i.zonaCerta)
                    .map<LinhaRelatorio>((i) => ({ tarefa: `“${i.texto}”`, resultado: "errado", resposta: nomeZona(onde[i.id]), certa: nomeZona(i.zonaCerta), feedback: col.dica })),
                ];
                aoConcluir(certos, col.itens.length, movs, linhas);
              }}
            >
              Continuar
            </Botao>
          </div>
        </>
      ) : (
        <div>
          <Botao onClick={() => setConfirmado(true)} disabled={porColocar.length > 0}>
            Confirmar
          </Botao>
        </div>
      )}
    </div>
  );
}

function Zona({ id, nome, children, selecionado, aoEscolher, desativada }: { id: string; nome: string; children: React.ReactNode; selecionado: string | null; aoEscolher: () => void; desativada: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: desativada });
  return (
    <section aria-label={nome} className="grid gap-1">
      <div className="flex items-center justify-between gap-2">
        <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{nome}</strong>
        {selecionado && !desativada && (
          <button type="button" className="botao botao--contorno" style={{ minHeight: 36, padding: "2px 10px", fontSize: ".85rem" }} onClick={aoEscolher}>
            Colocar aqui
          </button>
        )}
      </div>
      <div ref={setNodeRef} className="zona" data-ativa={isOver} onClick={() => selecionado && !desativada && aoEscolher()}>
        {children}
      </div>
    </section>
  );
}

function Ficha({ id, texto, selecionado, aoSelecionar, estado, desativada }: { id: string; texto: string; selecionado: boolean; aoSelecionar: () => void; estado: "certa" | "errada" | null; desativada: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: desativada });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`ficha ${estado === "certa" ? "ficha--certa" : estado === "errada" ? "ficha--errada" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.6 : 1 }}
      disabled={desativada}
      {...attributes}
      {...listeners}
      aria-pressed={selecionado}
      onClick={(e) => {
        e.stopPropagation();
        aoSelecionar();
      }}
    >
      {texto}
    </button>
  );
}

export const definicao = definir<ConfigPaginacao>({
  slug: "paginacao",
  numero: 6,
  dominio: "arrastar",
  titulo: { jornal: "Paginação", laboratorio: "Bancada" },
  descricao: "Ordenar, classificar em secções e ligar pares. Tudo com alternativa por teclado e por toque.",
  duracao: "2 a 4 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({
    ordenar: { jornal: { titulo: "Ordena os três passos", itens: ["Escrever", "Rever", "Publicar"] }, laboratorio: { titulo: "Ordena os três passos", itens: ["Medir", "Registar", "Guardar"] } },
    classificar: { jornal: { categorias: ["Desporto", "Cultura"], itens: [{ t: "Futebol", c: 0 }, { t: "Teatro", c: 1 }] }, laboratorio: { categorias: ["Líquido", "Sólido"], itens: [{ t: "Água", c: 0 }, { t: "Pedra", c: 1 }] } },
  }),
  Componente: Paginacao,
  dica: (m) => {
    if (Number(m.movimentos) > 1.5 * Number(m.movimentosOtimos)) return "Decide antes de arrastar: lê todos os itens, escolhe o destino e só depois moves. Menos movimentos, mais pontos.";
    return "Nos testes, quase sempre há alternativa ao arrasto: clica no item e depois no destino, ou usa o teclado.";
  },
});
