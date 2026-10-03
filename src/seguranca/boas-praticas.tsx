// ─── Segurança · Teste de boas práticas online ───────────────────────────────
// Três partes: situações (escolha múltipla com explicação), criar uma palavra-passe forte (verificada no ecrã,
// nunca guardada nem enviada) e deixar uma conta simulada segura (interruptores).
// Pontuação: 50 % situações + 25 % palavra-passe + 25 % conta (nível 1, sem conta: 65/35).
import { useMemo, useRef, useState } from "react";
import { amostra, baralharOpcoes, misturar } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio, Interruptor } from "../ui";
import { Janela } from "../componentes/Janela";

export interface ConfigBoasPraticas {
  situacoes: number;
  senha: { minimo: number; exigeTipos: number; proibeNome: boolean };
  definicoes: number; // 0 = sem a parte da conta
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigBoasPraticas> = {
  1: { situacoes: 4, senha: { minimo: 8, exigeTipos: 2, proibeNome: false }, definicoes: 0 },
  2: { situacoes: 5, senha: { minimo: 10, exigeTipos: 2, proibeNome: true }, definicoes: 4 },
  3: { situacoes: 6, senha: { minimo: 12, exigeTipos: 3, proibeNome: true }, definicoes: 5 },
  4: { situacoes: 7, senha: { minimo: 12, exigeTipos: 3, proibeNome: true }, definicoes: 6 },
  5: { situacoes: 8, senha: { minimo: 14, exigeTipos: 3, proibeNome: true }, definicoes: 6 },
};

interface Situacao {
  pergunta: string;
  opcoes: string[]; // a primeira é a certa
  porque: string;
}

export const SITUACOES: Situacao[] = [
  { pergunta: "Estás no computador da biblioteca e acabaste de ler o teu email. O que fazes?", opcoes: ["Termino a sessão e fecho o navegador", "Fecho só o separador", "Deixo aberto para a próxima vez"], porque: "Num computador partilhado, a sessão fica aberta para quem vier a seguir se não a terminares." },
  { pergunta: "Num computador da escola, o navegador pergunta se queres guardar a palavra-passe.", opcoes: ["Não guardo", "Guardo, para ser mais rápido", "Guardo e escrevo-a num papel ao lado"], porque: "Em computadores partilhados, qualquer pessoa poderia entrar na tua conta." },
  { pergunta: "Um colega pede a tua palavra-passe para entregar um trabalho por ti.", opcoes: ["Não a dou e ajudo-o de outra forma", "Dou, porque é meu amigo", "Dou e mudo-a daqui a um mês"], porque: "A palavra-passe é só tua. Quem a tiver pode fazer tudo em teu nome." },
  { pergunta: "Recebeste por SMS um código de verificação que não pediste.", opcoes: ["Alguém tentou entrar: mudo a palavra-passe", "Ignoro", "Envio o código a quem o pedir"], porque: "Um código que não pediste quer dizer que alguém tem a tua palavra-passe e está a tentar entrar." },
  { pergunta: "O telemóvel avisa que há uma atualização do sistema.", opcoes: ["Instalo assim que puder", "Nunca instalo atualizações", "Espero alguns anos"], porque: "As atualizações corrigem falhas de segurança que os atacantes já conhecem." },
  { pergunta: "Estás num café com Wi-Fi gratuito e queres pagar uma compra online.", opcoes: ["Uso os dados móveis", "Uso o Wi-Fi do café", "Peço a outra pessoa que pague por mim no portátil dela"], porque: "Numa rede pública, outras pessoas podem tentar ver o que passa na rede. Os dados móveis são mais seguros." },
  { pergunta: "Uma aplicação de lanterna pede acesso aos contactos e à localização.", opcoes: ["Recuso: não precisa disso para funcionar", "Aceito tudo", "Aceito só os contactos"], porque: "Permissões a mais podem servir para recolher e vender os teus dados." },
  { pergunta: "Usas a mesma palavra-passe no email e num jogo online. O jogo foi atacado.", opcoes: ["Mudo também a palavra-passe do email", "Não faço nada", "Mudo só a do jogo"], porque: "Os atacantes experimentam a mesma palavra-passe noutros serviços. Por isso deve ser diferente em cada um." },
  { pergunta: "O que quer dizer o cadeado ao lado do endereço de um sítio?", opcoes: ["Que a ligação é cifrada, mas não que o sítio é honesto", "Que o sítio é oficial e seguro", "Que o computador não tem vírus"], porque: "Também há sítios falsos com cadeado. Confirma sempre o endereço." },
  { pergunta: "Onde guardas o trabalho de grupo final, para não o perderes?", opcoes: ["Numa pasta na nuvem e numa cópia numa pen", "Só no computador da escola", "Não guardo, faço outra vez se for preciso"], porque: "Ter duas cópias em sítios diferentes protege contra avarias, perdas e vírus." },
  { pergunta: "Qual é a melhor forma de lembrar muitas palavras-passe diferentes?", opcoes: ["Usar um gestor de palavras-passe", "Escrevê-las num papel colado ao ecrã", "Usar a mesma em todo o lado"], porque: "Um gestor guarda-as cifradas; só precisas de decorar uma palavra-passe principal." },
  { pergunta: "Um concurso de desenhos online pede o número do teu cartão de cidadão.", opcoes: ["Não dou: é um dado de que não precisam", "Dou, para poder ganhar", "Dou o número dos meus pais"], porque: "Dá só os dados indispensáveis. Dados de identificação podem ser usados para fraudes." },
  { pergunta: "Para que serve a verificação em dois passos?", opcoes: ["Pede um segundo código além da palavra-passe", "Muda a palavra-passe sozinha todos os dias", "Torna a internet mais rápida"], porque: "Mesmo que descubram a palavra-passe, sem o segundo código não entram." },
  { pergunta: "Vais emprestar o teu portátil a um primo durante uma tarde.", opcoes: ["Crio-lhe uma conta de convidado ou termino as minhas sessões", "Empresto com tudo aberto", "Dou-lhe as minhas palavras-passe"], porque: "Assim ele não fica com acesso ao teu email, às tuas redes e aos teus ficheiros." },
];

const DEFINICOES: { id: string; rotulo: string; seguro: boolean; porque: string }[] = [
  { id: "2fa", rotulo: "Verificação em dois passos", seguro: true, porque: "Deve estar ligada: protege a conta mesmo que descubram a palavra-passe." },
  { id: "publico", rotulo: "Perfil público (qualquer pessoa vê)", seguro: false, porque: "Deve estar desligado: só pessoas que escolheres devem ver o perfil." },
  { id: "local", rotulo: "Partilhar a minha localização", seguro: false, porque: "Deve estar desligada: mostra onde estás em tempo real." },
  { id: "atual", rotulo: "Atualizações automáticas", seguro: true, porque: "Devem estar ligadas: corrigem falhas de segurança." },
  { id: "guardar", rotulo: "Guardar a palavra-passe neste computador partilhado", seguro: false, porque: "Deve estar desligado: num computador partilhado qualquer pessoa entraria." },
  { id: "telefone", rotulo: "Mostrar o meu número de telefone no perfil", seguro: false, porque: "Deve estar desligado: o número pode ser usado para burlas e contactos indesejados." },
];

const COMUNS = ["123456", "password", "palavra", "qwerty", "abc123", "111111", "benfica", "porto", "sporting", "portugal", "escola", "admin"];

export function avaliarSenha(s: string, cfg: ConfigBoasPraticas["senha"], nome: string): { regra: string; ok: boolean }[] {
  const tipos = [/[a-zà-ú]/.test(s), /[A-ZÀ-Ú]/.test(s), /\d/.test(s), /[^A-Za-zÀ-ú0-9]/.test(s)].filter(Boolean).length;
  const palavras = s.split(/[\s\-_.]+/).filter((p) => p.length >= 3).length;
  const minus = s.toLowerCase();
  const regras = [
    { regra: `Tem pelo menos ${cfg.minimo} caracteres`, ok: s.length >= cfg.minimo },
    { regra: cfg.exigeTipos >= 3 ? "Mistura 3 tipos de caracteres (minúsculas, maiúsculas, algarismos, símbolos) ou é uma frase de 3 ou mais palavras" : "Tem letras e algarismos, ou é uma frase de várias palavras", ok: tipos >= cfg.exigeTipos || palavras >= 3 },
    { regra: "Não é uma palavra-passe comum (123456, password, nome de clube…)", ok: !COMUNS.some((c) => minus.includes(c)) },
  ];
  if (cfg.proibeNome) regras.push({ regra: `Não contém o teu nome (${nome}) nem anos como 2012`, ok: !minus.includes(nome.toLowerCase()) && !/(19|20)\d\d/.test(s) });
  return regras;
}

const NOMES = ["Joana", "Tiago", "Inês", "Rui", "Marta", "Duarte", "Leonor", "Tomás"];

function BoasPraticas({ config, aoTerminar }: PropsAtividade<ConfigBoasPraticas>) {
  const partes = config.definicoes > 0 ? (["situacoes", "senha", "conta"] as const) : (["situacoes", "senha"] as const);
  const [pi, setPi] = useState(0);
  const [nome] = useState(() => misturar(NOMES)[0]);
  const resultado = useRef<{ s: number; p: number; c: number; linhas: LinhaRelatorio[] }>({ s: 0, p: 0, c: 0, linhas: [] });
  const inicio = useRef(performance.now());

  function proxima() {
    if (pi + 1 < partes.length) return setPi(pi + 1);
    const r = resultado.current;
    const pont = config.definicoes > 0 ? 0.5 * r.s + 0.25 * r.p + 0.25 * r.c : 0.65 * r.s + 0.35 * r.p;
    aoTerminar({ pontuacao: limitar(100 * pont), duracaoMs: performance.now() - inicio.current, metricas: { situacoes: Math.round(100 * r.s), senha: Math.round(100 * r.p), conta: config.definicoes > 0 ? Math.round(100 * r.c) : "nao_aplicavel" }, relatorio: r.linhas });
  }

  return (
    <div className="grid gap-4">
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
        Parte {pi + 1} de {partes.length}
      </div>
      {partes[pi] === "situacoes" && (
        <Situacoes
          n={config.situacoes}
          aoConcluir={(fr, linhas) => {
            resultado.current.s = fr;
            resultado.current.linhas.push(...linhas);
            proxima();
          }}
        />
      )}
      {partes[pi] === "senha" && (
        <Senha
          cfg={config.senha}
          nome={nome}
          aoConcluir={(fr, linha) => {
            resultado.current.p = fr;
            resultado.current.linhas.push(linha);
            proxima();
          }}
        />
      )}
      {partes[pi] === "conta" && (
        <Conta
          n={config.definicoes}
          aoConcluir={(fr, linhas) => {
            resultado.current.c = fr;
            resultado.current.linhas.push(...linhas);
            proxima();
          }}
        />
      )}
    </div>
  );
}

function Situacoes({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [qs] = useState(() => amostra(SITUACOES, n).map((s) => ({ ...s, ...baralharOpcoes(s.opcoes, 0) })));
  const [resp, setResp] = useState<(number | null)[]>(() => qs.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = qs.filter((q, i) => resp[i] === q.correta).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Escolhe o que é mais seguro fazer em cada situação.</Instrucao>
      {qs.map((q, i) => (
        <fieldset key={i} className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === q.correta ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">{i + 1}. {q.pergunta}</legend>
          {q.opcoes.map((o, j) => (
            <BotaoRadio key={j} id={`bp-${i}-${j}`} name={`bp-${i}`} rotulo={o} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
          ))}
          {feito && <p className="m-0 text-sm" style={{ color: resp[i] === q.correta ? "var(--certo)" : "var(--errado)" }}>{resp[i] === q.correta ? "Certo. " : `A opção mais segura: ${q.opcoes[q.correta]}. `}{q.porque}</p>}
        </fieldset>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(certas / qs.length, qs.map((q, i) => ({ tarefa: q.pergunta, resultado: resp[i] === q.correta ? "certo" : "errado", resposta: resp[i] === null ? undefined : q.opcoes[resp[i]!], certa: q.opcoes[q.correta], feedback: q.porque })))}>Continuar</Botao>
        )}
        {feito && <span>{certas} de {qs.length} certas.</span>}
      </div>
    </div>
  );
}

function Senha({ cfg, nome, aoConcluir }: { cfg: ConfigBoasPraticas["senha"]; nome: string; aoConcluir: (fr: number, l: LinhaRelatorio) => void }) {
  const [s, setS] = useState("");
  const [ver, setVer] = useState(false);
  const regras = useMemo(() => avaliarSenha(s, cfg, nome), [s, cfg, nome]);
  const ok = regras.filter((r) => r.ok).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Cria uma palavra-passe forte para o email da escola da {nome}. Uma frase com várias palavras é uma boa ideia.</Instrucao>
      <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>Esta palavra-passe é só um exercício: não é guardada nem enviada para lado nenhum. Não uses uma palavra-passe verdadeira tua.</p>
      <Janela endereco="conta.escola.pt/nova-palavra-passe">
        <div className="p-5 grid gap-3 max-w-xl">
          <div className="campo">
            <label htmlFor="senha">Nova palavra-passe</label>
            <div className="flex gap-2">
              <input id="senha" type={ver ? "text" : "password"} value={s} onChange={(e) => setS(e.target.value)} autoComplete="off" aria-describedby="senha-regras" className="flex-1" />
              <Botao variante="contorno" onClick={() => setVer((v) => !v)} aria-pressed={ver}>{ver ? "Ocultar" : "Mostrar"}</Botao>
            </div>
          </div>
          <ul id="senha-regras" className="m-0 p-0 list-none grid gap-1" aria-live="polite">
            {regras.map((r) => (
              <li key={r.regra} style={{ color: r.ok ? "var(--certo)" : "var(--suave)" }}>
                <span aria-hidden="true">{r.ok ? "✓" : "○"}</span> {r.regra}
                <span className="sr-only">{r.ok ? ": cumprido" : ": por cumprir"}</span>
              </li>
            ))}
          </ul>
          <div className="barra" aria-hidden="true"><div style={{ width: `${(100 * ok) / regras.length}%`, background: ok === regras.length ? "var(--certo)" : ok >= regras.length / 2 ? "var(--aviso)" : "var(--errado)" }} /></div>
        </div>
      </Janela>
      <div>
        <Botao disabled={!s} onClick={() => aoConcluir(ok / regras.length, { tarefa: "Criar uma palavra-passe forte", resultado: ok === regras.length ? "certo" : ok >= regras.length / 2 ? "parcial" : "errado", resposta: `${ok} de ${regras.length} regras cumpridas`, certa: "Todas as regras", feedback: ok === regras.length ? undefined : `Falta: ${regras.filter((r) => !r.ok).map((r) => r.regra.toLowerCase()).join("; ")}.` })}>
          Confirmar
        </Botao>
      </div>
    </div>
  );
}

function Conta({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [defs] = useState(() => DEFINICOES.slice(0, n));
  // Estado inicial: pelo menos metade das definições começa insegura.
  const [estado, setEstado] = useState<Record<string, boolean>>(() => {
    const inseguras = new Set(amostra(defs.map((d) => d.id), Math.ceil(n / 2) + (Math.random() < 0.5 ? 1 : 0)));
    return Object.fromEntries(defs.map((d) => [d.id, inseguras.has(d.id) ? !d.seguro : d.seguro]));
  });
  const certas = defs.filter((d) => estado[d.id] === d.seguro).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Estas são as definições da conta da tua rede social da escola. Deixa a conta segura e carrega em Guardar.</Instrucao>
      <Janela endereco="rede.escola.pt/definicoes/privacidade">
        <div className="p-5 grid gap-2 max-w-xl">
          <h3 className="text-lg">Privacidade e segurança</h3>
          {defs.map((d) => (
            <Interruptor key={d.id} id={`def-${d.id}`} rotulo={d.rotulo} checked={estado[d.id]} onChange={(e) => setEstado((s) => ({ ...s, [d.id]: e.target.checked }))} />
          ))}
        </div>
      </Janela>
      <div>
        <Botao onClick={() => aoConcluir(certas / defs.length, defs.map((d) => ({ tarefa: d.rotulo, resultado: estado[d.id] === d.seguro ? "certo" : "errado", resposta: estado[d.id] ? "Ligado" : "Desligado", certa: d.seguro ? "Ligado" : "Desligado", feedback: estado[d.id] === d.seguro ? undefined : d.porque })))}>Guardar</Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigBoasPraticas>({
  slug: "boas-praticas",
  numero: 201,
  dominio: "seguranca",
  titulo: { jornal: "Boas Práticas Online", laboratorio: "Boas Práticas Online" },
  descricao: "Situações do dia a dia, uma palavra-passe forte e uma conta segura.",
  duracao: "4 a 6 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ situacoes: 1, senha: { minimo: 8, exigeTipos: 2, proibeNome: false }, definicoes: 0 }),
  Componente: BoasPraticas,
  dica: (m) => {
    if (Number(m.senha) < 100) return "Uma frase com quatro palavras e um número (por exemplo “janela-azul-come-pão-7”) é fácil de lembrar e muito difícil de adivinhar.";
    if (typeof m.conta === "number" && m.conta < 100) return "Revê as definições de privacidade de todas as tuas contas: verificação em dois passos ligada, perfil e localização desligados.";
    return "Lê a página Boas práticas online para ver mais conselhos, e experimenta o nível seguinte.";
  },
});
