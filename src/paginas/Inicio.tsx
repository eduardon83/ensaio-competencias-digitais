import { useEffect, useState } from "react";
import { Link } from "react-router";
import { obterAgregados, telemetriaConfigurada } from "../dados/telemetria";
import { FAIXAS, faixaDe } from "../motor/tipos";
import { AvisoTutorial } from "./Tutorial";

const BLOCOS = [
  { para: "/treinar", titulo: "Treinar", texto: "Faz o teste do teu nível, treina uma atividade, joga, aprende a navegar em segurança ou entra com o código do teu professor.", icone: "▶" },
  { para: "/professor", titulo: "Professor", texto: "Crie uma prova para as suas turmas, para avaliar as suas competências digitais.", icone: "✎" },
  { para: "/tutorial", titulo: "Tutorial", texto: "O funcionamento do Ensaio às Competências Digitais encontra-se explicado num breve tutorial. Tempo de leitura: 2 minutos.", icone: "?" },
  { para: "/observatorio", titulo: "Observatório", texto: "Estatísticas anónimas: que competências faltam e a quantas pessoas.", icone: "◔" },
];

/** Média global das pontuações no Observatório (só grupos públicos, com 20 ou mais tentativas). */
function useMediaGlobal(): { media: number; n: number } | null {
  const [m, setM] = useState<{ media: number; n: number } | null>(null);
  useEffect(() => {
    if (!telemetriaConfigurada) return;
    obterAgregados().then((r) => {
      if (!r || "erro" in r) return;
      const grupos = Object.values(r.por_atividade);
      const n = grupos.reduce((s, g) => s + g.n, 0);
      if (n > 0) setM({ media: Math.round(grupos.reduce((s, g) => s + g.media * g.n, 0) / n), n });
    });
  }, []);
  return m;
}

export function Inicio() {
  const mediaGlobal = useMediaGlobal();
  const faixaGlobal = mediaGlobal ? faixaDe(mediaGlobal.media) : null;
  return (
    <div className="grid gap-12">
      <section className="grid gap-4 max-w-3xl mx-auto text-center justify-items-center">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>
          Gratuito · pt-PT · sem conta
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-none" style={{ letterSpacing: "-.02em" }}>
          Antes da prova, o ecrã.
        </h1>
        <p className="text-xl m-0">Treina as tuas competências digitais antes das provas e testes importantes! Podes treinar-te a escrever no teclado, ler num ecrã, preencher campos, gerir o tempo, entre outras competências. Há também jogos e testes de segurança online.</p>
        <p className="m-0">O Ensaio às Competências Digitais (ECD) ajuda a treinar estas competências. É gratuito. Não é preciso conta nem dados pessoais.</p>
      </section>

      <AvisoTutorial />

      <nav aria-label="Entradas principais" className="grid gap-4 sm:grid-cols-2 max-w-4xl w-full mx-auto">
        {BLOCOS.map((b) => (
          <Link key={b.para} to={b.para} className="bloco-entrada cartao no-underline grid gap-2 p-6" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-xl text-2xl font-extrabold" style={{ width: 56, height: 56, background: "var(--acento)", color: "var(--acento-tinta)" }}>
              {b.icone}
            </span>
            <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--fonte-titulo)" }}>
              {b.titulo}
            </span>
            <span style={{ color: "var(--suave)" }}>{b.texto}</span>
          </Link>
        ))}
      </nav>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="cartao p-5 grid gap-2 content-start">
          <h2 className="text-xl">Porquê</h2>
          <p className="m-0 text-sm">
            Desde 2025, as provas ModA do 4.º e 6.º anos e as provas finais do 9.º ano são feitas em suporte digital. O IAVE criou provas-ensaio para que todos os alunos cheguem à prova em situação de equidade.<sup>1</sup>
          </p>
          <p className="m-0 text-sm">
            Estudos em vários países mostram que o mesmo teste pode dar resultados mais baixos no computador do que em papel. A diferença tende a ser maior para alunos com menos acesso a tecnologia.<sup>2, 3</sup>
          </p>
          <p className="m-0 text-sm">
            Usar o telemóvel todos os dias não ensina a usar um formulário ou um teclado completo. No estudo ICILS 2023, cerca de um terço dos alunos portugueses do 8.º ano ficou abaixo do nível 2 de literacia digital.<sup>4</sup>
          </p>
        </div>
        <div className="cartao p-5 grid gap-2 content-start">
          <h2 className="text-xl">Como funciona</h2>
          <p className="m-0 text-sm">Escolhes o teu nível. Fazes atividades curtas, como num jogo. Cada uma dá uma pontuação de 0 a 100. No fim vês o que já dominas e o que podes treinar.</p>
          <p className="m-0 text-sm">Antes de começar escolhes o cenário: a redação do jornal da escola, ou um laboratório de experiências.</p>
          <p className="m-0 text-sm">Os professores montam uma prova, dão o código à turma e veem os resultados por código.</p>
        </div>
        <div className="cartao p-5 grid gap-2 content-start">
          <h2 className="text-xl">Os teus dados</h2>
          <p className="m-0 text-sm">Não há contas nem registos de pessoas. Os teus resultados ficam no teu navegador. Para estatísticas, cada atividade envia um registo anónimo que serve para perceber que competências faltam e a quantas pessoas. Podes desligar isso nas Definições.</p>
          <p className="m-0 text-sm">Sem endereço IP, sem impressão digital do dispositivo, sem analítica de terceiros. Por isso não há aviso de cookies.</p>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">Nível médio de competências digitais</h2>
        {mediaGlobal && faixaGlobal && (
          <p className="m-0">
            Média de todos os utilizadores: <strong className="tabular-nums">{mediaGlobal.media}</strong> pontos, nível <strong>{faixaGlobal.nome}</strong> ({mediaGlobal.n} atividades concluídas). Mais números no <Link to="/observatorio">Observatório</Link>.
          </p>
        )}
        <div className="faixa" role="list">
          {FAIXAS.map((f) => (
            <div key={f.nome} role="listitem" aria-current={faixaGlobal?.nome === f.nome ? "true" : undefined} style={faixaGlobal?.nome === f.nome ? { outline: "3px solid var(--acento)", outlineOffset: -3 } : undefined}>
              <b className="block" style={{ fontFamily: "var(--fonte-titulo)" }}>
                {f.nome}
              </b>
              <span className="tabular-nums text-xs" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>
                {f.min} a {f.max}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm m-0" style={{ color: "var(--suave)" }}>
          As pontuações descrevem o desempenho dos utilizadores nas diferentes atividades do ECD. Não são uma certificação DigComp. Os limiares são estimativas iniciais e poderão ser recalibrados.
        </p>
      </section>

      <section className="text-xs" style={{ color: "var(--suave)" }}>
        <p className="m-0">
          1. IAVE, Preparar o Digit@l, 2025. 2. Backes e Cowan, Harvard EdLabs, 2019. 3. Kröhne e Martens, 2011; Lindner et al., 2024. 4. IAVE, Relatório Nacional ICILS 2023. Ligações completas em <Link to="/sobre">Sobre</Link>.
        </p>
      </section>
    </div>
  );
}

export function Treinar() {
  const opcoes = [
    { para: "/teste", titulo: "Teste", texto: "Uma sequência de atividades para o teu nível de ensino. No fim, tens acesso ao teu perfil de competências.", icone: "☰" },
    { para: "/treino", titulo: "Atividade", texto: "Escolhe uma atividade e um de cinco níveis. É possível repetir as atividades e bater o recorde anterior.", icone: "◎" },
    { para: "/codigo", titulo: "Código", texto: "O teu professor deu-te um código? Introduz aqui para fazer a prova.", icone: "#" },
    { para: "/jogos", titulo: "Jogos", texto: "Jogos para desenvolver competências: leitura com literatura portuguesa, escape room, mistério, folha de cálculo, email e um robô para programar.", icone: "🎲" },
    { para: "/seguranca", titulo: "Segurança", texto: "Informações e testes sobre boas práticas online, exemplos de fraude e redes sociais.", icone: "🛡" },
  ];
  return (
    <div className="grid gap-8">
      <header className="grid gap-2 text-center justify-items-center">
        <h1 className="text-4xl">Treinar</h1>
        <p className="m-0 max-w-2xl">Escolhe como queres treinar. Em todas as opções, antes de começar escolhes o cenário.</p>
      </header>
      <nav aria-label="Modos de treino" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full mx-auto">
        {opcoes.map((b) => (
          <Link key={b.para} to={b.para} className="bloco-entrada cartao no-underline grid gap-2 p-6 content-start" style={{ color: "var(--tinta)" }}>
            <span aria-hidden="true" className="grid place-items-center rounded-xl text-2xl font-extrabold" style={{ width: 56, height: 56, background: "var(--acento)", color: "var(--acento-tinta)" }}>
              {b.icone}
            </span>
            <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--fonte-titulo)" }}>
              {b.titulo}
            </span>
            <span style={{ color: "var(--suave)" }}>{b.texto}</span>
          </Link>
        ))}
      </nav>
      <p className="text-center text-sm m-0" style={{ color: "var(--suave)" }}>
        Primeira vez? Vê o <Link to="/tutorial">tutorial</Link>. Os teus carimbos estão no <Link to="/cartao">cartão</Link>.
      </p>
    </div>
  );
}
