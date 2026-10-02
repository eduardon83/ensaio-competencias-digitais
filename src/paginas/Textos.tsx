// ─── Páginas de texto: guia de acessibilidade, sobre (com espaço para vídeo), privacidade ──
import { Link } from "react-router";
import { AUTORIA, DATA_VERSAO, REPOSITORIO, VERSAO } from "../versao";

/** URL do vídeo de apresentação (YouTube/Vimeo "embed" ou ficheiro .mp4). Vazio = espaço reservado. */
const VIDEO_SOBRE: string = (import.meta.env.VITE_VIDEO_SOBRE as string | undefined)?.trim() ?? "";

export function Video({ titulo }: { titulo: string }) {
  if (!VIDEO_SOBRE) {
    return (
      <div className="video" role="img" aria-label="Espaço reservado para o vídeo de apresentação">
        <div className="grid gap-1 p-4">
          <span className="text-4xl" aria-hidden="true">▶</span>
          <strong>Vídeo de apresentação</strong>
          <span className="text-sm">Em breve.</span>
        </div>
      </div>
    );
  }
  if (/\.(mp4|webm)(\?|$)/i.test(VIDEO_SOBRE)) {
    return (
      <div className="video">
        <video controls preload="metadata" src={VIDEO_SOBRE} aria-label={titulo} />
      </div>
    );
  }
  return (
    <div className="video">
      <iframe src={VIDEO_SOBRE} title={titulo} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
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
            <li>Expirar a sessão nunca perde respostas: guardar cada resposta e mostrar “Guardado”.</li>
          </ul>
          <h3 className="text-sm uppercase tracking-wide" style={{ color: "var(--suave)" }}>
            Conteúdo
          </h3>
          <ul className="grid gap-1 pl-5 m-0">
            <li>Contraste de texto 4,5:1, de componentes 3:1. Nunca só a cor.</li>
            <li>Funciona a 200 % de zoom e a 320 px de largura sem scroll horizontal (1.4.4, 1.4.10).</li>
            <li>Rótulos e instruções visíveis e ligados aos campos. Os erros dizem o que está mal e como corrigir (3.3.1, 3.3.3).</li>
            <li>Não pedir a mesma informação duas vezes (3.3.7).</li>
            <li>Início de sessão, quando existe, sem testes de memória ou puzzles; permitir colar e gestores de palavras-passe (3.3.8).</li>
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
          Estado: em desenvolvimento, versão {VERSAO}. Objetivo: WCAG 2.2 nível AA. A auditoria automática (axe-core, regras WCAG 2.2 A e AA) não encontrou problemas nas páginas e atividades, nos dois aspetos e nos dois temas; falta a revisão manual com leitor de ecrã. Problemas de acessibilidade: contactar a Kendir Studios. O aspeto Mosaico usa componentes do Ágora Design System da AMA; o aspeto Original usa componentes próprios com os mesmos requisitos. Ambos têm tema claro e escuro.
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
      <Video titulo="Apresentação do Ensaio às Competências Digitais" />
      <p className="m-0">
        Ensaio às Competências Digitais (ECD), versão {VERSAO} de {DATA_VERSAO}. Um projeto Eduardo Nunes &amp; Kendir Studios (Worlds4Education - Jogos e Ambientes Educativos, Lda. | NIPC 516583824).
      </p>
      <p className="m-0">Plataforma web de código aberto, em português de Portugal, onde alunos treinam e medem as competências digitais práticas que as provas em computador pressupõem: escrever no teclado, ler ecrãs, preencher formulários, navegar, gerir o tempo, escrever matemática.</p>
      <p className="m-0">Sem contas, sem registos de pessoas e sem base de dados: a aplicação é um conjunto de ficheiros estáticos que qualquer escola ou entidade pode alojar. As estatísticas de uso são anónimas e vão para uma folha de cálculo controlada por quem publica a aplicação.</p>
      {REPOSITORIO && (
        <p className="m-0">
          Código-fonte:{" "}
          <a href={REPOSITORIO} target="_blank" rel="noreferrer">
            {REPOSITORIO}
          </a>
        </p>
      )}
      <section className="grid gap-2">
        <h2 className="text-2xl">Estado</h2>
        <ul className="pl-5 m-0 grid gap-1 text-sm">
          <li>Versão atual: motor de atividades, as 11 atividades jogáveis a 5 níveis, com tarefas, textos e alvos sorteados em cada tentativa, teste por ciclo, treino, carimbos e cartão de imprensa, dois contextos narrativos (redação e laboratório), duas interfaces de utilização possíveis (Original e Mosaico) com tema claro e escuro, resultados locais, telemetria anónima com Observatório e ecrã de administração.</li>
          <li>Ferramentas de suporte: tutorial, sessões de professor com código, QR, resultados por email e página privada de resultados; auditoria automática de acessibilidade (WCAG 2.2 AA); protocolo de piloto e script de recalibração dos limiares.</li>
          <li>Backlog: piloto em escolas, recalibração dos limiares com os dados do piloto, revisão manual de acessibilidade com leitor de ecrã.</li>
        </ul>
      </section>
      <p className="m-0">
        Primeira vez? Vê o <Link to="/tutorial">tutorial</Link>. Estatísticas de uso no <Link to="/observatorio">Observatório</Link>.
      </p>
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
        <h2 className="text-xl">Não há contas</h2>
        <p className="m-0">Ninguém se regista. Não pedimos nome, email nem idade. Os teus resultados ficam só no teu navegador, para veres a tua evolução; podes exportá-los ou apagá-los em “Os meus resultados”. O nome que escreveres nas Definições serve só para aparecer no teu ecrã de resultado e nunca sai do teu computador.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Estatísticas anónimas</h2>
        <p className="m-0">Para sabermos que competências faltam e a quantas pessoas, cada atividade concluída envia um pequeno registo anónimo: um identificador aleatório criado no teu navegador (não ligado a ti), a atividade, o nível, a pontuação, a duração, algumas medidas da atividade (por exemplo palavras por minuto), o tipo de dispositivo (computador, tablet, telemóvel), o contexto e o aspeto escolhidos, e se usaste tempo alargado. Não enviamos o endereço IP, nem impressão digital do dispositivo, nem usamos analítica ou publicidade de terceiros. Por isso não há aviso de cookies: só há armazenamento estritamente necessário.</p>
        <p className="m-0">Os registos vão para uma folha de cálculo controlada pela entidade que publica a aplicação, na União Europeia, e servem só para estatísticas agregadas. No Observatório, qualquer grupo com menos de 20 tentativas fica oculto. Podes desligar o envio em Definições → Estatísticas anónimas; a aplicação funciona exatamente igual.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Sessões de professor</h2>
        <p className="m-0">Quando um professor cria uma sessão, guardamos o código, a configuração da prova e, se o professor o indicar, o seu email, para lhe enviar os resultados. O email só é usado depois de confirmado por ligação e é apagado 12 meses após a última tentativa. Nas tentativas feitas com o código vai também o identificador que o professor pediu (número de turma ou alcunha); recomendamos o número de turma em vez do nome.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Base legal e contacto</h2>
        <p className="m-0">Os dados anónimos não identificam ninguém e são tratados com base no interesse legítimo de melhorar a preparação dos alunos para provas digitais. Dúvidas ou pedidos: Kendir Studios.</p>
      </section>
    </div>
  );
}

export function Licenca() {
  return (
    <div className="grid gap-5 max-w-3xl">
      <h1 className="text-4xl">Licença</h1>
      <p className="m-0">
        O Ensaio às Competências Digitais é uma ferramenta gratuita desenvolvida por {AUTORIA} para uso pelo Estado Português. Qualquer pessoa, escola ou entidade pode usá-la, copiá-la, adaptá-la e publicá-la de forma gratuita, desde que mantenha a atribuição:
      </p>
      <blockquote className="cartao p-4 m-0 font-bold">“Ensaio às Competências Digitais, desenvolvido por {AUTORIA}.”</blockquote>
      <section className="grid gap-2">
        <h2 className="text-xl">Código-fonte: Licença MIT</h2>
        <p className="m-0">Permite usar, alterar e redistribuir o código para qualquer fim, mantendo o aviso de direitos de autor da Kendir Studios em todas as cópias.</p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Conteúdos: Creative Commons Atribuição 4.0 (CC BY 4.0)</h2>
        <p className="m-0">
          Textos das atividades, narrativas, personagens, documentação e design. Podem ser partilhados e adaptados para qualquer fim, desde que se indique a autoria ({AUTORIA}), se inclua uma ligação para a licença e se assinale o que foi alterado.{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.pt" target="_blank" rel="noreferrer">
            Texto da licença CC BY 4.0
          </a>
          .
        </p>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl">Componentes de terceiros</h2>
        <p className="m-0">O Ágora Design System (AMA), React, dnd-kit e as restantes bibliotecas mantêm as suas licenças próprias. As marcas e logótipos da Kendir Studios não estão incluídos nesta licença.</p>
      </section>
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
        O texto completo está no ficheiro LICENSE do código-fonte.
      </p>
    </div>
  );
}
