// ─── Textos das páginas (editáveis no backoffice) ────────────────────────────
// [conteúdo Kendir] Marcação permitida nos textos: **negrito**, [texto](/rota), ^1^ (índice superior).
// Os campos "para" e "icone" não são editáveis (rotas e nomes de ícones de src/componentes/Icone.tsx).

export const PAGINAS = {
  geral: {
    nomeApp: "Ensaio às Competências Digitais",
    faixaMosaico: "Aspeto Mosaico · Ágora Design System (ARTE)",
    saltar: "Saltar para o conteúdo",
    rodape: "Ferramenta gratuita desenvolvida por {autoria} para uso pelo Estado Português",
    ligacoesRodape: { resultados: "Os meus resultados", cartao: "O meu cartão", seguranca: "Segurança digital", tutorial: "Tutorial", privacidade: "Privacidade", acessibilidade: "Acessibilidade", admin: "Administração", licenca: "Licença" },
    menu: { inicio: "Início", sobre: "Sobre", definicoes: "Definições" },
  },
  inicio: {
    etiqueta: "Gratuito · PT-PT · sem conta",
    titulo: "Antes da prova, treina no ecrã.",
    destaque: "Prepara as tuas competências digitais para as provas e avaliações. Pratica a escrita no teclado, a leitura no ecrã e a gestão do tempo. ",
    subtitulo: "O Ensaio às Competências Digitais (ECD) permite-te praticar tudo isto. É gratuito e não requer conta nem dados pessoais.",
    blocos: [
      { para: "/treinar", icone: "jogar", titulo: "Treinar", texto: "Prepara-te para provas e exames, experimenta desafios de competências digitais, joga ou entra com o código do teu professor." },
      { para: "/professor", icone: "lapis", titulo: "Professor", texto: "Crie uma prova para as suas turmas e avalie as competências digitais dos seus alunos." },
      { para: "/tutorial", icone: "ajuda", titulo: "Tutorial", texto: "Descobre como funciona o Ensaio às Competências Digitais e como começar a treinar. \nTempo de leitura: 2 minutos." },
      { para: "/observatorio", icone: "grafico", titulo: "Observatório", texto: "Consulta estatísticas anónimas e descobre quais são as competências digitais que mais precisam de treino." },
    ],
    porque: {
      titulo: "Porquê",
      paragrafos: [
        "Desde 2025, as provas ModA do 4.º e 6.º anos e as provas finais do 9.º ano são feitas em suporte digital. O IAVE criou provas-ensaio para que todos os alunos cheguem à prova em situação de equidade.^1^",
        "Estudos em vários países mostram que o mesmo teste pode dar resultados mais baixos no computador do que em papel. A diferença tende a ser maior para alunos com menos acesso a tecnologia.^2, 3^",
        "Usar o telemóvel todos os dias não ensina a usar um formulário ou um teclado completo. No estudo ICILS 2023, cerca de um terço dos alunos portugueses do 8.º ano ficou abaixo do nível 2 de literacia digital.^4^",
      ],
    },
    comoFunciona: {
      titulo: "Como funciona",
      paragrafos: [
        "Há duas formas de usar a plataforma:",
        "Se és aluno: escolhe o que queres praticar ou usa o código dado pelo professor para acederes a uma ficha.",
        "Se é professor: crie uma ficha, partilhe o código de acesso com a turma e consulte os resultados.",
      ],
    },
    dados: {
      titulo: "Privacidade e dados",
      paragrafos: [
        "Não precisas de criar uma conta. Os teus resultados ficam guardados no teu navegador.\nPara criar estatísticas gerais sobre as competências digitais, são enviados dados anónimos, sem nome nem endereço IP.  \n\nPodes desativar esta opção nas 'Definições'.",
        "Não são utilizados identificadores do dispositivo nem ferramentas de análise de terceiros.",
      ],
    },
    nivelMedio: {
      titulo: "Nível médio de competências digitais",
      media: "Média de todos os utilizadores: **{media}** pontos, nível **{faixa}** ({n} atividades concluídas). Mais números no [Observatório](/observatorio).",
      nota: "As pontuações descrevem o desempenho dos utilizadores nas diferentes atividades do ECD. Não são uma certificação DigComp. Os limiares são estimativas iniciais e poderão ser recalibrados.",
    },
    fontes: "1. IAVE, Preparar o Digit@l, 2025. 2. Backes e Cowan, Harvard EdLabs, 2019. 3. Kröhne e Martens, 2011; Lindner et al., 2024. 4. IAVE, Relatório Nacional ICILS 2023. Ligações completas em [Sobre](/sobre).",
  },
  treinar: {
    titulo: "Treinar",
    introducao: "Escolhe como queres treinar as tuas competências digitais. Se o teu professor te entregou um código, escolhe a opção correspondente.",
    opcoes: [
      { para: "/teste", icone: "lista", titulo: "Provas e exames", texto: "Treina as competências digitais para te familiarizares com as provas ModA, as provas finais do 9.º ano e os exames nacionais. Descobre o teu perfil de competências e identifica onde podes melhorar." },
      { para: "/treino", icone: "alvo", titulo: "Desafios", texto: "Escolhe um desafio e o nível de dificuldade. Repete as vezes que quiseres e tenta superar o teu recorde." },
      { para: "/codigo", icone: "cardinal", titulo: "Código", texto: "O teu professor deu-te um código? Introduz aqui para fazer a prova." },
      { para: "/jogos", icone: "dados", titulo: "Jogos", texto: "Joga com literatura portuguesa, participa num escape room, resolve um mistério, pratica com uma folha de cálculo, escreve uma mensagem eletrónica e programa um robô. Os jogos também te podem ajudar a desenvolver as tuas competências." },
      { para: "/seguranca", icone: "escudo", titulo: "Segurança digital", texto: "Avalia se conheces boas práticas, identifica e reconhece as fraudes mais comuns e descobre o que sabes sobre segurança e redes sociais." },
    ],
    rodape: "Primeira vez? Vê o [tutorial](/tutorial). Os teus carimbos estão no [cartão](/cartao).",
  },
  tutorial: {
    progresso: "Tutorial · passo {i} de {n}",
    saltar: "Saltar o tutorial",
    anterior: "Anterior",
    seguinte: "Seguinte",
    fim: "Voltar ao início",
    teclas: "Podes usar as setas ← → do teclado para mudar de passo.",
    aviso: { titulo: "Como funciona o ECD?", ver: "Ver o tutorial", agoraNao: "Agora não" },
    boasVindas: {
      titulo: "Bem-vindo ao Ensaio às Competências Digitais",
      paragrafos: [
        "Cada vez mais provas e avaliações são feitas no computador. Aqui podes praticar as competências digitais de que precisas para as realizar com confiança.\nTambém encontras jogos e desafios sobre segurança online.\nÉ gratuito e não precisas de criar uma conta. Este tutorial demora cerca de 2 minutos e podes saltá-lo quando quiseres.",
        "Vamos começar?",
      ],
    },
    maneiras: {
      titulo: "Formas de treinar",
      provas: { titulo: "Provas e exames", texto: "Descobre o teu perfil de competências, os teus pontos fortes e o que precisas de praticar." },
      atividade: { titulo: "Desafio", texto: "Escolhe um desafio, avança pelos níveis e tenta superar o teu melhor resultado." },
      codigo: { titulo: "Código", texto: "Recebeste um código do teu professor? Introduz o código para acederes à prova." },
      jogos: { titulo: "Jogos", texto: "Põe as tuas competências à prova em jogos e em situações do dia a dia." },
      seguranca: { titulo: "Segurança digital", texto: "Testa os teus conhecimentos em três temas: boas práticas online, exemplos de fraude e redes sociais. " },
    },
    cenario: { titulo: "Escolhe o cenário", texto: "Escolhe o cenário antes de começares. As personagens e os textos mudam, mas as regras e a pontuação mantêm-se.", personagens: "Personagens" },
    atividade: {
      titulo: "O que vais encontrar",
      etapas: [
        { titulo: "1. Instrução", texto: "Uma personagem explica o que tens de fazer. Podes ouvir as instruções em voz alta." },
        { titulo: "2. Prática", texto: "Experimenta uma tarefa curta, sem pontuação, para perceberes como funciona." },
        { titulo: "3. Avaliação", texto: "Aqui, as tuas respostas contam para o resultado. Em alguns casos, tens um tempo definido para responder." },
        { titulo: "4. Resultado", texto: "Vê a tua pontuação, recebe uma dica e consulta o teu desempenho em cada tarefa." },
      ],
    },
    pontuacao: { titulo: "Como funciona a pontuação", texto: "Cada desafio recebe uma pontuação de 0 a 100. Se tiveres menos de 50, podes tentar novamente. Entre 50 e 74, ganhas uma estrela; entre 75 e 90, duas; e entre 91 e 100, três. A tua melhor pontuação em cada nível fica guardada neste navegador." },
    medida: {
      titulo: "Ajusta à tua medida",
      paragrafos: [
        "Nas 'Definições', podes escolher o modo de visualização, o tema, o tamanho do texto, o contraste e o tempo para responder.",
        "Podes usar todas as funcionalidades com o teclado. Para arrastar, também podes selecionar o item e depois o destino.",
      ],
    },
    professores: {
      titulo: "Para professores",
      montar: { titulo: "1. Crie uma ficha ", texto: "Escolha o nível, as atividades, incluindo jogos e testes de segurança, e se os alunos se identificam pelo número da turma, por uma alcunha ou não se identificam." },
      partilhar: { titulo: "2. Partilhe a ficha", texto: "Receba um código e um QR para os alunos acederem à ficha." },
      acompanhar: { titulo: "3. Acompanhe os resultados", texto: "Consulte os resultados numa página privada, receba-os por mensagem eletrónica, se quiser, ou exporte-os em CSV." },
    },
    dados: {
      titulo: "Os teus dados",
      paragrafos: [
        "Não há contas. Os teus resultados ficam guardados no teu navegador. São enviados dados anónimos, sem nome nem endereço IP, para criar estatísticas sobre as competências digitais que precisam de mais treino. Podes desativar esta opção nas 'Definições'.",
        "No 'Observatório', podes consultar estatísticas gerais sobre as competências digitais. Para proteger a privacidade, só são apresentados resultados de grupos com vinte ou mais tentativas.",
      ],
    },
  },
  acessibilidade: {
    titulo: "Guia de acessibilidade",
    caminho: "Acessibilidade",
    introducao: "Para quem desenvolve, para escolas e para quem encomenda provas digitais. O enquadramento legal: o European Accessibility Act aplica-se desde 28 de junho de 2025; a EN 301 549 v4.1.1 (setembro de 2026) adota a WCAG 2.2 AA; os organismos públicos em Portugal seguem o Decreto-Lei 83/2018 e publicam uma declaração de acessibilidade. Este jogo compromete-se a cumprir todos os pontos abaixo.",
    colunas: [
      {
        titulo: "Para quem desenvolve",
        grupos: [
          { titulo: "Operação", itens: ["Tudo funciona só com teclado, por ordem lógica, com foco visível (WCAG 2.1.1, 2.4.7).", "O foco nunca fica escondido por cabeçalhos ou rodapés fixos (2.4.11).", "Todo o arrasto tem alternativa por clique ou toque (2.5.7).", "Alvos com pelo menos 24 por 24 px; de preferência 44 para crianças (2.5.8).", "Nunca exigir atalhos que o navegador ou o sistema reservam."] },
          { titulo: "Tempo", itens: ["Os temporizadores podem ser alargados por aluno, como acomodação (2.2.1).", "Os avisos de tempo são anunciados a leitores de ecrã, não só por cor.", "Expirar a sessão nunca perde respostas: guardar cada resposta e mostrar “Guardado”."] },
          { titulo: "Conteúdo", itens: ["Contraste de texto 4,5:1, de componentes 3:1. Nunca só a cor.", "Funciona a 200 % de zoom e a 320 px de largura sem scroll horizontal (1.4.4, 1.4.10).", "Rótulos e instruções visíveis e ligados aos campos. Os erros dizem o que está mal e como corrigir (3.3.1, 3.3.3).", "Não pedir a mesma informação duas vezes (3.3.7).", "Início de sessão, quando existe, sem testes de memória ou puzzles; permitir colar e gestores de palavras-passe (3.3.8).", "Ajuda no mesmo sítio em todos os ecrãs (3.2.6).", "Legendas e transcrições para áudio e vídeo; controlo de repetição nos itens com áudio.", "Respeitar o movimento reduzido e as definições de tipo de letra e espaçamento do utilizador (1.4.12).", "Linguagem simples. Testar as instruções com alunos da idade alvo."] },
        ],
      },
      {
        titulo: "Para escolas e entidades avaliadoras",
        grupos: [
          { titulo: "Antes da prova", itens: ["Dar aos alunos a interface real para praticar meses antes, não dias.", "Ensinar a interface, não só a matéria: navegação, listas de revisão, ferramentas, submissão.", "Testar nos dispositivos, teclados e rede reais da escola, com a turma toda ligada.", "Dar tempo às equipas de informática para instalar aplicações.", "Recolher cedo as necessidades de acomodação (mais tempo, leitor de ecrã, letra grande) e confirmar que funcionam na plataforma."] },
          { titulo: "Durante a prova", itens: ["Ter alternativa em papel ou offline pronta.", "Registar incidentes técnicos por aluno, para ler os resultados em contexto.", "Repor o tempo perdido por falha técnica."] },
          { titulo: "Ao comprar ou encomendar", itens: ["Exigir conformidade com a EN 301 549 (WCAG 2.2 AA) no caderno de encargos e pedir relatório de auditoria, não só autodeclaração.", "Exigir compatibilidade com as tecnologias de apoio usadas nas escolas.", "Comparar resultados digitais e em papel (efeito de modo) e publicar a análise.", "Publicar uma declaração de acessibilidade e um contacto para problemas."] },
        ],
      },
    ],
    declaracao: {
      titulo: "Declaração de acessibilidade deste sítio",
      texto: "Estado: em desenvolvimento, versão {versao}. Objetivo: WCAG 2.2 nível AA. A auditoria automática (axe-core, regras WCAG 2.2 A e AA) não encontrou problemas nas páginas e atividades, nos dois aspetos e nos dois temas; falta a revisão manual com leitor de ecrã. Problemas de acessibilidade: contactar a Kendir Studios. O aspeto Mosaico usa componentes do Ágora Design System da AMA; o aspeto Original usa componentes próprios com os mesmos requisitos. Ambos têm tema claro e escuro e uma opção de contraste reforçado (AAA).",
    },
  },
  sobre: {
    titulo: "Sobre",
    versao: "Ensaio às Competências Digitais (ECD), versão {versao} de {data}. Um projeto Eduardo Nunes & Kendir Studios (Worlds4Education - Jogos e Ambientes Educativos, Lda. | NIPC 516583824).",
    paragrafos: [
      "Plataforma web de código aberto, em português de Portugal, onde alunos treinam e medem as competências digitais práticas que as provas em computador pressupõem: escrever no teclado, ler ecrãs, preencher formulários, navegar, gerir o tempo, escrever matemática. Prepara para as provas ModA, as provas finais e os exames nacionais. Inclui também jogos e testes de segurança online.",
      "Sem contas, sem registos de pessoas e sem base de dados: a aplicação é um conjunto de ficheiros estáticos que qualquer escola ou entidade pode alojar. As estatísticas de uso são anónimas e vão para uma folha de cálculo controlada por quem publica a aplicação.",
    ],
    codigo: "Código-fonte:",
    estado: {
      titulo: "Estado",
      itens: [
        "Versão atual: motor de atividades, as 12 atividades jogáveis a 5 níveis (incluindo A Maqueta, de manipulação 3D), com tarefas, textos e alvos sorteados em cada tentativa, preparação para as provas ModA, provas finais, exames nacionais e ensino superior, treino, carimbos e cartão de imprensa, dois contextos narrativos (redação e laboratório), duas interfaces de utilização possíveis (Original e Mosaico) com tema claro e escuro, resultados locais, telemetria anónima com Observatório e ecrã de administração.",
        "Jogos (Biblioteca Viva, A Sala Trancada, Quem Apagou o Ficheiro?, Orçamento da Visita de Estudo, Correio da Redação, O Robô da Bancada) e Segurança digital (boas práticas online, exemplos de fraude, redes sociais, privacidade e navegação, computadores e Wi-Fi públicos, família e controlo parental), com cinco níveis e relatório. O professor pode incluí-los nas provas.",
        "Ferramentas de suporte: tutorial, sessões de professor com código, QR, resultados por email e página privada de resultados; auditoria automática de acessibilidade (WCAG 2.2 AA); protocolo de piloto e script de recalibração dos limiares.",
        "Backlog: piloto em escolas, recalibração dos limiares com os dados do piloto, revisão manual de acessibilidade com leitor de ecrã.",
      ],
    },
    faq: {
      titulo: "Perguntas frequentes",
      itens: [
        {
          pergunta: "Como são os meus dados guardados?",
          paragrafos: [
            "Não há contas. Os teus resultados ficam guardados só neste navegador, neste dispositivo. Não vão para nenhuma base de dados.",
            "Cada atividade concluída envia também um registo anónimo para estatísticas: a atividade, o nível, a pontuação, a duração e o tipo de dispositivo. Nunca envia o nome, o email nem o endereço IP. Tudo explicado na página [Privacidade](/privacidade).",
          ],
        },
        {
          pergunta: "Posso ver as minhas conquistas noutro computador?",
          paragrafos: [
            "Não. Como não há contas, os resultados, as estrelas e os carimbos ficam só no navegador onde fizeste as atividades. Noutro computador, ou noutro navegador do mesmo computador, começas do zero.",
            "Em [Os meus resultados](/resultados) podes exportar as tuas tentativas para um ficheiro CSV e guardá-lo, mas esse ficheiro não pode ser importado noutro computador.",
          ],
        },
        {
          pergunta: "Se fizer estas atividades, terei mais sucesso nas provas?",
          paragrafos: [
            "Não te podemos prometer melhores notas. O ECD não reproduz as provas oficiais nem ensina a matéria das disciplinas.",
            "O que faz é treinar as competências digitais que as provas em computador pressupõem: escrever no teclado, ler ecrãs, usar menus e formulários, gerir o tempo e escrever matemática. Os estudos sobre provas em computador mostram que a falta destas competências pode baixar os resultados, independentemente do que o aluno sabe (ver as fontes no fim desta página).",
            "O efeito do ECD nos resultados das provas ainda não foi medido. Isso será feito no piloto em escolas.",
          ],
        },
        {
          pergunta: "Quem pode fazer estas atividades?",
          paragrafos: [
            "Qualquer pessoa. O ECD foi pensado para alunos do 1.º ciclo ao ensino superior, com cinco níveis por atividade.",
            "Os professores podem montar uma prova para a turma em [Professor](/professor). Pais, encarregados de educação e adultos que queiram treinar também são bem-vindos.",
          ],
        },
        {
          pergunta: "Fazer estas atividades tem algum custo?",
          paragrafos: [
            "Não. É gratuito, não tem publicidade nem compras e não pede conta nem dados de pagamento.",
            "Escolas e entidades também podem usar, copiar e alojar a aplicação sem custos (ver [Licença](/licenca)).",
          ],
        },
        {
          pergunta: "O professor vê o meu nome?",
          paragrafos: [
            "Só se tu o escreveres. Nas provas com código, o professor escolhe como te identificas: número de turma, alcunha ou nada. Nunca é pedido o nome completo e recomendamos o número de turma.",
            "Para cada identificador, o professor vê a atividade, o nível, a pontuação e a duração. O nome que escreves em Definições aparece só no teu ecrã e nunca é enviado.",
          ],
        },
        {
          pergunta: "Posso apagar os meus resultados?",
          paragrafos: [
            "Sim. Em [Os meus resultados](/resultados), o botão “Apagar tudo” apaga as tentativas e os testes guardados neste navegador. Não é possível recuperá-los.",
            "Também podes limpar os dados do navegador. É uma boa prática, sobretudo em computadores partilhados:",
          ],
          lista: [
            "Abre as definições do navegador e procura Privacidade.",
            "Escolhe Limpar dados de navegação. O atalho Ctrl+Shift+Delete (no Mac, Cmd+Shift+Delete) abre o mesmo menu.",
            "Escolhe o período, por exemplo “Desde sempre”, e marca o histórico, os cookies e dados de sítios e os ficheiros em cache.",
            "Confirma. Isto apaga os resultados e as preferências do ECD e termina as sessões abertas noutros sítios.",
          ],
          nota: "Os registos anónimos já enviados não identificam ninguém, por isso não há forma de os associar a ti para os apagar. Mais conselhos em [Privacidade e navegação](/seguranca/privacidade).",
        },
        {
          pergunta: "Posso desligar o envio de estatísticas?",
          paragrafos: [
            "Sim. Em [Definições](/definicoes), em Estatísticas anónimas, desliga o interruptor. A partir daí nada é enviado. O treino, os resultados e as estrelas funcionam da mesma forma.",
            "Atenção: nas provas com código, os resultados chegam ao professor por esse mesmo envio. Com o envio desligado, o professor não recebe os teus resultados. A aplicação avisa-te antes de começares a prova.",
          ],
        },
        {
          pergunta: "Preciso de instalar alguma coisa? Funciona no telemóvel ou no tablet?",
          paragrafos: [
            "Não é preciso instalar nada. Basta um navegador atualizado e ligação à internet.",
            "Funciona no computador, no tablet e no telemóvel. Como as provas digitais se fazem no computador, recomendamos treinar num computador com teclado físico, sobretudo nas atividades de escrita e de atalhos.",
          ],
        },
        {
          pergunta: "Tenho uma dificuldade de visão, de motricidade, de leitura ou de atenção. Posso usar?",
          paragrafos: ["Sim. O ECD foi construído para cumprir as regras de acessibilidade WCAG 2.2, nível AA:"],
          lista: [
            "Em [Definições](/definicoes): tema claro ou escuro, texto grande, contraste reforçado e tempo alargado (×1,25, ×1,5 ou ×2), como nas acomodações das provas.",
            "Leitura facilitada: uma letra fácil de distinguir e mais espaço entre letras, palavras e linhas.",
            "Botões e opções grandes, mais altos e mais afastados, para quem tem dificuldades de motricidade.",
            "Modo calmo: esconde os relógios e as barras de tempo e desliga as animações. O tempo continua a contar e há um aviso tranquilo quando falta pouco.",
            "Tudo funciona só com o teclado, com o foco sempre visível.",
            "Tudo o que se arrasta também se faz com toques ou com o teclado.",
            "As instruções de cada atividade podem ser lidas em voz alta. Com a opção Ler em voz alta, também as tarefas, as perguntas, o feedback e o resultado.",
            "Todos os campos têm rótulos e os avisos são anunciados aos leitores de ecrã.",
            "Funciona com o zoom do navegador e respeita a opção do sistema de reduzir o movimento.",
          ],
          nota: "A revisão com leitores de ecrã por pessoas que os usam no dia a dia ainda está por fazer. Se algo não funcionar contigo, diz-nos. Mais informação em [Acessibilidade](/acessibilidade).",
        },
        {
          pergunta: "O que significam as estrelas e os níveis?",
          paragrafos: [
            "Cada atividade tem cinco níveis: 1 Iniciação, 2 Base, 3 Intermédio, 4 Avançado e 5 Perito. Podes começar em qualquer um.",
            "Cada tentativa dá de 0 a 100 pontos. Abaixo de 50, convém tentar de novo. De 50 a 74 ganhas uma estrela, de 75 a 90 duas e de 91 a 100 três. Fica guardada a melhor tentativa de cada nível.",
            "Com 85 pontos ou mais numa competência ganhas o carimbo dessa competência no [teu cartão](/cartao).",
          ],
        },
        {
          pergunta: "Este jogo é oficial? É do IAVE?",
          paragrafos: [
            "Não. O ECD é um projeto independente e gratuito da Kendir Studios. Não é um produto do IAVE nem do Ministério da Educação e não reproduz as provas oficiais.",
            "Baseia-se em informação pública sobre as provas digitais (ver as fontes no fim desta página) e treina as competências de que precisas para as fazer.",
          ],
        },
        {
          pergunta: "A minha escola pode alojar a aplicação ou adaptá-la?",
          paragrafos: [
            "Sim. O código está sob a Licença MIT e os conteúdos sob a licença CC BY 4.0. Qualquer escola ou entidade pode usar, copiar, adaptar e publicar a aplicação, gratuitamente, desde que mantenha a atribuição (ver [Licença](/licenca)).",
            "A aplicação é um conjunto de ficheiros estáticos: aloja-se em qualquer servidor web, sem base de dados. As instruções estão no ficheiro README que acompanha o código.",
          ],
        },
      ],
    },
    rodape: "Primeira vez? Vê o [tutorial](/tutorial). Estatísticas de uso no [Observatório](/observatorio).",
    fontes: {
      titulo: "Fontes",
      lista: [
        { texto: "IAVE, Preparar o Digit@l: Provas-Ensaio 2025", url: "https://iave.pt/wp-content/uploads/2025/01/Provas-ensaio_Comunicacao-as-escolas_IAVE.pdf" },
        { texto: "Harvard GSE, Testing Mode Matters (Backes e Cowan)", url: "https://www.gse.harvard.edu/ideas/usable-knowledge/19/01/testing-mode-matters" },
        { texto: "Comparing Test-Taking Effort Between Paper-Based and Computer-Based Tests (PMC)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10846472/" },
        { texto: "Kröhne e Martens, Computer-based competence tests in the NEPS", url: "https://www.researchgate.net/publication/225123434" },
        { texto: "Kappan, Assessing our assessments: Paper vs. computer", url: "https://kappanonline.org/assessing-our-assessments-paper-vs-computer/" },
        { texto: "IAVE, ICILS 2023 Relatório Nacional", url: "https://iave.pt/wp-content/uploads/2024/11/Relatorio-Final-ICILS.pdf" },
        { texto: "Iniciativa Educação, Literacia digital em tempos de pandemia", url: "https://www.iniciativaeducacao.org/pt/ed-on/artigos/estatisticas/literacia-digital-em-tempos-de-pandemia-o-impacto-do-ensino-remoto-nas-competencias-digitais" },
        { texto: "Comissão Europeia, ICILS in Europe 2023", url: "https://op.europa.eu/en/publication-detail/-/publication/59721dc6-a0aa-11ef-85f0-01aa75ed71a1/" },
        { texto: "Público, Maioria dos alunos não terminou prova de aferição no tempo estipulado", url: "https://www.publico.pt/2023/05/29/sociedade/noticia/maioria-alunos-nao-terminou-prova-afericao-tempo-estipulado-problemas-tecnicos-2051484" },
        { texto: "JRC, DigComp 2.2", url: "https://publications.jrc.ec.europa.eu/repository/handle/JRC128415" },
        { texto: "AccessibleEU, EN 301 549 has been updated", url: "https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en" },
        { texto: "Ágora Design System (AMA) · Mosaico", url: "https://mosaico.gov.pt/ferramentas/agora-design-system" },
      ],
    },
  },
  videos: {
    titulos: {
      promocional: "O Ensaio às Competências Digitais em um minuto",
      institucional: "Apresentação do Ensaio às Competências Digitais",
      aluno: "Tutorial para alunos",
      professor: "Tutorial para professores",
    },
    publico: {
      promocional: "Vídeo promocional",
      institucional: "Para escolas, famílias e decisores",
      aluno: "Como treinar, passo a passo",
      professor: "Como montar uma prova para a turma",
    },
    reproduzir: "Reproduzir o vídeo: {titulo}",
    aviso: "Ao carregar em reproduzir, o vídeo é carregado do YouTube (youtube-nocookie.com).",
    verNoYoutube: "Ver no YouTube",
    tituloSobre: "Vídeos",
  },
  privacidade: {
    titulo: "Privacidade",
    introducao: "Escrito em linguagem simples. Se algo não ficar claro, pergunta.",
    seccoes: [
      { titulo: "Não há contas", paragrafos: ["Ninguém se regista. Não pedimos nome, email nem idade. Os teus resultados ficam só no teu navegador, para veres a tua evolução; podes exportá-los ou apagá-los em “Os meus resultados”. O nome que escreveres nas Definições serve só para aparecer no teu ecrã de resultado e nunca sai do teu computador."] },
      { titulo: "Estatísticas anónimas", paragrafos: ["Para sabermos que competências faltam e a quantas pessoas, cada atividade concluída envia um pequeno registo anónimo: um identificador aleatório criado no teu navegador (não ligado a ti), a atividade, o nível, a pontuação, a duração, algumas medidas da atividade (por exemplo palavras por minuto), o tipo de dispositivo (computador, tablet, telemóvel), o contexto e o aspeto escolhidos, e se usaste tempo alargado. Não enviamos o endereço IP, nem impressão digital do dispositivo, nem usamos analítica ou publicidade de terceiros. Por isso não há aviso de cookies: só há armazenamento estritamente necessário.", "Os registos vão para uma folha de cálculo controlada pela entidade que publica a aplicação, na União Europeia, e servem só para estatísticas agregadas. No Observatório, qualquer grupo com menos de 20 tentativas fica oculto. Podes desligar o envio em Definições → Estatísticas anónimas; a aplicação funciona igual, mas os professores deixam de receber os resultados das provas feitas com código."] },
      { titulo: "Sessões de professor", paragrafos: ["Quando um professor cria uma sessão, guardamos o código, a configuração da prova e, se o professor o indicar, o seu email, para lhe enviar os resultados. O email só é usado depois de confirmado por ligação e é apagado 12 meses após a última tentativa. Nas tentativas feitas com o código vai também o identificador que o professor pediu (número de turma ou alcunha); recomendamos o número de turma em vez do nome."] },
      { titulo: "Vídeos", paragrafos: ["Os vídeos de apresentação e os tutoriais estão alojados no YouTube. A página não contacta o YouTube enquanto não carregares em reproduzir. Depois disso, o vídeo vem de youtube-nocookie.com, o modo de privacidade reforçada do YouTube, e aplicam-se as regras de privacidade da Google."] },
      { titulo: "Base legal e contacto", paragrafos: ["Os dados anónimos não identificam ninguém e são tratados com base no interesse legítimo de melhorar a preparação dos alunos para provas digitais. Dúvidas ou pedidos: Kendir Studios."] },
    ],
  },
  licenca: {
    titulo: "Licença",
    introducao: "O Ensaio às Competências Digitais é uma ferramenta gratuita desenvolvida por {autoria} para uso pelo Estado Português. Qualquer pessoa, escola ou entidade pode usá-la, copiá-la, adaptá-la e publicá-la de forma gratuita, desde que mantenha a atribuição:",
    atribuicao: "“Ensaio às Competências Digitais, desenvolvido por {autoria}.”",
    seccoes: [
      { titulo: "Código-fonte: Licença MIT", paragrafos: ["Permite usar, alterar e redistribuir o código para qualquer fim, mantendo o aviso de direitos de autor da Kendir Studios em todas as cópias."] },
      { titulo: "Conteúdos: Creative Commons Atribuição 4.0 (CC BY 4.0)", paragrafos: ["Textos das atividades, narrativas, personagens, documentação e design. Podem ser partilhados e adaptados para qualquer fim, desde que se indique a autoria ({autoria}), se inclua uma ligação para a licença e se assinale o que foi alterado. [Texto da licença CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt)."] },
      { titulo: "Componentes de terceiros", paragrafos: ["O Ágora Design System (AMA), React, three.js, dnd-kit e as restantes bibliotecas mantêm as suas licenças próprias. As marcas e logótipos da Kendir Studios não estão incluídos nesta licença."] },
    ],
    nota: "O texto completo está no ficheiro LICENSE do código-fonte.",
  },
  professor: {
    titulo: "Professor",
    comoFuncionaTitulo: "Como funciona",
    resultadosTitulo: "Resultados da sessão",
    semLigacao: "Abra a ligação privada que recebeu ao criar a sessão (ou no email de confirmação). As sessões criadas neste navegador estão listadas em [Professor](/professor).",
    "introducao": "Monte uma prova para a turma: escolha o nível e as atividades, obtenha um código e dê-o aos alunos. Para receber os resultados dos seus alunos, indique um email.",
    "comoFunciona": [
      "Deve escolher o nível, as atividades e como os alunos se identificam.",
      "Irá receber um código alfanumérico e um código QR para projetar.",
      "Os alunos deverão aceder ao site, selecionar a opção Treinar → Código, inserir o código e executar a prova.",
      "Os resultados serão enviados por email e ficam numa página privada, sendo possível a sua exportação em formato CSV."
    ]
  },
  provas: {
    titulo: "Preparação para provas e exames",
    caminho: "Provas e exames",
    cartao: "Preparação {nome}",
    comecar: "Começar a preparação",
    retomar: "Retomar ({i}/{n})",
    atividades: "Nível {nivel} · {n} atividades: {lista}.",
    nota: "O ECD não reproduz as provas oficiais nem as substitui: treina as competências digitais de que precisas para as fazer no computador (escrever, ler no ecrã, usar ferramentas, gerir o tempo). Para treinar uma atividade de cada vez, vai a [Desafios](/treino).",
    "introducao": "Escolhe a prova para a qual te estás a preparar. A preparação é uma sequência de atividades curtas que treina o que essas provas pedem no computador. Podes pausar entre atividades e retomar neste dispositivo. O nível é adaptado a cada prova e à complexidade dos processos digitais associados."
  },
  atividades: {
    tituloCatalogo: "Atividades",
    titulo: "Desafios",
    caminho: "Desafios",
    "introducaoCatalogo": "As atividades do ECD. Escolhe a prova para ver as atividades que entram na preparação e em que nível. Para os cinco níveis de dificuldade, vai a [Desafios](/treino).",
    "introducao": "Cada desafio tem cinco níveis, do 1 (Iniciação) ao 5 (Perito). Podes repetir sempre que precisares. O teu melhor desempenho fica guardado neste navegador, por nível, com as estrelas respetivas: abaixo de 50 pontos convém tentar novamente; de 50 a 74, 1 estrela; de 75 a 90, 2 estrelas; de 91 a 100, 3 estrelas."
  },
  jogos: {
    titulo: "Jogos",
    "introducao": "Jogos para desenvolver competências digitais e de literacia. Cada jogo tem cinco níveis e um relatório no fim. Não contam para a preparação de provas nem para os carimbos: são treino livre."
  },
  seguranca: {
    titulo: "Segurança digital",
    ajudaTitulo: "Onde pedir ajuda",
    aprender: "Aprender",
    testar: "Testar · nível {nivel}",
    "introducao": "Seis temas para estares mais seguro na internet. Em cada um, lê as informações e depois faz o teste, com cinco níveis e um relatório no fim. Os testes de segurança não contam para a preparação de provas nem para os carimbos."
  },
  definicoes: {
    titulo: "Definições",
    ajudas: {
      titulo: "Ajudas",
      leitura: {
        titulo: "Tipo de leitura",
        normal: "Normal",
        facilitada: "Leitura facilitada",
        ajuda: "Uma letra desenhada para ser fácil de distinguir (Atkinson Hyperlegible) e mais espaço entre letras, palavras e linhas, alinhado à esquerda. Ajuda quem tem dislexia, baixa visão ou se cansa a ler no ecrã.",
      },
      alvos: {
        titulo: "Botões e opções",
        normais: "Normais",
        grandes: "Grandes: mais altos e mais afastados",
        ajuda: "Botões, opções e caixas com pelo menos 56 píxeis e mais espaço entre si. Ajuda quem tem dificuldades de motricidade, usa o ecrã tátil ou um rato com pouca precisão.",
      },
      voz: {
        titulo: "Ler em voz alta",
        ajuda: "Mostra um botão “Ouvir” nas instruções das tarefas, nas perguntas dos testes de segurança, nas mensagens de feedback e no resumo do resultado. Usa a voz do navegador, em português. As instruções iniciais de cada atividade têm sempre este botão.",
        ligado: "Botões “Ouvir” ligados",
        desligado: "Botões “Ouvir” desligados",
      },
      calmo: {
        titulo: "Modo calmo",
        oQueFaz: "**O que faz:** esconde os relógios e as barras de tempo e desliga as animações. O tempo continua a contar como antes: quando faltar pouco, aparece só um aviso tranquilo. A pontuação não muda.",
        paraQue: "**Para que serve:** para quem fica ansioso ao ver o tempo a passar, se distrai com movimento ou prefere concentrar-se só na tarefa. Se precisares de mais tempo, junta-lhe o tempo alargado.",
        ligado: "Modo calmo ligado",
        desligado: "Modo calmo desligado",
        aviso: "O tempo está a contar. Avisamos quando faltar pouco.",
        poucoTempo: "Falta pouco tempo. Termina com calma.",
      },
    },
    "introducao": "Tudo fica guardado neste navegador. Nenhuma destas escolhas afeta a pontuação, exceto o tempo alargado, que fica registado no resultado como acomodação."
  },
  resultados: {
    titulo: "Os meus resultados",
    "introducao": "Não há contas: os teus resultados ficam só neste navegador, para veres a evolução e os melhores por nível. Podes exportá-los ou apagá-los quando quiseres."
  },
  observatorio: {
    titulo: "Observatório",
    "introducao": "Estatísticas anónimas sobre as competências digitais de todas as pessoas que usaram a aplicação. Escolhe o período e os filtros, vê os gráficos e exporta o relatório em CSV ou PDF. Para proteger a privacidade, os grupos com menos de 20 tentativas não são mostrados."
  },
  atividade: {
    briefing: { pratica: "Primeiro fazes um item de prática que não conta. Depois começa a avaliação.", melhor: "O teu melhor neste nível: **{pontos}** pontos.", comecar: "Começar a prática", saltar: "Saltar a prática", ouvir: "Ler em voz alta", alargado: "Tempo alargado ×{x} ativo." },
    etapas: { intro: "Briefing", pratica: "Prática (não conta)", avaliacao: "A contar", resultado: "Resultado" },
    resultado: { carimbo: "Ganhaste o {carimbo} de {dominio}.", bom: "Bom trabalho.", caminho: "Vais no bom caminho.", tenta: "Tenta novamente: vais conseguir.", verCartao: "Ver o meu {cartao}", recorde: "Novo recorde pessoal (antes: {antes}).", tempo: "Tempo: {s} s · Nível {nivel} ({nome})", repetir: "Repetir", proxima: "Próxima atividade: {titulo}", voltar: "Voltar aos desafios", repetirEsta: "Repetir esta atividade", revInfo: "Rever as informações", voltarSeguranca: "Voltar à segurança", voltarJogos: "Voltar aos jogos" },
    relatorio: { estrelas0: "Ainda não ganhaste estrelas: vale a pena tentar novamente.", estrelas1: "Obtiveste 1 estrela.", estrelasN: "Obtiveste {n} estrelas.", tres: "Tens as três estrelas. Experimenta o nível seguinte.", falta: "Para {nome} precisas de {alvo} pontos: faltam {falta}.", nomes: ["a primeira estrela", "a segunda estrela", "a terceira estrela"], proximaVez: "Da próxima vez:", titulo: "Relatório da atividade", bemFeito: "Bem feito.", porResponder: "Por responder: em branco vale zero." },
  },
  codigo: {
    titulo: "Entrar com código",
    caminho: "Código",
    introducao: "Insere aqui o código que o teu professor indicou. Terá o formato **TEC7·4F7KQ2**. Após inserires o código, clica em “Entrar” para começar a prova.",
    semEnvio: "**O envio de estatísticas está desligado neste navegador.** Assim, o teu professor não vai receber os resultados desta prova. Liga o envio para que ele os receba.",
    ligarEnvio: "Ligar o envio",
  },
};
