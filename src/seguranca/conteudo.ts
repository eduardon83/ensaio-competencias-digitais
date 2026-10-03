// ─── Segurança digital: conteúdos informativos dos três temas ────────────────
// [conteúdo Kendir] Texto provisório em linguagem simples. Os contactos de ajuda devem ser confirmados antes da
// publicação. Todos os exemplos usam organizações fictícias (Banco Horizonte, Envios Já, TecnoMais...).

export type TemaSeguranca = "boas-praticas" | "fraude" | "redes-sociais";

export interface SecaoInfo {
  titulo: string;
  pontos: string[];
  exemplo?: { titulo: string; linhas: string[]; nota: string };
}

export interface ConteudoTema {
  id: TemaSeguranca;
  titulo: string;
  icone: string;
  resumo: string;
  teste: { titulo: string; descricao: string; slug: string };
  secoes: SecaoInfo[];
}

export const AJUDA: { nome: string; descricao: string }[] = [
  { nome: "Linha Internet Segura · 800 21 90 90 (gratuita)", descricao: "Apoio a crianças, jovens, pais e professores em situações de risco online, incluindo ciberbullying." },
  { nome: "CERT.PT (Centro Nacional de Cibersegurança)", descricao: "Para reportar incidentes de segurança informática, como tentativas de burla por email." },
  { nome: "Polícia Judiciária e queixa eletrónica", descricao: "Para apresentar queixa de burla, extorsão ou ameaças. Em perigo imediato, liga 112." },
  { nome: "Um adulto de confiança", descricao: "Professor, diretor de turma, pais ou encarregado de educação. Contar é sempre o primeiro passo." },
];

export const TEMAS: ConteudoTema[] = [
  {
    id: "boas-praticas",
    titulo: "Boas práticas online",
    icone: "🛡️",
    resumo: "Palavras-passe, verificação em dois passos, atualizações, redes Wi-Fi e computadores partilhados.",
    teste: { titulo: "Teste: boas práticas", descricao: "Situações do dia a dia, criar uma palavra-passe forte e deixar uma conta segura.", slug: "boas-praticas" },
    secoes: [
      {
        titulo: "Palavras-passe fortes",
        pontos: [
          "Usa pelo menos 12 caracteres. Uma frase com várias palavras é fácil de lembrar e difícil de adivinhar: por exemplo “bicicleta-azul-come-pão-às-7”.",
          "Não uses o teu nome, a data de nascimento, o nome do animal de estimação nem “123456”.",
          "Usa uma palavra-passe diferente em cada serviço. Se uma for descoberta, as outras ficam protegidas.",
          "Um gestor de palavras-passe guarda-as todas em segurança. Só precisas de decorar uma.",
          "Nunca digas a tua palavra-passe a ninguém, nem a amigos. Nenhum serviço sério ta pede por email ou SMS.",
        ],
      },
      {
        titulo: "Verificação em dois passos",
        pontos: [
          "Além da palavra-passe, pede um código enviado para o telemóvel ou gerado numa aplicação.",
          "Mesmo que alguém descubra a palavra-passe, não entra sem o código.",
          "Ativa-a no email, nas redes sociais e em tudo o que tenha dados importantes.",
          "Se receberes um código que não pediste, alguém está a tentar entrar: muda a palavra-passe.",
        ],
      },
      {
        titulo: "Computadores, telemóveis e redes",
        pontos: [
          "Instala as atualizações do sistema e das aplicações: corrigem falhas de segurança.",
          "Num computador da escola ou partilhado, termina sempre a sessão e não guardes palavras-passe no navegador.",
          "Em redes Wi-Fi públicas, evita entrar no banco ou fazer compras. Prefere os dados móveis.",
          "O cadeado na barra de endereço só quer dizer que a ligação é cifrada. Não garante que o sítio é honesto: confirma também o endereço.",
          "Bloqueia o telemóvel com código, impressão digital ou reconhecimento facial.",
          "Faz cópias de segurança dos trabalhos importantes (na nuvem ou numa pen).",
        ],
      },
      {
        titulo: "Os teus dados",
        pontos: [
          "Pensa antes de dar dados pessoais: morada, número de telefone, número de cartão de cidadão.",
          "Lê as permissões das aplicações. Uma lanterna não precisa de aceder aos teus contactos.",
          "Desconfia de formulários e concursos que pedem muitos dados em troca de um prémio.",
        ],
      },
    ],
  },
  {
    id: "fraude",
    titulo: "Exemplos de fraude",
    icone: "🎣",
    resumo: "Emails, SMS e mensagens falsas: como reconhecer uma burla e o que fazer.",
    teste: { titulo: "Teste: O Email Desconfiado", descricao: "Uma caixa de correio com mensagens verdadeiras e burlas. Descobre quais são falsas e porquê.", slug: "fraude" },
    secoes: [
      {
        titulo: "Os sinais de alerta",
        pontos: [
          "Remetente estranho: o endereço parece o verdadeiro mas tem letras trocadas ou um domínio diferente (bancohorizonte-seguranca.com em vez de bancohorizonte.pt).",
          "Ligação enganadora: o texto diz uma coisa, mas o destino real é outro. No computador, passa o rato por cima antes de clicar.",
          "Urgência e medo: “a tua conta vai ser bloqueada em 24 horas”, “última oportunidade”.",
          "Pedido de dados: palavra-passe, códigos, dados do cartão. Nenhuma entidade séria os pede assim.",
          "Prémio inesperado: ganhaste um telemóvel num concurso em que não entraste.",
          "Erros de escrita e tratamento estranho (“Caro cliente”, “Prezado usuário”).",
          "Anexos inesperados, sobretudo com extensões como .exe, .zip ou .scr.",
        ],
        exemplo: {
          titulo: "Exemplo de SMS falso",
          linhas: ["De: +351 9XX XXX XXX", "Envios Já: a sua encomenda está retida. Pague 1,99 € de taxas em envios-ja-taxas.com até hoje."],
          nota: "Sinais: número desconhecido, urgência, pagamento pequeno para parecer inofensivo e um endereço que não é o oficial.",
        },
      },
      {
        titulo: "Tipos de burla mais comuns",
        pontos: [
          "Phishing: emails que imitam bancos, escolas, lojas ou serviços para roubar palavras-passe.",
          "Smishing: o mesmo por SMS (falsas encomendas, multas, pagamentos).",
          "“Olá mãe, olá pai”: alguém diz que é um filho com número novo e pede dinheiro com urgência.",
          "Lojas falsas: preços demasiado baixos, sem morada nem contactos, pagamento só por transferência.",
          "Falsos apoios técnicos: uma chamada ou aviso diz que o computador tem vírus e pede acesso remoto.",
          "Investimentos milagrosos: ganhos garantidos e rápidos, muitas vezes com figuras públicas falsificadas.",
        ],
      },
      {
        titulo: "O que fazer",
        pontos: [
          "Não cliques na ligação e não abras o anexo.",
          "Confirma pelo canal oficial: escreve tu o endereço do sítio, usa a aplicação oficial ou liga para o número que já conheces.",
          "Se já deste dados, muda logo a palavra-passe e avisa o banco ou o serviço.",
          "Apaga a mensagem e, se puderes, denuncia-a como spam ou phishing.",
          "Conta a um adulto de confiança. Cair numa burla não é vergonha: acontece a qualquer pessoa.",
        ],
      },
    ],
  },
  {
    id: "redes-sociais",
    titulo: "Redes sociais",
    icone: "💬",
    resumo: "Privacidade, pegada digital, ciberbullying, contactos desconhecidos e desinformação.",
    teste: { titulo: "Teste: Verdade ou Boato?", descricao: "Verifica publicações com ferramentas de pesquisa e decide o que fazer em situações nas redes sociais.", slug: "redes-sociais" },
    secoes: [
      {
        titulo: "Privacidade e pegada digital",
        pontos: [
          "Põe o perfil em privado e escolhe quem pode ver as tuas publicações.",
          "Desliga a partilha da localização em tempo real.",
          "O que publicas fica: pode ser copiado, guardado e visto anos depois, até por futuros empregadores.",
          "Antes de publicar uma fotografia de outra pessoa, pede-lhe autorização.",
          "Em Portugal, a idade mínima para dares consentimento sozinho a uma rede social é 13 anos. Abaixo disso, é preciso autorização dos pais.",
        ],
      },
      {
        titulo: "Ciberbullying",
        pontos: [
          "Insultos, ameaças, boatos ou fotografias partilhadas para humilhar alguém são ciberbullying.",
          "Não respondas na mesma moeda. Guarda provas (capturas de ecrã), bloqueia e denuncia na rede social.",
          "Conta a um adulto de confiança ou liga para a Linha Internet Segura.",
          "Se vires acontecer a outra pessoa, não partilhes e apoia-a: o silêncio de quem vê também conta.",
        ],
      },
      {
        titulo: "Contactos desconhecidos",
        pontos: [
          "Nem todos são quem dizem ser. Um perfil com fotografias bonitas e poucos amigos pode ser falso.",
          "Nunca envies fotografias íntimas nem dados pessoais a quem conheceste online.",
          "Desconfia de quem pede segredo, oferece presentes ou insiste em falar só em privado.",
          "Se alguém te propuser um encontro, fala primeiro com um adulto e nunca vás sozinho.",
        ],
      },
      {
        titulo: "Desinformação: verdade ou boato?",
        pontos: [
          "Lê mais do que o título. Títulos alarmistas querem cliques, não informar.",
          "Vê quem publicou: é uma fonte conhecida? A conta é recente? Tem histórico?",
          "Confirma a data: uma notícia antiga pode ser partilhada como se fosse de hoje.",
          "Procura a mesma informação noutras fontes fiáveis. Se nenhuma fala disso, desconfia.",
          "Faz uma pesquisa pela imagem: muitas fotografias são verdadeiras mas de outro lugar ou de outro ano.",
          "Na dúvida, não partilhes.",
        ],
      },
    ],
  },
];
