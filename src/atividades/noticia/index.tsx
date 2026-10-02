// ─── Atividade 1 · A Notícia / O Protocolo (dactilografia) ───────────────────
import { useEffect, useMemo, useRef, useState } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { definir, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, Instrucao, useTemporizador } from "../../motor/util";
import { Botao } from "../../ui";
import { combinarComTeclado, pontuarDactilografia } from "./pontuacao";

export interface ConfigNoticia {
  /** Vários textos por cenário: em cada tentativa é escolhido um ao acaso, para que repetir não seja decorar. */
  texto: Record<Contexto, string[]>;
  segundos: number;
  alvoWpm: number;
  /** Ronda de teclado numérico (níveis 3+): valores a introduzir numa tabela. */
  teclado?: { quantidade: number; decimais?: boolean; negativos?: boolean; segundos: number };
}

// [conteúdo Kendir] textos provisórios; substituir por notícias curtas / excertos com direitos tratados.
// Citações e fontes sempre com aspas curvas “ ” e parênteses curvos ( ).
export const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigNoticia> = {
  1: {
    segundos: 60,
    alvoWpm: 8,
    texto: {
      jornal: [
        "sol mar pão bola casa gato rua flor. A escola tem um jornal.",
        "lua céu mesa livro lápis porta sala chão. O jornal sai hoje.",
        "pato vaca uva maçã pera bolo leite mel. A Lia lê a notícia.",
      ],
      laboratorio: [
        "água sal copo luz pedra folha fogo gelo. O laboratório tem uma lupa.",
        "areia vidro tubo pó óleo cor lata frio. A Marta mede a água.",
        "terra vaso feijão raiz sol chuva caule. A planta cresceu muito.",
      ],
    },
  },
  2: {
    segundos: 90,
    alvoWpm: 15,
    texto: {
      jornal: [
        "A turma do 5.º B visitou o museu na terça-feira. Viram quadros, estátuas e uma coleção de moedas antigas. No fim, a professora ofereceu um lanche.",
        "O torneio de andebol começou na quinta-feira. A equipa da escola ganhou o primeiro jogo por 12 a 9. O próximo jogo é no pavilhão, às três da tarde.",
        "A biblioteca recebeu trinta livros novos. Há banda desenhada, poesia e livros de ciência. Cada aluno pode levar dois livros durante quinze dias.",
      ],
      laboratorio: [
        "Hoje medimos a temperatura da água em três copos. O copo com gelo ficou a 2 graus. A água da torneira estava a 18 graus e a água quente a 45.",
        "Pusemos sal, açúcar e areia em copos com água. O sal e o açúcar dissolveram-se. A areia ficou no fundo do copo, mesmo depois de mexermos bem.",
        "O feijão germinou em cinco dias. A raiz apareceu primeiro e depois o caule. Regámos a planta todas as manhãs com vinte mililitros de água.",
      ],
    },
  },
  3: {
    segundos: 120,
    alvoWpm: 25,
    texto: {
      jornal: [
        "A feira do livro decorre de 12 a 16 de maio (pavilhão B). Os livros têm 20% de desconto e o bilhete custa 1,50 €. Inscrições para a visita: feira@escola.pt.",
        "O concerto de Natal tem 3 sessões (18h, 19h30 e 21h). Cada bilhete custa 2 € e as receitas revertem para a viagem de finalistas. Reservas: musica@escola.pt.",
        "A recolha de tampas já juntou 450 kg (mais 35% do que em 2025). O objetivo é chegar aos 600 kg até junho. Dúvidas para ambiente@escola.pt ou na sala 14.",
      ],
      laboratorio: [
        "A solução A (50 ml) tem 12% de sal; a B tem 8%. Cada frasco custou 2,30 € e as medições ficam registadas em lab@escola.pt. Repetir 3 vezes.",
        "O pêndulo (fio de 1,20 m) fez 10 oscilações em 22 segundos. A massa usada foi de 150 g. Registar os tempos na folha 3 e enviar para fisica@escola.pt.",
        "A planta B recebeu 30% mais luz do que a A (8 h por dia). Ao fim de 14 dias media 9,5 cm (custo do ensaio: 0,80 €). Relatório para bio@escola.pt, até sexta.",
      ],
    },
    teclado: { quantidade: 10, segundos: 60 },
  },
  4: {
    segundos: 180,
    alvoWpm: 35,
    texto: {
      jornal: [
        "Segundo Silva (2024, p. 12), a leitura em ecrã exige estratégias próprias. A reportagem completa está em https://gazeta.campus.pt/leitura e as dúvidas podem ser enviadas para redacao@campus.pt até 30/06.",
        "De acordo com Almeida e Rocha (2023, pp. 40-41), 62% dos estudantes leem notícias no telemóvel. O inquérito da Gazeta está aberto em https://gazeta.campus.pt/inquerito até 15/07; contacto: inqueritos@campus.pt.",
        "Como notou Teixeira (2025, p. 8), “verificar é mais lento do que publicar”. A oficina de fact-checking decorre a 3/10, na sala 2.14 (inscrições em https://gazeta.campus.pt/oficina ou oficinas@campus.pt).",
      ],
      laboratorio: [
        "O ensaio seguiu o método de Costa & Pires (2023, p. 47): 3 réplicas por amostra, 25 °C ± 0,5. Os dados estão em https://lab.campus.pt/dados; questões para inves@campus.pt até 30/06.",
        "Segundo Lopes (2022, pp. 101-103), a amostra deve repousar 24 h a 4 °C. Os resultados preliminares (n = 18) estão em https://lab.campus.pt/preliminar; dúvidas para amostras@campus.pt.",
        "Conforme Duarte e Neves (2024, p. 15), o pH ideal é 7,2 ± 0,2. A calibração do equipamento fica registada em https://lab.campus.pt/calibracao e as falhas devem ser comunicadas a tecnico@campus.pt.",
      ],
    },
    teclado: { quantidade: 15, decimais: true, segundos: 75 },
  },
  5: {
    segundos: 180,
    alvoWpm: 50,
    texto: {
      jornal: [
        "“Não há jornalismo sem verificação”, escreveu Marques (2025), citando 3 fontes (duas anónimas; uma oficial). O inquérito teve 1 024 respostas: 57% em telemóvel, 38% em portátil e 5% em tablet. Ver anexo_A.pdf & anexo_B.xlsx.",
        "“Uma correção publicada vale mais do que um erro escondido”, defendeu Sousa (2024, p. 77). Em 2025, a Gazeta publicou 312 artigos e 9 erratas (2,9%); o relatório anual está em relatorio_2025.pdf & dados_2025.csv.",
        "“O leitor merece saber de onde vem cada número”, lembrou Pereira (2023). O novo guia exige 2 fontes por dado (mínimo) e links permanentes; modelo em guia_fontes_v3.docx; sugestões para editor@gazeta.campus.pt (até 31/12).",
      ],
      laboratorio: [
        "“Sem controlo, não há conclusão”, lembrou Ferreira (2025). Protocolo: 5 réplicas; pH 7,4 ± 0,1; 37 °C. Resultados em amostra_01.csv e amostra_02.csv: 1 024 leituras, 57% válidas, 38% repetidas & 5% rejeitadas.",
        "“Medir duas vezes é metade do método”, escreveu Matos (2024, p. 12). Ensaio LAB-017: 3 lotes (A, B, C); desvio-padrão 0,08; incerteza ± 0,15 mg/L. Dados brutos em lote_A.xlsx & lote_B.xlsx; análise em analise_v2.R.",
        "“O caderno é a memória da experiência”, insistiu Cardoso (2023). Regra: data, hora (hh:mm), operador e lote em cada página; 98,5% dos registos de 2025 cumpriram-na. Modelo em caderno_modelo.pdf; dúvidas para qualidade@lab.campus.pt.",
      ],
    },
    teclado: { quantidade: 20, decimais: true, negativos: true, segundos: 90 },
  },
};

/** Valores aleatórios para a ronda de teclado numérico (novos em cada tentativa, sem repetidos). */
export function gerarValoresTeclado(c: NonNullable<ConfigNoticia["teclado"]>, r: () => number = Math.random): string[] {
  const vistos = new Set<string>();
  while (vistos.size < c.quantidade) {
    const digitos = 1 + Math.floor(r() * 4);
    let v = String(Math.floor(r() * 10 ** digitos));
    if (c.decimais && r() < 0.45) v += "," + String(1 + Math.floor(r() * 99)).replace(/0$/, "");
    if (c.negativos && r() < 0.25 && v !== "0") v = "-" + v;
    vistos.add(v);
  }
  return [...vistos];
}

type Etapa = "texto" | "pergunta_teclado" | "teclado";

function Noticia({ config, modo, contexto, extensaoTempo, aoTerminar }: PropsAtividade<ConfigNoticia>) {
  const [fonte] = useState(() => {
    const lista = config.texto[contexto];
    return lista[Math.floor(Math.random() * lista.length)];
  });
  const limiteMs = config.segundos * 1000 * extensaoTempo;
  const [digitado, setDigitado] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("texto");
  const [terminouTexto, setTerminouTexto] = useState(false);
  const resultadoTexto = useRef<{ pontuacao: number; precisao: number; wpm: number; ms: number } | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const { restanteMs, decorridoExato } = useTemporizador(etapa === "texto" && !terminouTexto, limiteMs, () => terminarTexto());

  useEffect(() => {
    area.current?.focus();
  }, []);

  function terminarTexto() {
    if (terminouTexto) return;
    setTerminouTexto(true);
    const ms = decorridoExato();
    let corretos = 0;
    for (let i = 0; i < fonte.length; i++) if (digitado[i] === fonte[i]) corretos++;
    const r = pontuarDactilografia({ corretos, totalFonte: fonte.length, minutos: ms / 60000, alvoWpm: config.alvoWpm });
    resultadoTexto.current = { ...r, ms };
    if (config.teclado && modo === "avaliacao") {
      setEtapa("pergunta_teclado");
    } else {
      aoTerminar({ pontuacao: r.pontuacao, duracaoMs: ms, metricas: { wpm: Math.round(r.wpm), precisao: Math.round(r.precisao * 100), tecladoNumerico: "nao_aplicavel" } });
    }
  }

  // Terminar automaticamente quando o texto está todo escrito.
  useEffect(() => {
    if (!terminouTexto && digitado.length >= fonte.length) terminarTexto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digitado]);

  const spans = useMemo(
    () =>
      Array.from(fonte).map((c, i) => {
        let cls = "";
        if (i < digitado.length) cls = digitado[i] === c ? "certo" : "errado";
        else if (i === digitado.length) cls = "atual";
        return (
          <span key={i} className={cls}>
            {c === " " && cls === "errado" ? "␣" : c}
          </span>
        );
      }),
    [fonte, digitado],
  );

  if (etapa === "pergunta_teclado" || etapa === "teclado") {
    return (
      <RondaTeclado
        config={config.teclado!}
        extensaoTempo={extensaoTempo}
        perguntar={etapa === "pergunta_teclado"}
        aoResponderPergunta={(tem) => {
          if (tem) setEtapa("teclado");
          else {
            const rt = resultadoTexto.current!;
            aoTerminar({ pontuacao: rt.pontuacao, duracaoMs: rt.ms, metricas: { wpm: Math.round(rt.wpm), precisao: Math.round(rt.precisao * 100), tecladoNumerico: "saltado" } });
          }
        }}
        aoTerminar={(corretos, total, ms, usouNumpad) => {
          const rt = resultadoTexto.current!;
          aoTerminar({
            pontuacao: combinarComTeclado(rt.pontuacao, { corretos, total }),
            duracaoMs: rt.ms + ms,
            metricas: { wpm: Math.round(rt.wpm), precisao: Math.round(rt.precisao * 100), tecladoNumerico: usouNumpad ? "usado" : "linha_superior", tecladoCorretos: corretos, tecladoTotal: total },
          });
        }}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <Instrucao>Escreve o texto exatamente como está. Os acentos, as maiúsculas e os sinais contam.</Instrucao>
      {restanteMs !== null && <BarraTempo restanteMs={restanteMs} totalMs={limiteMs} />}
      <div className="cartao p-4 dactilo" aria-label="Texto a copiar" onClick={() => area.current?.focus()}>
        {spans}
      </div>
      <label className="sr-only" htmlFor="caixa-dactilo">
        Escreve aqui o texto
      </label>
      <textarea
        id="caixa-dactilo"
        ref={area}
        className="cartao p-4 dactilo w-full"
        rows={4}
        value={digitado}
        disabled={terminouTexto}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onChange={(e) => setDigitado(e.target.value.slice(0, fonte.length))}
        aria-describedby="dactilo-ajuda"
      />
      <p id="dactilo-ajuda" className="text-sm" style={{ color: "var(--suave)" }}>
        Em teclado português: <kbd>´</kbd> <kbd>~</kbd> <kbd>^</kbd> são teclas mortas (primeiro o acento, depois a letra). <kbd>@</kbd> é <kbd>AltGr</kbd>+<kbd>2</kbd> e <kbd>€</kbd> é <kbd>AltGr</kbd>+<kbd>E</kbd>.
      </p>
      <div className="flex gap-3 flex-wrap items-center">
        <Botao variante="contorno" onClick={terminarTexto} disabled={terminouTexto}>
          Terminei
        </Botao>
        <span className="text-sm" style={{ color: "var(--suave)" }}>
          {digitado.length} de {fonte.length} caracteres
        </span>
      </div>
    </div>
  );
}

function RondaTeclado({
  config,
  extensaoTempo,
  perguntar,
  aoResponderPergunta,
  aoTerminar,
}: {
  config: NonNullable<ConfigNoticia["teclado"]>;
  extensaoTempo: number;
  perguntar: boolean;
  aoResponderPergunta: (temTecladoNumerico: boolean) => void;
  aoTerminar: (corretos: number, total: number, ms: number, usouNumpad: boolean) => void;
}) {
  const [alvos] = useState(() => gerarValoresTeclado(config));
  const [valores, setValores] = useState<string[]>(() => alvos.map(() => ""));
  const [primeiraTecla, setPrimeiraTecla] = useState<"numpad" | "linha" | null>(null);
  const [pergunta, setPergunta] = useState(false);
  const [terminou, setTerminou] = useState(false);
  const limiteMs = config.segundos * 1000 * extensaoTempo;
  const ativo = !perguntar && !pergunta && !terminou;
  const { restanteMs, decorridoExato } = useTemporizador(ativo, limiteMs, () => terminar());
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!perguntar) primeiro.current?.focus();
  }, [perguntar, pergunta]);

  function terminar() {
    if (terminou) return;
    setTerminou(true);
    const corretos = valores.filter((v, i) => v.trim().replace(".", ",") === alvos[i]).length;
    aoTerminar(corretos, alvos.length, decorridoExato(), primeiraTecla === "numpad");
  }

  if (perguntar) {
    return (
      <div className="grid gap-4">
        <Instrucao>Segunda ronda: introduzir {alvos.length} valores numa tabela com o teclado numérico.</Instrucao>
        <div className="cartao p-4 grid gap-3">
          <p>Vais precisar do teclado numérico (as teclas à direita, com os números em bloco). Tens esse teclado?</p>
          <div className="flex gap-3 flex-wrap">
            <Botao onClick={() => aoResponderPergunta(true)}>Sim, vou usá-lo</Botao>
            <Botao variante="contorno" onClick={() => aoResponderPergunta(false)}>
              Não tenho. Saltar esta ronda sem penalização
            </Botao>
          </div>
        </div>
      </div>
    );
  }

  if (pergunta) {
    return (
      <div className="cartao p-4 grid gap-3" role="alertdialog" aria-labelledby="pergunta-np">
        <p id="pergunta-np" className="font-bold">
          Usaste os números da linha de cima. O teu teclado tem teclado numérico?
        </p>
        <div className="flex gap-3 flex-wrap">
          <Botao onClick={() => setPergunta(false)}>Sim, vou usá-lo agora</Botao>
          <Botao variante="contorno" onClick={() => aoResponderPergunta(false)}>
            Não. Saltar esta ronda sem penalização
          </Botao>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Instrucao>Introduz os valores da coluna da esquerda na coluna da direita, pela ordem. Usa o teclado numérico.</Instrucao>
      {restanteMs !== null && <BarraTempo restanteMs={restanteMs} totalMs={limiteMs} />}
      <table className="tabela cartao">
        <thead>
          <tr>
            <th scope="col">Valor</th>
            <th scope="col">Introduz aqui</th>
          </tr>
        </thead>
        <tbody>
          {alvos.map((v, i) => (
            <tr key={i}>
              <td className="tabular-nums" style={{ fontFamily: "var(--fonte-mono)" }}>
                {v}
              </td>
              <td>
                <label className="sr-only" htmlFor={`np-${i}`}>
                  Valor {i + 1}
                </label>
                <input
                  id={`np-${i}`}
                  ref={i === 0 ? primeiro : undefined}
                  inputMode="decimal"
                  className="w-32 px-2 py-1 rounded border"
                  style={{ borderColor: "var(--tecla-borda)", fontFamily: "var(--fonte-mono)", background: "var(--superficie)", color: "var(--tinta)" }}
                  value={valores[i]}
                  disabled={terminou}
                  onKeyDown={(e) => {
                    if (primeiraTecla === null && /^[0-9]$/.test(e.key)) {
                      if (e.code.startsWith("Numpad")) setPrimeiraTecla("numpad");
                      else {
                        setPrimeiraTecla("linha");
                        setPergunta(true);
                      }
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const prox = document.getElementById(`np-${i + 1}`) as HTMLInputElement | null;
                      if (prox) prox.focus();
                      else terminar();
                    }
                  }}
                  onChange={(e) => setValores((vs) => vs.map((x, j) => (j === i ? e.target.value : x)))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <Botao variante="contorno" onClick={terminar} disabled={terminou}>
          Terminei
        </Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigNoticia>({
  slug: "noticia",
  numero: 1,
  dominio: "teclado",
  titulo: { jornal: "A Notícia", laboratorio: "O Protocolo" },
  descricao: "Copiar um texto com um temporizador suave. Acentos, ç, @, € e teclado numérico contam.",
  duracao: "1 a 3 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: (c) => ({ segundos: 60, alvoWpm: c.alvoWpm, texto: { jornal: ["O jornal da escola."], laboratorio: ["A bancada do laboratório."] } }),
  Componente: Noticia,
  dica: (m) => {
    if (Number(m.precisao) < 90) return "Primeiro a precisão, depois a velocidade: olha para o ecrã enquanto escreves e corrige com Backspace assim que vires vermelho.";
    if (m.tecladoNumerico === "linha_superior") return "Experimenta o teclado numérico para números: com a mão direita no bloco, o 5 tem um relevo para te orientares.";
    return "Para ganhar velocidade, treina os acentos: escreve o acento primeiro (tecla morta) e só depois a letra.";
  },
});
