// ─── Biblioteca: excertos de autores portugueses em domínio público ──────────
// [conteúdo Kendir] Transcrições em ortografia atualizada. ANTES DE USAR EM ESCOLAS, validar cada texto contra
// uma edição de referência (Biblioteca Nacional Digital, Arquivo Pessoa, edições críticas) e registar a fonte em
// `fonte`. Todos os autores morreram há mais de 70 anos (domínio público em Portugal).
// Para acrescentar textos: basta juntar objetos a TEXTOS com o nível certo; o jogo gera o resto
// (palavras em falta, ordenação, ditado). As perguntas de compreensão e o glossário são escritos à mão.

export interface PerguntaTexto {
  pergunta: string;
  opcoes: string[];
  correta: number;
}

export interface TextoLiterario {
  id: string;
  nivel: 1 | 2 | 3 | 4 | 5;
  autor: string;
  obra: string;
  ano: string; // de publicação (ou de escrita, indicado)
  falecimento: number; // ano de morte do autor (domínio público: + 70 anos)
  tipo: "poema" | "prosa";
  excerto: boolean;
  texto: string; // versos separados por \n; estrofes por linha vazia
  glossario: Record<string, string>; // palavra (como aparece no texto) → explicação simples
  perguntas: PerguntaTexto[];
  fonte: string; // edição de referência a confirmar
}

export const TEXTOS: TextoLiterario[] = [
  // ── Nível 1 ────────────────────────────────────────────────────────────────
  {
    id: "caeiro-tejo-curto",
    nivel: 1,
    autor: "Alberto Caeiro (Fernando Pessoa)",
    obra: "O Guardador de Rebanhos, poema XX",
    ano: "1914 (escrito); publicado em 1925",
    falecimento: 1935,
    tipo: "poema",
    excerto: true,
    texto: `O Tejo é mais belo que o rio que corre pela minha aldeia,
Mas o Tejo não é mais belo que o rio que corre pela minha aldeia
Porque o Tejo não é o rio que corre pela minha aldeia.

O Tejo desce de Espanha
E o Tejo entra no mar em Portugal.
Toda a gente sabe isso.`,
    glossario: { aldeia: "Povoação pequena, no campo.", belo: "Bonito." },
    perguntas: [
      { pergunta: "De onde desce o Tejo?", opcoes: ["De Espanha", "De França", "Da aldeia do poeta"], correta: 0 },
      { pergunta: "Onde entra o Tejo no mar?", opcoes: ["Em Espanha", "Em Portugal", "Na aldeia"], correta: 1 },
      { pergunta: "O que é que “toda a gente sabe”?", opcoes: ["Por onde passa o Tejo", "Como se chama o rio da aldeia", "Quantos rios há em Portugal"], correta: 0 },
    ],
    fonte: "Arquivo Pessoa; Fernando Pessoa, Poemas de Alberto Caeiro (edição de referência a confirmar).",
  },
  {
    id: "pessoa-mar-curto",
    nivel: 1,
    autor: "Fernando Pessoa",
    obra: "Mensagem, “Mar Português”",
    ano: "1934",
    falecimento: 1935,
    tipo: "poema",
    excerto: true,
    texto: `Ó mar salgado, quanto do teu sal
São lágrimas de Portugal!
Por te cruzarmos, quantas mães choraram,
Quantos filhos em vão rezaram!`,
    glossario: { salgado: "Que tem sal.", cruzarmos: "Atravessarmos de um lado ao outro.", "em vão": "Sem resultado, sem servir de nada." },
    perguntas: [
      { pergunta: "Com quem fala o poeta?", opcoes: ["Com o mar", "Com as mães", "Com um rio"], correta: 0 },
      { pergunta: "Segundo o poema, muito do sal do mar são…", opcoes: ["Lágrimas de Portugal", "Pedras da praia", "Peixes"], correta: 0 },
      { pergunta: "Quem chorou?", opcoes: ["As mães", "Os peixes", "Os marinheiros"], correta: 0 },
    ],
    fonte: "Fernando Pessoa, Mensagem, 1934 (edição de referência a confirmar).",
  },

  // ── Nível 2 ────────────────────────────────────────────────────────────────
  {
    id: "pessoa-mar",
    nivel: 2,
    autor: "Fernando Pessoa",
    obra: "Mensagem, “Mar Português”",
    ano: "1934",
    falecimento: 1935,
    tipo: "poema",
    excerto: false,
    texto: `Ó mar salgado, quanto do teu sal
São lágrimas de Portugal!
Por te cruzarmos, quantas mães choraram,
Quantos filhos em vão rezaram!
Quantas noivas ficaram por casar
Para que fosses nosso, ó mar!

Valeu a pena? Tudo vale a pena
Se a alma não é pequena.
Quem quer passar além do Bojador
Tem que passar além da dor.
Deus ao mar o perigo e o abismo deu,
Mas nele é que espelhou o céu.`,
    glossario: {
      Bojador: "Cabo na costa de África, muito perigoso para os navegadores do século XV.",
      abismo: "Profundidade enorme, sem fundo à vista.",
      espelhou: "Refletiu, como num espelho.",
      "em vão": "Sem resultado.",
    },
    perguntas: [
      { pergunta: "Segundo o poema, quando é que “tudo vale a pena”?", opcoes: ["Se a alma não é pequena", "Se o mar estiver calmo", "Se houver navios"], correta: 0 },
      { pergunta: "Quem quer passar além do Bojador tem de passar além de quê?", opcoes: ["Da dor", "Do céu", "Da noite"], correta: 0 },
      { pergunta: "O que é que Deus espelhou no mar?", opcoes: ["O céu", "A terra", "As lágrimas"], correta: 0 },
      { pergunta: "Quem ficou por casar?", opcoes: ["Quantas noivas", "Os filhos", "As mães"], correta: 0 },
    ],
    fonte: "Fernando Pessoa, Mensagem, 1934 (edição de referência a confirmar).",
  },
  {
    id: "caeiro-tejo-medio",
    nivel: 2,
    autor: "Alberto Caeiro (Fernando Pessoa)",
    obra: "O Guardador de Rebanhos, poema XX",
    ano: "1914 (escrito); publicado em 1925",
    falecimento: 1935,
    tipo: "poema",
    excerto: true,
    texto: `O Tejo é mais belo que o rio que corre pela minha aldeia,
Mas o Tejo não é mais belo que o rio que corre pela minha aldeia
Porque o Tejo não é o rio que corre pela minha aldeia.

O Tejo tem grandes navios
E navega nele ainda,
Para aqueles que veem em tudo o que lá não está,
A memória das naus.

O Tejo desce de Espanha
E o Tejo entra no mar em Portugal.
Toda a gente sabe isso.`,
    glossario: { naus: "Grandes navios à vela, como os dos Descobrimentos.", aldeia: "Povoação pequena, no campo." },
    perguntas: [
      { pergunta: "O que tem o Tejo, segundo o poema?", opcoes: ["Grandes navios", "Pontes de pedra", "Moinhos"], correta: 0 },
      { pergunta: "O que veem no Tejo “aqueles que veem em tudo o que lá não está”?", opcoes: ["A memória das naus", "Os peixes", "A aldeia"], correta: 0 },
      { pergunta: "O Tejo é mais belo do que o rio da aldeia?", opcoes: ["É mais belo, mas para o poeta não é, porque não é o rio da sua aldeia", "Não, é mais feio", "O poema não fala disso"], correta: 0 },
    ],
    fonte: "Arquivo Pessoa; Fernando Pessoa, Poemas de Alberto Caeiro (edição de referência a confirmar).",
  },

  // ── Nível 3 ────────────────────────────────────────────────────────────────
  {
    id: "pessoa-autopsicografia",
    nivel: 3,
    autor: "Fernando Pessoa",
    obra: "“Autopsicografia”",
    ano: "1932 (publicado na revista Presença)",
    falecimento: 1935,
    tipo: "poema",
    excerto: false,
    texto: `O poeta é um fingidor.
Finge tão completamente
Que chega a fingir que é dor
A dor que deveras sente.

E os que leem o que escreve,
Na dor lida sentem bem,
Não as duas que ele teve,
Mas só a que eles não têm.

E assim nas calhas de roda
Gira, a entreter a razão,
Esse comboio de corda
Que se chama coração.`,
    glossario: {
      fingidor: "Quem finge, quem faz parecer o que não é.",
      deveras: "De verdade, realmente.",
      "calhas de roda": "Carris, trilhos por onde andam as rodas.",
      "comboio de corda": "Comboio de brincar, que anda depois de se lhe dar corda.",
      entreter: "Distrair, ocupar.",
    },
    perguntas: [
      { pergunta: "Segundo o poema, o que é o poeta?", opcoes: ["Um fingidor", "Um viajante", "Um leitor"], correta: 0 },
      { pergunta: "Como se chama o “comboio de corda”?", opcoes: ["Coração", "Razão", "Dor"], correta: 0 },
      { pergunta: "Que dor sentem os que leem o poema?", opcoes: ["Só a que eles não têm", "As duas que o poeta teve", "Nenhuma"], correta: 0 },
    ],
    fonte: "Fernando Pessoa, “Autopsicografia”, Presença n.º 36, 1932 (edição de referência a confirmar).",
  },
  {
    id: "caeiro-tejo",
    nivel: 3,
    autor: "Alberto Caeiro (Fernando Pessoa)",
    obra: "O Guardador de Rebanhos, poema XX",
    ano: "1914 (escrito); publicado em 1925",
    falecimento: 1935,
    tipo: "poema",
    excerto: false,
    texto: `O Tejo é mais belo que o rio que corre pela minha aldeia,
Mas o Tejo não é mais belo que o rio que corre pela minha aldeia
Porque o Tejo não é o rio que corre pela minha aldeia.

O Tejo tem grandes navios
E navega nele ainda,
Para aqueles que veem em tudo o que lá não está,
A memória das naus.

O Tejo desce de Espanha
E o Tejo entra no mar em Portugal.
Toda a gente sabe isso.
Mas poucos sabem qual é o rio da minha aldeia
E para onde ele vai
E donde ele vem.
E por isso, porque pertence a menos gente,
É mais livre e maior o rio da minha aldeia.

Pelo Tejo vai-se para o Mundo.
Para além do Tejo há a América
E a fortuna daqueles que a encontram.
Ninguém nunca pensou no que há para além
Do rio da minha aldeia.

O rio da minha aldeia não faz pensar em nada.
Quem está ao pé dele está só ao pé dele.`,
    glossario: { naus: "Grandes navios à vela.", fortuna: "Riqueza; também sorte.", donde: "De onde." },
    perguntas: [
      { pergunta: "Porque é que o rio da aldeia é “mais livre e maior”?", opcoes: ["Porque pertence a menos gente", "Porque é mais comprido", "Porque tem navios"], correta: 0 },
      { pergunta: "O que há “para além do Tejo”?", opcoes: ["A América", "A aldeia", "Espanha"], correta: 0 },
      { pergunta: "Em que faz pensar o rio da aldeia?", opcoes: ["Em nada", "Na América", "Nas naus"], correta: 0 },
      { pergunta: "Quantas pessoas sabem para onde vai o rio da aldeia?", opcoes: ["Poucas", "Toda a gente", "Ninguém"], correta: 0 },
    ],
    fonte: "Arquivo Pessoa; Fernando Pessoa, Poemas de Alberto Caeiro (edição de referência a confirmar).",
  },

  // ── Nível 4 ────────────────────────────────────────────────────────────────
  {
    id: "camoes-amor-fogo",
    nivel: 4,
    autor: "Luís Vaz de Camões",
    obra: "Rimas, soneto “Amor é fogo que arde sem se ver”",
    ano: "1595 (edição póstuma)",
    falecimento: 1580,
    tipo: "poema",
    excerto: false,
    texto: `Amor é fogo que arde sem se ver,
é ferida que dói, e não se sente;
é um contentamento descontente,
é dor que desatina sem doer.

É um não querer mais que bem querer;
é um andar solitário entre a gente;
é nunca contentar-se de contente;
é um cuidar que ganha em se perder.

É querer estar preso por vontade;
é servir a quem vence, o vencedor;
é ter com quem nos mata, lealdade.

Mas como causar pode seu favor
nos corações humanos amizade,
se tão contrário a si é o mesmo Amor?`,
    glossario: {
      desatina: "Faz perder o juízo, deixa fora de si.",
      cuidar: "Pensar, preocupar-se com alguém.",
      lealdade: "Fidelidade, ser leal.",
      favor: "Benefício, bondade.",
    },
    perguntas: [
      { pergunta: "Com que é comparado o Amor no primeiro verso?", opcoes: ["Com fogo", "Com água", "Com uma flor"], correta: 0 },
      { pergunta: "Expressões como “contentamento descontente” juntam ideias opostas. Como se chama isto?", opcoes: ["Antítese ou paradoxo", "Rima", "Onomatopeia"], correta: 0 },
      { pergunta: "Quantos versos tem um soneto como este?", opcoes: ["14", "12", "10"], correta: 0 },
      { pergunta: "A pergunta final do poema é sobre…", opcoes: ["Como pode o Amor, tão contrário a si mesmo, criar amizade", "Onde mora o Amor", "Quando acaba o Amor"], correta: 0 },
    ],
    fonte: "Luís de Camões, Rimas, 1595 (edição de referência a confirmar).",
  },
  {
    id: "florbela-ser-poeta",
    nivel: 4,
    autor: "Florbela Espanca",
    obra: "Charneca em Flor, soneto “Ser Poeta”",
    ano: "1931",
    falecimento: 1930,
    tipo: "poema",
    excerto: false,
    texto: `Ser poeta é ser mais alto, é ser maior
Do que os homens! Morder como quem beija!
É ser mendigo e dar como quem seja
Rei do Reino de Aquém e de Além Dor!

É ter de mil desejos o esplendor
E não saber sequer que se deseja!
É ter cá dentro um astro que flameja,
É ter garras e asas de condor!

É ter fome, é ter sede de Infinito!
Por elmo, as manhãs de oiro e de cetim…
É condensar o mundo num só grito!

E é amar-te, assim, perdidamente…
É seres alma, e sangue, e vida em mim
E dizê-lo cantando a toda a gente!`,
    glossario: {
      mendigo: "Pessoa que pede esmola.",
      esplendor: "Brilho intenso, grandeza.",
      flameja: "Brilha como uma chama.",
      condor: "Ave muito grande, dos Andes.",
      elmo: "Capacete de armadura.",
      condensar: "Juntar muito num espaço pequeno.",
    },
    perguntas: [
      { pergunta: "Segundo o poema, ser poeta é ser mais alto do que quem?", opcoes: ["Do que os homens", "Do que as montanhas", "Do que os reis"], correta: 0 },
      { pergunta: "De que ave são as “garras e asas”?", opcoes: ["De condor", "De águia", "De gaivota"], correta: 0 },
      { pergunta: "O que é condensado “num só grito”?", opcoes: ["O mundo", "O amor", "A dor"], correta: 0 },
    ],
    fonte: "Florbela Espanca, Charneca em Flor, 1931 (edição de referência a confirmar).",
  },

  {
    id: "pessoa-mostrengo",
    nivel: 5,
    autor: "Fernando Pessoa",
    obra: "Mensagem, “O Mostrengo”",
    ano: "1934",
    falecimento: 1935,
    tipo: "poema",
    excerto: false,
    texto: `O mostrengo que está no fim do mar
Na noite de breu ergueu-se a voar;
À roda da nau voou três vezes,
Voou três vezes a chiar,
E disse: “Quem é que ousou entrar
Nas minhas cavernas que não desvendo,
Meus tetos negros do fim do mundo?”
E o homem do leme disse, tremendo:
“El-Rei D. João Segundo!”

“De quem são as velas onde me roço?
De quem as quilhas que vejo e ouço?”
Disse o mostrengo, e rodou três vezes,
Três vezes rodou imundo e grosso.
“Quem vem poder o que só eu posso,
Que moro onde nunca ninguém me visse
E escorro os medos do mar sem fundo?”
E o homem do leme tremeu, e disse:
“El-Rei D. João Segundo!”

Três vezes do leme as mãos ergueu,
Três vezes ao leme as reprendeu,
E disse no fim de tremer três vezes:
“Aqui ao leme sou mais do que eu:
Sou um Povo que quer o mar que é teu;
E mais que o mostrengo, que me a alma teme
E roda nas trevas do fim do mundo,
Manda a vontade, que me ata ao leme,
De El-Rei D. João Segundo!”`,
    glossario: {
      mostrengo: "Monstro; ser enorme e assustador.",
      breu: "Escuridão total.",
      nau: "Grande navio à vela.",
      desvendo: "Mostro, revelo.",
      leme: "Peça que dá a direção ao navio.",
      quilhas: "Peças que formam o fundo do navio.",
      imundo: "Sujo, repugnante.",
      trevas: "Escuridão.",
    },
    perguntas: [
      { pergunta: "Quantas vezes voou o mostrengo à roda da nau?", opcoes: ["Três", "Duas", "Sete"], correta: 0 },
      { pergunta: "Em nome de quem responde o homem do leme?", opcoes: ["De El-Rei D. João Segundo", "Do mostrengo", "De Neptuno"], correta: 0 },
      { pergunta: "No fim, o homem do leme diz que é mais do que ele próprio. O que diz que é?", opcoes: ["Um Povo que quer o mar", "Um rei", "Um monstro"], correta: 0 },
      { pergunta: "O que vence o medo do homem do leme?", opcoes: ["A vontade do rei, que o ata ao leme", "A força dos braços", "A luz do dia"], correta: 0 },
    ],
    fonte: "Fernando Pessoa, Mensagem, 1934 (edição de referência a confirmar).",
  },
  {
    id: "camoes-lusiadas",
    nivel: 5,
    autor: "Luís Vaz de Camões",
    obra: "Os Lusíadas, Canto I, estâncias 1 a 3",
    ano: "1572",
    falecimento: 1580,
    tipo: "poema",
    excerto: true,
    texto: `As armas e os barões assinalados
Que da ocidental praia Lusitana
Por mares nunca de antes navegados
Passaram ainda além da Taprobana,
Em perigos e guerras esforçados
Mais do que prometia a força humana,
E entre gente remota edificaram
Novo Reino, que tanto sublimaram;

E também as memórias gloriosas
Daqueles Reis que foram dilatando
A Fé, o Império, e as terras viciosas
De África e de Ásia andaram devastando,
E aqueles que por obras valerosas
Se vão da lei da Morte libertando,
Cantando espalharei por toda parte,
Se a tanto me ajudar o engenho e arte.

Cessem do sábio Grego e do Troiano
As navegações grandes que fizeram;
Cale-se de Alexandro e de Trajano
A fama das vitórias que tiveram;
Que eu canto o peito ilustre Lusitano,
A quem Neptuno e Marte obedeceram.
Cesse tudo o que a Musa antiga canta,
Que outro valor mais alto se alevanta.`,
    glossario: {
      barões: "Homens ilustres, heróis.",
      assinalados: "Notáveis, famosos.",
      Taprobana: "Nome antigo da ilha de Ceilão (atual Sri Lanka).",
      sublimaram: "Engrandeceram, tornaram grandioso.",
      dilatando: "Alargando, expandindo.",
      valerosas: "Corajosas, de valor.",
      engenho: "Talento, inteligência.",
      Cessem: "Parem, acabem.",
      alevanta: "Levanta-se, ergue-se.",
    },
    perguntas: [
      { pergunta: "De que “praia” partiram os heróis?", opcoes: ["Da ocidental praia Lusitana", "Da praia da Taprobana", "Da praia de Troia"], correta: 0 },
      { pergunta: "O poeta vai cantar “por toda parte” se tiver a ajuda de quê?", opcoes: ["Do engenho e arte", "Dos Reis", "De Neptuno e Marte"], correta: 0 },
      { pergunta: "Quem obedeceu ao “peito ilustre Lusitano”?", opcoes: ["Neptuno e Marte", "Alexandro e Trajano", "O Grego e o Troiano"], correta: 0 },
      { pergunta: "Na terceira estância, o poeta pede que se calem os feitos antigos porque…", opcoes: ["Outro valor mais alto se levanta", "Já não interessam a ninguém", "Não foram verdadeiros"], correta: 0 },
    ],
    fonte: "Luís de Camões, Os Lusíadas, 1572 (edição de referência a confirmar).",
  },

  // ── Nível 5 ────────────────────────────────────────────────────────────────
  {
    id: "eca-maias",
    nivel: 5,
    autor: "Eça de Queirós",
    obra: "Os Maias (início do capítulo I)",
    ano: "1888",
    falecimento: 1900,
    tipo: "prosa",
    excerto: true,
    texto: `A casa que os Maias vieram habitar em Lisboa, no outono de 1875, era conhecida na vizinhança da Rua de S. Francisco de Paula, e em todo o bairro das Janelas Verdes, pela Casa do Ramalhete ou simplesmente o Ramalhete. Apesar deste fresco nome de vivenda campestre, o Ramalhete, sombrio casarão de paredes severas, com um renque de estreitas varandas de ferro no primeiro andar, e por cima uma tímida fila de janelinhas abrigadas à beira do telhado, tinha o aspeto tristonho de residência eclesiástica que competia a uma edificação do reinado da senhora D. Maria I: com uma sineta e com uma cruz no topo assemelhar-se-ia a um colégio de jesuítas.`,
    glossario: {
      "vivenda campestre": "Casa de campo.",
      casarão: "Casa muito grande.",
      renque: "Fila, fileira.",
      eclesiástica: "Da Igreja, de padres.",
      sineta: "Sino pequeno.",
      "assemelhar-se-ia": "Seria parecida com.",
    },
    perguntas: [
      { pergunta: "Em que ano vieram os Maias habitar a casa de Lisboa?", opcoes: ["1875", "1888", "1857"], correta: 0 },
      { pergunta: "Como era conhecida a casa?", opcoes: ["Ramalhete", "Janelas Verdes", "Casa de S. Francisco"], correta: 0 },
      { pergunta: "Com uma sineta e uma cruz, a que se pareceria a casa?", opcoes: ["A um colégio de jesuítas", "A um palácio real", "A uma vivenda campestre"], correta: 0 },
      { pergunta: "O nome “Ramalhete” sugere uma casa de campo. Como era, afinal, a casa?", opcoes: ["Sombria, de paredes severas", "Alegre e colorida", "Pequena e moderna"], correta: 0 },
    ],
    fonte: "Eça de Queirós, Os Maias, 1888 (edição de referência a confirmar).",
  },
  {
    id: "garrett-viagens",
    nivel: 3,
    autor: "Almeida Garrett",
    obra: "Viagens na Minha Terra (início do capítulo I)",
    ano: "1846",
    falecimento: 1854,
    tipo: "prosa",
    excerto: true,
    texto: `Que viaje à roda do seu quarto quem está à beira dos Alpes, de inverno, em Turim, que é quase tão frio como Sampetersburgo — entende-se. Mas com este clima, com este ar que Deus nos deu, onde a laranjeira cresce na moita, e o mato é de murta, o próprio Xavier de Maistre, que aqui escrevesse, ao menos ia até o quintal.`,
    glossario: {
      "à roda": "À volta.",
      Sampetersburgo: "São Petersburgo, cidade muito fria da Rússia.",
      moita: "Conjunto de arbustos.",
      murta: "Arbusto de flores brancas e perfumadas.",
      "Xavier de Maistre": "Escritor que publicou “Viagem à Roda do Meu Quarto” (1794).",
    },
    perguntas: [
      { pergunta: "Em que cidade “à beira dos Alpes” se compreende que alguém viaje à roda do quarto?", opcoes: ["Turim", "Lisboa", "Sampetersburgo"], correta: 0 },
      { pergunta: "Que árvore “cresce na moita” no clima português?", opcoes: ["A laranjeira", "A murta", "O pinheiro"], correta: 0 },
      { pergunta: "Se Xavier de Maistre escrevesse em Portugal, até onde iria, pelo menos?", opcoes: ["Até ao quintal", "Até Turim", "À roda do quarto"], correta: 0 },
    ],
    fonte: "Almeida Garrett, Viagens na Minha Terra, 1846 (edição de referência a confirmar).",
  },
];

/** Item de prática: uma frase curta. */
export const TEXTO_PRATICA: TextoLiterario = {
  id: "pratica",
  nivel: 1,
  autor: "Fernando Pessoa",
  obra: "Mensagem, “O Infante”",
  ano: "1934",
  falecimento: 1935,
  tipo: "poema",
  excerto: true,
  texto: "Deus quer, o homem sonha, a obra nasce.",
  glossario: { obra: "Aquilo que se faz ou se cria." },
  perguntas: [{ pergunta: "O que faz o homem, segundo o verso?", opcoes: ["Sonha", "Quer", "Nasce"], correta: 0 }],
  fonte: "Fernando Pessoa, Mensagem, 1934.",
};
