// ─── Atividade 9 · Encontra no Texto / Encontra no Manual (leitura em ecrã) ──
// Texto longo num painel com scroll; perguntas num painel fixo. Mede estratégia de leitura em ecrã:
// títulos, varrimento, Ctrl+F (intercetado para a caixa de procura da página), voltar atrás.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { TECLA_CTRL } from "../../preferencias/preferencias";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao, useTemporizador } from "../../motor/util";
import { Botao, BotaoRadio } from "../../ui";

interface Secao {
  titulo: string;
  paragrafos: string[];
  tabela?: { cabecalho: string[]; linhas: string[][] };
}
interface Texto {
  titulo: string;
  indice?: boolean; // mostra lista de conteúdos no topo
  secoes: Secao[];
}
interface Pergunta {
  pergunta: string;
  opcoes: string[];
  correta: number;
}
export interface ConfigEncontra {
  texto: Record<Contexto, Texto>;
  perguntas: Record<Contexto, Pergunta[]>;
  tempoReferenciaSeg: number;
}

// [conteúdo Kendir] textos provisórios (regulamento fictício, guia fictício). É aqui que entram os textos de autor.
const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigEncontra> = {
  1: {
    tempoReferenciaSeg: 90,
    texto: {
      jornal: {
        titulo: "O dia da escola",
        secoes: [
          { titulo: "A festa", paragrafos: ["No dia 12 de maio a escola fez uma festa. Houve música no pátio e um teatro na biblioteca. A Diretora Graça abriu a festa às 10 horas."] },
          { titulo: "O jogo", paragrafos: ["À tarde houve um jogo de futebol entre o 3.º A e o 3.º B. Ganhou o 3.º B por 2 a 1. O Tomé tirou as fotografias."] },
          { titulo: "O lanche", paragrafos: ["No fim, todos comeram bolo de laranja. A Lia disse que foi o melhor dia do ano."] },
        ],
      },
      laboratorio: {
        titulo: "A experiência da planta",
        secoes: [
          { titulo: "O que fizemos", paragrafos: ["No dia 12 de maio plantámos três feijões em copos com algodão. Pusemos um copo ao sol, um à sombra e um no armário."] },
          { titulo: "O que vimos", paragrafos: ["Ao fim de 7 dias, o feijão ao sol tinha 9 centímetros. O da sombra tinha 5 e o do armário tinha 2 e estava amarelo."] },
          { titulo: "O que aprendemos", paragrafos: ["As plantas precisam de luz para crescer bem. A Doutora Inês disse que a cor amarela mostra falta de luz."] },
        ],
      },
    },
    perguntas: {
      jornal: [
        { pergunta: "Em que dia foi a festa?", opcoes: ["12 de maio", "2 de maio", "12 de março"], correta: 0 },
        { pergunta: "Quem ganhou o jogo?", opcoes: ["O 3.º A", "O 3.º B", "Empate"], correta: 1 },
        { pergunta: "Quem tirou as fotografias?", opcoes: ["A Lia", "A Diretora Graça", "O Tomé"], correta: 2 },
        { pergunta: "De que era o bolo?", opcoes: ["Chocolate", "Laranja", "Cenoura"], correta: 1 },
      ],
      laboratorio: [
        { pergunta: "Quantos feijões plantámos?", opcoes: ["Dois", "Três", "Sete"], correta: 1 },
        { pergunta: "Quanto media o feijão ao sol?", opcoes: ["9 centímetros", "5 centímetros", "2 centímetros"], correta: 0 },
        { pergunta: "Qual feijão ficou amarelo?", opcoes: ["O do sol", "O da sombra", "O do armário"], correta: 2 },
        { pergunta: "O que mostra a cor amarela?", opcoes: ["Falta de água", "Falta de luz", "Muito sol"], correta: 1 },
      ],
    },
  },
  2: {
    tempoReferenciaSeg: 150,
    texto: {
      jornal: {
        titulo: "Regras da biblioteca da escola",
        secoes: [
          { titulo: "Horário", paragrafos: ["A biblioteca abre de segunda a sexta, das 8h30 às 17h30. Às quartas-feiras fecha às 13h00 para arrumação. Nas férias de verão abre só de manhã."] },
          { titulo: "Empréstimos", paragrafos: ["Cada aluno pode levar até 3 livros de cada vez, por 15 dias. Os livros podem ser renovados uma vez, no balcão ou pelo computador da entrada. As revistas não saem da biblioteca."] },
          { titulo: "Atrasos", paragrafos: ["Por cada dia de atraso, o aluno fica um dia sem poder levar livros. Se um livro se perder, a família deve repor um igual ou pagar o valor na secretaria."] },
          { titulo: "Computadores", paragrafos: ["Há 6 computadores para trabalhos escolares. Cada sessão dura 30 minutos e marca-se com a professora bibliotecária, a professora Helena."] },
        ],
      },
      laboratorio: {
        titulo: "Regras do laboratório de ciências",
        secoes: [
          { titulo: "Horário", paragrafos: ["O laboratório abre de segunda a sexta, das 9h00 às 18h00. Às quartas-feiras fecha às 13h00 para limpeza. Fora das aulas só se entra com um professor."] },
          { titulo: "Equipamento", paragrafos: ["Cada grupo pode requisitar até 3 instrumentos de cada vez, por 15 dias. A requisição faz-se no balcão ou no computador da entrada. Os reagentes não saem do laboratório."] },
          { titulo: "Acidentes", paragrafos: ["Qualquer derrame deve ser comunicado logo ao técnico, o Rui. O material partido é registado no livro de ocorrências e reposto pela escola."] },
          { titulo: "Segurança", paragrafos: ["Há 6 bancadas com 4 lugares. A bata e os óculos são obrigatórios. O cabelo comprido deve estar preso e as mochilas ficam nos cacifos."] },
        ],
      },
    },
    perguntas: {
      jornal: [
        { pergunta: "A que hora fecha a biblioteca às quartas-feiras?", opcoes: ["17h30", "13h00", "8h30"], correta: 1 },
        { pergunta: "Quantos livros pode um aluno levar de cada vez?", opcoes: ["3", "6", "15"], correta: 0 },
        { pergunta: "Quantas vezes se pode renovar um livro?", opcoes: ["Nenhuma", "Uma", "Duas"], correta: 1 },
        { pergunta: "Quanto tempo dura uma sessão no computador?", opcoes: ["15 minutos", "30 minutos", "1 hora"], correta: 1 },
        { pergunta: "Como se chama a professora bibliotecária?", opcoes: ["Helena", "Graça", "Lia"], correta: 0 },
      ],
      laboratorio: [
        { pergunta: "A que hora fecha o laboratório às quartas-feiras?", opcoes: ["18h00", "13h00", "9h00"], correta: 1 },
        { pergunta: "Quantos instrumentos pode um grupo requisitar de cada vez?", opcoes: ["3", "4", "6"], correta: 0 },
        { pergunta: "A quem se comunica um derrame?", opcoes: ["À Doutora Inês", "Ao Rui", "À secretaria"], correta: 1 },
        { pergunta: "Quantas bancadas há?", opcoes: ["4", "6", "15"], correta: 1 },
        { pergunta: "Onde ficam as mochilas?", opcoes: ["Nas bancadas", "Nos cacifos", "No corredor"], correta: 1 },
      ],
    },
  },
  3: {
    tempoReferenciaSeg: 210,
    texto: {
      jornal: {
        titulo: "Guia do visitante: Museu da Cidade",
        secoes: [
          { titulo: "Apresentação", paragrafos: ["O Museu da Cidade ocupa o antigo palacete da Rua das Flores desde 1987. Tem três pisos, um jardim e uma cafetaria. A coleção reúne mais de 12 000 peças, das quais cerca de 900 estão expostas em permanência."] },
          { titulo: "Horários e preços", paragrafos: ["Aberto de terça a domingo, das 10h00 às 18h00; a última entrada é às 17h15. Encerra à segunda-feira e nos dias 1 de janeiro, 1 de maio e 25 de dezembro. Entrada gratuita no primeiro domingo de cada mês."], tabela: { cabecalho: ["Bilhete", "Preço"], linhas: [["Normal", "5,00 €"], ["Estudante", "2,50 €"], ["Menores de 12", "Grátis"], ["Grupo escolar (por aluno)", "1,00 €"]] } },
          { titulo: "Visitas escolares", paragrafos: ["As visitas de grupos escolares devem ser marcadas com 10 dias de antecedência através do email educativo@museudacidade.pt. Cada grupo tem no máximo 25 alunos e é acompanhado por um guia do serviço educativo. A visita dura 90 minutos."] },
          { titulo: "Regras", paragrafos: ["É permitido fotografar sem flash, exceto na sala 7 (têxteis). Mochilas grandes ficam no bengaleiro. Não é permitido comer nas salas; a cafetaria fica no piso 0, junto ao jardim."] },
        ],
      },
      laboratorio: {
        titulo: "Manual do microscópio MX-200",
        secoes: [
          { titulo: "Descrição", paragrafos: ["O MX-200 é um microscópio ótico com três objetivas (4x, 10x e 40x) e uma ocular de 10x. A ampliação total vai de 40x a 400x. A fonte de luz é LED com regulação de intensidade."] },
          { titulo: "Características", paragrafos: ["O aparelho pesa 3,2 kg e funciona a 12 V através do transformador fornecido. A lâmpada LED tem uma vida útil estimada de 20 000 horas."], tabela: { cabecalho: ["Objetiva", "Ampliação total", "Distância de trabalho"], linhas: [["4x", "40x", "25 mm"], ["10x", "100x", "7 mm"], ["40x", "400x", "0,6 mm"]] } },
          { titulo: "Utilização", paragrafos: ["Começa sempre pela objetiva de 4x. Coloca a lâmina na platina, prende-a com as pinças e foca com o parafuso macrométrico. Só depois passa à objetiva seguinte e afina com o parafuso micrométrico. Nunca uses o macrométrico com a objetiva de 40x: a lente pode tocar na lâmina."] },
          { titulo: "Manutenção", paragrafos: ["Limpa as lentes apenas com papel próprio e nunca com os dedos. Após a utilização, roda para a objetiva de 4x, desliga a luz e cobre o aparelho. Em caso de avaria contacta o técnico pelo email manutencao@lab3.pt."] },
        ],
      },
    },
    perguntas: {
      jornal: [
        { pergunta: "Desde que ano está o museu no palacete?", opcoes: ["1978", "1987", "1997"], correta: 1 },
        { pergunta: "A que hora é a última entrada?", opcoes: ["17h15", "18h00", "17h00"], correta: 0 },
        { pergunta: "Quanto paga cada aluno numa visita de grupo escolar? (ver tabela)", opcoes: ["2,50 €", "1,00 €", "Grátis"], correta: 1 },
        { pergunta: "Com quantos dias de antecedência se marca uma visita escolar?", opcoes: ["5", "10", "25"], correta: 1 },
        { pergunta: "Em que sala não se pode fotografar?", opcoes: ["Sala 7", "Sala 1", "Jardim"], correta: 0 },
        { pergunta: "Quando é a entrada gratuita?", opcoes: ["Todos os domingos", "No primeiro domingo do mês", "Às segundas"], correta: 1 },
      ],
      laboratorio: [
        { pergunta: "Qual é a ampliação da ocular?", opcoes: ["4x", "10x", "40x"], correta: 1 },
        { pergunta: "Quanto pesa o aparelho?", opcoes: ["3,2 kg", "12 kg", "2,3 kg"], correta: 0 },
        { pergunta: "Qual é a distância de trabalho da objetiva de 40x? (ver tabela)", opcoes: ["25 mm", "7 mm", "0,6 mm"], correta: 2 },
        { pergunta: "Por que objetiva se deve começar?", opcoes: ["4x", "10x", "40x"], correta: 0 },
        { pergunta: "Com que parafuso se afina a focagem nas objetivas maiores?", opcoes: ["Macrométrico", "Micrométrico", "Platina"], correta: 1 },
        { pergunta: "Para que email se comunica uma avaria?", opcoes: ["manutencao@lab3.pt", "tecnico@lab3.pt", "ajuda@mx200.pt"], correta: 0 },
      ],
    },
  },
  4: {
    tempoReferenciaSeg: 300,
    texto: {
      jornal: {
        titulo: "Regulamento do Jornal Escolar (excerto)",
        indice: true,
        secoes: [
          { titulo: "Artigo 1.º — Objeto", paragrafos: ["1. O presente regulamento define a organização do jornal escolar «O Recreio», adiante designado por Jornal.", "2. O Jornal é publicado em formato digital e em papel, com periodicidade mensal durante o ano letivo."] },
          { titulo: "Artigo 2.º — Equipa", paragrafos: ["1. A equipa é composta por um coordenador docente, um editor por secção e um número variável de repórteres.", "2. Os editores são eleitos no início de cada ano letivo por maioria simples dos repórteres inscritos.", "3. O mandato dos editores tem a duração de um ano letivo, renovável uma vez."] },
          { titulo: "Artigo 3.º — Conteúdos", paragrafos: ["1. Todos os textos são assinados pelo autor, salvo o editorial, que é da responsabilidade do coordenador.", "2. Não são publicados textos que identifiquem alunos sem autorização escrita do encarregado de educação.", "3. As fotografias de menores exigem a mesma autorização, exceto em planos gerais de eventos públicos da escola."] },
          { titulo: "Artigo 4.º — Prazos", paragrafos: ["1. Os textos são entregues ao editor da secção até ao dia 20 de cada mês.", "2. O fecho da edição ocorre no dia 25; após essa data só o coordenador pode autorizar alterações.", "3. A edição é publicada no primeiro dia útil do mês seguinte."] },
          { titulo: "Artigo 5.º — Direito de resposta", paragrafos: ["1. Qualquer pessoa visada numa notícia pode exercer o direito de resposta no prazo de 15 dias após a publicação.", "2. A resposta é publicada na edição seguinte, com o mesmo destaque, e não pode exceder 300 palavras."] },
          { titulo: "Artigo 6.º — Revisão", paragrafos: ["O presente regulamento é revisto de três em três anos, ou sempre que a assembleia de repórteres o proponha por dois terços dos votos."] },
        ],
      },
      laboratorio: {
        titulo: "Regulamento de Utilização do Laboratório (excerto)",
        indice: true,
        secoes: [
          { titulo: "Artigo 1.º — Objeto", paragrafos: ["1. O presente regulamento define as condições de utilização do Laboratório 3, adiante designado por Laboratório.", "2. Aplica-se a alunos, docentes, técnicos e visitantes."] },
          { titulo: "Artigo 2.º — Acesso", paragrafos: ["1. O acesso faz-se com cartão pessoal, emitido pela direção após formação de segurança com a duração de 2 horas.", "2. Alunos menores de 16 anos só acedem acompanhados por um docente.", "3. O cartão é válido por um ano letivo e renova-se com uma sessão de atualização de 30 minutos."] },
          { titulo: "Artigo 3.º — Segurança", paragrafos: ["1. É obrigatório o uso de bata, óculos de proteção e calçado fechado.", "2. É proibido comer, beber ou usar o telemóvel nas bancadas.", "3. Os reagentes são requisitados ao técnico e devolvidos no fim da sessão, com o registo de quantidades no livro de bancada."] },
          { titulo: "Artigo 4.º — Horários", paragrafos: ["1. O Laboratório funciona de segunda a sexta, das 9h00 às 18h00.", "2. As sessões reservam-se com 48 horas de antecedência na plataforma da escola.", "3. A reserva caduca se o grupo não comparecer nos primeiros 15 minutos."] },
          { titulo: "Artigo 5.º — Incidentes", paragrafos: ["1. Qualquer incidente é registado no livro de ocorrências no prazo de 24 horas.", "2. Danos em equipamento por uso indevido são comunicados ao encarregado de educação e repostos nos termos definidos pela direção."] },
          { titulo: "Artigo 6.º — Revisão", paragrafos: ["O presente regulamento é revisto de dois em dois anos, ou sempre que a comissão de segurança o proponha."] },
        ],
      },
    },
    perguntas: {
      jornal: [
        { pergunta: "Qual é a periodicidade do Jornal?", opcoes: ["Semanal", "Mensal", "Trimestral"], correta: 1 },
        { pergunta: "Quanto dura o mandato dos editores?", opcoes: ["Um ano letivo", "Dois anos", "Até ao fim do ciclo"], correta: 0 },
        { pergunta: "Quem assina o editorial?", opcoes: ["O editor de secção", "O coordenador", "Ninguém"], correta: 1 },
        { pergunta: "Até que dia se entregam os textos?", opcoes: ["Dia 20", "Dia 25", "Dia 1"], correta: 0 },
        { pergunta: "Qual é o limite de palavras do direito de resposta?", opcoes: ["150", "300", "500"], correta: 1 },
        { pergunta: "Qual é o prazo para exercer o direito de resposta?", opcoes: ["5 dias", "15 dias", "30 dias"], correta: 1 },
        { pergunta: "Com que frequência é revisto o regulamento?", opcoes: ["Todos os anos", "De dois em dois anos", "De três em três anos"], correta: 2 },
      ],
      laboratorio: [
        { pergunta: "Quanto dura a formação de segurança inicial?", opcoes: ["30 minutos", "2 horas", "1 dia"], correta: 1 },
        { pergunta: "A partir de que idade um aluno pode entrar sem docente?", opcoes: ["14 anos", "16 anos", "18 anos"], correta: 1 },
        { pergunta: "Onde se registam as quantidades de reagentes?", opcoes: ["No livro de bancada", "No livro de ocorrências", "Na plataforma"], correta: 0 },
        { pergunta: "Com quanta antecedência se reserva uma sessão?", opcoes: ["24 horas", "48 horas", "Uma semana"], correta: 1 },
        { pergunta: "Ao fim de quantos minutos caduca a reserva?", opcoes: ["10", "15", "30"], correta: 1 },
        { pergunta: "Em que prazo se regista um incidente?", opcoes: ["Imediatamente", "24 horas", "48 horas"], correta: 1 },
        { pergunta: "Com que frequência é revisto o regulamento?", opcoes: ["Todos os anos", "De dois em dois anos", "De três em três anos"], correta: 1 },
      ],
    },
  },
  5: {
    tempoReferenciaSeg: 360,
    texto: {
      jornal: {
        titulo: "Normas de Publicação da Gazeta do Campus (excerto)",
        indice: true,
        secoes: [
          { titulo: "Artigo 1.º — Âmbito", paragrafos: ["1. As presentes normas aplicam-se a todos os textos submetidos à Gazeta do Campus, incluindo notícias, reportagens, entrevistas, crónicas e cartas.", "2. A submissão implica a aceitação integral destas normas e da política editorial aprovada pelo conselho de redação em 14 de setembro de 2025."] },
          { titulo: "Artigo 2.º — Submissão", paragrafos: ["1. Os textos são submetidos exclusivamente através da plataforma interna, em formato .docx ou .odt, com o nome do ficheiro no padrão APELIDO_secção_data.", "2. Cada texto é acompanhado de um resumo até 50 palavras e de três palavras-chave.", "3. Fotografias são enviadas em separado, em JPG, com um mínimo de 2000 píxeis no lado maior e legenda com indicação do autor."] },
          { titulo: "Artigo 3.º — Extensão e formato", paragrafos: ["1. A extensão dos textos obedece à tabela seguinte.", "2. As citações diretas superiores a 40 palavras são destacadas em parágrafo próprio. As referências seguem a norma APA, 7.ª edição."], tabela: { cabecalho: ["Género", "Mínimo", "Máximo"], linhas: [["Notícia", "250 palavras", "600 palavras"], ["Reportagem", "800 palavras", "2 000 palavras"], ["Entrevista", "600 palavras", "1 500 palavras"], ["Crónica", "400 palavras", "800 palavras"], ["Carta ao editor", "—", "300 palavras"]] } },
          { titulo: "Artigo 4.º — Revisão e verificação", paragrafos: ["1. Todos os textos passam por verificação de factos; o autor indica as fontes de cada dado numérico.", "2. O editor pode devolver o texto para revisão até duas vezes; à terceira devolução o texto é arquivado.", "3. O prazo de resposta do editor é de 7 dias úteis a contar da submissão."] },
          { titulo: "Artigo 5.º — Conflitos de interesse", paragrafos: ["1. O autor declara qualquer ligação a pessoas ou entidades visadas no texto.", "2. Textos sobre associações de estudantes não podem ser escritos por membros dos seus órgãos sociais."] },
          { titulo: "Artigo 6.º — Correções", paragrafos: ["1. Erros factuais detetados após publicação são corrigidos no próprio texto, com nota datada no final.", "2. Pedidos de correção são enviados para correcoes@gazeta.campus.pt e respondidos em 72 horas."] },
          { titulo: "Artigo 7.º — Direitos", paragrafos: ["Os autores mantêm os direitos sobre os textos e concedem à Gazeta uma licença não exclusiva de publicação em qualquer suporte, por tempo indeterminado."] },
        ],
      },
      laboratorio: {
        titulo: "Procedimento Operacional: Preparação e Registo de Soluções (excerto)",
        indice: true,
        secoes: [
          { titulo: "1. Objetivo", paragrafos: ["1.1. Este procedimento descreve a preparação, rotulagem e registo de soluções aquosas no Laboratório de Investigação.", "1.2. Aplica-se a todos os investigadores e estudantes com acesso autorizado, de acordo com a revisão 4 aprovada em 14 de setembro de 2025."] },
          { titulo: "2. Material", paragrafos: ["2.1. Balança analítica (resolução 0,1 mg), calibrada diariamente com a massa padrão de 100 g.", "2.2. Balões volumétricos de classe A; provetas apenas para medições aproximadas.", "2.3. Água ultrapura tipo I (resistividade 18,2 MΩ·cm a 25 °C)."] },
          { titulo: "3. Preparação", paragrafos: ["3.1. Calcula a massa de soluto e regista o cálculo no caderno antes de pesar.", "3.2. Dissolve em cerca de 70 % do volume final, homogeneíza e completa até à marca; a temperatura da solução deve estar entre 18 °C e 22 °C na aferição.", "3.3. Os limites de tolerância por tipo de solução constam da tabela seguinte."], tabela: { cabecalho: ["Tipo", "Tolerância da concentração", "Validade"], linhas: [["Tampão", "± 1 %", "30 dias"], ["Padrão de calibração", "± 0,5 %", "7 dias"], ["Reagente geral", "± 2 %", "90 dias"], ["Solução de limpeza", "± 5 %", "180 dias"]] } },
          { titulo: "4. Rotulagem", paragrafos: ["4.1. Cada frasco leva etiqueta com: nome e concentração, data de preparação, validade, iniciais do preparador e código de lote no formato AAAA-MM-NNN.", "4.2. Frascos sem etiqueta ou com etiqueta ilegível são eliminados pelo técnico como resíduo não identificado."] },
          { titulo: "5. Registo", paragrafos: ["5.1. A preparação é registada no livro de soluções em 24 horas, com referência à página do caderno onde está o cálculo.", "5.2. Desvios ao procedimento são comunicados ao responsável do laboratório e registados como não conformidade; a resposta é dada em 72 horas."] },
          { titulo: "6. Eliminação", paragrafos: ["Soluções fora de validade são neutralizadas conforme a ficha de segurança e colocadas no contentor correspondente; nunca na pia."] },
          { titulo: "7. Revisão", paragrafos: ["Este procedimento é revisto anualmente ou após qualquer incidente que o envolva."] },
        ],
      },
    },
    perguntas: {
      jornal: [
        { pergunta: "Em que data foi aprovada a política editorial?", opcoes: ["14 de setembro de 2025", "4 de setembro de 2025", "14 de setembro de 2024"], correta: 0 },
        { pergunta: "Qual é o padrão do nome do ficheiro?", opcoes: ["APELIDO_secção_data", "secção_APELIDO_data", "data_secção_APELIDO"], correta: 0 },
        { pergunta: "Qual é o mínimo de píxeis do lado maior das fotografias?", opcoes: ["1200", "2000", "3000"], correta: 1 },
        { pergunta: "Qual é o máximo de palavras de uma crónica? (ver tabela)", opcoes: ["600", "800", "1 500"], correta: 1 },
        { pergunta: "Quantas devoluções pode um texto sofrer antes de ser arquivado?", opcoes: ["Uma", "Duas", "Três"], correta: 1 },
        { pergunta: "Qual é o prazo de resposta do editor?", opcoes: ["7 dias úteis", "72 horas", "15 dias"], correta: 0 },
        { pergunta: "Para onde se enviam pedidos de correção?", opcoes: ["correcoes@gazeta.campus.pt", "editor@gazeta.campus.pt", "redacao@campus.pt"], correta: 0 },
        { pergunta: "Que licença concedem os autores à Gazeta?", opcoes: ["Exclusiva por 5 anos", "Não exclusiva por tempo indeterminado", "Cedência total dos direitos"], correta: 1 },
      ],
      laboratorio: [
        { pergunta: "Qual é a resolução da balança analítica?", opcoes: ["0,1 mg", "1 mg", "0,01 g"], correta: 0 },
        { pergunta: "Qual é a resistividade da água tipo I?", opcoes: ["18,2 MΩ·cm", "12,8 MΩ·cm", "25 MΩ·cm"], correta: 0 },
        { pergunta: "Em que intervalo de temperatura se afere o volume?", opcoes: ["18 °C a 22 °C", "20 °C a 25 °C", "15 °C a 20 °C"], correta: 0 },
        { pergunta: "Qual é a validade de um padrão de calibração? (ver tabela)", opcoes: ["7 dias", "30 dias", "90 dias"], correta: 0 },
        { pergunta: "Qual é o formato do código de lote?", opcoes: ["AAAA-MM-NNN", "NNN-MM-AAAA", "AAAA/NNN"], correta: 0 },
        { pergunta: "Em quanto tempo se regista a preparação no livro de soluções?", opcoes: ["Imediatamente", "24 horas", "72 horas"], correta: 1 },
        { pergunta: "O que acontece a frascos sem etiqueta?", opcoes: ["São devolvidos ao preparador", "São eliminados como resíduo não identificado", "São rotulados pelo técnico"], correta: 1 },
        { pergunta: "Com que frequência é revisto o procedimento?", opcoes: ["Anualmente", "De dois em dois anos", "Só após incidentes"], correta: 0 },
      ],
    },
  },
};

function realcar(texto: string, termo: string): ReactNode {
  if (!termo || termo.length < 2) return texto;
  const partes = texto.split(new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return partes.map((p, i) => (p.toLowerCase() === termo.toLowerCase() ? <mark key={i}>{p}</mark> : p));
}

function Encontra({ config, contexto, extensaoTempo, aoTerminar }: PropsAtividade<ConfigEncontra>) {
  const texto = config.texto[contexto];
  const perguntas = config.perguntas[contexto];
  const [respostas, setRespostas] = useState<(number | null)[]>(() => perguntas.map(() => null));
  const [procura, setProcura] = useState("");
  const usouProcurar = useRef(false);
  const [terminou, setTerminou] = useState(false);
  const caixaProcura = useRef<HTMLInputElement>(null);
  const { decorridoExato } = useTemporizador(!terminou, null);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        usouProcurar.current = true;
        caixaProcura.current?.focus();
        caixaProcura.current?.select();
      }
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  function terminar() {
    if (terminou) return;
    setTerminou(true);
    const certas = respostas.filter((r, i) => r === perguntas[i].correta).length;
    const ms = decorridoExato();
    const fatorTempo = Math.min(1, (config.tempoReferenciaSeg * 1000 * extensaoTempo) / Math.max(1, ms));
    aoTerminar({
      pontuacao: limitar(100 * (0.8 * (certas / perguntas.length) + 0.2 * fatorTempo)),
      duracaoMs: ms,
      metricas: { certas, perguntas: perguntas.length, usouProcurar: usouProcurar.current, segundos: Math.round(ms / 1000) },
    });
  }

  const ocorrencias = useMemo(() => {
    if (procura.length < 2) return 0;
    const re = new RegExp(procura.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    let n = 0;
    for (const s of texto.secoes) {
      n += (s.titulo.match(re) ?? []).length;
      for (const p of s.paragrafos) n += (p.match(re) ?? []).length;
    }
    return n;
  }, [procura, texto]);

  return (
    <div className="grid gap-4">
      <Instrucao>
        Responde às perguntas com base no texto. Podes usar títulos, o índice e a procura (<kbd>{TECLA_CTRL}</kbd>+<kbd>F</kbd> ou a caixa). O tempo conta um pouco.
      </Instrucao>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="cartao grid" aria-label="Texto" style={{ maxHeight: "60vh", overflow: "hidden", gridTemplateRows: "auto minmax(0,1fr)" }}>
          <div className="p-3 border-b flex gap-2 items-center flex-wrap" style={{ borderColor: "var(--linha)" }}>
            <label htmlFor="procura" className="text-sm font-bold">
              Procurar no texto
            </label>
            <input
              id="procura"
              ref={caixaProcura}
              type="search"
              value={procura}
              onChange={(e) => {
                setProcura(e.target.value);
                if (e.target.value.length >= 2) usouProcurar.current = true;
              }}
              className="px-2 py-1 rounded border flex-1 min-w-32"
              style={{ borderColor: "var(--tecla-borda)", background: "var(--superficie)", color: "var(--tinta)", minHeight: 40 }}
              placeholder="palavra"
            />
            <span className="text-sm tabular-nums" style={{ color: "var(--suave)" }} aria-live="polite">
              {procura.length >= 2 ? `${ocorrencias} ocorrência${ocorrencias === 1 ? "" : "s"}` : ""}
            </span>
          </div>
          <div className="p-4 overflow-auto" tabIndex={0} style={{ fontSize: "1rem" }}>
            <h3 className="text-xl mb-2">{realcar(texto.titulo, procura)}</h3>
            {texto.indice && (
              <nav aria-label="Índice" className="mb-4 text-sm">
                <ol className="pl-5">
                  {texto.secoes.map((s, i) => (
                    <li key={i}>
                      <a href={`#sec-${i}`}>{s.titulo}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {texto.secoes.map((s, i) => (
              <section key={i} id={`sec-${i}`} className="mb-4">
                <h4 className="text-base font-bold normal-case tracking-normal" style={{ color: "var(--tinta)" }}>
                  {realcar(s.titulo, procura)}
                </h4>
                {s.paragrafos.map((p, j) => (
                  <p key={j} className="my-2">
                    {realcar(p, procura)}
                  </p>
                ))}
                {s.tabela && (
                  <table className="tabela my-2">
                    <thead>
                      <tr>
                        {s.tabela.cabecalho.map((c) => (
                          <th key={c} scope="col">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.tabela.linhas.map((l, k) => (
                        <tr key={k}>
                          {l.map((c, m) => (
                            <td key={m}>{realcar(c, procura)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            ))}
            <p className="text-xs mt-6" style={{ color: "var(--suave)" }}>
              Fim do texto.
            </p>
          </div>
        </section>
        <section className="grid gap-3 content-start" aria-label="Perguntas">
          {perguntas.map((q, i) => (
            <fieldset key={i} className="cartao p-3 grid gap-1 border-0" style={{ borderColor: terminou ? (respostas[i] === q.correta ? "var(--certo)" : "var(--errado)") : undefined, borderWidth: terminou ? 2 : 1, borderStyle: "solid" }}>
              <legend className="font-bold px-1">
                {i + 1}. {q.pergunta}
              </legend>
              {q.opcoes.map((o, j) => (
                <BotaoRadio key={j} id={`q${i}-${j}`} name={`q${i}`} rotulo={o} checked={respostas[i] === j} disabled={terminou} onChange={() => setRespostas((r) => r.map((x, k) => (k === i ? j : x)))} />
              ))}
            </fieldset>
          ))}
          <div>
            <Botao onClick={terminar} disabled={terminou || respostas.some((r) => r === null)}>
              Terminar
            </Botao>
            {respostas.some((r) => r === null) && !terminou && (
              <span className="text-sm ml-3" style={{ color: "var(--suave)" }}>
                Responde a todas as perguntas.
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigEncontra>({
  slug: "encontra",
  numero: 9,
  dominio: "leitura",
  titulo: { jornal: "Encontra no Texto", laboratorio: "Encontra no Manual" },
  descricao: "Procurar factos num texto longo com scroll: títulos, índice, tabela, procura. Mede estratégia, não interpretação.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({
    tempoReferenciaSeg: 30,
    texto: {
      jornal: { titulo: "Aviso", secoes: [{ titulo: "Reunião", paragrafos: ["A reunião da redação é às 14h00 na sala 12."] }] },
      laboratorio: { titulo: "Aviso", secoes: [{ titulo: "Sessão", paragrafos: ["A sessão do laboratório é às 14h00 na sala 12."] }] },
    },
    perguntas: {
      jornal: [{ pergunta: "Em que sala é a reunião?", opcoes: ["Sala 12", "Sala 14", "Sala 2"], correta: 0 }],
      laboratorio: [{ pergunta: "Em que sala é a sessão?", opcoes: ["Sala 12", "Sala 14", "Sala 2"], correta: 0 }],
    },
  }),
  Componente: Encontra,
  dica: (m) => {
    if (!m.usouProcurar) return `Experimenta ${TECLA_CTRL}+F para procurar palavras num texto longo: escreve uma palavra da pergunta e salta diretamente para a resposta.`;
    if (Number(m.certas) < Number(m.perguntas)) return "Lê primeiro os títulos das secções: dizem-te onde cada resposta deve estar antes de começares a procurar.";
    return "Boa estratégia. Para ganhar tempo, usa o índice para saltar à secção certa e confirma na tabela quando a pergunta fala de valores.";
  },
});
