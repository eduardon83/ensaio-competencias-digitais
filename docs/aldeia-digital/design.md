# Aldeia Digital · Orientações de desenho (v0.3, 2026-10-14)

Para o agente ou equipa de arte e UI. Não escrever código.
Estado: implementado na v1.1.0. **O que a aplicação faz de facto (e as diferenças para este documento) está na secção 17**; a narrativa e os vídeos na 18 e em `HISTORIA.md`.
Estrutura do modo: `ESPECIFICACAO.md`. Missões de cidadania: `CURRICULO.md`. Identidade atual do ECD: `design/pacote-video/tokens.json` e `src/styles/app.css`.

## 1. Direção geral

- Uma **aldeia pequena, isométrica e acolhedora**, com o espírito dos jogos de aventura portáteis: ruas, casas, árvores, um largo, gente a passear.
- Personagens **redondas, simpáticas e expressivas**, ao estilo das apps de turma para crianças: formas simples, olhos grandes, poucas linhas.
- Público: 6 a 15 anos como núcleo, sem parecer infantil para o 3.º ciclo. Tom: caloroso, curioso, nunca assustador. Os riscos digitais mostram-se como situações a resolver com calma, nunca com medo.
- **Originalidade obrigatória.** Inspiração de género, não cópia: nenhuma personagem, criatura, edifício, interface, letra ou paleta reconhecível de Pokémon, ClassDojo ou outros jogos. Nenhuma marca real, rede social real ou pessoa real.
- Toque português discreto: calçada, telhados de telha, azulejo numa fachada, laranjeira, ninho de cegonha numa chaminé, coreto no largo, Junta de Freguesia. Sem caricaturas.
- A aldeia é um lugar de **crianças e escola**: crianças a brincar, mochilas, bicicletas, pais à porta da escola. Não é um escritório nem uma cidade de adultos.

## 2. Estilo gráfico

Proposta: **vetorial plano com sombreado suave** (2 a 3 tons por cor, sombra simples, contorno fino na cor escura do próprio objeto, nunca preto puro).
Alternativa a decidir: pixel art isométrica, com as mesmas regras de grelha e escala.

## 3. Grelha isométrica

- Projeção 2:1. Mosaico base **128 × 64 px** a 1×; exportar também a 2×.
- Origem dos objetos: centro da base no chão (para a ordem de profundidade).
- Altura de um piso: 64 px. Edifícios do núcleo: 2 a 3 pisos. Casas: 1 piso + telhado.
- Pegadas: Escola 4×3, Jornal 3×3, Laboratório 3×3, casas 2×2, expansão 3×3, Largo 4×4, Horta 3×2.
- Mapa: cerca de 40 × 40 mosaicos. Bairro com **32 lotes** de 2×2; lote vazio = jardim com variações.
- Luz de cima à esquerda. Sombras para baixo à direita, 30 % de opacidade.

## 4. Paleta

- Mundo: paleta própria, quente e equilibrada (relva, calçada ocre, telha, céu, água).
- **Interface** por cima do mapa usa os tokens do ECD (Mosaico e Original, claro e escuro). Não inventar cores de UI.
- Tema escuro: a aldeia passa a fim de tarde (janelas acesas), não a preto.
- Contraste reforçado: contornos mais grossos nos objetos interativos, etiquetas com fundo sólido.
- Estados nunca só por cor: missão = ícone + etiqueta; bloqueado = cadeado + tom dessaturado; concluído = visto + bandeirola.

## 5. Avatares

### 5.1 Base
- Criança com **fato de animal** (pijama inteiro com capuz). O capuz tem a cara do animal; a cara da criança aparece por baixo.
- Proporção de 2,5 cabeças. Altura em jogo cerca de 96 px a 1×.
- 6 tons de pele, 6 cabelos visíveis à frente do capuz (franja, caracóis, tranças, curto, rapado, com lenço). Sem associar a género.
- Óculos de ver disponíveis desde o início (identidade, não prémio).
- 4 direções diagonais; as da esquerda podem ser espelho.

### 5.2 Fatos (animais)
Pelo menos 32, um por lugar, cada um reconhecível em silhueta. Lista com género gramatical (para os nomes anónimos):

| Masculino | Feminino |
|---|---|
| o Dinossauro (pela Lourinhã) | a Andorinha |
| o Lince | a Raposa |
| o Lobo | a Coruja |
| o Golfinho | a Tartaruga |
| o Esquilo | a Baleia |
| o Polvo | a Abelha |
| o Ouriço | a Girafa |
| o Coelho | a Lontra |
| o Gato | a Zebra |
| o Cão | a Rã |
| o Urso | a Foca |
| o Panda | a Joaninha |
| o Pinguim | a Lula |
| o Leão | a Gaivota |
| o Tigre | a Lebre |
| o Elefante | a Ovelha |
| o Camaleão | a Formiga |
| o Dragão | a Toupeira |

Retirados da primeira lista por risco de alcunha de troça: burro, vaca, sardinha. Rever a lista final com crianças.

### 5.3 Adjetivos para nomes anónimos
Sempre com as duas formas: Charmoso/a, Corajoso/a, Curioso/a, Atento/a, Sábio/Sábia, Criativo/a, Engenhoso/a, Simpático/a, Sereno/a, Destemido/a; invariáveis: Veloz, Alegre, Gentil, Brilhante, Feliz.
Sem adjetivos sobre corpo, aparência ou inteligência.

### 5.4 Cosmética desbloqueável
| Categoria | Exemplos | Mínimo v1 |
|---|---|---|
| Cor do fato | 8 cores, depois padrões (riscas, pintas, estrelas) | 8 + 4 |
| Chapéu | boné de repórter, chapéu de explorador, coroa de papel, capacete de obra | 8 |
| Óculos de estilo | sol, laboratório | 4 |
| Mochila | escolar, de cartão com asas, de livros | 6 |
| Objeto na mão | microfone de repórter, lupa, tubo de ensaio, lápis gigante | 6 |
| Calçado | botas de chuva, ténis, pantufas | 4 |
| Emblemas | um por competência (carimbos) | 13 |
| Fato da festa | final da história | 1 |

Camadas (ordem): corpo e fato, cara e cabelo, calçado, mochila (atrás ou à frente), emblemas, objeto, óculos, chapéu, capuz.

### 5.5 Animações
| Animação | Fotogramas | Uso |
|---|---|---|
| Parado (respirar, piscar) | 8 | sempre |
| Andar | 8 por direção | mapa |
| Acenar | 8 | chegar, à porta de casa |
| Celebrar | 10 | missão, desbloqueio |
| Pensar | 6 | à porta de um edifício |
| Vamos outra vez | 6 | abaixo de 50, leve, nunca choro |
| Dormir | 6 | aluno inativo, à porta de casa |
| Vestir (rodopio) | 8 | guarda-roupa |
| **Nascer** | ver 6 | primeira entrada |

12 fps. Todas com versão estática para o modo calmo.

## 6. Nascimento do avatar

Momento central da primeira entrada. Acontece depois de escrever o nome (pelo aluno ou pelo encarregado de educação) e escolher o fato.

### 6.1 Narrativa (texto proposto, frases curtas)
1. Ecrã do ninho, ao entardecer, à porta da futura casa. A **Dona Cegonha**, carteira da aldeia, pousa um ovo num ninho de mantinha.
   Dona Cegonha: “Olá! Chegou uma encomenda especial para a aldeia.”
2. O nome aparece numa etiqueta presa ao ovo: “Para: Dinossauro Charmoso”.
   Dona Cegonha: “**O teu avatar vai nascer!** Ajuda-o a sair.”
3. O aluno toca no ovo (ou carrega em Espaço/Enter) **3 vezes**. A cada toque: abana, aparece uma racha, brilho suave. Indicação: “Toca no ovo” com contador 1, 2, 3.
4. O ovo abre. O avatar sai, espreguiça-se e acena.
   Dona Cegonha: “Bem-vindo à Aldeia Digital! Esta é a tua casa.”
5. Passa para a personalização da cara e do cabelo, depois “Guarda o teu nome”, depois o tutorial.

### 6.2 O ovo
- “Ovinho fofinho”: oval redondinho, tons pastel, superfície macia com textura leve de tecido, padrão do animal escolhido (pintas da joaninha, riscas da zebra, escamas do dinossauro), laço ou etiqueta de papel.
- Ninho: mantinha de lã às riscas dentro de uma cestinha. Brilhos e corações pequenos à volta.
- 3 estados de racha + abertura (topo salta como uma tampa).

### 6.3 Animação
| Passo | Duração | Notas |
|---|---|---|
| Cegonha chega e pousa o ovo | 1,5 s | voo suave, sem sustos |
| Ovo à espera | ciclo 1 s | balanço leve |
| Toque 1, 2, 3 | 0,6 s cada | abanar + racha + brilho |
| Abertura | 1,2 s | tampa salta, luz quente, confettis discretos |
| Avatar sai e acena | 1,5 s | usa “Acenar” |

- Modo calmo: 4 imagens fixas (ovo, racha, ovo aberto, avatar) com botão “Abrir o ovo”. Sem brilhos a piscar.
- Som opcional (desligado por omissão): toque suave, “pop” da abertura.
- O avatar nasce sempre contente. Nada pode correr mal neste momento.

## 7. Tutorial inicial

Guia: a Dona Cegonha (e, quando aparece o edifício, a personagem de lá). 8 passos curtos, saltável, repetível em “Ajuda”. Cada passo: balão com 1 ou 2 frases, destaque do sítio de que fala, botões “Ouvir”, “Continuar” e “Saltar tutorial”.

| Passo | Destaque no ecrã | Texto proposto |
|---|---|---|
| 1 A tua casa | casa do aluno | “Esta casa é só tua. Aqui mudas de roupa e guardas os teus troféus.” |
| 2 Andar | avatar e botão Mapa em lista | “Toca num sítio para andar. Também podes usar as setas. Ou abre a lista de lugares.” |
| 3 Os edifícios | Escola, Jornal, Laboratório (e os outros “em obras”) | “Na Escola começa a história. No Jornal escreves notícias. No Laboratório fazes experiências. Os outros abrem mais tarde.” |
| 4 Missões e capítulos | ícone “!” por cima de um edifício | “O ponto de exclamação mostra uma missão. Faz as missões para avançar na história. Podes repetir para melhorar.” |
| 5 Prémios | guarda-roupa e parede dos troféus | “Cada missão dá um prémio. Com 85 pontos ganhas um carimbo e um troféu para a casa.” |
| 6 Os teus dados | cadeado e cartão do nome | “Não pedimos email nem palavra-passe. O teu nome e o teu progresso ficam neste computador e numa caixa segura da aldeia. Só tu e o teu professor veem os teus resultados. No fim do ano, tudo é apagado. Num computador da escola, carrega em Sair no fim.” |
| 7 Ajudas | botões Ouvir e Definições | “Se precisares, posso ler em voz alta. Também podes aumentar a letra ou parar as animações.” |
| 8 Primeira missão | Escola com “!” | “Vamos à Escola? A primeira missão está à tua espera.” |

Versões de texto por ciclo (1.º ciclo mais curto; 3.º ciclo e secundário um pouco mais completo). Todos os textos ficam no sistema de textos, nunca na imagem.

## 8. Casas

- Exterior (lote 2×2): paredes, telhado, porta, janelas, caixa do correio com o nome (texto da UI), jardim, cerca, bandeira com o animal do fato.
- Personalização exterior: paredes (8 cores), telhado (6), porta (6), jardim (flores, horta, baloiço, árvore).
- Interior: sala isométrica 6×6. Chão, papel de parede, janela, mobília (cama, secretária com computador, estante, tapete, candeeiro, planta), **parede dos troféus** e **moldura** com o Jornal da Aldeia no fim.
- Mobília colocada em grelha, com alternativa por lista (sem arrastar).
- Interior só visível pelo próprio aluno. Colegas veem só a fachada.

## 9. Edifícios

Estados: em obras (andaimes), aberto, com missão nova (ícone), concluído (bandeirola), festivo (final).

| Edifício | Notas |
|---|---|
| Escola | o maior; relógio, recreio com campo, portão com pais e crianças |
| Redação do Jornal | montra com a capa da edição, quadro de ardósia, secretárias e uma rotativa pequena |
| Laboratório | cúpula de vidro, estufa ao lado, fumo colorido suave |
| Biblioteca | escadaria, janelas em arco, bancos de leitura |
| Arquivo | portas grandes, caixas e pastas |
| Junta de Freguesia e Correios | torre pequena, marco do correio genérico, bandeira inventada, ninho da Dona Cegonha |
| Centro de Segurança Digital | edifício claro e moderno, símbolo inventado de escudo com estrela |
| Mercado | bancas com toldos às riscas, balança |
| Oficina dos Robôs | portão de garagem, robô de limpeza adorável à porta |
| Museu | fachada clássica pequena, porta com fechadura grande |
| Largo e Torre do Relógio | fonte, coreto, bancos, grinaldas que se acendem com o objetivo coletivo |
| Horta e Ecoponto | canteiros, contentores de reciclagem coloridos, oficina de reparação |

Interiores: um fundo ilustrado por edifício atrás do cartão da missão, com as personagens.

## 10. Personagens (NPC)
- Moradores dos cenários atuais: Diretora Graça, Tomé, Lia, Sr. Prazo (Jornal); Doutora Inês, Rui, Marta, O Cronómetro (Laboratório).
- Novos: **Dona Cegonha** (carteira e guia), Professora ou Professor da Escola, Bibliotecária, Presidente da Junta, Robô de limpeza (centro do mistério, adorável, nunca vilão), uma família da aldeia (para as missões de Saúde e família).
- Cada um: corpo em 2 direções e retrato com 4 expressões (neutra, contente, preocupada, surpreendida).
- Diversidade de idade, tom de pele e corpo. Uma personagem em cadeira de rodas, sem que isso seja tema.

## 11. Missões de cidadania (ilustrações)
- Cada missão é uma **cena ilustrada da aldeia** com 3 a 5 situações e escolhas (ver `CURRICULO.md` 4).
- Por situação: 1 ilustração (16:9, 1280 × 720 a 1×) com a personagem e o problema; o ecrã simulado (mensagem, publicação, aviso) é desenhado como objeto da aldeia, não como cópia de uma app real.
- As mesmas ilustrações servem o “Treinar aqui” depois de concluída a missão.
- Sem texto dentro das ilustrações (balões e ecrãs simulados recebem texto da UI por cima).

## 12. Interface sobre o mapa

- **HUD**: mini avatar e nome, capítulo com barra de progresso, botões Mochila, Casa, Mapa em lista, Ajuda, Definições, Sair. Alvos ≥ 44 px (56 com Botões grandes).
- **Balão de diálogo** em baixo, até 720 px: retrato, nome, texto ≥ 18 px, “Ouvir”, “Continuar”. Escrita letra a letra só se for possível saltar e desliga no modo calmo.
- **Marcadores**: ícone + etiqueta da UI.
- **Cartão da missão**: título, personagem, briefing, nível, duração, “Começar”. Depois abre o ecrã normal do ECD.
- **Desbloqueio**: item, avatar a celebrar, “Vestir agora” e “Depois”.
- **Guarda-roupa**: avatar grande a rodar, categorias em separadores, itens com nome; bloqueados com cadeado e “o que falta”.
- **Jornal da Aldeia** (final): capa de jornal com o avatar em destaque, título com o nome, perfil de competências e de cidadania. Exportável como imagem.
- **Sair deste computador**: botão claro no fim de cada sessão e no menu.

## 13. Ecrãs do professor

Seguem o estilo atual do ECD (Mosaico/Original).

### 13.1 Escolha de modo na página Professor
- Dois cartões grandes lado a lado (empilhados no telemóvel): **Teste de Competências** e **Aldeia Digital**.
- Cada cartão: ilustração pequena (folha de prova; casinhas da aldeia), título, uma frase, espaço para vídeo curto (miniatura com botão de reproduzir).
- Escolhido: borda grossa, fundo `--acento-suave`, visto e a palavra “Escolhido”. Não escolhido: borda fina.
- Por baixo, os blocos do modo escolhido aparecem com uma transição curta (sem animação no modo calmo).

### 13.2 Painel da Aldeia
- Cabeçalho: nome da turma, código da turma, estado (aberta, data de fim), botão “Projetar código”.
- Faixa de **alertas** (cartões com ícone e frase: “3 alunos sem atividade há 7 dias”).
- Miniatura da aldeia com casas coloridas por estado e lista equivalente.
- Separadores: Turma, Missões, Competências, Cidadania, Relatórios, Definições.

### 13.3 Relatórios
- **Progresso**: barras por capítulo, faixas por competência, lista “Quem precisa de apoio”, tabela por aluno.
- **Conclusão**: perfil da turma, gráfico primeira vs melhor por competência, perfil de cidadania, “Para treinar” agrupado, nota PADDE.
- PDF com a mesma ordem, cabeçalho do ECD, sem ilustrações pesadas.

### 13.4 Emails (modelo visual)
- Simples e legível em qualquer cliente: logotipo pequeno, título (“Resumo semanal da Aldeia · 5.º B”), 3 a 5 números grandes, lista de alertas, botão “Abrir o painel”, rodapé com “Deixar de receber” e a frase de privacidade.
- Sem imagens obrigatórias (o email lê-se com imagens bloqueadas). Texto alternativo em todas.

## 14. Acessibilidade no desenho
- Nenhum texto dentro das imagens.
- Contraste 4,5:1 em todo o texto da UI; foco visível nos objetos do mapa (`--foco`).
- Estados com forma e ícone; testar com simulação de daltonismo.
- Movimento subtil e desligável; nada a piscar mais de 3 vezes por segundo.
- Avatar e itens com nome em texto (ex.: “Fato de lince, boné de repórter azul, mochila de livros”).

## 15. Entregáveis

1. Folha de estilo: paleta, luz, contorno, materiais.
2. Avatar base (4 direções, 6 tons de pele, 6 cabelos).
3. 32 fatos (primeiro em silhueta para validar).
4. Cosmética mínima (5.4).
5. Animações (5.5) para o avatar base e 1 fato de teste.
6. **Nascimento**: Dona Cegonha (voo e pouso), ninho, ovo com 32 padrões, 3 racha + abertura, versão estática.
7. **Tutorial**: 8 ecrãs com destaques.
8. Casa: exterior com variações e interior com mobília mínima.
9. Edifícios do núcleo em todos os estados; expansão em esboço.
10. Mosaicos do chão, ruas, calçada, relva, água, árvores, adereços.
11. NPC com retratos.
12. Ilustrações das missões de cidadania do 1.º grupo (1.º ciclo primeiro).
13. Maquetas: mapa com HUD, diálogo, cartão da missão, guarda-roupa, casa, desbloqueio, Mapa em lista, Jornal da Aldeia, Professor com os dois modos, painel, relatórios, email. Desktop 1280 e telemóvel 390, claro e escuro.

### Formatos e nomes
- Fonte: SVG por objeto e camada. Exportação: PNG em folhas de sprites 1× e 2× com atlas JSON.
- Nomes em português, minúsculas, com hífen: `avatar-fato-lince-andar-se-01.png`, `edificio-escola-concluido.svg`, `nascimento-ovo-zebra-racha-2.svg`.
- Orçamento: aldeia completa ≤ 1,5 MB comprimido; cada fato ≤ 60 kB a 1×; nascimento ≤ 200 kB.

## 16. Fora de âmbito desta fase
Música, colegas a andar em tempo real, loja e moeda, outras histórias.

## 17. O que a aplicação faz (v1.1.0): implementado vs. este documento

A v1.1.0 implementa este documento com o pacote de arte v1.1 (`design/aldeia-digital/`). Quase tudo bate certo; o que mudou ou ficou de fora está aqui. **Para produzir vídeos, vale esta secção e as capturas**, não as maquetas.

Capturas dos ecrãs reais (desktop 1280 e telemóvel 390, claro e escuro): `design/aldeia-digital/implementado/` (só locais, fora do Git). Voltar a gerar com `npm run dev` e:
`node scripts/aldeia/percurso.mjs http://localhost:5180 design/aldeia-digital/implementado/aldeia`, `node scripts/aldeia/percurso-premios.mjs … implementado/aldeia` e `node scripts/aldeia/capturas-ecd.mjs … implementado/ecd`.

### 17.1 Decisões que mudam o que se vê

| Tema | Neste documento | Na aplicação |
|---|---|---|
| Estilo | vetorial (proposta) ou pixel | **pixel art** do pacote, 1 px de arte = 2 px no ecrã, escala inteira |
| Fatos | 32 | **68**: 36 "Animais de hoje" e 32 "Animais de antigamente"; o professor escolhe a coleção ou deixa escolher |
| Avatar | 96 px | **88 px** a 1× (célula 44 × 64); o chapéu fica por cima do capuz |
| Nascimento | ovo pequeno | nascimento v2: a cegonha entrega a trouxa, o ovo é grande, o avatar sai de dentro, salta para o chão e acena; a tampa pousa virada à direita |
| Objetivo coletivo | por decidir | 3 em cada 4 alunos acabam o capítulo do meio da história: o Largo fica em festa (grinaldas) e todos ganham o troféu "Ajudante da aldeia" |
| Desbloqueios | marcos | só marcos, sem moeda nem loja (tabela 17.5) |

### 17.2 Percurso do aluno, ecrã a ecrã

1. **Entrada** (`/aldeia`): campo "Código da turma" (`XXX·XXXX`) e, se houver, "Neste computador: Continuar como …" com a cabeça do fato. `/codigo` também aceita o código da turma.
2. **Como te queres chamar?** Só as formas que o professor permitiu: número de turma, primeiro nome, ou **3 nomes de animal** propostos (cabeça do animal + nome, "Outros nomes" sorteia outros). Caixa "Noutro computador? Escreve o mesmo código e o mesmo nome."
3. **Escolhe o teu fato**: grelha de cabeças (64 px) com o nome; os ocupados aparecem tracejados com "Já tem dono"; o fato do nome de animal vem marcado. Os extintos com nota (ex.: Lourinhanossauro, "Descoberto na Lourinhã, Portugal").
4. **Nascimento**: cena 200 × 120 nativa, entardecer (tema escuro: céu lilás). A Dona Cegonha diz "Olá! Chegou uma encomenda especial para a aldeia." e depois "O teu avatar vai nascer! Ajuda-o a sair." Etiqueta "Para: {nome}" junto ao ovo. Botão "Toca no ovo · 1 de 3" (também tocar no ovo, Espaço ou Enter). Depois: "Bem-vindo(a) à Aldeia Digital! Esta é a tua casa." Caixa "Som" (desligada por omissão). Modo calmo: 4 imagens e "Abrir o ovo · n de 3".
5. **Como é o teu avatar?** Avatar a rodar (animação "vestir"), escolhas em pastilhas: 6 tons de pele, 6 cabelos (franja, caracóis, tranças, curto, rapado, lenço), 4 cores de cabelo (o lenço tem 4 padrões), óculos de ver (sem, redondos, retangulares). "Está pronto".
6. **Guarda o teu nome**: cartão com o avatar a acenar, o código da turma grande, o nome e o endereço; "Guardar imagem", "Imprimir", "Já guardei".
7. **Tutorial na aldeia** (8 passos, Dona Cegonha em balão no fundo do ecrã, "Passo n de 8 · título"): o resto do mapa escurece e o alvo ganha contorno `--foco` (magenta no Mosaico). Alvos: 1 a casa; 2 o avatar e o botão Lista; 3 Escola, Jornal e Laboratório; 4 a Escola com o "!"; 5 Mochila e Casa; 6 o cartão do aluno; 7 Ajuda e Definições; 8 a Escola. "Vamos!" fecha e o avatar anda até à Escola. Repete-se em Ajuda → "Ver o tutorial outra vez".
8. **Aldeia** (ecrã inteiro, sem cabeçalho): HUD em cima. À esquerda, cartão com cabeça, nome, "Capítulo n · título" e barra do capítulo. À direita, botões **Mochila, Casa, Lista, Jornal, Ajuda, Definições, Sair** (o Jornal é novo). No telemóvel, os botões ficam só com ícone, numa fila por baixo do cartão. Indicação "A guardar…" ou "Por guardar: sem rede" quando há operações por enviar.
9. **Mapa**: câmara segue o avatar; edifícios do núcleo (Escola, Jornal, Laboratório) e o Largo sempre abertos; os outros "Em obras" (cadeado e etiqueta) até ao capítulo deles. Etiquetas da UI: "Missão nova" por baixo do "!" a flutuar, "Em obras", "✓ {edifício}" quando tudo está feito. Personagens à porta (tabela 17.4). Colegas à porta da casa deles, a dormir se estiverem sem atividade há 7 dias; tocar numa casa de colega mostra "Casa de {nome}. O interior das casas é privado." Entardecer no tema escuro, com candeeiros acesos e halos. Sombras de nuvens de dia.
10. **Chegada a um edifício** (1.ª vez): balão da personagem do edifício (texto em `ALDEIA.dialogos.chegada`). Depois, **cartão do edifício**: ilustração do edifício no topo, nome, e a lista das missões dele em capítulos abertos, cada uma com título, etiqueta "! Por fazer" ou "✓ Feita", briefing, "Melhor: n pontos", botões "Começar" ou "Repetir para melhorar" e "Treinar aqui". A prática do capítulo 0 tem a etiqueta "Prática: não conta para os resultados."
11. **Missão**: página com barra azul "Aldeia Digital · {edifício}" e "← Voltar à aldeia"; o motor do ECD com o briefing novo (17.6) e a personagem do edifício. No fim, "Voltar à aldeia".
12. **De volta à aldeia**: o avatar celebra (ou faz "Vamos outra vez") e a personagem diz uma frase (carimbo, "Boa! Falta pouco para o carimbo." ou "Vamos outra vez?"). Seguem-se, por esta ordem: **Escolhe o teu prémio** (3 itens da oferta da missão, cada um mostrado no avatar do aluno) → **Ganhaste: {item}** com "Vestir agora" e "Depois" → **Capítulo concluído** (estatueta do capítulo, frase de fecho, novo troféu, "Novo na casa: {categoria}") → abertura do capítulo seguinte pela Dona Cegonha.
13. **Festa**: no Largo, quando tudo está feito, o cartão mostra "Em festa"; a Dona Cegonha agradece e abre o Jornal da Aldeia.

### 17.3 Capítulos e missões na aplicação (versão Completa)

| Cap. | Título | Missões (edifício) |
|---|---|---|
| 0 | Nasce um morador | nascimento, tutorial, prática do Painel (Escola, não conta) |
| 1 | A sala de computadores | O Painel, Teclas Mágicas (Escola); cidadania: Os direitos das crianças, também online; As regras da turma (Escola) |
| 2 | O jornal da turma | A Notícia, Revisão, Paginação (Jornal); cidadania: O que se pode publicar? / Verdade ou boato (Jornal) |
| 3 | A experiência perdida | Escrita Matemática, A Maqueta (Laboratório); cidadania: Onde vai o computador velho? (Horta) |
| 4 | Papéis por todo o lado | Encontra no Texto (Biblioteca), O Arquivo (Arquivo); cidadania: De quem é esta imagem? (Biblioteca). Opcionais: Biblioteca Viva, A Sala Trancada (Museu) |
| 5 | A aldeia decide | Cartão de Imprensa, Correio da Redação (Junta); cidadania: A votação da festa (Junta), Preciso ou quero? (Mercado). Opcional: Orçamento (Mercado) |
| 6 | Alerta na aldeia | O Email Desconfiado, Boas Práticas (Centro de Segurança); cidadania: Pedir ajuda a um adulto de confiança (Centro), Hora de desligar (Casa). Opcionais: os outros 4 testes de segurança |
| 7 | Quem baralhou a aldeia? | Quem Apagou o Ficheiro? (Junta), O Robô (Oficina); cidadania: Boas maneiras na conversa online (Largo) |
| 8 | A Festa da Aldeia | Fecho de Edição, Simulador de Prova (Escola), festa (Largo) |

As missões de cidadania só entram com a dimensão marcada pelo professor (as do 1.º grupo vêm marcadas). Na Essencial ficam só os 12 desafios (o capítulo 7 desaparece).

### 17.4 Personagens por edifício

| Edifício | Personagem (à porta e nos diálogos) |
|---|---|
| Escola | Professora Sara |
| Redação do Jornal | Diretora Graça |
| Laboratório | Doutora Inês |
| Biblioteca | Dona Amélia (cadeira de rodas) |
| Arquivo | Tomé |
| Junta de Freguesia e Correios | Senhor Joaquim (Correio da Redação: Dona Cegonha) |
| Centro de Segurança Digital | Mãe Rita |
| Mercado | Marta |
| Oficina dos Robôs | Robô de limpeza |
| Museu | Rui |
| Horta e Ecoponto | Avô Zé |
| Largo e casa | Dona Cegonha (guia, tutorial, aberturas de capítulo) |

### 17.5 Prémios na aplicação

| Acontecimento | O que se ganha |
|---|---|
| Nascimento | o fato, as cores Original, Menta, Céu e Rosa, e os óculos de ver |
| Missão concluída | 1 item à escolha entre 3 da oferta da missão (temática do edifício); se já tiver os três, nada |
| Estrelas (total) | cores Lilás (6), Pêssego (12), Dourado (18), Areia (24), Nuvem (30); padrões Riscas (9), Pintas (15), Estrelas (21), Xadrez (27) |
| 85 ou mais | carimbo: emblema (alfinete no peito) e taça para as prateleiras |
| Capítulo concluído | estatueta e nova categoria da casa: 0 paredes, 1 porta, 2 telhado, 3 jardim, 4 papel de parede, 5 chão, 6 vitrine, 8 moldura do Jornal |
| Cidadania | roseta da dimensão quando todas as missões dela estão feitas |
| Esforço | Primeira missão, Tentei outra vez, Treino em casa (3 treinos), Todas as estrelas (3 estrelas em 5 missões) |
| Objetivo coletivo | Largo em festa e troféu Ajudante da aldeia |
| Fim | Chapéu da festa, padrão Confetes, cor Dourado e troféu Jornal da Aldeia |

**Guarda-roupa**: separadores Chapéus, Óculos, Mochilas, Objetos, Calçado, Cores, Padrões, Emblemas, Óculos de ver (não há separador "Fatos": o animal é o lugar do aluno na turma). Cada item mostra o avatar do aluno com ele; os bloqueados ficam a cinzento com cadeado e "Falta: prémio de {missões}" ou "Falta: {n} estrelas". "Guardar roupa".
**Casa**: sala 6 × 6 em canvas com o avatar no meio; separadores Mobília (cada móvel com o lugar atual, "Mudar" para o seguinte e cor quando há variantes), Paredes, Chão, Fachada (paredes, porta, telhado, jardim), Troféus (os 36, ganhos e por ganhar, com a regra) e Treinar. "Guardar", "Sair de casa".
**Jornal da Aldeia**: "Edição em curso" durante a história, "Edição da Festa" no fim; manchete "{nome} ajuda a aldeia" / "{nome} põe a aldeia em ordem"; avatar a celebrar (com o chapéu da festa no fim); barras por desafio com a cor da faixa; dimensões de cidadania trabalhadas; "Para treinar"; "Guardar como imagem", "Pôr na moldura da casa".

### 17.6 Mudanças no resto do ECD (todas as atividades, jogos e testes)

- **Briefing**: banda de 150 px com o recorte do mapa inteiro centrado no edifício (dia ou entardecer) e a etiqueta com o nome; retrato da personagem numa moldura 9-slice; "Personagem · publicação" (só nos desafios); briefing entre aspas; etiquetas Nível, duração, competência; botões **"Começar"** (vai direto à avaliação), **"Experimentar primeiro"** (prática que não conta) e **"Ouvir"**. Edifícios: desafios → Redação (Diretora Graça) ou Laboratório (Doutora Inês), conforme o cenário; Biblioteca Viva → Biblioteca; Sala Trancada → Museu; Quem Apagou o Ficheiro? e Correio → Junta; Orçamento → Mercado; Robô → Oficina; segurança → Centro de Segurança.
- **Resultado**: à esquerda, o avatar (o último da Aldeia neste navegador, ou a raposa) a celebrar (50 ou mais) ou a fazer "Vamos outra vez", a pontuação grande, estrelas em pixel (as vazias a meia transparência) e a faixa; à direita, título, resumo, cartão do carimbo com o emblema ("Falta pouco para o carimbo de …" ou "Ganhaste o carimbo de …"), tempo e botões; por baixo, o relatório.
- **Tempo**: retrato do Sr. Prazo (Redação) ou de O Cronómetro (Laboratório) à esquerda da barra: neutro; surpreendido a meio do tempo ou nos 2 últimos minutos; preocupado nos 30 segundos finais. No modo calmo fica parado ao lado da frase.
- **Esperas**: o avatar anda no lugar ao lado de "A carregar…" (só depois de 400 ms).
- **Professor**: dois cartões grandes ("Teste de Competências" com a folha, "Aldeia Digital" com cinco casinhas), "✓ Escolhido", vídeo do Teste = o tutorial de professor que já existe; o da Aldeia é um espaço "Ver em 1 minuto" (por produzir).
- **Tutorial do ECD** (`/tutorial`): passos atualizados (Começar ou experimentar, personagens do tempo, avatar no resultado, os dois modos do professor, a Aldeia nas formas de treinar).

### 17.7 Professor (Aldeia)

- **Configuração**: blocos A turma (nome, lugares) → Nível → Extensão (Personalizada mostra as missões por capítulo) → Dimensões de Cidadania (1.º e 2.º grupo) → Identificação (nome de animal recomendado) e fatos → Ritmo, tempo alargado, data de fim → Email e alertas → termos e "Criar a aldeia". À direita, "A sua aldeia": n missões em c capítulos, aulas estimadas e os capítulos com as missões.
- **Aldeia pronta**: código da turma grande com QR, "Projetar código", "Copiar"; código do professor numa caixa com borda de aviso, "Copiar", "Guardar como PDF", "Já guardei o código do professor" (só então abre "Abrir o painel"); "Cartões de entrada (um por lugar)" e "Carta para os encarregados de educação" em PDF.
- **Painel** (como a maqueta `turma`): cabeçalho com o código, a data de fim, o modo e o nível, e os botões Projetar código, Relatório da turma, Atualizar e Sair do painel; faixa de alertas; separadores Turma, Missões, Competências, Cidadania, Relatórios, Definições. Na Turma: 4 números, "Onde está cada aluno" (estações 0 a 8 com as cabeças e "!" de apoio), "Feito e por fazer" (filtros e legenda; no telemóvel, cartões), "Para a próxima aula" e a miniatura da aldeia com as cabeças nas casas. O detalhe do aluno abre numa janela por cima (não numa gaveta lateral), com História, Feito, Por fazer, Para treinar e as ações.
- **Email**: igual à maqueta `email`.

### 17.8 Do pacote que ainda não está na aplicação

Pássaros, borboletas, a Dona Cegonha a atravessar a aldeia, as reações da laranjeira e da fonte, a bandeirinha da caixa do correio, as personagens a virarem-se para o avatar, as janelas a acenderem em cascata, "Dormir" à porta de casa depois de 90 s, as entradas animadas do edifício a abrir, do marcador a cair e do avatar a chegar, as 4 expressões dos retratos (usam-se a neutra e a contente), os interiores ilustrados dos edifícios atrás do cartão (usa-se o exterior) e o texto letra a letra nos balões. Nenhum destes é necessário para os vídeos; se aparecerem num guião, são para depois.

## 18. Narrativa e vídeos

A bíblia da história, as personagens, o tom e os guiões dos vídeos promocionais e dos tutoriais estão em `HISTORIA.md` (nesta pasta).
