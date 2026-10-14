# Aldeia Digital · Pacote de ilustração e movimento (v1.1, 2026-10-13)

**Na aplicação (v1.1.0, 2026-10-14).** O pacote está integrado: `node scripts/aldeia/preparar-arte.mjs` copia a versão nativa para `public/aldeia/` e gera os manifestos; `python scripts/aldeia/exportar-cena.py` exporta a disposição do mapa. O que a aplicação mostra de facto, e o que ficou de fora, está em `docs/aldeia-digital/design.md` secção 17; capturas dos ecrãs reais em `implementado/` (local). A narrativa e os guiões dos vídeos estão em `docs/aldeia-digital/HISTORIA.md`. No Git ficam só este ficheiro, `fonte/` e os manifestos JSON; as imagens, as maquetas, o guia e os zips ficam locais.

Novo na v1.1: coleção opcional de animais extintos, 36 troféus, nascimento refeito (v2) e página inicial do professor.

Arte em pixel para a Aldeia Digital do ECD, feita a partir de `docs/aldeia-digital/design.md` (secção 15).
O guia visual com tudo a mexer está publicado como página (ver a ligação na conversa). Este ficheiro diz onde está cada coisa e como se usa.

## Regras de escala

- 1 px de arte = 2 px a 1× = 4 px a 2×. Ficheiros: `nome.png` (1×), `nome@2x.png`, `nome@nativo.png`.
- Recomendado: carregar `@nativo` e escalar por número inteiro com `image-rendering: pixelated` (CSS) ou `imageSmoothingEnabled = false` (canvas).
- Mosaico 64 × 32 nativo (128 × 64 a 1×). Piso 32 px nativos.
- Cenas das missões: 320 × 180 nativo, 4 px por píxel (1280 × 720 a 1×).
- Nenhum texto dentro das imagens.

## Pastas

| Pasta | Conteúdo |
|---|---|
| `avatares/fatos-extintos/` | **Novo.** 32 atlas da coleção opcional “Animais de antigamente” (dinossauros e outros animais extintos). Mesma grelha, âncoras e cosmética. |
| `avatares/fatos/` | 36 atlas `avatar-fato-<id>` com as camadas `corpo` e `capuz` (formato de folha com `frames` e `animations`, compatível com PixiJS e Phaser). |
| `avatares/caras/` | 6 peles. |
| `avatares/cabelos/` | 5 estilos × 4 cores (rapado não tem camada). O lenço vem em 4 padrões. |
| `avatares/padroes/` | Camadas de padrão do fato (riscas, pintas, estrelas, xadrez, confetes). |
| `avatares/cosmetica/` | Itens com versão `frente` e `costas`. Pivôs e âncoras em `avatares.json`. |
| `avatares/emblemas/` | 13 emblemas 11 × 11 (UI e troféus) e alfinetes 7 × 7 (peito do avatar). |
| `avatares/avatares.json` | Manifesto: grelha, fps, âncoras por fotograma, ordem das camadas, rampas de cor de cada fato, peles, cosmética. |
| `nascimento-v2/` | **Novo. Usar este.** Ovo grande (44 × 58) em que o avatar cabe, com `fundo` e `tampa`; ninho grande e `frente` do ninho; cegonha `entregar` e `pousar-trouxa`; `sequencia/` com a coreografia completa (104 fotogramas a 12 fps, folha e GIF) para 6 fatos; `calmo/<fato>/` com 4 imagens para os 68 fatos; `nascimento.json` com segmentos e ordem das camadas. |
| `nascimento/` | v1, mantida para ícones e referência. Dona Cegonha (voo, pousar, parada, falar, acenar), ninho, `ovos/<fato>/` (inteiro, 3 rachas, aberto, tampa, abanar, 4 imagens do modo calmo), `efeitos/`. |
| `mundo/mosaicos/` | Chão, água animada, borda da ilha, losango de foco. |
| `mundo/aderecos/` | Árvores (4 f), fonte (4 f), ecopontos, candeeiro e candeeiro aceso, halo, nuvem e sombra, pássaros, borboletas, grinaldas, luzinhas. |
| `mundo/edificios/<id>/` | 12 edifícios × 4 estados (`obras`, `aberto`, `concluido`, `festivo`) × 2 luzes (`dia`, `entardecer`). |
| `mundo/casa/` | Camadas `paredes`, `porta`, `telhado` (mesma tela e origem), exemplos, `bandeiras/` por fato. |
| `mundo/interior/` | Salas (6 papéis, 4 chãos) com 3 prateleiras de troféus (18 lugares), `moveis/` (com `vitrine`), `trofeus/` (**novo**: 36 troféus em 4 famílias, grande e pequeno, e `trofeus.json` com regras e âncoras). |
| `mundo/mapa/` | Renders do mapa 40 × 40 (dia, entardecer, início da história, festa) e `mapa.json` (edifícios, 32 lotes, chão). |
| `mundo/mundo.json` | Âncoras de cada edifício por estado (porta, topo, marcador, fumo, ninho), dados da casa e do interior. |
| `personagens/` | Corpo parado em `se` e `ne` (4 f a 4 fps) e retratos 48 × 48 em 4 expressões; crianças com corpo por expressão; Dona Cegonha. |
| `missoes/` | Grupo 1, 1.º ciclo: 4 missões × 3 situações, sem avatar, com `-exemplo` e `missoes.json` (âncoras a 1× e pose sugerida do avatar). |
| `ui/` | Moldura 9-slice (claro e escuro), estrelas, ícones de categoria, marcadores (missão, concluído, bloqueado), cabeças dos 68 fatos. |
| `maquetas/` | 17 ecrãs × desktop/telemóvel × claro/escuro, mais 8 do tutorial. Novos: `turma` (página inicial do professor) e `turma-aluno` (detalhe do aluno). |
| `guia/` | O guia publicado, para abrir localmente (`guia/index.html`). Inclui `turma.js`, o componente de maqueta da página do professor. |
| `movimento.json` | Tokens de movimento. |
| `fonte/` | Geradores em Python que produzem todo o pacote. |

## Avatar

- Célula 44 × 64 nativa, origem (pés) em (22, 60).
- Linhas de todas as folhas: parado se, parado ne, andar se, andar ne, acenar, celebrar, pensar, outra-vez, dormir, vestir (giro). 12 fps.
- Sudoeste = sudeste espelhado; noroeste = nordeste espelhado (espelhar também os pivôs).
- Ordem das camadas: corpo, padrão, cara, óculos de ver, cabelo, calçado, mochila, emblema, capuz, objeto, óculos de estilo, chapéu.
  Diferença para o `design.md`: o chapéu fica por cima do capuz, senão o capuz tapava-o.
- Cores do fato: as folhas são de paleta indexada. Para mudar a cor, trocar as 4 cores de `rampa.principal` do fato pelas de `cores_fato.<cor>`.
- Âncoras por fotograma em `avatares.json → ancoras["<anim>/<dir>/<nn>"]`: `chapeu`, `olhos`, `mao_e`, `mao_d`, `mochila`, `peito`, `pe_e`, `pe_d`. Colar o item com `âncora − pivô`.

## Coleções de fatos

- `atuais` (36) e `extintos` (32), em `avatares.json → colecoes`. O professor escolhe a coleção da turma, ou deixa cada aluno escolher entre as duas. Nada muda no resto do sistema.
- Os nomes anónimos usam o género do fato (`fatos_extintos[].genero`) como já acontece com os atuais.
- Toques portugueses na coleção extinta: Lourinhanossauro (Lourinhã), Cabra-dos-Pirenéus (Península Ibérica), Lagartixa-gigante (Cabo Verde), Arau-gigante (costas ibéricas).
- Pterodáctilo, Plesiossauro e Meganeura não eram dinossauros: a ficha do fato pode dizê-lo numa frase (`nota`).

## Nascimento v2

- Camadas por ordem: fundo, cegonha, ninho grande, avatar enquanto está dentro do ovo, fundo do ovo, frente do ninho, tampa, avatar depois de sair, efeitos.
- Segmentos em `nascimento-v2/nascimento.json`: `chegada` e `entrega` correm sozinhos; `espera` em ciclo até ao primeiro toque; `toque-1`, `toque-2`; o terceiro toque encadeia `toque-3`, `abertura`, `sair` e `acenar` (ciclo).
- Correções: o avatar sai de dentro do ovo; a tampa pousa no chão à direita do ninho, virada ao contrário (antes parecia um objeto na mão); a cegonha entrega a trouxa; o avatar salta para o chão antes de acenar.

## Troféus

- Famílias: `taca-<competencia>` (13, carimbo com 85 ou mais), `estatueta-cap-<n>` (9, capítulo concluído), `roseta-<dimensao>` (8, cidadania), `especial-<id>` (6, esforço).
- Nunca comparam alunos. As regras estão em `trofeus.json`.
- Parede: 18 lugares em 3 prateleiras (âncoras em `trofeus.json`); vitrine com 12 lugares.

## Página inicial do professor

- Três blocos: onde está cada aluno (caminho dos 9 capítulos com as cabeças dos alunos), feito e por fazer (grelha aluno × missão), para a próxima aula.
- Estado sempre por forma e ícone: estrela (85 ou mais), visto (50 a 84), seta de repetir (abaixo de 50), meio cheio (em curso), círculo vazio (por fazer).
- “Precisa de apoio”: sem atividade há 7 dias ou 2 resultados abaixo de 50. Filtros: todos, apoio, sem atividade, mais adiantados.
- Telemóvel: a grelha passa a cartões, um por aluno. Detalhe do aluno numa gaveta lateral com feito, por fazer e para treinar.

## Mundo

- Ecrã a partir de mosaico (nativo): `x = ox + (i − j) × 32`, `y = oy + (i + j) × 16`.
- Edifícios: colar a imagem de modo que `origem_mosaico_norte` (em `mundo.json`) coincida com o canto norte da pegada.
- Profundidade: chão primeiro; depois objetos por `i + j` da esquina sul; o avatar entra na mesma ordem pelo mosaico dos pés.
- Marcador de missão: sprite `ui/marcador-missao` na âncora `marcador`, com etiqueta da UI.
- Entardecer (tema escuro): usar as imagens `-entardecer`; halos `luz-halo` em modo `screen`.

## Orçamentos medidos

- Aldeia completa a 1× (mosaicos, adereços, 12 edifícios em 4 estados e 2 luzes, casas, interior): 660 kB (pedido ≤ 1,5 MB).
- Cada fato a 1×: até 19 kB (pedido ≤ 60 kB).
- Nascimento com um ovo: cerca de 30 kB (pedido ≤ 200 kB).

## Por decidir

- Fonte em SVG por objeto: não incluída. A fonte é o gerador (`fonte/`). Pixel art não ganha com SVG.
- Validar silhuetas e nomes dos fatos com crianças (folha de silhuetas no guia).
- Edifícios da expansão: primeira versão, a rever em detalhe.

## Voltar a gerar

```
cd fonte
python3 export_avatares.py     # avatares
python3 export_resto.py        # nascimento, mundo, personagens, missões, ui (inclui troféus)
python3 export_extintos.py     # coleção extinta
python3 export_nascimento2.py  # nascimento v2 (demora cerca de 10 minutos)
```
Requer Python 3 com Pillow e NumPy.
