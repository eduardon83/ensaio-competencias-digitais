// ─── Segurança · Família e controlo parental: O Acordo da Família ─────────────
// Parte 1: mito ou facto sobre o controlo parental e a vida online em família.
// Parte 2: configurar, em família, o controlo parental do tablet de uma criança (idade sorteada; a classificação
// PEGI máxima depende da idade).
// Parte 3: situações em que pedir ajuda e conversar em família faz a diferença.
// Pontuação: 30 % mito ou facto + 30 % painel + 40 % situações.
import { useState } from "react";
import { amostra, escolher, inteiro, misturar, type Gerador } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio, Interruptor, Seletor } from "../ui";
import { Janela } from "../componentes/Janela";
import { Ouvir } from "../componentes/Ouvir";
import { CabecalhoParte, Situacoes, type Situacao } from "./Situacoes";

export interface ConfigFamilia {
  afirmacoes: number;
  definicoes: number;
  situacoes: number;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigFamilia> = {
  1: { afirmacoes: 3, definicoes: 3, situacoes: 3 },
  2: { afirmacoes: 4, definicoes: 4, situacoes: 4 },
  3: { afirmacoes: 5, definicoes: 5, situacoes: 5 },
  4: { afirmacoes: 6, definicoes: 6, situacoes: 6 },
  5: { afirmacoes: 7, definicoes: 6, situacoes: 7 },
};

// ─── Mito ou facto ───────────────────────────────────────────────────────────
export const AFIRMACOES: { texto: string; facto: boolean; porque: string }[] = [
  { texto: "Com controlo parental ligado, já não é preciso falar sobre o que se faz online.", facto: false, porque: "Os filtros falham e não ensinam nada. A conversa em família é o que ajuda a decidir bem quando não há filtro." },
  { texto: "Os filtros de conteúdos não apanham tudo.", facto: true, porque: "Nenhum filtro é perfeito. Por isso é importante saber a quem contar quando aparece algo que incomoda." },
  { texto: "A classificação PEGI indica a idade mínima recomendada para um jogo.", facto: true, porque: "PEGI 3, 7, 12, 16 e 18: o número é a idade mínima. Os símbolos ao lado explicam porquê (violência, medo, linguagem…)." },
  { texto: "Se um jogo é muito popular na turma, é adequado para todas as idades.", facto: false, porque: "A popularidade não diz nada sobre o conteúdo. Vê a classificação PEGI e falem sobre isso em família." },
  { texto: "Contar aos pais que algo correu mal online é a melhor forma de resolver o problema.", facto: true, porque: "Um adulto pode ajudar a guardar provas, bloquear, denunciar e pedir apoio. Ninguém tem de resolver isto sozinho." },
  { texto: "O controlo parental serve para castigar.", facto: false, porque: "Serve para proteger enquanto se aprende. Funciona melhor quando as regras são combinadas e explicadas." },
  { texto: "As regras online devem mudar à medida que a criança cresce.", facto: true, porque: "Com a idade vem mais autonomia. Revejam o acordo em família de tempos a tempos." },
  { texto: "Os pais também devem dar o exemplo, por exemplo no tempo de ecrã às refeições.", facto: true, porque: "As regras funcionam melhor quando valem para toda a família." },
  { texto: "Pedir autorização para compras dentro das aplicações é desnecessário: os jogos grátis não custam nada.", facto: false, porque: "Muitos jogos grátis vendem moedas, caixas surpresa e extras. Sem autorização, é fácil gastar dinheiro sem dar por isso." },
  { texto: "Em Portugal, abaixo dos 13 anos é preciso autorização dos pais para criar conta numa rede social.", facto: true, porque: "É a idade de consentimento digital definida na lei portuguesa." },
  { texto: "Navegar juntos, sobretudo com crianças pequenas, ajuda a perceber o que é seguro.", facto: true, porque: "Explorar em conjunto cria confiança e mostra, na prática, como decidir." },
];

// ─── Painel de controlo parental ─────────────────────────────────────────────
export const PEGI = [3, 7, 12, 16, 18] as const;

/** Classificação PEGI máxima adequada a uma idade: a maior que não passa a idade. */
export function pegiParaIdade(idade: number): number {
  return [...PEGI].reverse().find((p) => p <= idade) ?? 3;
}

export const DEFINICOES_PARENTAIS: { id: string; rotulo: string; ligado: boolean; porque: string }[] = [
  { id: "filtro", rotulo: "Filtro de conteúdos adequado à idade", ligado: true, porque: "Deve estar ligado: bloqueia a maior parte dos conteúdos impróprios. Não substitui a conversa." },
  { id: "compras", rotulo: "Pedir autorização para compras nas aplicações", ligado: true, porque: "Deve estar ligado: evita gastos sem querer e permite conversar sobre cada compra." },
  { id: "desconhecidos", rotulo: "Aceitar mensagens e pedidos de amizade de desconhecidos", ligado: false, porque: "Deve estar desligado: nos jogos e nas aplicações, só contactos que a família conhece." },
  { id: "localizacao", rotulo: "Mostrar a localização a qualquer pessoa", ligado: false, porque: "Deve estar desligado: a localização não deve ser pública." },
  { id: "noite", rotulo: "Pausa para dormir: o tablet fica bloqueado à noite", ligado: true, porque: "Deve estar ligado: dormir bem é importante. A hora combina-se em família." },
  { id: "instalar", rotulo: "Instalar aplicações sem pedir", ligado: false, porque: "Deve estar desligado: cada aplicação nova é uma boa ocasião para verem juntos o que faz e que dados pede." },
  { id: "publico", rotulo: "Perfil público nos jogos online", ligado: false, porque: "Deve estar desligado: o perfil fica visível só para amigos aprovados." },
];

const CRIANCAS = ["Leonor", "Tomás", "Matilde", "Duarte", "Beatriz", "Gabriel", "Carolina", "Martim"];

export function gerarPainel(n: number, r: Gerador = Math.random) {
  const nome = escolher(CRIANCAS, r);
  const idade = inteiro(6, 15, r);
  const defs = amostra(DEFINICOES_PARENTAIS, n, r);
  // Pelo menos metade das definições começa no valor errado, para nunca começar cumprido.
  const erradas = new Set(amostra(defs.map((d) => d.id), Math.max(1, Math.ceil(n / 2)), r));
  const inicial = Object.fromEntries(defs.map((d) => [d.id, erradas.has(d.id) ? !d.ligado : d.ligado])) as Record<string, boolean>;
  return { nome, idade, defs, inicial };
}

// ─── Situações ───────────────────────────────────────────────────────────────
export const SITUACOES_FAMILIA: Situacao[] = [
  { pergunta: "Num vídeo aparece uma coisa que te assusta e não consegues esquecer.", opcoes: ["Conto aos meus pais ou a outro adulto de confiança", "Guardo para mim", "Envio o vídeo aos amigos"], porque: "Falar ajuda a perceber o que viste e a fazer com que não volte a aparecer." },
  { pergunta: "Os teus pais querem ligar o controlo parental no teu tablet.", opcoes: ["Conversamos e combinamos as regras juntos", "Escondo o tablet", "Procuro uma forma de o desligar às escondidas"], porque: "Regras combinadas em família são mais justas e mais fáceis de cumprir." },
  { pergunta: "Um jogo pede 4,99 € para desbloquear uma personagem.", opcoes: ["Peço primeiro autorização aos meus pais", "Uso o cartão dos meus pais sem perguntar", "Dou os dados do cartão a um amigo do jogo"], porque: "Compras online pedem sempre autorização de quem paga." },
  { pergunta: "Um colega diz que conheceu alguém num jogo que lhe pediu para guardar segredo.", opcoes: ["Digo-lhe que conte a um adulto e conto eu também, se for preciso", "Prometo não contar a ninguém", "Peço o contacto dessa pessoa"], porque: "Pedidos de segredo de desconhecidos são um sinal de alerta. Contar não é trair: é proteger." },
  { pergunta: "Queres um jogo PEGI 16 e tens 11 anos.", opcoes: ["Falo com os meus pais e escolhemos um jogo para a minha idade", "Instalo às escondidas", "Peço a um amigo mais velho que o compre"], porque: "A classificação existe por causa do conteúdo (violência, medo, linguagem). Falar ajuda a encontrar alternativas." },
  { pergunta: "À noite, o telemóvel não para de vibrar com mensagens do grupo da turma.", opcoes: ["Deixo o telemóvel fora do quarto, como combinámos em família", "Respondo até de madrugada", "Desligo o despertador para dormir mais"], porque: "Ter uma hora para desligar ajuda a dormir bem. Os amigos podem esperar pela manhã." },
  { pergunta: "Viste o teu irmão mais novo a falar num jogo com um adulto que não conhece.", opcoes: ["Falo com ele com calma e contamos juntos aos pais", "Grito com ele e apago o jogo", "Não digo nada"], porque: "Sem dramatizar, o importante é que um adulto saiba e ajude a decidir." },
  { pergunta: "Os teus pais publicam muitas fotografias tuas nas redes sociais e tu não gostas.", opcoes: ["Digo-lhes com calma e combinamos o que pode ser publicado", "Publico fotografias deles sem pedir", "Não digo nada e fico chateado"], porque: "Também tens direito à tua imagem. Conversar é a melhor forma de chegar a um acordo." },
  { pergunta: "Fizeste uma asneira online e tens medo de ficar sem o telemóvel se contares.", opcoes: ["Conto na mesma: é melhor resolver cedo, com ajuda", "Escondo e espero que passe", "Apago tudo e finjo que nada aconteceu"], porque: "Os problemas online costumam piorar com o tempo. Um bom acordo familiar inclui: contar não dá castigo." },
];

// ─── Componente ──────────────────────────────────────────────────────────────
function Familia({ config, aoTerminar }: PropsAtividade<ConfigFamilia>) {
  const partes = ["Mito ou facto?", "O painel da família", "O que fazes?"];
  const [pi, setPi] = useState(0);
  const [res] = useState<{ m: number; p: number; linhas: LinhaRelatorio[] }>({ m: 0, p: 0, linhas: [] });
  const [inicio] = useState(() => performance.now());
  return (
    <div className="grid gap-4">
      <CabecalhoParte i={pi} total={partes.length} nome={partes[pi]} />
      {pi === 0 && (
        <MitoOuFacto
          n={config.afirmacoes}
          aoConcluir={(fr, l) => {
            res.m = fr;
            res.linhas.push(...l);
            setPi(1);
          }}
        />
      )}
      {pi === 1 && (
        <Painel
          n={config.definicoes}
          aoConcluir={(fr, l) => {
            res.p = fr;
            res.linhas.push(...l);
            setPi(2);
          }}
        />
      )}
      {pi === 2 && (
        <Situacoes
          lista={SITUACOES_FAMILIA}
          n={config.situacoes}
          prefixo="fm"
          instrucao="O que fazes em cada situação?"
          aoConcluir={(fr, l) =>
            aoTerminar({
              pontuacao: limitar(100 * (0.3 * res.m + 0.3 * res.p + 0.4 * fr)),
              duracaoMs: performance.now() - inicio,
              metricas: { mitos: Math.round(100 * res.m), painel: Math.round(100 * res.p), situacoes: Math.round(100 * fr) },
              relatorio: [...res.linhas, ...l],
            })
          }
        />
      )}
    </div>
  );
}

function MitoOuFacto({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [lista] = useState(() => {
    const f = misturar(AFIRMACOES.filter((a) => a.facto));
    const m = misturar(AFIRMACOES.filter((a) => !a.facto));
    return misturar([f[0], m[0], ...misturar([...f.slice(1), ...m.slice(1)])].slice(0, Math.max(1, n)));
  });
  const [resp, setResp] = useState<(boolean | null)[]>(() => lista.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = lista.filter((a, i) => resp[i] === a.facto).length;
  const nome = (b: boolean) => (b ? "Facto" : "Mito");
  return (
    <div className="grid gap-3">
      <Instrucao>Cada frase é um mito (falsa) ou um facto (verdadeira)?</Instrucao>
      {lista.map((a, i) => (
        <fieldset key={a.texto} data-ouvir="" className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === a.facto ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">{i + 1}. “{a.texto}”</legend>
          <div className="flex gap-x-4 flex-wrap">
            <BotaoRadio id={`mf-${i}-f`} name={`mf-${i}`} rotulo="Facto" checked={resp[i] === true} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? true : x)))} />
            <BotaoRadio id={`mf-${i}-m`} name={`mf-${i}`} rotulo="Mito" checked={resp[i] === false} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? false : x)))} />
          </div>
          {feito && <p className="m-0 text-sm" style={{ color: resp[i] === a.facto ? "var(--certo)" : "var(--errado)" }}>{resp[i] === a.facto ? "Certo. " : `É ${nome(a.facto).toLowerCase()}. `}{a.porque}</p>}
          <div><Ouvir /></div>
        </fieldset>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(certas / lista.length, lista.map((a, i) => ({ tarefa: `“${a.texto}”`, resultado: resp[i] === a.facto ? "certo" : "errado", resposta: resp[i] === null ? undefined : nome(resp[i]!), certa: nome(a.facto), feedback: resp[i] === a.facto ? undefined : a.porque })))}>Continuar</Botao>
        )}
        {feito && <span>{certas} de {lista.length} certas.</span>}
      </div>
    </div>
  );
}

function Painel({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [p] = useState(() => gerarPainel(n));
  const [estado, setEstado] = useState(p.inicial);
  const [pegi, setPegi] = useState("18");
  const pegiCerto = pegiParaIdade(p.idade);
  const certasDefs = p.defs.filter((d) => estado[d.id] === d.ligado).length;
  const pegiOk = Number(pegi) === pegiCerto;
  return (
    <div className="grid gap-3">
      <Instrucao>
        {p.nome} tem {p.idade} anos e está a configurar o tablet com os pais. Ajuda a família: escolhe os jogos adequados à idade e deixa cada opção como deve ficar. Depois carrega em Guardar.
      </Instrucao>
      <Janela endereco={`familia.tablet/controlo-parental/${p.nome.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")}`} rotulo="Painel de controlo parental simulado">
        <div className="p-5 grid gap-3 max-w-xl">
          <h3 className="text-lg">Controlo parental · {p.nome}, {p.idade} anos</h3>
          <Seletor id="pegi" rotulo="Jogos permitidos até à classificação" opcoes={PEGI.map((x) => ({ valor: String(x), texto: `PEGI ${x}` }))} value={pegi} onChange={(e) => setPegi(e.target.value)} />
          {p.defs.map((d) => (
            <Interruptor key={d.id} id={`par-${d.id}`} rotulo={d.rotulo} checked={estado[d.id]} onChange={(e) => setEstado((s) => ({ ...s, [d.id]: e.target.checked }))} />
          ))}
        </div>
      </Janela>
      <div>
        <Botao
          onClick={() =>
            aoConcluir((certasDefs + (pegiOk ? 1 : 0)) / (p.defs.length + 1), [
              { tarefa: `Classificação máxima dos jogos (${p.idade} anos)`, resultado: pegiOk ? "certo" : "errado", resposta: `PEGI ${pegi}`, certa: `PEGI ${pegiCerto}`, feedback: pegiOk ? undefined : `O número PEGI é a idade mínima. Com ${p.idade} anos, o máximo adequado é PEGI ${pegiCerto}.` },
              ...p.defs.map((d) => ({ tarefa: d.rotulo, resultado: estado[d.id] === d.ligado ? ("certo" as const) : ("errado" as const), resposta: estado[d.id] ? "Ligado" : "Desligado", certa: d.ligado ? "Ligado" : "Desligado", feedback: estado[d.id] === d.ligado ? undefined : d.porque })),
            ])
          }
        >
          Guardar
        </Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigFamilia>({
  slug: "familia",
  numero: 206,
  dominio: "seguranca",
  titulo: { jornal: "O Acordo da Família", laboratorio: "O Acordo da Família" },
  descricao: "Mitos e factos sobre o controlo parental, um painel para configurar em família e situações para decidir.",
  duracao: "4 a 6 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ afirmacoes: 1, definicoes: 2, situacoes: 1 }),
  Componente: Familia,
  dica: (m) => {
    if (Number(m.painel) < 100) return "O número PEGI é a idade mínima recomendada. E cada opção do painel é uma boa conversa para ter em família.";
    if (Number(m.mitos) < 100) return "O controlo parental ajuda, mas não substitui a conversa: os filtros falham e as regras funcionam melhor quando são combinadas.";
    return "Bom trabalho. Mostra a página Família e controlo parental aos teus pais e façam juntos o vosso acordo.";
  },
});
