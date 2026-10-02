// ─── Atividades ainda não implementadas (fase 2 da especificação) ────────────
// Ficam no catálogo como "Em breve" para a estrutura dos percursos ser visível desde já.
import { definir, type PropsAtividade } from "../motor/tipos";

function EmBreve({ aoTerminar }: PropsAtividade<Record<string, never>>) {
  return (
    <div className="cartao p-6 grid gap-3">
      <p>Esta atividade ainda está em construção.</p>
      <button type="button" className="botao botao--contorno" onClick={() => aoTerminar({ pontuacao: 0, duracaoMs: 0, metricas: {} })}>
        Voltar
      </button>
    </div>
  );
}

const vazio = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} } as Record<1 | 2 | 3 | 4 | 5, Record<string, never>>;

export const arquivo = definir<Record<string, never>>({
  slug: "arquivo",
  numero: 4,
  dominio: "navegacao",
  titulo: { jornal: "O Arquivo", laboratorio: "Arquivo de Amostras" },
  descricao: "Encontrar ficheiros em pastas, separadores abertos, histórico de navegação e o fim de uma página longa.",
  duracao: "3 a 5 min",
  disponivel: false,
  niveis: vazio,
  pratica: (c) => c,
  Componente: EmBreve,
  dica: () => "",
});

export const cartao = definir<Record<string, never>>({
  slug: "cartao",
  numero: 5,
  dominio: "formularios",
  titulo: { jornal: "Cartão de Imprensa", laboratorio: "Ficha de Segurança" },
  descricao: "Preencher um formulário a partir de uma ficha de dados, com formatos portugueses, e corrigir os erros de validação.",
  duracao: "3 a 5 min",
  disponivel: false,
  niveis: vazio,
  pratica: (c) => c,
  Componente: EmBreve,
  dica: () => "",
});

export const fecho = definir<Record<string, never>>({
  slug: "fecho",
  numero: 7,
  dominio: "tempo",
  titulo: { jornal: "Fecho de Edição", laboratorio: "Fim da Sessão" },
  descricao: "Muitos itens curtos, um relógio global e tempos sugeridos por secção. Mede ritmo, não dificuldade.",
  duracao: "4 a 8 min",
  disponivel: false,
  niveis: vazio,
  pratica: (c) => c,
  Componente: EmBreve,
  dica: () => "",
});

export const simulador = definir<Record<string, never>>({
  slug: "simulador",
  numero: 10,
  dominio: "todas",
  titulo: { jornal: "Simulador de Prova", laboratorio: "Simulador de Prova" },
  descricao: "Uma interface de prova genérica: lista de itens, marcar para rever, áudio, zoom, calculadora, confirmação antes de submeter.",
  duracao: "8 a 15 min",
  disponivel: false,
  niveis: vazio,
  pratica: (c) => c,
  Componente: EmBreve,
  dica: () => "",
});
