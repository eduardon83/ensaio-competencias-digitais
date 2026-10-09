// ─── Segurança digital: conteúdos informativos dos seis temas ────────────────
// [conteúdo Kendir] Texto provisório em linguagem simples. Os contactos de ajuda devem ser confirmados antes da
// publicação. Todos os exemplos usam organizações fictícias (Banco Horizonte, Envios Já, TecnoMais...).

import type { NomeIcone } from "../componentes/Icone";

export type TemaSeguranca = "boas-praticas" | "fraude" | "redes-sociais" | "privacidade" | "publicos" | "familia";

export interface SecaoInfo {
  titulo: string;
  pontos: string[];
  exemplo?: { titulo: string; linhas: string[]; nota: string };
}

export interface ConteudoTema {
  id: TemaSeguranca;
  titulo: string;
  icone: NomeIcone;
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
    icone: "escudoCerto",
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
    icone: "anzol",
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
    icone: "mensagem",
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
  {
    id: "privacidade",
    titulo: "Privacidade e navegação",
    icone: "bussola",
    resumo: "Ler endereços, cookies, permissões, navegação privada, transferências e limpar os dados do navegador.",
    teste: { titulo: "Teste: O Endereço Certo", descricao: "Escolhe a ligação oficial entre endereços parecidos, decide que permissões dar e o que fazer ao navegar.", slug: "privacidade" },
    secoes: [
      {
        titulo: "Ler um endereço",
        pontos: [
          "O que conta é o nome imediatamente antes da primeira barra /. Em “www.bancohorizonte.pt/entrar” o sítio é bancohorizonte.pt.",
          "Em “bancohorizonte.pt.verificar-conta.com/entrar” o sítio é verificar-conta.com: o nome do banco no início é só uma máscara.",
          "Desconfia de letras trocadas por algarismos (0 em vez de o, 1 em vez de l) e de palavras a mais (-seguranca, -premios, -login).",
          "Para sítios importantes (banco, escola, email), escreve tu o endereço ou usa um marcador guardado.",
          "Nos resultados de pesquisa, “Patrocinado” quer dizer anúncio. Alguns anúncios imitam sítios verdadeiros.",
        ],
        exemplo: {
          titulo: "Qual é o sítio verdadeiro?",
          linhas: ["www.bancohorizonte.pt/entrar ✔ bancohorizonte.pt", "conta.bancohorizonte.pt/entrar ✔ bancohorizonte.pt", "bancohorizonte.pt.verificar-conta.com/entrar ✘ verificar-conta.com", "banc0horizonte.pt/entrar ✘ banc0horizonte.pt"],
          nota: "O domínio principal é o que fica imediatamente antes da primeira barra. Tudo o que está à esquerda dele pode ser escolhido por quem criou o sítio.",
        },
      },
      {
        titulo: "Cookies, rastreio e permissões",
        pontos: [
          "Os cookies necessários fazem o sítio funcionar. Os outros servem sobretudo para seguir o que fazes e mostrar publicidade: podes recusá-los.",
          "Quando um sítio pede a localização, a câmara, o microfone ou notificações, pergunta: precisa mesmo disto para fazer o que eu quero?",
          "Revê de vez em quando as permissões nas definições do navegador e retira as que já não fazem falta.",
          "Dá só os dados indispensáveis. Um jogo grátis não precisa da tua morada.",
        ],
      },
      {
        titulo: "Navegar com cuidado",
        pontos: [
          "A navegação privada não guarda o histórico neste dispositivo, mas os sítios, a escola ou a rede continuam a ver o que fazes.",
          "Descarrega programas só do sítio oficial de quem os faz ou da loja de aplicações do sistema.",
          "Instala poucas extensões no navegador e só de quem conheces. Uma extensão com acesso a tudo pode ler o que escreves.",
          "Avisos a piscar a dizer que o computador tem vírus são burlas: fecha a página.",
          "Se o navegador avisar que a ligação não é privada, volta atrás.",
          "Mantém o navegador atualizado.",
        ],
      },
      {
        titulo: "Limpar os dados do navegador",
        pontos: [
          "Limpar o histórico, os cookies e os dados guardados é uma boa prática, sobretudo num computador partilhado.",
          "Na maior parte dos navegadores: Definições, Privacidade, Limpar dados de navegação. O atalho Ctrl+Shift+Delete (no Mac, Cmd+Shift+Delete) abre o mesmo menu.",
          "Escolhe o período (por exemplo, “Desde sempre”) e o que queres apagar: histórico, cookies e dados de sítios, imagens e ficheiros em cache.",
          "Atenção: ao apagar os cookies e os dados de sítios, terminas as sessões e apagas o que os sítios guardaram no navegador, como o progresso em jogos e os resultados guardados localmente.",
        ],
      },
    ],
  },
  {
    id: "publicos",
    titulo: "Computadores e Wi-Fi públicos",
    icone: "wifi",
    resumo: "Bibliotecas, cafés, estações e computadores da escola: redes falsas, sessões abertas, pens e carregadores.",
    teste: { titulo: "Teste: Na Biblioteca", descricao: "Escolhe a rede Wi-Fi certa, deixa o computador público como o encontraste e decide o que fazer fora de casa.", slug: "publicos" },
    secoes: [
      {
        titulo: "Redes Wi-Fi públicas",
        pontos: [
          "Confirma o nome exato da rede com o espaço (cartaz, talão, funcionário). Redes com nomes quase iguais podem ser armadilhas.",
          "Numa rede pública não sabes quem a gere nem quem está ligado. Deixa o banco e as compras para os dados móveis ou uma rede de confiança.",
          "Confirma que os sítios usam https e que o endereço é o oficial.",
          "Desliga a ligação automática a redes abertas e, quando saíres, esquece a rede.",
          "Desliga a partilha de ficheiros e o Bluetooth quando não precisares.",
        ],
      },
      {
        titulo: "Computadores públicos e partilhados",
        pontos: [
          "Não guardes palavras-passe no navegador. Recusa sempre quando ele perguntar.",
          "Usa a navegação privada, se o computador deixar.",
          "Cuidado com quem está atrás de ti quando escreves a palavra-passe.",
          "Não guardes trabalhos no ambiente de trabalho do computador: usa a tua pen ou a tua nuvem.",
        ],
      },
      {
        titulo: "Antes de sair",
        pontos: [
          "Termina a sessão em todas as contas (email, plataforma da escola, redes sociais). Fechar o separador não chega.",
          "Apaga o que descarregaste da pasta Transferências e esvazia a reciclagem.",
          "Fecha todas as janelas do navegador.",
          "Retira a pen.",
        ],
      },
      {
        titulo: "Pens e carregadores",
        pontos: [
          "Não ligues pens encontradas: entrega-as a quem gere o espaço.",
          "Nas estações de carregamento públicas, prefere o teu carregador numa tomada. Se o telemóvel perguntar se confias no dispositivo, recusa.",
        ],
      },
    ],
  },
  {
    id: "familia",
    titulo: "Família e controlo parental",
    icone: "familia",
    resumo: "Porque é importante viver a internet em família: conversar, combinar regras e usar o controlo parental.",
    teste: { titulo: "Teste: O Acordo da Família", descricao: "Mitos e factos, um painel de controlo parental para configurar em família e situações para decidir.", slug: "familia" },
    secoes: [
      {
        titulo: "Porque é importante",
        pontos: [
          "Na internet há coisas ótimas e algumas que magoam, assustam ou enganam. Ninguém tem de lidar com isso sozinho.",
          "Quando pais e filhos falam sobre o que fazem online, é mais fácil pedir ajuda cedo, antes de um problema crescer.",
          "Os pais aprendem com os filhos (jogos, aplicações, redes) e os filhos aprendem com os pais (cuidado, bom senso, limites).",
          "Contar a um adulto quando algo corre mal não é fazer queixinhas: é proteger-te a ti e aos outros.",
        ],
      },
      {
        titulo: "O que o controlo parental faz e não faz",
        pontos: [
          "Filtra conteúdos impróprios, limita o tempo de ecrã, pede autorização para compras e para instalar aplicações.",
          "Existe no sistema do telemóvel, do tablet e do computador, nas consolas, em muitas aplicações e no router de casa.",
          "Nenhum filtro é perfeito: alguns conteúdos passam e alguns bons ficam bloqueados.",
          "Não substitui a conversa. Funciona melhor quando as regras são explicadas e combinadas, e não usadas como castigo.",
          "Deve mudar com a idade: mais autonomia à medida que a criança cresce e mostra que sabe decidir.",
        ],
      },
      {
        titulo: "Um acordo da família",
        pontos: [
          "Combinem por escrito onde e quando se usam ecrãs (por exemplo, nada às refeições nem no quarto à noite).",
          "Que jogos e aplicações são adequados. A classificação PEGI (3, 7, 12, 16, 18) indica a idade mínima.",
          "Que dados nunca se partilham: morada, escola, fotografias, palavras-passe.",
          "Que compras precisam de autorização.",
          "O que fazer quando algo corre mal: contar logo, sem medo de castigo.",
          "As regras valem para todos: os adultos também dão o exemplo.",
          "Revejam o acordo de tempos a tempos.",
        ],
      },
      {
        titulo: "Para pais e encarregados de educação",
        pontos: [
          "Naveguem juntos, sobretudo com crianças pequenas. Perguntem que jogos e aplicações usam e experimentem-nos.",
          "Configurem o controlo parental com a criança, explicando cada opção.",
          "Ativem a autorização de compras e desliguem as mensagens de desconhecidos nos jogos.",
          "Antes de publicar fotografias dos filhos, perguntem-lhes. Também têm direito à sua imagem.",
          "Reajam com calma quando a criança conta um problema. Se contar trouxer castigo, da próxima vez não conta.",
          "Em caso de dúvida, a Linha Internet Segura (800 21 90 90) também apoia pais e educadores.",
        ],
      },
    ],
  },
];
