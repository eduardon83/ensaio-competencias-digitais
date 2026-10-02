import { LigacaoBotao } from "../ui";
import { FAIXAS } from "../motor/tipos";

export function Inicio() {
  return (
    <div className="grid gap-12">
      <section className="grid gap-5 max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--suave)", fontFamily: "var(--fonte-mono)" }}>
          Gratuito · pt-PT · sem conta
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-none" style={{ letterSpacing: "-.02em" }}>
          Antes da prova, o ecrã.
        </h1>
        <p className="text-xl m-0">As provas são cada vez mais feitas no computador. Saber a matéria não chega. É preciso escrever no teclado, ler num ecrã, preencher campos e gerir o tempo.</p>
        <p className="m-0">O Ensaio às Competências Digitais ajuda a treinar estas competências. É gratuito. Não precisa de conta.</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <LigacaoBotao para="/teste" grande>
            Fazer o teste
          </LigacaoBotao>
          <LigacaoBotao para="/codigo" variante="contorno" grande>
            Tenho um código
          </LigacaoBotao>
          <LigacaoBotao para="/treino" variante="contorno" grande>
            Treinar uma atividade
          </LigacaoBotao>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="cartao p-5 grid gap-2">
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
        <div className="cartao p-5 grid gap-2">
          <h2 className="text-xl">Como funciona</h2>
          <p className="m-0 text-sm">Escolhes o teu nível. Fazes atividades curtas, como num jogo. Cada uma dá uma pontuação de 0 a 100. No fim vês o que já dominas e o que podes treinar.</p>
          <p className="m-0 text-sm">Há dois cenários à escolha: a redação do jornal da escola, ou um laboratório de experiências. E dois aspetos: o editorial Kendir ou o Mosaico, o design system dos serviços públicos portugueses.</p>
          <p className="m-0 text-sm">Os professores podem criar um código para a turma e receber os resultados por email.</p>
        </div>
        <div className="cartao p-5 grid gap-2">
          <h2 className="text-xl">Os teus dados</h2>
          <p className="m-0 text-sm">Não há contas nem registos de pessoas. Os teus resultados ficam no teu navegador. Para estatísticas, cada atividade envia um registo anónimo que serve para perceber que competências faltam e a quantas pessoas. Podes desligar isso nas Definições.</p>
          <p className="m-0 text-sm">Sem endereço IP, sem impressão digital do dispositivo, sem analítica de terceiros. Por isso não há aviso de cookies.</p>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl">Onde ficas</h2>
        <div className="faixa" role="list">
          {FAIXAS.map((f) => (
            <div key={f.nome} role="listitem">
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
          As pontuações descrevem o desempenho neste jogo. Não são uma certificação DigComp. Os limiares são estimativas iniciais, a recalibrar com um piloto em escolas.
        </p>
      </section>

      <section className="text-xs" style={{ color: "var(--suave)" }}>
        <p className="m-0">
          1. IAVE, Preparar o Digit@l, 2025. 2. Backes e Cowan, Harvard EdLabs, 2019. 3. Kröhne e Martens, 2011; Lindner et al., 2024. 4. IAVE, Relatório Nacional ICILS 2023. Ligações completas em <a href="/sobre">Sobre</a>.
        </p>
      </section>
    </div>
  );
}
