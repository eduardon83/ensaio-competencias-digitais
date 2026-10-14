// ─── Aldeia Digital · missões de cidadania (conteúdo editável no backoffice) ──
// Cada missão é uma cena da aldeia com 3 situações e escolhas ("O que fazes?"), por ciclo: c1 (1.º ciclo), c23
// (2.º e 3.º ciclos) e sec (secundário). Se faltar um ciclo, usa o de baixo. Alinhamento com as AE de Cidadania e
// Desenvolvimento em docs/aldeia-digital/CURRICULO.md (secção 4). [conteúdo Kendir] A validar com a DGE.
// Em cada situação, "certa" é a resposta certa (o campo não muda de lugar: a escolha certa não é editável, só o texto).
// "a" e "b" são as outras opções. O adulto de confiança aparece sempre como primeira ajuda. Tudo fictício.
import type { PorCiclo } from "../textos";

export interface Situacao {
  /** O que a personagem conta (aparece no balão). */
  texto: string;
  /** Texto no ecrã ou cartaz desenhado na cena (opcional). */
  ecra?: string;
  pergunta?: string;
  certa: string;
  a: string;
  b: string;
  /** Explicação curta, mostrada depois da escolha. */
  porque: string;
}
export type Situacoes = { s1: Situacao; s2: Situacao; s3: Situacao };
export interface MissaoCidadania {
  titulo: PorCiclo;
  intro: PorCiclo;
  fecho: PorCiclo;
  situacoes: { c1: Situacoes; c23?: Situacoes; sec?: Situacoes };
}

export const PERGUNTA_PADRAO = "O que fazes?";

// Personagem e ilustração de cada missão (técnico: fora do backoffice).
export const CENAS: Record<string, { personagem: string; arte?: string }> = {
  "cid-direitos-online": { personagem: "professora", arte: "direitos-online" },
  "cid-regras-turma": { personagem: "professora" },
  "cid-verdade-boato": { personagem: "diretora-graca" },
  "cid-computador-velho": { personagem: "avo", arte: "computador-velho" },
  "cid-imagem-autor": { personagem: "bibliotecaria" },
  "cid-votacao-festa": { personagem: "presidente-junta", arte: "votacao-festa" },
  "cid-preciso-ou-quero": { personagem: "mae", arte: "preciso-ou-quero" },
  "cid-pedir-ajuda": { personagem: "professora" },
  "cid-hora-desligar": { personagem: "avo" },
  "cid-boas-maneiras": { personagem: "dona-cegonha" },
};

export const CIDADANIA: Record<string, MissaoCidadania> = {
  "cid-direitos-online": {
    titulo: { c1: "Os direitos das crianças, também online", c23: "Ninguém fica de fora no grupo da turma", sec: "Discurso de ódio: o que fazer" },
    intro: { c1: "As crianças têm direitos. Na internet também!", c23: "Os direitos das crianças também valem online. Vamos ver três situações da turma.", sec: "Os direitos humanos valem dentro e fora da internet. Como agir quando alguém é atacado?" },
    fecho: { c1: "Muito bem! Proteges os teus direitos e os dos outros.", c23: "Fizeste escolhas que protegem todos na turma.", sec: "Proteger quem é atacado também é exercer direitos." },
    situacoes: {
      c1: {
        s1: { texto: "O Leo tirou-te uma foto. Quer pô-la no grupo da turma.", ecra: "Foto nova", certa: "Digo que primeiro me tem de perguntar.", a: "Deixo, não faz mal.", b: "Tiro-lhe uma foto também, sem perguntar.", porque: "A tua imagem é tua. Antes de partilhar uma foto, pergunta-se sempre." },
        s2: { texto: "A Nina não está no grupo da turma. Ficou triste.", ecra: "Grupo da turma", certa: "Peço para a Nina entrar no grupo.", a: "Não digo nada.", b: "Fazemos outro grupo sem ela.", porque: "Todos têm direito a participar. Ninguém fica de fora." },
        s3: { texto: "Recebeste uma mensagem que te deixou triste.", ecra: "Mensagem nova", certa: "Conto à professora ou à família.", a: "Guardo segredo.", b: "Respondo com uma mensagem má.", porque: "Um adulto de confiança ajuda-te. Fizeste bem em contar." },
      },
      c23: {
        s1: { texto: "Um colega tirou uma foto tua no recreio. Vai publicá-la sem perguntar.", ecra: "A publicar…", certa: "Peço-lhe que não publique sem a minha autorização.", a: "Não digo nada, para não criar problemas.", b: "Publico eu uma foto dele, para ficarmos quites.", porque: "O direito à imagem também vale online. Sem autorização, não se publica." },
        s2: { texto: "No grupo da turma combinam uma saída e deixam a Ana de fora.", ecra: "Grupo da turma · 23", certa: "Lembro o grupo de incluir a Ana.", a: "Fico calado.", b: "Faço uma piada sobre isso.", porque: "Rejeitar a exclusão é cooperar na vida da escola: todos podem participar." },
        s3: { texto: "Numa conversa online, alguém escreve comentários maus sobre ti.", ecra: "Conversa", certa: "Guardo uma imagem da conversa e falo com um adulto de confiança.", a: "Apago tudo e não conto a ninguém.", b: "Respondo com insultos.", porque: "Guardar provas e pedir ajuda a um adulto é o caminho seguro." },
      },
      sec: {
        s1: { texto: "Alguém publica a foto de um colega com comentários de troça sobre a origem dele.", ecra: "Publicação", certa: "Não partilho, denuncio a publicação e aviso um adulto da escola.", a: "Partilho para mostrar que é errado.", b: "Ignoro: não é comigo.", porque: "Partilhar espalha o dano. Denunciar e pedir ajuda protege quem é visado." },
        s2: { texto: "No grupo da turma, uma colega é posta de parte por ser de outro país.", ecra: "Grupo da turma", certa: "Digo que não concordo e convido-a para o trabalho de grupo.", a: "Fico em silêncio para não ser o próximo.", b: "Saio do grupo sem dizer nada.", porque: "Tomar posição com respeito ajuda a parar a discriminação." },
        s3: { texto: "Começas a receber mensagens de ódio de contas que não conheces.", ecra: "Mensagens", certa: "Bloqueio, guardo provas e falo com um adulto de confiança.", a: "Respondo a cada mensagem.", b: "Desligo tudo e não conto a ninguém.", porque: "Não estás sozinho: guardar provas e pedir ajuda permite agir." },
      },
    },
  },
  "cid-regras-turma": {
    titulo: { c1: "As regras da turma", c23: "Regras da turma para o digital" },
    intro: { c1: "A turma vai combinar regras para os computadores.", c23: "As regras da sala de computadores e do grupo online decidem-se em conjunto." },
    fecho: { c1: "As regras são de todos. Muito bem!", c23: "Regras feitas em conjunto são mais fáceis de cumprir." },
    situacoes: {
      c1: {
        s1: { texto: "A turma vai fazer regras para os computadores. Quem decide?", ecra: "Regras da turma", pergunta: "Quem decide?", certa: "Decidimos todos juntos.", a: "Só quem fala mais alto.", b: "Ninguém: não precisamos de regras.", porque: "As regras da turma decidem-se em conjunto." },
        s2: { texto: "A regra diz: no fim, cada um desliga o computador. A Bia esqueceu-se.", ecra: "1. Desligar no fim", certa: "Lembro a Bia com simpatia.", a: "Faço queixa aos gritos.", b: "Não faço nada: não é comigo.", porque: "Cumprir as regras é cuidar do que é de todos." },
        s3: { texto: "O Tiago quer mudar uma regra.", ecra: "Proposta nova", certa: "Ele propõe e a turma vota.", a: "Ele muda sozinho.", b: "A regra fica para sempre igual.", porque: "As regras podem mudar, mas em conjunto." },
      },
      c23: {
        s1: { texto: "A turma vai escrever as regras para os computadores e para o grupo online.", ecra: "Regras da turma", certa: "Cada um propõe ideias e votamos.", a: "O delegado escreve tudo sozinho.", b: "Copiamos regras de outra escola sem conversar.", porque: "Decisões coletivas ouvem todos antes de votar." },
        s2: { texto: "Uma proposta diz: não partilhar fotos de colegas sem autorização. Um colega não concorda.", ecra: "Proposta 3", certa: "Ouvimos as razões dele e discutimos.", a: "Tiramo-lo do grupo.", b: "Mudamos a regra só por causa dele.", porque: "Todos são ouvidos; depois respeita-se o que a turma decidir." },
        s3: { texto: "Alguém continua a não cumprir a regra combinada.", ecra: "Regra combinada", certa: "Lembramos a regra e, se continuar, falamos com o professor.", a: "Gozamos com ele no grupo.", b: "Deixamos de cumprir também.", porque: "As regras protegem todos. Quando não chegam, pede-se ajuda a quem é responsável." },
      },
    },
  },
  "cid-verdade-boato": {
    titulo: { c1: "O jornal da turma: o que se pode publicar?", c23: "Verdade ou boato na aldeia", sec: "A IA editou a foto?" },
    intro: { c1: "Vamos fazer o jornal da turma. O que se pode publicar?", c23: "A trovoada trouxe boatos. Ajuda o Jornal a separar o verdadeiro do falso.", sec: "Imagens geradas ou editadas por IA circulam depressa. Como verificar antes de publicar?" },
    fecho: { c1: "O jornal ficou certo e seguro.", c23: "A aldeia já sabe o que é verdade.", sec: "Verificar fontes e imagens é a base de um jornal credível." },
    situacoes: {
      c1: {
        s1: { texto: "Chegou uma mensagem: a escola vai fechar amanhã!", ecra: "URGENTE! A escola fecha amanhã! Partilha!", certa: "Pergunto a um adulto se é verdade.", a: "Partilho já com todos.", b: "Fico com medo e não digo nada.", porque: "Antes de partilhar, confirma com um adulto." },
        s2: { texto: "O jornal quer pôr a morada da Ana, para lhe mandarem postais.", ecra: "Notícia: a Ana mudou de casa", certa: "Não: a morada não se publica.", a: "Sim, para todos saberem.", b: "Sim, mas só a rua.", porque: "A morada é um dado pessoal. Fica protegida." },
        s3: { texto: "Há uma foto de um elefante no Largo! Será verdade?", ecra: "Foto: elefante no Largo", certa: "Vou ver ou pergunto a quem lá esteve.", a: "Acredito logo.", b: "Mudo a foto e partilho.", porque: "As imagens também podem enganar." },
      },
      c23: {
        s1: { texto: "Circula uma mensagem: a festa foi cancelada por causa da trovoada!", ecra: "Partilha! A festa foi cancelada!!!", certa: "Procuro a notícia no sítio da Junta e vejo a data.", a: "Partilho: mais vale avisar.", b: "Acrescento pormenores para ficar mais interessante.", porque: "Confirmar a fonte e a data evita espalhar boatos." },
        s2: { texto: "Uma foto mostra o rio da aldeia a transbordar “ontem”. Parece antiga.", ecra: "Foto: o rio transbordou ontem", certa: "Procuro de onde vem a foto e quando foi tirada.", a: "Partilho no grupo da turma.", b: "Comento a dizer que é verdade.", porque: "Fotos antigas ou de outros sítios são usadas para enganar." },
        s3: { texto: "Uma publicação diz “os cientistas dizem…”, mas não diz quem.", ecra: "Os cientistas dizem que…", certa: "Procuro outras fontes credíveis antes de acreditar.", a: "Acredito porque tem muitos gostos.", b: "Partilho com a turma.", porque: "Muitos gostos não tornam uma informação verdadeira." },
      },
      sec: {
        s1: { texto: "Chega uma foto do presidente da Junta a dançar no telhado. Parece perfeita demais.", ecra: "Foto exclusiva!", certa: "Procuro sinais de edição ou de IA e a fonte original.", a: "Publico: é engraçada.", b: "Publico com um aviso “pode ser falso”.", porque: "Imagens geradas por IA podem parecer reais. Sem verificar, não se publica." },
        s2: { texto: "A tua rede mostra sempre notícias que concordam contigo.", ecra: "Para ti", certa: "Procuro fontes diferentes, de propósito.", a: "Fico só com as que concordam comigo.", b: "Bloqueio quem pensa diferente.", porque: "Os algoritmos criam bolhas. Variar as fontes ajuda a pensar melhor." },
        s3: { texto: "Queres usar IA para melhorar a foto de capa do jornal.", ecra: "Editar com IA", certa: "Uso só para ajustes e digo que a foto foi editada.", a: "Mudo o que aconteceu na foto.", b: "Não digo a ninguém.", porque: "Ser transparente sobre o uso de IA mantém a confiança dos leitores." },
      },
    },
  },
  "cid-computador-velho": {
    titulo: { c1: "Onde vai o computador velho?", c23: "Reparar, reutilizar, reciclar", sec: "A pegada do digital" },
    intro: { c1: "O computador da família está velhinho. O que fazemos?", c23: "Os aparelhos também têm vida. Reparar, reutilizar e reciclar poupa o planeta.", sec: "O digital também tem pegada: energia, materiais e lixo eletrónico." },
    fecho: { c1: "Cuidaste da aldeia e do planeta!", c23: "Reparar e reciclar bem faz toda a diferença.", sec: "Pequenas escolhas digitais somam muito." },
    situacoes: {
      c1: {
        s1: { texto: "Este computador já não liga bem. O que fazemos?", certa: "Primeiro vemos se dá para arranjar.", a: "Deitamos no lixo de casa.", b: "Deixamos na rua.", porque: "Reparar é o primeiro passo. Assim gastamos menos." },
        s2: { texto: "Não dá para arranjar. Para onde vai?", ecra: "Ponto de recolha", certa: "Para o ponto de recolha de aparelhos elétricos.", a: "Para o ecoponto amarelo.", b: "Para o lixo comum.", porque: "Os aparelhos elétricos têm um sítio próprio. Assim aproveitam-se as peças." },
        s3: { texto: "O Avô Zé arranjou o rato do computador!", ecra: "Oficina de reparação", certa: "Usamos o rato outra vez.", a: "Compramos um novo na mesma.", b: "Guardamos na gaveta para sempre.", porque: "Reutilizar poupa materiais." },
      },
      c23: {
        s1: { texto: "O portátil da família ficou lento.", certa: "Vemos se uma limpeza ou uma peça nova resolve.", a: "Compramos logo outro.", b: "Deitamos fora.", porque: "Reparar prolonga a vida dos aparelhos e reduz o lixo eletrónico." },
        s2: { texto: "Tens um telemóvel avariado. Onde o deixas?", ecra: "Ecoponto · Pilhas · Elétricos", certa: "No ponto de recolha de equipamentos elétricos.", a: "No ecoponto azul, do papel.", b: "No lixo comum.", porque: "Os equipamentos elétricos têm materiais que se recuperam e outros que poluem." },
        s3: { texto: "O tablet antigo ainda funciona, mas já não precisas dele.", ecra: "Oficina de reparação", certa: "Ofereço a quem precise ou entrego numa recolha solidária.", a: "Guardo na gaveta.", b: "Deito fora.", porque: "Reutilizar dá nova vida ao aparelho." },
      },
      sec: {
        s1: { texto: "Tens milhares de fotos repetidas guardadas na nuvem.", certa: "Apago as repetidas e guardo só as que importam.", a: "Guardo tudo: na nuvem não gasta nada.", b: "Faço mais cópias, por segurança.", porque: "Os centros de dados gastam energia. Guardar menos também conta." },
        s2: { texto: "O telemóvel novo não traz carregador. Tens três em casa.", ecra: "Ecoponto · Elétricos", certa: "Uso um dos que tenho e entrego os que sobram para reciclar.", a: "Compro um novo.", b: "Deito os antigos no lixo.", porque: "Reutilizar acessórios evita lixo eletrónico." },
        s3: { texto: "Vês vídeos durante horas em alta resolução no telemóvel.", ecra: "Qualidade do vídeo", certa: "Baixo a qualidade quando não preciso e faço pausas.", a: "Ponho sempre a qualidade máxima.", b: "Deixo os vídeos a correr sem ver.", porque: "Escolhas como esta reduzem a energia gasta e cuidam do bem-estar." },
      },
    },
  },
  "cid-imagem-autor": {
    titulo: { c1: "De quem é esta imagem?", c23: "Copiar não é criar", sec: "Citar fontes" },
    intro: { c1: "Quem faz um desenho é o autor. Vamos respeitar os autores.", c23: "Na Biblioteca aprendemos a usar o trabalho dos outros sem copiar.", sec: "Citar fontes é dar crédito e permitir que outros verifiquem." },
    fecho: { c1: "Respeitaste os autores. Muito bem!", c23: "Criar é usar ideias com respeito e dizer de onde vêm.", sec: "Um trabalho com fontes é um trabalho credível." },
    situacoes: {
      c1: {
        s1: { texto: "Encontraste um desenho na internet para o cartaz.", ecra: "Desenho de: Rita, 9 anos", certa: "Digo o nome de quem o fez.", a: "Uso e digo que fui eu.", b: "Corto o nome do autor.", porque: "Quem cria um desenho é o autor. Dizemos sempre quem fez." },
        s2: { texto: "A Ana fez um desenho lindo. Queres pô-lo no jornal.", certa: "Peço autorização à Ana.", a: "Uso sem dizer nada.", b: "Digo que fui eu.", porque: "Para usar o trabalho de alguém, pede-se primeiro." },
        s3: { texto: "Copiaste uma frase de um livro para o trabalho.", ecra: "“Era uma vez…”", certa: "Ponho entre aspas e digo de que livro é.", a: "Escrevo como se fosse minha.", b: "Copio o livro todo.", porque: "Citar é dizer de onde vem." },
      },
      c23: {
        s1: { texto: "Para o trabalho de grupo, encontras um texto pronto na internet.", certa: "Escrevo por palavras minhas e indico a fonte.", a: "Copio e colo: ninguém vai notar.", b: "Copio e mudo só umas palavras.", porque: "Copiar sem indicar é plágio. Resumir e citar mostra o que aprendeste." },
        s2: { texto: "Uma imagem diz: “pode ser usada, indicando o autor”.", ecra: "Pode ser usada, indicando o autor", certa: "Uso e indico o autor.", a: "Uso sem indicar.", b: "Acho que nenhuma imagem pode ser usada.", porque: "Algumas imagens podem ser usadas, cumprindo as condições do autor." },
        s3: { texto: "O vídeo da turma vai ter música. Qual escolhes?", ecra: "Música para o vídeo", certa: "Uma música livre de direitos ou feita por nós.", a: "A música mais famosa, sem autorização.", b: "Gravo a música da rádio.", porque: "As músicas têm autores. Usa as que permitem uso ou cria a tua." },
      },
      sec: {
        s1: { texto: "Num trabalho, usas dados de um estudo.", certa: "Indico o estudo, os autores e o ano.", a: "Ponho só os números.", b: "Arredondo os números para parecerem meus.", porque: "Citar permite verificar e dá crédito a quem fez o estudo." },
        s2: { texto: "Uma ferramenta de IA escreveu um parágrafo para ti.", ecra: "Texto gerado", certa: "Revejo, confirmo os factos e digo que usei IA.", a: "Entrego como se fosse meu.", b: "Copio sem ler.", porque: "A IA pode errar e o trabalho deve ser honesto sobre a sua origem." },
        s3: { texto: "Encontras a mesma informação em dois sítios diferentes.", certa: "Procuro a fonte original e cito essa.", a: "Cito o primeiro que encontrei.", b: "Não cito nenhum.", porque: "A fonte original é a mais fiável e a mais justa para o autor." },
      },
    },
  },
  "cid-votacao-festa": {
    titulo: { c1: "A votação da festa", c23: "A votação da festa", sec: "Participar com informação credível" },
    intro: { c1: "A aldeia vai escolher o tema da festa. Todos votam!", c23: "A Junta organiza a votação da festa. Uma decisão justa precisa de regras justas.", sec: "Decidir em conjunto pede informação credível e respeito pelo resultado." },
    fecho: { c1: "A festa foi escolhida por todos!", c23: "Uma votação justa deixa todos participar.", sec: "Participar bem é informar-se, votar e respeitar o resultado." },
    situacoes: {
      c1: {
        s1: { texto: "Como se escolhe o tema da festa?", ecra: "Piratas · Espaço · Animais", pergunta: "Como votas?", certa: "Cada um vota uma vez.", a: "Voto muitas vezes no meu.", b: "Escolho por todos.", porque: "Numa votação justa, cada pessoa vota uma vez." },
        s2: { texto: "O Tiago ainda não disse a ideia dele.", ecra: "Ideias para a festa", certa: "Esperamos e ouvimos o Tiago.", a: "Não há tempo: decidimos já.", b: "As ideias do Tiago não contam.", porque: "Antes de decidir, ouvimos todos." },
        s3: { texto: "Ganharam os Animais. Tu votaste no Espaço.", ecra: "Animais 12 · Espaço 8 · Piratas 4", certa: "Aceito e ajudo a preparar a festa.", a: "Fico zangado e não vou.", b: "Digo que a votação não vale.", porque: "Numa votação, aceitamos o resultado e participamos." },
      },
      c23: {
        s1: { texto: "A Junta abriu uma votação online para a festa.", ecra: "Vota aqui · 1 voto por pessoa", certa: "Voto uma vez, com o meu código.", a: "Peço o código aos colegas para votar mais.", b: "Crio contas falsas.", porque: "Um voto por pessoa garante uma decisão justa." },
        s2: { texto: "Antes de votar há um debate no Largo.", ecra: "Debate: o tema da festa", certa: "Ouço os argumentos e procuro informação.", a: "Voto no tema do meu melhor amigo, sem ouvir.", b: "Interrompo quem pensa diferente.", porque: "Decidir bem é ouvir, informar-se e só depois escolher." },
        s3: { texto: "Saiu o resultado. Começa um boato a dizer que houve batota.", ecra: "Resultado oficial", certa: "Confirmo o resultado oficial no sítio da Junta.", a: "Partilho o boato.", b: "Exijo outra votação sem provas.", porque: "Confiar em fontes oficiais protege as decisões de todos." },
      },
      sec: {
        s1: { texto: "Circula uma sondagem sobre a festa sem dizer quem a fez.", ecra: "Sondagem: 90 % querem…", certa: "Procuro quem fez a sondagem e como.", a: "Acredito: são números.", b: "Partilho para influenciar o voto.", porque: "Sem fonte e método, uma sondagem não é informação credível." },
        s2: { texto: "Um candidato à comissão da festa promete coisas impossíveis.", ecra: "Promessas", certa: "Comparo as propostas e pergunto como as vai cumprir.", a: "Voto nele: promete mais.", b: "Não voto: é tudo igual.", porque: "Participar é avaliar propostas com espírito crítico." },
        s3: { texto: "Perdeste a votação por poucos votos.", ecra: "Resultado oficial", certa: "Aceito, e proponho melhorias para a próxima vez.", a: "Espalho que houve fraude.", b: "Deixo de participar.", porque: "Respeitar o resultado mantém a confiança nas decisões coletivas." },
      },
    },
  },
  "cid-preciso-ou-quero": {
    titulo: { c1: "Preciso ou quero?", c23: "Preciso ou quero? As compras nos jogos", sec: "Fraude financeira e digital" },
    intro: { c1: "Às vezes precisamos de coisas. Outras vezes só queremos. Vamos pensar?", c23: "O dinheiro a sério também se gasta nos jogos. Vamos decidir com calma.", sec: "Burlas com dinheiro chegam por mensagem, email ou anúncios. Como te proteges?" },
    fecho: { c1: "Pensaste antes de gastar. Boa!", c23: "Pensar antes de comprar é uma grande ajuda.", sec: "Desconfiar, verificar e não ter pressa protege o teu dinheiro." },
    situacoes: {
      c1: {
        s1: { texto: "Num jogo aparece uma janela a brilhar.", ecra: "Compra 100 estrelas! Só 2 €", certa: "Fecho e falo com a família.", a: "Carrego logo para comprar.", b: "Peço o cartão aos pais sem dizer para quê.", porque: "As compras nos jogos custam dinheiro a sério. Decide-se em família." },
        s2: { texto: "Tens 3 € no mealheiro e estás com fome.", ecra: "Lanche 1 € · Brinquedo 5 €", certa: "Compro o lanche e guardo o resto.", a: "Gasto tudo no brinquedo.", b: "Peço dinheiro emprestado para os dois.", porque: "Primeiro o que precisas. O que queres pode esperar." },
        s3: { texto: "Queres muito um jogo novo.", certa: "Falo com a família e poupamos juntos.", a: "Faço birra.", b: "Compro às escondidas.", porque: "Poupar ajuda a conseguir o que queres." },
      },
      c23: {
        s1: { texto: "Um jogo grátis pede moedas para avançar mais depressa.", ecra: "Moedas: avança já!", certa: "Penso se preciso mesmo e combino com a família.", a: "Compro sempre que aparece.", b: "Uso o cartão dos pais às escondidas.", porque: "Jogos grátis ganham dinheiro com pequenas compras. Decidir com calma evita surpresas." },
        s2: { texto: "Tens 10 € por semana. Queres um livro e uma pizza.", ecra: "Livro 8 € · Pizza 6 €", certa: "Escolho um agora e poupo para o outro.", a: "Compro os dois e fico a dever.", b: "Gasto tudo no primeiro dia.", porque: "Um orçamento ajuda a escolher entre o que precisas e o que queres." },
        s3: { texto: "Aparece uma oferta: “Só hoje! Últimas unidades!”", certa: "Comparo preços e espero um dia antes de decidir.", a: "Compro já, para não perder.", b: "Partilho com todos para comprarem.", porque: "Ofertas com pressa querem que decidas sem pensar." },
      },
      sec: {
        s1: { texto: "Uma mensagem diz que ganhaste um prémio e pede os dados do cartão.", ecra: "Parabéns! Ganhaste!", certa: "Não dou os dados e verifico pelo canal oficial.", a: "Dou só os números do cartão.", b: "Respondo a pedir mais informação.", porque: "Ninguém pede dados do cartão para entregar prémios. É uma burla." },
        s2: { texto: "Um vendedor online pede pagamento por transferência para fora da plataforma.", ecra: "Pague por fora: é mais barato", certa: "Recuso e uso só pagamentos protegidos da plataforma.", a: "Aceito: é mais barato.", b: "Pago metade antes.", porque: "Fora da plataforma perdes a proteção do comprador." },
        s3: { texto: "Um colega diz que duplicas o dinheiro numa aplicação “de investimento”.", ecra: "Duplica em 7 dias!", certa: "Desconfio de ganhos garantidos e falo com um adulto de confiança.", a: "Invisto as minhas poupanças.", b: "Convenço os amigos a investir.", porque: "Ganhos rápidos e garantidos são um sinal clássico de fraude." },
      },
    },
  },
  "cid-pedir-ajuda": {
    titulo: { c1: "Pedir ajuda a um adulto de confiança", c23: "Pictogramas e avisos no ecrã", sec: "Riscos online e o que fazer" },
    intro: { c1: "Quando algo nos assusta online, pedimos ajuda. Sempre.", c23: "Os avisos e os ícones no ecrã dizem muito. Vamos aprender a lê-los com calma.", sec: "Saber reconhecer um risco e a quem recorrer é a melhor proteção." },
    fecho: { c1: "Fizeste bem em pedir ajuda!", c23: "Agora lês os avisos com calma e sabes a quem perguntar.", sec: "Reconhecer, parar e pedir ajuda: assim se age perante um risco." },
    situacoes: {
      c1: {
        s1: { texto: "Um jogo pede a tua morada.", ecra: "Escreve a tua morada", certa: "Não escrevo e pergunto a um adulto.", a: "Escrevo a morada.", b: "Escrevo a morada de um amigo.", porque: "A morada é tua e da tua família. Não se dá online." },
        s2: { texto: "Alguém que não conheces quer ser teu amigo no jogo.", ecra: "Pedido de amizade", certa: "Não aceito e conto a um adulto.", a: "Aceito: parece simpático.", b: "Digo-lhe onde moro.", porque: "Online, nem sempre sabemos quem é a outra pessoa." },
        s3: { texto: "Aparece um aviso: “Vírus! Carrega aqui!”", ecra: "VÍRUS! Carrega aqui!", certa: "Não carrego e chamo um adulto.", a: "Carrego depressa.", b: "Escrevo a palavra-passe.", porque: "Avisos assustadores querem que carregues sem pensar." },
      },
      c23: {
        s1: { texto: "Ao lado do endereço aparece um aviso de “ligação não segura”.", ecra: "⚠ Ligação não segura", certa: "Não escrevo dados pessoais nem palavras-passe neste sítio.", a: "Ignoro o aviso.", b: "Escrevo só o email.", porque: "O aviso diz que outros podem ver o que escreves." },
        s2: { texto: "Uma aplicação pede acesso à câmara, ao microfone e aos contactos.", ecra: "Permitir acesso?", certa: "Só permito o que a aplicação precisa para funcionar.", a: "Permito tudo.", b: "Instalo outra igual sem ver.", porque: "Permissões a mais podem expor os teus dados." },
        s3: { texto: "Alguém do jogo pede fotos tuas e diz para não contares a ninguém.", ecra: "É segredo, ok?", certa: "Não envio, bloqueio e conto a um adulto de confiança.", a: "Envio uma foto.", b: "Guardo segredo.", porque: "Pedidos de segredo são um sinal de perigo. Contar a um adulto é o certo." },
      },
      sec: {
        s1: { texto: "Recebes uma ligação para “confirmar a conta” da escola.", ecra: "Confirme a sua conta em 24 h", certa: "Entro pelo endereço oficial que conheço, nunca pela ligação.", a: "Carrego e escrevo a palavra-passe.", b: "Reencaminho aos colegas.", porque: "Mensagens com urgência e ligações estranhas são sinais de phishing." },
        s2: { texto: "Uma foto tua está a circular sem autorização.", ecra: "Partilhado 34 vezes", certa: "Guardo provas, denuncio na plataforma e falo com um adulto de confiança.", a: "Ignoro e espero que passe.", b: "Respondo a quem partilhou com ameaças.", porque: "Denunciar e pedir ajuda permite travar a partilha." },
        s3: { texto: "Um amigo parece passar a noite inteira online e está sempre cansado.", certa: "Falo com ele com calma e sugiro pedir ajuda a um adulto.", a: "Gozo com ele.", b: "Não digo nada.", porque: "Preocupar-se com o bem-estar dos outros também é segurança." },
      },
    },
  },
  "cid-hora-desligar": {
    titulo: { c1: "Hora de desligar", c23: "Tempo de ecrã e sono", sec: "Bem-estar e dependência" },
    intro: { c1: "Os ecrãs são divertidos. Mas também é preciso descansar!", c23: "O sono e as pausas ajudam a aprender. Vamos encontrar o equilíbrio.", sec: "Algumas aplicações são feitas para não as largarmos. Como manter o controlo?" },
    fecho: { c1: "Sabes quando desligar. Boa!", c23: "Equilíbrio é saber quando parar.", sec: "Usar a tecnologia sem que ela nos use: é essa a ideia." },
    situacoes: {
      c1: {
        s1: { texto: "É hora de dormir e queres jogar mais.", certa: "Desligo e vou dormir.", a: "Jogo só mais um bocadinho… muito.", b: "Levo o tablet para a cama.", porque: "Dormir bem ajuda a crescer e a aprender." },
        s2: { texto: "Estás há muito tempo no ecrã. Os olhos estão cansados.", certa: "Faço uma pausa e brinco lá fora.", a: "Continuo: não faz mal.", b: "Aproximo mais o ecrã.", porque: "As pausas descansam os olhos e o corpo." },
        s3: { texto: "Ao jantar, a família está a conversar.", certa: "Deixo o tablet e converso.", a: "Vejo vídeos à mesa.", b: "Ponho o som alto.", porque: "Os momentos em família também precisam de nós." },
      },
      c23: {
        s1: { texto: "Amanhã há teste e são 23h00. O grupo da turma não para.", certa: "Silencio o telemóvel e vou dormir.", a: "Fico a responder até tarde.", b: "Durmo com o telemóvel na almofada.", porque: "O sono é essencial para a memória e para estar bem." },
        s2: { texto: "Passaste a tarde toda num jogo e ainda não fizeste os trabalhos.", certa: "Combino um tempo de jogo e cumpro-o.", a: "Faço os trabalhos à pressa à noite.", b: "Digo que não havia trabalhos.", porque: "Gerir o tempo de ecrã ajuda a ter tempo para tudo." },
        s3: { texto: "Sentes-te mal quando vês fotos “perfeitas” dos outros.", certa: "Lembro-me que muitas fotos são editadas e faço uma pausa.", a: "Fico horas a comparar-me.", b: "Edito as minhas fotos até ficar diferente.", porque: "As redes mostram só uma parte. Cuidar de ti é mais importante." },
      },
      sec: {
        s1: { texto: "Abres uma aplicação “só 5 minutos” e passou uma hora.", certa: "Ativo limites de tempo e desligo as notificações.", a: "Não faz mal, acontece sempre.", b: "Instalo mais aplicações do mesmo tipo.", porque: "Muitas aplicações são desenhadas para prender a atenção. Os limites ajudam." },
        s2: { texto: "Um amigo diz que não consegue deixar de jogar e anda triste.", certa: "Ouço-o e sugiro falar com um adulto de confiança.", a: "Digo que é exagero.", b: "Convido-o para jogar mais.", porque: "A dependência é um problema de saúde. Pedir ajuda faz parte da solução." },
        s3: { texto: "Queres estudar, mas o telemóvel vibra a toda a hora.", certa: "Ponho o telemóvel noutra divisão enquanto estudo.", a: "Respondo a tudo entre exercícios.", b: "Estudo com vídeos a dar ao lado.", porque: "Menos distrações, mais atenção e menos cansaço." },
      },
    },
  },
  "cid-boas-maneiras": {
    titulo: { c1: "Boas maneiras na conversa online", c23: "Todos podem participar", sec: "Bolhas e câmaras de eco" },
    intro: { c1: "Online também se diz olá, obrigado e por favor.", c23: "No Largo, todos têm lugar. Online também.", sec: "Ouvir quem pensa diferente ajuda a sair das bolhas." },
    fecho: { c1: "Foste simpático com todos!", c23: "Uma conversa onde todos participam é mais rica.", sec: "Diversidade de vozes faz uma comunidade mais forte." },
    situacoes: {
      c1: {
        s1: { texto: "No chat do jogo, alguém escreve com erros.", ecra: "olá vamus jogar?", certa: "Respondo com simpatia.", a: "Gozo com ele.", b: "Escrevo tudo em maiúsculas.", porque: "Todos estamos a aprender. A simpatia faz bem." },
        s2: { texto: "A Ana fala outra língua em casa. Escreveu uma palavra diferente.", ecra: "obrigada · thank you · merci", certa: "Pergunto o que quer dizer.", a: "Rio-me.", b: "Digo que está errado.", porque: "Línguas diferentes tornam a conversa mais rica." },
        s3: { texto: "Não concordas com o Leo na conversa.", certa: "Digo a minha opinião com respeito.", a: "Insulto o Leo.", b: "Digo que ninguém gosta dele.", porque: "Podemos discordar e ser simpáticos." },
      },
      c23: {
        s1: { texto: "No fórum da turma, um colega novo ainda não falou.", ecra: "Fórum da turma", certa: "Convido-o a dar a opinião dele.", a: "Ignoro: ele que fale.", b: "Faço piadas sobre ele ser novo.", porque: "Criar espaço para todos é a base de uma comunidade." },
        s2: { texto: "Alguém escreve que “meninas não percebem de jogos”.", ecra: "meninas não percebem de jogos", certa: "Digo com calma que não é verdade e porquê.", a: "Concordo para não haver discussão.", b: "Respondo com insultos.", porque: "Estereótipos afastam pessoas. Contrariá-los com respeito ajuda." },
        s3: { texto: "A colega usa cadeira de rodas e quer participar no vídeo da turma.", certa: "Planeamos o vídeo para todos participarem.", a: "Deixamo-la a ver.", b: "Fazemos o vídeo sem lhe dizer.", porque: "Incluir é adaptar para que todos possam participar." },
      },
      sec: {
        s1: { texto: "Só segues contas que pensam como tu.", certa: "Sigo também fontes credíveis com outras opiniões.", a: "Deixo como está: assim não me chateio.", b: "Bloqueio todos os que discordam.", porque: "Câmaras de eco tornam-nos menos críticos." },
        s2: { texto: "Numa discussão online, a conversa fica agressiva.", certa: "Proponho voltar aos factos ou saio da conversa.", a: "Subo o tom.", b: "Partilho capturas para gozar.", porque: "Baixar a tensão e usar factos ajuda a conversar." },
        s3: { texto: "Uma comunidade online diz que “os outros” são todos maus.", certa: "Desconfio de generalizações e procuro conhecer outros pontos de vista.", a: "Concordo: é o meu grupo.", b: "Partilho para mais gente ver.", porque: "Generalizar sobre grupos alimenta o preconceito." },
      },
    },
  },
};
