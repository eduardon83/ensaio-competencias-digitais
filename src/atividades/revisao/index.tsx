// ─── Atividade 3 · Revisão / Controlo de Qualidade (atenção ao detalhe) ──────
// Dois painéis: o original e a cópia digital. Clica-se em cada palavra da cópia que difere.
import { useMemo, useState } from "react";
import type { Contexto } from "../../preferencias/preferencias";
import { definir, type PropsAtividade } from "../../motor/tipos";
import { BarraTempo, Instrucao, palavras, useTemporizador } from "../../motor/util";
import { Botao } from "../../ui";
import { diferencas, pontuarRevisao } from "./pontuacao";

export interface ConfigRevisao {
  original: Record<Contexto, string>;
  copia: Record<Contexto, string>;
  diferencas: number;
  segundos: number | null;
}

// Cada par original/cópia tem o mesmo número de palavras; o teste `conteudo.test.ts` confirma o número de diferenças.
export const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigRevisao> = {
  1: {
    diferencas: 3,
    segundos: null,
    original: {
      jornal: "A Rita tem um gato preto. Ele dorme na cadeira azul da sala.",
      laboratorio: "O copo tem água fria. A Marta mede com a régua amarela.",
    },
    copia: {
      jornal: "A Rita tem um galo preto. Ela dorme na cadeia azul da sala.",
      laboratorio: "O cubo tem água fina. A Marta mede com a régua amarelo.",
    },
  },
  2: {
    diferencas: 5,
    segundos: 120,
    original: {
      jornal: "Visita ao museu: terça-feira, 14 de maio, às 9h30. Turma 5.º B, 24 alunos. Professora responsável: Ana Silva. Autocarro n.º 12. Regresso às 16h00.",
      laboratorio: "Experiência 3: medir a temperatura. Copo A: 18 graus. Copo B: 45 graus. Copo C: 2 graus. Data: 14 de maio. Responsável: Marta Costa.",
    },
    copia: {
      jornal: "Visita ao museu: quarta-feira, 14 de maio, às 9h00. Turma 5.º B, 42 alunos. Professora responsável: Anna Silva. Autocarro n.º 12. Regresso às 18h00.",
      laboratorio: "Experiência 8: medir a temperatura. Copo A: 81 graus. Copo B: 45 graus. Copo D: 2 graus. Data: 14 de março. Responsável: Marta Couto.",
    },
  },
  3: {
    diferencas: 7,
    segundos: 180,
    original: {
      jornal: "Nome: Joana Silva Pereira. Email: joana.silva@escola.pt. Telefone: 912 345 678. Data de nascimento: 03/11/2010. Código postal: 4400-123 Vila Nova de Gaia. Turma: 9.º C. Encarregado: Rui Pereira.",
      laboratorio: "Amostra: A-104. Massa: 12,5 g. Volume: 25 ml. Temperatura: 21,0 °C. pH: 7,4. Operador: marta.costa@lab.pt. Data: 03/11/2026. Lote: 4400-123.",
    },
    copia: {
      jornal: "Nome: Joana Silva Pereira. Email: joana.silv@escola.pt. Telemóvel: 912 354 678. Data de nascimento: 03/11/2001. Código postal: 4400-132 Vila Novo de Gaia. Turma: 9.º C. Encarregado: Rui Ferreira.",
      laboratorio: "Amostra: A-140. Marca: 12,5 g. Volume: 52 ml. Temperatura: 21,0 °C. pH: 7,1. Operador: marta.cost@lab.pt. Data: 03/11/2062. Lote: 4400-132.",
    },
  },
  4: {
    diferencas: 9,
    segundos: 240,
    original: {
      jornal: "Silva, A. (2024). Ler no ecrã. Porto: Edições Norte, pp. 12-34. Costa, B. & Pires, C. (2023). Avaliação digital. Lisboa: Horizonte, 3.ª ed. Marques, D. (2025). Verificação de fontes. Coimbra: Almedina, vol. 2, n.º 7, pp. 101-119. Taxa de resposta: 57,3%.",
      laboratorio: "Ensaio 1: 3,5 ml; 22,1 °C; 7,40 pH. Ensaio 2: 3,6 ml; 22,3 °C; 7,38 pH. Ensaio 3: 3,4 ml; 22,0 °C; 7,41 pH. Média: 3,50 ml; 22,13 °C; 7,40 pH. Desvio: 0,10; 0,15; 0,02. Operador: M. Costa. Ref.: LAB-2026-017.",
    },
    copia: {
      jornal: "Silveira, A. (2024). Ler no ecrá. Porto: Edições Norte, pp. 12-43. Costa, B. & Pinto, C. (2022). Avaliação digital. Lisboa; Horizonte, 2.ª ed. Marques, D. (2025). Verificação de fontes. Coimbra: Almedina, vol. 2, n.º 7, pp. 101-191. Taxa de resposta: 57.3%.",
      laboratorio: "Ensaio 1: 3.5 ml; 22,1 °C; 7,40 pH. Ensaio 5: 3,6 ml; 23,3 °C; 7,38 pH. Ensaio 3: 3,4 ml; 22,0 °C; 7,14 pH. Media: 3,50 ml; 22,31 °C; 7,40 pH. Desvio: 0,10; 0,51; 0,02. Operador: N. Costa. Ref.: LAB-2026-071.",
    },
  },
  5: {
    diferencas: 12,
    segundos: 300,
    original: {
      jornal: "Inquérito aos leitores (edição n.º 42, maio de 2026): 1 024 respostas válidas, 57,3% em telemóvel, 38,1% em portátil, 4,6% em tablet. Idade média: 16,4 anos. Secções preferidas: Desporto (31%), Cultura (27%), Escola (24%), Opinião (18%). Contacto: redacao@campus.pt; tel. 222 333 444. Coordenação: Prof.ª Graça Mendes & Tomé Alves.",
      laboratorio: "Relatório LAB-2026-017 (versão 3, 14/05/2026): 5 réplicas por amostra, 37,0 °C ± 0,1, pH 7,40 ± 0,02. Reagente R-12, lote 4471-B, validade 11/2027. Resultados: 1 024 leituras, 57,3% válidas, 38,1% repetidas, 4,6% rejeitadas. Equipamento: espectrofotómetro SP-300 (calibrado 02/05/2026). Operadores: Marta Costa & Rui Pires.",
    },
    copia: {
      jornal: "Inquérito aos leitores (edição n.º 24, junho de 2026): 1 042 respostas validas, 57,3% em telemóvel, 38,1% em portatil, 4,8% em tablet. Idade média: 16,4 anos. Secções preferidas: Desporto (13%), Cultura (72%), Escola (24%), Opinião (18%). Contacto: redaccao@campus.pt; tlf. 222 335 444. Coordenação: Prof.ª Graça Mendes & Tomé Alvez.",
      laboratorio: "Relatório LAB-2026-071 (versão 8, 14/05/2062): 5 réplicas por amostras, 37,0 °C ± 0,1, pH 7,04 ± 0,02. Reagente R-21, lote 4417-B, validade 11/2072. Resultados: 1 024 leituras, 57,8% válidas, 38,1% repetidas, 4,6% rejeitadas. Equipamento: espetrofotómetro SP-003 (calibrado 02/05/2026). Operadores: Marta Costa & Rui Peres.",
    },
  },
};

function Revisao({ config, contexto, nivel, extensaoTempo, aoTerminar }: PropsAtividade<ConfigRevisao>) {
  const original = config.original[contexto];
  const copia = config.copia[contexto];
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
    original: { jornal: "O jornal sai na sexta.", laboratorio: "A amostra está no frio." },
    copia: { jornal: "O jornal sai na sesta.", laboratorio: "A amostra está no frito." },
  }),
  Componente: Revisao,
  dica: (m) => {
    if (Number(m.errados) > Number(m.encontradas)) return "Marca só quando tiveres a certeza: cada clique errado desconta meio ponto. Compara palavra a palavra, com o dedo ou o cursor.";
    return "Os erros mais comuns escondem-se em números e emails: lê os dígitos um a um e verifica o que está antes do @.";
  },
});
