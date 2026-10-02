// ─── Atividade 3 · Revisão / Controlo de Qualidade (atenção ao detalhe) ──────
// Dois painéis: o original e a cópia digital. Clica-se em cada palavra da cópia que difere.
import { useMemo, useState } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { definir, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, Instrucao, palavras, useTemporizador } from "../../motor/util";
import { Botao } from "../../ui";
import { diferencas, gerarCopia, pontuarRevisao } from "./pontuacao";
import { escolher } from "../../motor/aleatorio";

export interface ConfigRevisao {
  /** Três ou mais originais por cenário; em cada tentativa sorteia-se um e gera-se a cópia com erros. */
  originais: Record<Contexto, string[]>;
  diferencas: number;
  segundos: number | null;
  /** Inclui erros de vírgula/ponto decimal (níveis altos). */
  avancado?: boolean;
}

// [conteúdo Kendir] textos provisórios. As cópias com erros são geradas automaticamente (pontuacao.ts).
export const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigRevisao> = {
  1: {
    diferencas: 3,
    segundos: null,
    originais: {
      jornal: [
        "A Rita tem um gato preto. Ele dorme na cadeira azul da sala.",
        "O Tomé tirou uma fotografia bonita da escola e da árvore grande.",
        "Na quinta o jornal sai com histórias sobre animais e plantas.",
      ],
      laboratorio: [
        "O copo tem água fria. A Marta mede com a régua amarela.",
        "A planta cresceu muito porque ficou perto da janela durante a semana.",
        "O Rui colocou areia, pedras e terra dentro do frasco grande.",
      ],
    },
  },
  2: {
    diferencas: 5,
    segundos: 120,
    originais: {
      jornal: [
        "Visita ao museu: terça-feira, 14 de maio, às 9h30. Turma 5.º B, 24 alunos. Professora responsável: Ana Silva. Autocarro n.º 12. Regresso às 16h00.",
        "Torneio de xadrez: sábado, 22 de março, às 10h15. Ginásio da escola, 36 jogadores. Organização: Pedro Matos. Inscrições até sexta-feira. Prémios às 17h30.",
        "Feira de ciências: quarta-feira, 9 de abril, às 14h00. Pavilhão B, 18 projetos. Coordenação: Helena Costa. Visitas das famílias entre 15h00 e 18h00.",
      ],
      laboratorio: [
        "Experiência 3: medir a temperatura. Copo A: 18 graus. Copo B: 45 graus. Copo C: 12 graus. Data: 14 de maio. Responsável: Marta Costa.",
        "Experiência 5: plantar feijões. Vaso A: 25 sementes. Vaso B: 36 sementes. Rega diária de 50 mililitros. Início: 3 de março. Responsável: Rui Pires.",
        "Experiência 7: misturas. Frasco A: 125 gramas de sal. Frasco B: 240 gramas de areia. Água: 750 mililitros. Data: 19 de abril. Responsável: Inês Lopes.",
      ],
    },
  },
  3: {
    diferencas: 7,
    segundos: 180,
    originais: {
      jornal: [
        "Nome: Joana Silva Pereira. Email: joana.silva@escola.pt. Telefone: 912 345 678. Data de nascimento: 03/11/2010. Código postal: 4400-123 Vila Nova de Gaia. Turma: 9.º C. Encarregado: Rui Pereira.",
        "Nome: Tiago Almeida Rocha. Email: tiago.rocha@escola.pt. Telefone: 936 287 451. Data de nascimento: 27/02/2011. Código postal: 3810-195 Aveiro. Turma: 8.º A. Encarregada: Sónia Almeida.",
        "Nome: Beatriz Nunes Faria. Email: beatriz.faria@escola.pt. Telefone: 965 418 203. Data de nascimento: 14/08/2010. Código postal: 4710-428 Braga. Turma: 9.º B. Encarregado: Hélder Faria.",
      ],
      laboratorio: [
        "Amostra: A-104. Massa: 12,5 g. Volume: 25 ml. Temperatura: 21,0 °C. pH: 7,4. Operador: marta.costa@lab.pt. Data: 03/11/2026. Lote: 4400-123.",
        "Amostra: B-218. Massa: 38,2 g. Volume: 150 ml. Temperatura: 19,5 °C. pH: 6,8. Operador: rui.pires@lab.pt. Data: 17/02/2026. Lote: 3810-457.",
        "Amostra: C-356. Massa: 7,85 g. Volume: 42 ml. Temperatura: 23,4 °C. pH: 8,1. Operadora: ines.lopes@lab.pt. Data: 25/09/2026. Lote: 2715-386.",
      ],
    },
  },
  4: {
    diferencas: 9,
    segundos: 240,
    avancado: true,
    originais: {
      jornal: [
        "Silva, A. (2024). Ler no ecrã. Porto: Edições Norte, pp. 12-34. Costa, B. e Pires, C. (2023). Avaliação digital. Lisboa: Horizonte, 3.ª edição. Marques, D. (2025). Verificação de fontes. Coimbra: Almedina, vol. 2, n.º 7, pp. 101-119. Taxa de resposta: 57,3%.",
        "Almeida, R. (2021). Jornalismo escolar. Braga: Minerva, pp. 45-67. Rocha, T. e Faria, B. (2022). Leitura em ecrã. Lisboa: Caminho, 2.ª edição. Teixeira, M. (2025). Fontes abertas. Porto: Afrontamento, vol. 4, n.º 12, pp. 210-238. Amostra: 1 284 estudantes.",
        "Sousa, L. (2023). Corrigir em público. Coimbra: Imprensa da Universidade, pp. 77-95. Lopes, I. e Matos, P. (2024). Dados na redação. Lisboa: Tinta-da-China, 1.ª edição. Cardoso, H. (2025). Ética e verificação. Porto: Porto Editora, vol. 3, n.º 9, pp. 141-163. Margem de erro: 3,1%.",
      ],
      laboratorio: [
        "Ensaio 1: 3,5 ml; 22,1 °C; 7,40 pH. Ensaio 2: 3,6 ml; 22,3 °C; 7,38 pH. Ensaio 3: 3,4 ml; 22,0 °C; 7,41 pH. Média: 3,50 ml; 22,13 °C; 7,40 pH. Desvio: 0,10; 0,15; 0,02. Operador: Marta Costa. Referência: LAB-2026-017.",
        "Ensaio 1: 12,8 g; 18,4 °C; 6,92 pH. Ensaio 2: 12,6 g; 18,7 °C; 6,95 pH. Ensaio 3: 12,9 g; 18,5 °C; 6,90 pH. Média: 12,77 g; 18,53 °C; 6,92 pH. Desvio: 0,15; 0,15; 0,03. Operador: Rui Pires. Referência: LAB-2026-034.",
        "Ensaio 1: 45,2 mg; 36,8 °C; 7,35 pH. Ensaio 2: 45,7 mg; 37,1 °C; 7,36 pH. Ensaio 3: 45,4 mg; 36,9 °C; 7,34 pH. Média: 45,43 mg; 36,93 °C; 7,35 pH. Desvio: 0,25; 0,15; 0,01. Operadora: Inês Lopes. Referência: LAB-2026-052.",
      ],
    },
  },
  5: {
    diferencas: 12,
    segundos: 300,
    avancado: true,
    originais: {
      jornal: [
        "Inquérito aos leitores (edição n.º 42, maio de 2026): 1 024 respostas válidas, 57,3% em telemóvel, 38,1% em portátil, 4,6% em tablet. Idade média: 16,4 anos. Secções preferidas: Desporto (31%), Cultura (27%), Escola (24%), Opinião (18%). Contacto: redacao@campus.pt; telefone 222 333 444. Coordenação: Graça Mendes e Tomé Alves.",
        "Balanço da campanha (edição n.º 57, outubro de 2026): 2 318 visitas únicas, 64,2% vindas de pesquisa, 21,7% de redes sociais, 14,1% diretas. Tempo médio de leitura: 3,8 minutos. Artigos mais lidos: Ambiente (29%), Ciência (26%), Desporto (23%), Cultura (22%). Contacto: editores@campus.pt; telefone 223 456 789. Revisão: Lia Moreira e Pedro Matos.",
        "Relatório de correções (edição n.º 63, dezembro de 2026): 412 artigos publicados, 19 erratas, 4,6% do total. Erros mais comuns: datas (37%), nomes (28%), números (21%), citações (14%). Prazo médio de correção: 2,7 dias. Contacto: correcoes@campus.pt; telefone 224 567 891. Responsáveis: Helena Costa e Rui Faria.",
      ],
      laboratorio: [
        "Relatório LAB-2026-017 (versão 3, 14 de maio de 2026): 5 réplicas por amostra, 37,0 °C, pH 7,40. Reagente R-12, lote 4471-B, validade novembro de 2027. Resultados: 1 024 leituras, 57,3% válidas, 38,1% repetidas, 4,6% rejeitadas. Equipamento: espectrofotómetro SP-300, calibrado a 2 de maio. Operadores: Marta Costa e Rui Pires. Contacto: qualidade@lab.pt.",
        "Relatório LAB-2026-034 (versão 2, 9 de junho de 2026): 4 réplicas por amostra, 25,0 °C, pH 6,85. Reagente R-27, lote 5832-C, validade março de 2028. Resultados: 2 368 leituras, 81,4% válidas, 12,9% repetidas, 5,7% rejeitadas. Equipamento: centrífuga CF-150, calibrada a 28 de maio. Operadores: Inês Lopes e Hugo Matos. Contacto: amostras@lab.pt.",
        "Relatório LAB-2026-052 (versão 5, 21 de setembro de 2026): 6 réplicas por amostra, 4,0 °C, pH 7,15. Reagente R-43, lote 2196-A, validade agosto de 2027. Resultados: 1 756 leituras, 72,8% válidas, 19,6% repetidas, 7,6% rejeitadas. Equipamento: balança BA-220, calibrada a 15 de setembro. Operadores: Sara Duarte e Tiago Neves. Contacto: tecnico@lab.pt.",
      ],
    },
  },
};

function Revisao({ config, contexto, nivel, extensaoTempo, aoTerminar }: PropsAtividade<ConfigRevisao>) {
  // Um original ao acaso e uma cópia com erros gerados de novo em cada tentativa.
  const [{ original, copia }] = useState(() => {
    const o = escolher(config.originais[contexto]);
    return { original: o, copia: gerarCopia(o, config.diferencas, !!config.avancado) };
  });
  const palavrasO = useMemo(() => palavras(original), [original]);
  const palavrasC = useMemo(() => palavras(copia), [copia]);
  const certas = useMemo(() => new Set(diferencas(original, copia)), [original, copia]);
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [terminou, setTerminou] = useState(false);
  const [painel, setPainel] = useState<"original" | "copia">("copia");
  const limiteMs = config.segundos === null ? null : config.segundos * 1000 * extensaoTempo;
  const { restanteMs, decorridoExato } = useTemporizador(!terminou, limiteMs, () => terminar());

  function terminar() {
    if (terminou) return;
    setTerminou(true);
    const encontradas = [...marcadas].filter((i) => certas.has(i)).length;
    const errados = marcadas.size - encontradas;
    const fracao = limiteMs === null ? null : Math.max(0, limiteMs - decorridoExato()) / limiteMs;
    aoTerminar({
      pontuacao: pontuarRevisao({ encontradas, errados, total: certas.size, fracaoTempoRestante: fracao }),
      duracaoMs: decorridoExato(),
      metricas: { encontradas, errados, total: certas.size },
    });
  }

  const grande = nivel === 1;
  const estiloTexto = { fontSize: grande ? "1.5rem" : "1.05rem", lineHeight: 1.9 };

  return (
    <div className="grid gap-4">
      <Instrucao>
        Compara os dois textos. Na cópia (à direita), clica em cada palavra que está diferente do original. Há {certas.size} diferenças.
      </Instrucao>
      {restanteMs !== null && limiteMs !== null && <BarraTempo restanteMs={restanteMs} totalMs={limiteMs} />}
      <div className="flex gap-2 md:hidden" role="tablist" aria-label="Painel visível">
        <button type="button" role="tab" className="separador" aria-selected={painel === "original"} onClick={() => setPainel("original")}>
          Original
        </button>
        <button type="button" role="tab" className="separador" aria-selected={painel === "copia"} onClick={() => setPainel("copia")}>
          Cópia
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className={`cartao p-4 ${painel === "original" ? "" : "hidden md:block"}`} aria-label="Original">
          <h3 className="text-sm uppercase tracking-wide mb-2" style={{ color: "var(--suave)" }}>
            Original (papel)
          </h3>
          <p style={{ ...estiloTexto, fontFamily: "Georgia, serif" }}>{palavrasO.join(" ")}</p>
        </section>
        <section className={`cartao p-4 ${painel === "copia" ? "" : "hidden md:block"}`} aria-label="Cópia digital">
          <h3 className="text-sm uppercase tracking-wide mb-2" style={{ color: "var(--suave)" }}>
            Cópia (computador)
          </h3>
          <p style={estiloTexto}>
            {palavrasC.map((p, i) => {
              const marcada = marcadas.has(i);
              const cls = terminou ? (certas.has(i) ? (marcada ? "palavra--acertou" : "palavra--falhou") : marcada ? "palavra--falhou" : "") : "";
              return (
                <span key={i}>
                  <button
                    type="button"
                    className={`palavra ${cls}`}
                    aria-pressed={marcada}
                    disabled={terminou}
                    onClick={() =>
                      setMarcadas((m) => {
                        const n = new Set(m);
                        if (n.has(i)) n.delete(i);
                        else n.add(i);
                        return n;
                      })
                    }
                  >
                    {p}
                  </button>{" "}
                </span>
              );
            })}
          </p>
        </section>
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <Botao onClick={terminar} disabled={terminou}>
          Terminei
        </Botao>
        <span style={{ color: "var(--suave)" }}>
          {marcadas.size} marcada{marcadas.size === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigRevisao>({
  slug: "revisao",
  numero: 3,
  dominio: "atencao",
  titulo: { jornal: "Revisão", laboratorio: "Controlo de Qualidade" },
  descricao: "Encontrar as diferenças entre o original e a cópia: dígitos trocados, acentos em falta, meses errados, emails quase iguais.",
  duracao: "2 a 4 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({
    diferencas: 1,
    segundos: null,
    originais: { jornal: ["O jornal da escola sai na sexta-feira."], laboratorio: ["A amostra fica guardada no frigorífico."] },
  }),
  Componente: Revisao,
  dica: (m) => {
    if (Number(m.errados) > Number(m.encontradas)) return "Marca só quando tiveres a certeza: cada clique errado desconta meio ponto. Compara palavra a palavra, com o dedo ou o cursor.";
    return "Os erros mais comuns escondem-se em números e emails: lê os dígitos um a um e verifica o que está antes do @.";
  },
});
