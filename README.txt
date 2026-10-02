ENSAIO ÀS COMPETÊNCIAS DIGITAIS (ECD)
Kendir Studios / Worlds4Education · versão 0.1.0 · outubro de 2026


O QUE É

O Ensaio às Competências Digitais é um jogo web gratuito, em português de Portugal, onde os alunos treinam e medem as competências digitais que as provas feitas no computador pressupõem: escrever no teclado, ler ecrãs, usar menus e formulários, arrastar e largar, usar atalhos, procurar informação num texto longo e escrever matemática.

Não tem contas, não regista pessoas e não precisa de base de dados. Funciona em qualquer navegador moderno, no computador, no tablet ou no telemóvel.


PARA QUEM

- Alunos do 1.º ciclo ao Ensino Superior, que querem chegar à prova digital sem surpresas.
- Professores, que querem montar uma prova curta para a turma e ver os resultados.
- Escolas e entidades (ARTE, EduQA, ministérios), que querem saber que competências faltam e a quantos alunos.


COMO SE USA

Na página inicial há quatro entradas:

1. Treinar
   - Teste: uma sequência de atividades para o nível de ensino do aluno. No fim aparece uma "primeira página" com o perfil de competências.
   - Atividade: escolhe-se uma atividade e um de cinco níveis (1 Iniciação, 2 Base, 3 Intermédio, 4 Avançado, 5 Perito). Pode repetir-se à vontade.
   - Código: o aluno escreve o código que o professor lhe deu e faz a prova que o professor montou.

2. Professor
   O professor escolhe o nível, as atividades, como os alunos se identificam (número de turma, alcunha ou nada) e o tempo alargado. Recebe um código e um QR para projetar. Se indicar um email, recebe os resultados (um resumo por dia ou um email por atividade), depois de confirmar o endereço. Tem sempre uma ligação privada com a tabela de resultados e exportação para folha de cálculo.

3. Tutorial
   Mostra tudo em oito passos curtos. Pode saltar-se a qualquer momento.

4. Observatório
   Estatísticas anónimas de todas as pessoas que usaram a aplicação: médias por competência e por nível, dispositivos, evolução por dia. Qualquer grupo com menos de 20 tentativas fica oculto.

Antes de começar uma atividade ou um teste, escolhe-se o cenário:
- Redação do jornal da escola: o aluno é repórter e cada tarefa serve a próxima edição.
- Laboratório de experiências: o aluno é investigador e cada tarefa é um passo de uma experiência.
O cenário muda a história, as personagens e os textos. As regras e a pontuação são iguais.


AS ATIVIDADES

Disponíveis, cada uma com cinco níveis:
- A Notícia / O Protocolo: escrever um texto no teclado, com acentos, ç, @, € e teclado numérico.
- O Painel / A Consola: seguir instruções num sítio simulado com botões, menus, separadores, caminhos, paginação, janelas e avisos.
- Revisão / Controlo de Qualidade: encontrar as diferenças entre o original e a cópia.
- Paginação / Bancada: ordenar, classificar e ligar pares, arrastando ou tocando.
- Teclas Mágicas: copiar, colar, desfazer, selecionar e mudar de campo só com o teclado.
- Encontra no Texto / Encontra no Manual: procurar factos num texto longo, com títulos, índice, tabela e procura.
- Escrita Matemática: escrever no computador frações, potências, raízes, desigualdades, índices, somatórios e integrais, e reconhecer notações.

Em preparação: O Arquivo (pastas e navegação), Cartão de Imprensa (formulários), Fecho de Edição (gestão do tempo) e Simulador de Prova.

Cada atividade começa com um briefing e um item de prática que não conta. Dá uma pontuação de 0 a 100, estrelas (50, 75 e 90 pontos) e uma dica concreta. Faixas: A começar (0 a 39), Em progresso (40 a 64), Confiante (65 a 84), Autónomo (85 a 100). As pontuações descrevem o desempenho neste jogo e não são uma certificação.


ACESSIBILIDADE

- Dois aspetos à escolha em Definições: Kendir (editorial) e Mosaico, o Ágora Design System da AMA usado nos serviços públicos digitais. Ambos têm tema claro e escuro.
- Texto grande, tempo alargado (×1,25, ×1,5 ou ×2, registado como acomodação) e funcionamento completo só com teclado.
- Tudo o que se arrasta tem alternativa por toque ou teclado.
- Objetivo: WCAG 2.2 nível AA (EN 301 549). A página Acessibilidade tem um guia para quem desenvolve e para quem encomenda provas digitais.


DADOS E PRIVACIDADE

- Não há contas. Os resultados de cada aluno ficam no navegador dele, que pode exportá-los ou apagá-los.
- Cada atividade concluída envia um registo anónimo (atividade, nível, pontuação, duração, tipo de dispositivo) para uma folha de cálculo controlada por quem publica a aplicação. Nunca envia nome, email, endereço IP nem identificação do dispositivo. O envio pode ser desligado em Definições.
- Nas provas de professor vai também o identificador que o professor pediu (recomenda-se o número de turma). O email do professor só é usado depois de confirmado e é apagado 12 meses após a última tentativa.


PUBLICAR A APLICAÇÃO

A aplicação é um conjunto de ficheiros estáticos. Para publicar:
1. Instalar o ponto de recolha de estatísticas (uma folha de cálculo Google com um script, cerca de cinco minutos, custo zero). Instruções em telemetria/README.md.
2. Indicar o endereço desse ponto e, se houver, o do vídeo de apresentação, no ficheiro .env.
3. Gerar os ficheiros (npm run build) e copiar a pasta dist/ para qualquer alojamento web, configurado para devolver index.html em todos os endereços.

Sem o passo 1, a aplicação funciona na mesma: os alunos treinam e veem os resultados, mas não há estatísticas nem resultados para os professores.

A página Administração mostra as estatísticas completas a quem tiver a chave definida no script.


PARA QUEM DESENVOLVE

Tecnologia: Vite, React 19, TypeScript, Tailwind CSS 4, React Router, dnd-kit, Ágora Design System (carregado só no aspeto Mosaico), Vitest.

  npm install
  npm run dev          servidor local em http://localhost:5180/
  npm run typecheck    verificação de tipos
  npm test             testes das pontuações, conteúdos, códigos e notação matemática
  npm run build        ficheiros finais em dist/

Arquitetura, convenções e estado do projeto: AGENTS.md. Resumo da especificação: docs/ESPECIFICACAO.md.


CONTACTO

Kendir Studios · https://kendirstudios.pt
