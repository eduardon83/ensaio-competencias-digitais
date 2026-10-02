// ─── Páginas de texto: código de turma e professor (fase 3, placeholders), guia de acessibilidade, sobre, privacidade ──
import { useState } from "react";
import { Link } from "react-router";
import { Botao, CampoTexto } from "../ui";
import { DATA_VERSAO, VERSAO } from "../versao";

export function Codigo() {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  return (
    <div className="grid gap-5 max-w-xl">
      <h1 className="text-4xl">Entrar com código</h1>
      <p className="m-0">O teu professor deu-te um código do tipo <code style={{ fontFamily: "var(--fonte-mono)" }}>TECLA·4F7K</code>. Escreve-o aqui para fazeres as atividades que ele escolheu.</p>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErro("As sessões de turma chegam na fase 3 (códigos, emails ao professor, relatórios). Por agora podes treinar livremente.");
        }}
      >
        <CampoTexto id="codigo" rotulo="Código da sessão" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} autoComplete="off" placeholder="XXXX·XXXX" erro={erro} obrigatorio />
        <div className="flex gap-3">
          <Botao type="submit" disabled={codigo.trim().length < 4}>
            Entrar
          </Botao>
          <Link to="/treino" className="botao botao--discreto">
            Treinar sem código
          </Link>
        </div>
      </form>
    </div>
  );
}

export function Professor() {
  return (
    <div className="grid gap-5 max-w-3xl">
      <h1 className="text-4xl">Criar uma sessão de turma</h1>
      <p className="m-0">Em construção (fase 3 da especificação). O que vai existir aqui:</p>
      <ol className="grid gap-2 pl-6">
        <li>Escolher o nível, uma ou mais atividades (ou o teste completo), extensão de tempo e datas de abertura e fecho.</li>
        <li>Indicar como os alunos se identificam: número de turma, alcunha ou nada.</li>
        <li>Email opcional, verificado uma vez. Sem verificação não saem relatórios.</li>
        <li>Código no formato XXXX·XXXX (sem O/0, I/1/L), com ligação e QR.</li>
        <li>Email por tentativa ou resumo diário, com a ligação privada de gestão: tabela, CSV, fechar sessão.</li>
      </ol>
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
        Sessões e resultados são apagados 12 meses após a última tentativa.
      </p>
    </div>
  );
}

export function Acessibilidade() {
  return (
    <div className="grid gap-8 max-w-4xl">
      <header className="grid gap-2">
        <h1 className="text-4xl">Guia de acessibilidade</h1>
        <p className="m-0">Para quem desenvolve, para escolas e para quem encomenda provas digitais. O enquadramento legal: o European Accessibility Act aplica-se desde 28 de junho de 2025; a EN 301 549 v4.1.1 (setembro de 2026) adota a WCAG 2.2 AA; os organismos públicos em Portugal seguem o Decreto-Lei 83/2018 e publicam uma declaração de acessibilidade. Este jogo compromete-se a cumprir todos os pontos abaixo.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="grid gap-3">
          <h2 className="text-2xl">Para quem desenvolve</h2>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Operação
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Tudo funciona só com teclado, por ordem lógica, com foco visível (WCAG 2.1.1, 2.4.7).</li>
            <li>O foco nunca fica escondido por cabeçalhos ou rodapés fixos (2.4.11).</li>
            <li>Todo o arrasto tem alternativa por clique ou toque (2.5.7).</li>
            <li>Alvos com pelo menos 24 por 24 px; de preferência 44 para crianças (2.5.8).</li>
            <li>Nunca exigir atalhos que o navegador ou o sistema reservam.</li>
          </ul>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Tempo
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Os temporizadores podem ser alargados por aluno, como acomodação (2.2.1).</li>
            <li>Os avisos de tempo são anunciados a leitores de ecrã, não só por cor.</li>
            <li>Expirar a sessão nunca perde respostas: guardar cada resposta e mostrar «Guardado».</li>
          </ul>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Conteúdo
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Contraste de texto 4,5:1, de componentes 3:1. Nunca só a cor.</li>
            <li>Funciona a 200 % de zoom e a 320 px de largura sem scroll horizontal (1.4.4, 1.4.10).</li>
            <li>Rótulos e instruções visíveis e ligados aos campos. Os erros dizem o que está mal e como corrigir (3.3.1, 3.3.3).</li>
            <li>Não pedir a mesma informação duas vezes (3.3.7).</li>
            <li>Início de sessão sem testes de memória ou puzzles; permitir colar e gestores de palavras-passe (3.3.8).</li>
            <li>Ajuda no mesmo sítio em todos os ecrãs (3.2.6).</li>
            <li>Legendas e transcrições para áudio e vídeo; controlo de repetição nos itens com áudio.</li>
            <li>Respeitar o movimento reduzido e as definições de tipo de letra e espaçamento do utilizador (1.4.12).</li>
            <li>Linguagem simples. Testar as instruções com alunos da idade alvo.</li>
          </ul>
        </section>
        <section className="grid gap-3">
          <h2 className="text-2xl">Para escolas e entidades avaliadoras</h2>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Antes da prova
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Dar aos alunos a interface real para praticar meses antes, não dias.</li>
            <li>Ensinar a interface, não só a matéria: navegação, listas de revisão, ferramentas, submissão.</li>
            <li>Testar nos dispositivos, teclados e rede reais da escola, com a turma toda ligada.</li>
            <li>Dar tempo às equipas de informática para instalar aplicações.</li>
            <li>Recolher cedo as necessidades de acomodação (mais tempo, leitor de ecrã, letra grande) e confirmar que funcionam na plataforma.</li>
          </ul>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Durante a prova
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Ter alternativa em papel ou offline pronta.</li>
            <li>Registar incidentes técnicos por aluno, para ler os resultados em contexto.</li>
            <li>Repor o tempo perdido por falha técnica.</li>
          </ul>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Ao comprar ou encomendar
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Exigir conformidade com a EN 301 549 (WCAG 2.2 AA) no caderno de encargos e pedir relatório de auditoria, não só autodeclaração.</li>
            <li>Exigir compatibilidade com as tecnologias de apoio usadas nas escolas.</li>
            <li>Comparar resultados digitais e em papel (efeito de modo) e publicar a análise.</li>
            <li>Publicar uma declaração de acessibilidade e um contacto para problemas.</li>
          </ul>
        </section>
      </div>
      <section className="cartao p-5 grid gap-2">
        <h2 className="text-xl">Declaração de acessibilidade deste sítio</h2>
        <p className="m-0 text-sm">
          Estado: em desenvolvimento, versão {VERSAO}. Objetivo: WCAG 2.2 nível AA. Auditoria e passagem com leitor de ecrã previstas para a fase 6. Problemas de acessibilidade: contactar a Kendir Studios. Nesta versão, o aspeto Mosaico usa componentes do Ágora Design System da AMA; o aspeto Kendir usa componentes próprios com os mesmos requisitos.
        </p>
      </section>
    </div>
  );
}

export function Sobre() {
  const fontes = [
    ["IAVE, Preparar o Digit@l: Provas-Ensaio 2025", "https://iave.pt/wp-content/uploads/2025/01/Provas-ensaio_Comunicacao-as-escolas_IAVE.pdf"],
    ["Harvard GSE, Testing Mode Matters (Backes e Cowan)", "https://www.gse.harvard.edu/ideas/usable-knowledge/19/01/testing-mode-matters"],
    ["Comparing Test-Taking Effort Between Paper-Based and Computer-Based Tests (PMC)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10846472/"],
    ["Kröhne e Martens, Computer-based competence tests in the NEPS", "https://www.researchgate.net/publication/225123434"],
    ["Kappan, Assessing our assessments: Paper vs. computer", "https://kappanonline.org/assessing-our-assessments-paper-vs-computer/"],
    ["IAVE, ICILS 2023 Relatório Nacional", "https://iave.pt/wp-content/uploads/2024/11/Relatorio-Final-ICILS.pdf"],
    ["Iniciativa Educação, Literacia digital em tempos de pandemia", "https://www.iniciativaeducacao.org/pt/ed-on/artigos/estatisticas/literacia-digital-em-tempos-de-pandemia-o-impacto-do-ensino-remoto-nas-competencias-digitais"],
    ["Comissão Europeia, ICILS in Europe 2023", "https://op.europa.eu/en/publication-detail/-/publication/59721dc6-a0aa-11ef-85f0-01aa75ed71a1/"],
    ["Público, Maioria dos alunos não terminou prova de aferição no tempo estipulado", "https://www.publico.pt/2023/05/29/sociedade/noticia/maioria-alunos-nao-terminou-prova-afericao-tempo-estipulado-problemas-tecnicos-2051484"],
    ["JRC, DigComp 2.2", "https://publications.jrc.ec.europa.eu/repository/handle/JRC128415"],
    ["AccessibleEU, EN 301 549 has been updated", "https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en"],
    ["Ágora Design System (AMA) · Mosaico", "https://mosaico.gov.pt/ferramentas/agora-design-system"],
  ];
  return (
    <div className="grid gap-6 max-w-3xl">
      <h1 className="text-4xl">Sobre</h1>
      <p className="m-0">
        Ensaio às Competências Digitais (ECD), versão {VERSAO} de {DATA_VERSAO}. Um projeto Kendir Studios / Worlds4Education. Jogo web aberto, em português de Portugal, onde alunos treinam e medem as competências digitais práticas que as provas em computador pressupõem: escrever no teclado, ler ecrãs, preencher formulários, navegar, gerir o tempo, escrever matemática.
      </p>
      <section className="grid gap-2">
        <h2 className="text-2xl">Estado</h2>
        <ul className="pl-5 m-0 grid gap-1 text-sm">
          <li>Fase 1 (em curso): motor de atividades, 7 das 11 atividades jogáveis a 5 níveis, teste por ciclo, treino, dois contextos narrativos (redação e laboratório), dois aspetos (Kendir e Mosaico), dados locais.</li>
          <li>Fase 2: O Arquivo, Cartão de Imprensa, Fecho de Edição, Simulador de Prova; carimbos e cartão de imprensa.</li>
          <li>Fase 3: códigos de turma, emails ao professor, ligação de gestão, CSV.</li>
          <li>Fase 4: contas por ligação mágica, histórico sincronizado, certificados com verificação.</li>
          <li>Fase 5: Observatório público com agregação no servidor e limiar de 20 tentativas.</li>
          <li>Fase 6: auditoria WCAG 2.2 AA, piloto em escolas, recalibração dos limiares.</li>
        </ul>
      </section>
      <section className="grid gap-2">
        <h2 className="text-2xl">Fontes</h2>
        <ol className="pl-5 m-0 grid gap-1 text-sm">
          {fontes.map(([t, u]) => (
            <li key={u}>
              <a href={u} target="_blank" rel="noreferrer">
                {t}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Privacidade() {
  return (
    <div className="grid gap-5 max-w-3xl">
      <h1 className="text-4xl">Privacidade</h1>
      <p className="m-0">Escrito em linguagem simples. Se algo não ficar claro, pergunta.</p>
      <section className="grid gap-2">
        <h2 className="text-xl">O que guardamos sem conta</h2>
        <p className="m-0">Um identificador aleatório criado no teu navegador e, por cada atividade: nível, atividade, pontuação, duração, algumas medidas (por exemplo palavras por minuto, se usaste a procura), tipo de dispositivo (computador, tablet, telemóvel), contexto e aspeto escolhidos, e se usaste tempo alargado. Não guardamos o endereço IP, nem impressão digital do dispositivo, nem usamos analítica ou publicidade de terceiros. Por isso não há aviso de cookies: só há armazenamento estritamente necessário.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Nesta versão</h2>
        <p className="m-0">Todos os dados ficam apenas no teu navegador. Podes exportá-los em CSV ou apagá-los em «O meu histórico». Quando a versão com servidor estiver ativa, os dados anónimos serão guardados na União Europeia e usados para estatísticas agregadas (Observatório), com base no interesse legítimo de perceber que competências faltam e a quantas pessoas.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Contas e sessões de turma (fases seguintes)</h2>
        <p className="m-0">Com conta, pedimos só nome e email (consentimento). Em Portugal a idade de consentimento digital é 13 anos; abaixo disso, um adulto cria a conta. Nas sessões de turma guardamos o email do professor (verificado) e o identificador que o professor escolher para cada aluno; recomendamos o número de turma em vez do nome. Sessões apagam-se 12 meses após a última tentativa; contas quando o utilizador pedir, ou após 24 meses de inatividade com aviso prévio.</p>
      </section>
    </div>
  );
}
