// ─── Segurança · Privacidade e navegação: O Endereço Certo ───────────────────
// Parte 1: ler endereços e escolher a ligação que leva mesmo ao sítio oficial (domínio principal).
// Parte 2: pedidos de permissão do navegador (localização, câmara…): permitir só o que o sítio precisa.
// Parte 3: situações de navegação e privacidade.
// Pontuação: 40 % endereços + 25 % permissões + 35 % situações.
import { useState } from "react";
import { amostra, misturar, type Gerador } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio } from "../ui";
import { Janela } from "../componentes/Janela";
import { Ouvir } from "../componentes/Ouvir";
import { CabecalhoParte, Situacoes, type Situacao } from "./Situacoes";

export interface ConfigPrivacidade {
  enderecos: number;
  opcoes: number; // ligações por endereço
  subdominios: boolean; // inclui ligações oficiais com subdomínio (login.exemplo.pt) e armadilhas mais subtis
  permissoes: number;
  situacoes: number;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigPrivacidade> = {
  1: { enderecos: 2, opcoes: 2, subdominios: false, permissoes: 2, situacoes: 3 },
  2: { enderecos: 3, opcoes: 3, subdominios: false, permissoes: 3, situacoes: 4 },
  3: { enderecos: 3, opcoes: 3, subdominios: true, permissoes: 4, situacoes: 5 },
  4: { enderecos: 4, opcoes: 4, subdominios: true, permissoes: 5, situacoes: 6 },
  5: { enderecos: 5, opcoes: 4, subdominios: true, permissoes: 6, situacoes: 7 },
};

// ─── Endereços ───────────────────────────────────────────────────────────────
// Organizações fictícias. "dominio" é o domínio oficial; os endereços enganadores são gerados a partir dele.
export const SITIOS: { nome: string; dominio: string; caminho: string }[] = [
  { nome: "Banco Horizonte", dominio: "bancohorizonte.pt", caminho: "/entrar" },
  { nome: "Envios Já", dominio: "enviosja.pt", caminho: "/seguir-encomenda" },
  { nome: "Loja TecnoMais", dominio: "tecnomais.pt", caminho: "/carrinho" },
  { nome: "Plataforma Escola Aberta", dominio: "escolaaberta.pt", caminho: "/aulas" },
  { nome: "Biblioteca Municipal", dominio: "bibliotecamunicipal.pt", caminho: "/reservas" },
  { nome: "Cinema Estrela", dominio: "cinemaestrela.pt", caminho: "/bilhetes" },
  { nome: "Correio Nuvem", dominio: "correionuvem.pt", caminho: "/caixa" },
];

/** Domínio principal de um endereço: as duas últimas partes do nome (exemplo.pt), ou três com .com.pt / .org.pt. */
export function dominioPrincipal(url: string): string {
  const semProtocolo = url.replace(/^[a-z]+:\/\//i, "");
  const anfitriao = semProtocolo.split(/[/?#]/)[0].split("@").pop()!.split(":")[0].toLowerCase();
  const partes = anfitriao.split(".");
  const n = /^(com|org|gov|edu)$/.test(partes[partes.length - 2] ?? "") && partes[partes.length - 1] === "pt" ? 3 : 2;
  return partes.slice(-n).join(".");
}

const TROCAS: [RegExp, string][] = [[/o/, "0"], [/i/, "1"], [/l/, "1"], [/m/, "rn"], [/a/, "4"], [/e/, "3"]];

/** Endereços enganadores para um domínio oficial, do mais evidente ao mais subtil. */
export function enganadores(dominio: string, caminho: string, subtis: boolean): string[] {
  const [nome, tld] = [dominio.slice(0, dominio.indexOf(".")), dominio.slice(dominio.indexOf(".") + 1)];
  const troca = TROCAS.find(([re]) => re.test(nome));
  const lista = [
    `https://${nome}-${tld}.com${caminho}`,
    `https://${nome}-seguranca.net${caminho}`,
    `http://${nome}.${tld}.info${caminho}`,
    `https://premios-${nome}.com${caminho}`,
  ];
  if (subtis) {
    lista.push(`https://${dominio}.verificar-conta.com${caminho}`, `https://www.${dominio}-login.pt${caminho}`);
    if (troca) lista.push(`https://${nome.replace(troca[0], troca[1])}.${tld}${caminho}`);
  }
  return lista;
}

export interface Pergunta {
  sitio: string;
  dominio: string;
  opcoes: string[];
  certa: number;
}

export function gerarEnderecos(cfg: ConfigPrivacidade, r: Gerador = Math.random): Pergunta[] {
  return amostra(SITIOS, cfg.enderecos, r).map((s) => {
    const oficiais = [`https://www.${s.dominio}${s.caminho}`, ...(cfg.subdominios ? [`https://conta.${s.dominio}${s.caminho}`, `https://${s.dominio}/ajuda?voltar=${s.caminho.slice(1)}`] : [])];
    const certo = misturar(oficiais, r)[0];
    // Nos níveis com subdomínios, pelo menos um enganador subtil (o domínio oficial no início do endereço falso).
    const falsos = enganadores(s.dominio, s.caminho, cfg.subdominios);
    const subtis = falsos.filter((f) => f.includes(`${s.dominio}.`) || f.includes(`${s.dominio}-`));
    const base = cfg.subdominios ? [misturar(subtis, r)[0]] : [];
    const resto = misturar(falsos.filter((f) => !base.includes(f)), r).slice(0, cfg.opcoes - 1 - base.length);
    const opcoes = misturar([certo, ...base, ...resto], r);
    return { sitio: s.nome, dominio: s.dominio, opcoes, certa: opcoes.indexOf(certo) };
  });
}

// ─── Permissões ──────────────────────────────────────────────────────────────
export const PEDIDOS: { sitio: string; endereco: string; pedido: string; permitir: boolean; porque: string }[] = [
  { sitio: "Videochamada da turma", endereco: "aulas.escolaaberta.pt/chamada", pedido: "usar a câmara e o microfone", permitir: true, porque: "Numa videochamada a câmara e o microfone são precisos. Podes desligá-los quando não estiveres a falar." },
  { sitio: "Receitas da Avó Rosa", endereco: "receitasdaavorosa.pt", pedido: "saber a tua localização", permitir: false, porque: "Um sítio de receitas não precisa de saber onde estás." },
  { sitio: "Mapa dos transportes", endereco: "mapa.transportesdacidade.pt", pedido: "saber a tua localização", permitir: true, porque: "Para mostrar a paragem mais próxima, o mapa precisa da localização. Escolhe “só desta vez” se o navegador deixar." },
  { sitio: "Notícias Agora", endereco: "noticiasagora-hoje.com", pedido: "enviar notificações", permitir: false, porque: "Muitos sítios pedem notificações só para enviar publicidade. Se precisares, podes ativá-las depois." },
  { sitio: "Jogo de palavras", endereco: "palavrasdivertidas.net", pedido: "usar o microfone", permitir: false, porque: "Um jogo de escrever palavras não precisa de ouvir o que dizes." },
  { sitio: "Gravador de leitura da escola", endereco: "leitura.escolaaberta.pt", pedido: "usar o microfone", permitir: true, porque: "Para gravares a tua leitura em voz alta, o microfone é necessário." },
  { sitio: "Calculadora online", endereco: "calculadora-gratis.net", pedido: "ver os ficheiros e as fotografias do dispositivo", permitir: false, porque: "Uma calculadora não tem nenhuma razão para ver os teus ficheiros." },
  { sitio: "Descarregar vídeos grátis", endereco: "videos-gratis-ja.net", pedido: "enviar notificações e abrir janelas", permitir: false, porque: "Sítios destes usam notificações e janelas para mostrar anúncios e burlas." },
  { sitio: "Tempo em Portugal", endereco: "tempo.meteoportugal.pt", pedido: "saber a tua localização", permitir: true, porque: "Para mostrar o tempo da tua zona é útil. Também podes recusar e escrever o nome da localidade." },
];

// ─── Situações ───────────────────────────────────────────────────────────────
export const SITUACOES_NAVEGACAO: Situacao[] = [
  { pergunta: "O que faz a navegação privada (anónima) do navegador?", opcoes: ["Não guarda o histórico neste computador, mas os sítios e a rede continuam a ver o que fazes", "Torna-te invisível na internet", "Protege-te de vírus"], porque: "A navegação privada só não deixa rasto neste dispositivo. Não esconde nada dos sítios que visitas nem da rede." },
  { pergunta: "Aparece um aviso a piscar: “O teu computador tem 5 vírus! Liga já para o apoio técnico.”", opcoes: ["Fecho a página e não ligo", "Ligo para o número", "Descarrego o programa que oferecem"], porque: "É uma burla. Os avisos verdadeiros vêm do antivírus do sistema, não de uma página na internet." },
  { pergunta: "Pesquisaste “Banco Horizonte” e o primeiro resultado diz “Patrocinado”.", opcoes: ["Confirmo o endereço antes de clicar: os anúncios podem levar a sítios falsos", "Clico logo: é o primeiro, logo é o oficial", "Clico em todos os resultados"], porque: "Os resultados patrocinados são anúncios pagos. Às vezes são imitações. Confirma o endereço ou escreve-o tu." },
  { pergunta: "Uma página pede para aceitares cookies. O que é mais protetor da tua privacidade?", opcoes: ["Aceitar só os necessários", "Aceitar todos", "Aceitar todos e partilhar com parceiros"], porque: "Os cookies necessários fazem o sítio funcionar. Os outros servem sobretudo para seguir o que fazes e mostrar publicidade." },
  { pergunta: "Queres descarregar um programa para a escola.", opcoes: ["Descarrego do sítio oficial de quem o faz", "Descarrego do primeiro sítio de downloads que aparecer", "Peço a um desconhecido num fórum que mo envie"], porque: "Os sítios de downloads não oficiais juntam muitas vezes publicidade ou programas maliciosos." },
  { pergunta: "Uma extensão do navegador promete “vídeos mais rápidos” e pede para ler todos os sítios que visitas.", opcoes: ["Não instalo", "Instalo, é grátis", "Instalo e dou-lhe também a palavra-passe do email"], porque: "Uma extensão com acesso a tudo pode ler o que escreves, incluindo palavras-passe." },
  { pergunta: "Como limpas o histórico, os cookies e os dados guardados no navegador?", opcoes: ["Nas definições do navegador, em Privacidade, opção Limpar dados de navegação", "Desligando o computador da tomada", "Apagando o ícone do navegador do ambiente de trabalho"], porque: "Em quase todos os navegadores o atalho Ctrl+Shift+Delete abre o mesmo menu." },
  { pergunta: "Vais pesquisar uma doença de um familiar. O que deves saber?", opcoes: ["Os motores de pesquisa e os sítios podem guardar o que pesquisas", "Ninguém guarda as pesquisas", "As pesquisas são sempre apagadas ao fim do dia"], porque: "Muitos serviços guardam o histórico de pesquisas. Vê as definições da conta e apaga-o se quiseres." },
  { pergunta: "Um sítio de jogos grátis pede o teu nome completo, data de nascimento e morada para te inscreveres.", opcoes: ["Dou só o indispensável, ou não me inscrevo", "Preencho tudo com os dados verdadeiros", "Uso os dados de um colega"], porque: "Quanto menos dados deres, menos podem ser perdidos, vendidos ou usados contra ti." },
  { pergunta: "O navegador avisa: “A ligação não é privada. Atacantes podem estar a tentar roubar as tuas informações.”", opcoes: ["Volto atrás e não continuo", "Clico em Avançadas e continuo na mesma", "Escrevo a palavra-passe rapidamente"], porque: "Este aviso quer dizer que o navegador não consegue confirmar que o sítio é quem diz ser." },
];

// ─── Componente ──────────────────────────────────────────────────────────────
function Privacidade({ config, aoTerminar }: PropsAtividade<ConfigPrivacidade>) {
  const partes = ["Que ligação é a oficial?", "Permitir ou bloquear?", "O que fazes?"];
  const [pi, setPi] = useState(0);
  const [res] = useState<{ e: number; p: number; linhas: LinhaRelatorio[] }>({ e: 0, p: 0, linhas: [] });
  const [inicio] = useState(() => performance.now());
  return (
    <div className="grid gap-4">
      <CabecalhoParte i={pi} total={partes.length} nome={partes[pi]} />
      {pi === 0 && (
        <Enderecos
          cfg={config}
          aoConcluir={(fr, l) => {
            res.e = fr;
            res.linhas.push(...l);
            setPi(1);
          }}
        />
      )}
      {pi === 1 && (
        <Permissoes
          n={config.permissoes}
          aoConcluir={(fr, l) => {
            res.p = fr;
            res.linhas.push(...l);
            setPi(2);
          }}
        />
      )}
      {pi === 2 && (
        <Situacoes
          lista={SITUACOES_NAVEGACAO}
          n={config.situacoes}
          prefixo="pv"
          instrucao="O que fazes em cada situação?"
          aoConcluir={(fr, l) =>
            aoTerminar({
              pontuacao: limitar(100 * (0.4 * res.e + 0.25 * res.p + 0.35 * fr)),
              duracaoMs: performance.now() - inicio,
              metricas: { enderecos: Math.round(100 * res.e), permissoes: Math.round(100 * res.p), situacoes: Math.round(100 * fr) },
              relatorio: [...res.linhas, ...l],
            })
          }
        />
      )}
    </div>
  );
}

function Enderecos({ cfg, aoConcluir }: { cfg: ConfigPrivacidade; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [qs] = useState(() => gerarEnderecos(cfg));
  const [resp, setResp] = useState<(number | null)[]>(() => qs.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = qs.filter((q, i) => resp[i] === q.certa).length;
  return (
    // Endereços longos sem espaços: partir em qualquer ponto, nos dois aspetos, para não criar scroll horizontal.
    <div className="grid gap-3" style={{ overflowWrap: "anywhere" }}>
      <Instrucao>Lê cada endereço com atenção. Escolhe a ligação que leva mesmo ao sítio oficial. Dica: o que conta é o que vem imediatamente antes da primeira barra /.</Instrucao>
      {qs.map((q, i) => (
        <fieldset key={i} data-ouvir="" className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === q.certa ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">
            {i + 1}. Queres entrar em {q.sitio}. O sítio oficial é <span style={{ fontFamily: "var(--fonte-mono)" }}>{q.dominio}</span>.
          </legend>
          {q.opcoes.map((o, j) => (
            <BotaoRadio key={j} id={`end-${i}-${j}`} name={`end-${i}`} rotulo={o} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
          ))}
          {feito && (
            <p className="m-0 text-sm" style={{ color: resp[i] === q.certa ? "var(--certo)" : "var(--errado)" }}>
              {resp[i] === q.certa ? "Certo. " : `A oficial: ${q.opcoes[q.certa]}. `}
              {resp[i] !== null && resp[i] !== q.certa && `A que escolheste leva a ${dominioPrincipal(q.opcoes[resp[i]!])}.`}
            </p>
          )}
          <div><Ouvir /></div>
        </fieldset>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao
            onClick={() =>
              aoConcluir(
                certas / qs.length,
                qs.map((q, i) => ({
                  tarefa: `Ligação oficial de ${q.sitio}`,
                  resultado: resp[i] === q.certa ? "certo" : "errado",
                  resposta: resp[i] === null ? undefined : q.opcoes[resp[i]!],
                  certa: q.opcoes[q.certa],
                  feedback: resp[i] === q.certa ? undefined : `O domínio da ligação que escolheste é ${dominioPrincipal(q.opcoes[resp[i]!])}, não ${q.dominio}. Lê o nome imediatamente antes da primeira barra.`,
                })),
              )
            }
          >
            Continuar
          </Botao>
        )}
        {feito && <span>{certas} de {qs.length} certas.</span>}
      </div>
    </div>
  );
}

function Permissoes({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  // Pelo menos um pedido a permitir e um a bloquear.
  const [ps] = useState(() => {
    const sim = misturar(PEDIDOS.filter((p) => p.permitir));
    const nao = misturar(PEDIDOS.filter((p) => !p.permitir));
    return misturar([sim[0], nao[0], ...misturar([...sim.slice(1), ...nao.slice(1)])].slice(0, Math.max(1, n)));
  });
  const [resp, setResp] = useState<(boolean | null)[]>(() => ps.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = ps.filter((p, i) => resp[i] === p.permitir).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Cada sítio pede uma permissão. Permite só o que o sítio precisa mesmo para funcionar.</Instrucao>
      {ps.map((p, i) => (
        <Janela key={p.endereco} endereco={p.endereco} rotulo={`Pedido de ${p.sitio}`}>
          <div className="p-4 grid gap-2" data-ouvir="" style={feito ? { outline: `2px solid ${resp[i] === p.permitir ? "var(--certo)" : "var(--errado)"}` } : undefined}>
            <fieldset className="border-0 p-0 m-0 grid gap-1">
              <legend className="font-bold">
                <span aria-hidden="true">🔔 </span>“{p.sitio}” quer {p.pedido}.
              </legend>
              <div className="flex gap-x-4 flex-wrap">
                <BotaoRadio id={`perm-${i}-s`} name={`perm-${i}`} rotulo="Permitir" checked={resp[i] === true} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? true : x)))} />
                <BotaoRadio id={`perm-${i}-n`} name={`perm-${i}`} rotulo="Bloquear" checked={resp[i] === false} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? false : x)))} />
              </div>
            </fieldset>
            {feito && <p className="m-0 text-sm" style={{ color: resp[i] === p.permitir ? "var(--certo)" : "var(--errado)" }}>{resp[i] === p.permitir ? "Certo. " : `O melhor era ${p.permitir ? "permitir" : "bloquear"}. `}{p.porque}</p>}
            <div><Ouvir /></div>
          </div>
        </Janela>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(certas / ps.length, ps.map((p, i) => ({ tarefa: `${p.sitio} quer ${p.pedido}`, resultado: resp[i] === p.permitir ? "certo" : "errado", resposta: resp[i] ? "Permitir" : "Bloquear", certa: p.permitir ? "Permitir" : "Bloquear", feedback: resp[i] === p.permitir ? undefined : p.porque })))}>Continuar</Botao>
        )}
        {feito && <span>{certas} de {ps.length} certas.</span>}
      </div>
    </div>
  );
}

export const definicao = definir<ConfigPrivacidade>({
  slug: "privacidade",
  numero: 204,
  dominio: "seguranca",
  titulo: { jornal: "O Endereço Certo", laboratorio: "O Endereço Certo" },
  descricao: "Reconhece o endereço oficial de um sítio, decide que permissões dar e o que fazer ao navegar.",
  duracao: "4 a 7 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ enderecos: 1, opcoes: 2, subdominios: false, permissoes: 1, situacoes: 1 }),
  Componente: Privacidade,
  dica: (m) => {
    if (Number(m.enderecos) < 100) return "Num endereço, o que conta é o nome imediatamente antes da primeira barra /. Em “bancohorizonte.pt.verificar-conta.com” o sítio é verificar-conta.com.";
    if (Number(m.permissoes) < 100) return "Antes de permitir, pergunta: este sítio precisa mesmo disto para fazer o que eu quero?";
    return "Bom trabalho. Revê de vez em quando as permissões dadas nas definições do navegador.";
  },
});
