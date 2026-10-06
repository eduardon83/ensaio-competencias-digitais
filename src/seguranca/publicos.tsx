// ─── Segurança · Computadores e Wi-Fi públicos: Na Biblioteca ─────────────────
// Parte 1: escolher a rede Wi-Fi oficial de um espaço público, a partir do cartaz, entre redes com nomes parecidos.
// Parte 2: antes de sair do computador público: escolher tudo o que se deve fazer (e nada do que não se deve).
// Parte 3: situações em computadores e redes públicas.
// Pontuação: 30 % redes + 30 % antes de sair + 40 % situações.
import { useState } from "react";
import { amostra, misturar, type Gerador } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio, CaixaVerificacao } from "../ui";
import { Janela } from "../componentes/Janela";
import { CabecalhoParte, Situacoes, type Situacao } from "./Situacoes";

export interface ConfigPublicos {
  locais: number;
  redes: number; // redes na lista de cada local
  acoes: number; // ações na lista "antes de sair"
  situacoes: number;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigPublicos> = {
  1: { locais: 1, redes: 3, acoes: 5, situacoes: 3 },
  2: { locais: 2, redes: 4, acoes: 6, situacoes: 4 },
  3: { locais: 2, redes: 5, acoes: 7, situacoes: 5 },
  4: { locais: 3, redes: 5, acoes: 8, situacoes: 6 },
  5: { locais: 3, redes: 6, acoes: 9, situacoes: 7 },
};

// ─── Redes Wi-Fi ─────────────────────────────────────────────────────────────
export const LOCAIS: { local: string; rede: string; senha: string }[] = [
  { local: "Biblioteca Municipal", rede: "Biblioteca_Municipal", senha: "pedir na receção" },
  { local: "Café Central", rede: "CafeCentral_Clientes", senha: "no talão de compra" },
  { local: "Estação de Comboios", rede: "Estacao_Passageiros", senha: "sem palavra-passe: aceitar as condições na página de entrada" },
  { local: "Museu da Ciência", rede: "MuseuCiencia_Visitantes", senha: "no bilhete de entrada" },
  { local: "Centro de Saúde", rede: "CentroSaude_Utentes", senha: "pedir no balcão" },
];

export interface Rede {
  nome: string;
  protegida: boolean;
  oficial: boolean;
}

const VIZINHAS = ["Casa_Ferreira", "Impressora_Sala2", "Telemovel_do_Rui", "Escritorio_3Andar", "Loja_ao_lado"];

/** Lista de redes para um local: exatamente uma oficial, imitações com nomes parecidos e redes vizinhas. */
export function gerarRedes(l: (typeof LOCAIS)[number], n: number, r: Gerador = Math.random): Rede[] {
  const aberta = l.senha.startsWith("sem");
  const oficial: Rede = { nome: l.rede, protegida: !aberta, oficial: true };
  const imitacoes: Rede[] = [`${l.rede}_GRATIS`, l.rede.replace(/_/g, " "), `${l.rede}-Free-5G`, l.rede.replace(/_/, "-")].map((nome) => ({ nome, protegida: false, oficial: false }));
  const vizinhas: Rede[] = VIZINHAS.map((nome) => ({ nome, protegida: true, oficial: false }));
  const nImit = Math.min(imitacoes.length, Math.max(1, Math.ceil((n - 1) / 2)));
  const lista = [oficial, ...misturar(imitacoes, r).slice(0, nImit), ...misturar(vizinhas, r)].slice(0, n);
  return misturar(lista, r);
}

// ─── Antes de sair ───────────────────────────────────────────────────────────
export const ACOES: { texto: string; certo: boolean; porque: string }[] = [
  { texto: "Terminar a sessão no email e nas outras contas", certo: true, porque: "Fechar o separador não chega: a sessão pode continuar aberta para quem vier a seguir." },
  { texto: "Apagar os ficheiros que descarreguei da pasta Transferências", certo: true, porque: "Os ficheiros ficam no computador e qualquer pessoa os pode abrir." },
  { texto: "Retirar a pen", certo: true, porque: "É fácil esquecê-la. E com ela ficam os teus trabalhos." },
  { texto: "Fechar todas as janelas do navegador", certo: true, porque: "Fechar o navegador termina a navegação e, na navegação privada, apaga os dados dessa sessão." },
  { texto: "Esvaziar a reciclagem depois de apagar os meus ficheiros", certo: true, porque: "Os ficheiros apagados ficam na reciclagem até ela ser esvaziada." },
  { texto: "Confirmar que não guardei nenhuma palavra-passe no navegador", certo: true, porque: "Uma palavra-passe guardada deixa qualquer pessoa entrar na tua conta." },
  { texto: "Deixar o email aberto para o colega que vem a seguir", certo: false, porque: "O colega ficaria com acesso a tudo o que está na tua conta." },
  { texto: "Guardar o trabalho no ambiente de trabalho do computador, para a próxima vez", certo: false, porque: "No computador público, qualquer pessoa o pode ver, copiar ou apagar. Guarda na tua pen ou na tua nuvem." },
  { texto: "Escrever a palavra-passe num papel e deixá-lo junto ao teclado", certo: false, porque: "Quem encontrar o papel entra na tua conta." },
  { texto: "Desligar o computador da tomada", certo: false, porque: "Desligar à força não termina as sessões na internet e pode estragar o computador." },
  { texto: "Instalar um programa para limpar o computador", certo: false, porque: "Nos computadores públicos não se instalam programas: quem gere o computador trata disso." },
];

// ─── Situações ───────────────────────────────────────────────────────────────
export const SITUACOES_PUBLICOS: Situacao[] = [
  { pergunta: "Estás ligado ao Wi-Fi gratuito de um café e queres ver o saldo do banco.", opcoes: ["Espero ou uso os dados móveis", "Vejo no Wi-Fi do café", "Peço a palavra-passe da rede a quem está na mesa ao lado"], porque: "Numa rede pública não sabes quem a gere nem quem está ligado. Deixa o banco e as compras para uma rede de confiança." },
  { pergunta: "Encontraste uma pen no chão da biblioteca.", opcoes: ["Entrego-a na receção sem a ligar", "Ligo-a para ver de quem é", "Ligo-a ao computador da escola"], porque: "Uma pen desconhecida pode ter programas maliciosos que se instalam ao ligá-la." },
  { pergunta: "Estás a escrever a palavra-passe num computador da biblioteca e alguém está atrás de ti a olhar.", opcoes: ["Paro, tapo o teclado ou espero que se afaste", "Continuo, não faz mal", "Digo a palavra-passe em voz alta para ir mais depressa"], porque: "Espreitar por cima do ombro é uma das formas mais simples de roubar palavras-passe." },
  { pergunta: "O telemóvel liga-se sozinho a redes Wi-Fi abertas que encontra.", opcoes: ["Desligo a ligação automática a redes abertas", "Deixo, assim poupo dados", "Ligo também o Bluetooth para todos"], porque: "Assim evitas ligar-te sem querer a redes falsas com nomes parecidos com os verdadeiros." },
  { pergunta: "Precisas de carregar o telemóvel numa estação USB de um centro comercial.", opcoes: ["Uso o meu carregador numa tomada, ou um cabo só de carga", "Ligo à porta USB e aceito tudo o que aparecer", "Empresto o telemóvel a um desconhecido para mo carregar"], porque: "Uma porta USB também pode passar dados. Se o telemóvel perguntar se confias no dispositivo, recusa." },
  { pergunta: "Já saíste do café. O que fazes à rede Wi-Fi do café no telemóvel?", opcoes: ["Esqueço a rede, para não voltar a ligar sozinho", "Nada", "Partilho a palavra-passe nas redes sociais"], porque: "Esquecer a rede evita ligações automáticas a essa rede ou a imitações dela." },
  { pergunta: "Numa rede pública, como sabes que a página do teu email é cifrada?", opcoes: ["O endereço começa por https e é o endereço oficial", "A página tem cores bonitas", "A rede tem um nome conhecido"], porque: "O https cifra a ligação. Mesmo assim, confirma o endereço: um sítio falso também pode ter https." },
  { pergunta: "Na escola, um colega deixou a sessão aberta no computador e foi embora.", opcoes: ["Termino a sessão dele ou aviso-o, sem mexer em nada", "Leio as mensagens dele", "Publico uma brincadeira em nome dele"], porque: "Usar a conta de outra pessoa sem autorização é errado e pode ser crime, mesmo a brincar." },
  { pergunta: "Precisas de imprimir um documento com os teus dados numa loja de cópias.", opcoes: ["Envio só esse ficheiro e confirmo que é apagado depois", "Deixo o email aberto na loja", "Dou a minha palavra-passe ao funcionário"], porque: "Partilha só o documento necessário e não deixes contas abertas em computadores alheios." },
];

// ─── Componente ──────────────────────────────────────────────────────────────
function Publicos({ config, aoTerminar }: PropsAtividade<ConfigPublicos>) {
  const partes = ["Que rede escolhes?", "Antes de sair", "O que fazes?"];
  const [pi, setPi] = useState(0);
  const [res] = useState<{ w: number; a: number; linhas: LinhaRelatorio[] }>({ w: 0, a: 0, linhas: [] });
  const [inicio] = useState(() => performance.now());
  return (
    <div className="grid gap-4">
      <CabecalhoParte i={pi} total={partes.length} nome={partes[pi]} />
      {pi === 0 && (
        <Redes
          cfg={config}
          aoConcluir={(fr, l) => {
            res.w = fr;
            res.linhas.push(...l);
            setPi(1);
          }}
        />
      )}
      {pi === 1 && (
        <AntesDeSair
          n={config.acoes}
          aoConcluir={(fr, l) => {
            res.a = fr;
            res.linhas.push(...l);
            setPi(2);
          }}
        />
      )}
      {pi === 2 && (
        <Situacoes
          lista={SITUACOES_PUBLICOS}
          n={config.situacoes}
          prefixo="pb"
          instrucao="O que fazes em cada situação?"
          aoConcluir={(fr, l) =>
            aoTerminar({
              pontuacao: limitar(100 * (0.3 * res.w + 0.3 * res.a + 0.4 * fr)),
              duracaoMs: performance.now() - inicio,
              metricas: { redes: Math.round(100 * res.w), antesDeSair: Math.round(100 * res.a), situacoes: Math.round(100 * fr) },
              relatorio: [...res.linhas, ...l],
            })
          }
        />
      )}
    </div>
  );
}

function Redes({ cfg, aoConcluir }: { cfg: ConfigPublicos; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [casos] = useState(() => amostra(LOCAIS, cfg.locais).map((l) => ({ ...l, redes: gerarRedes(l, cfg.redes) })));
  const [resp, setResp] = useState<(number | null)[]>(() => casos.map(() => null));
  const [feito, setFeito] = useState(false);
  const certa = (i: number) => casos[i].redes.findIndex((w) => w.oficial);
  const certas = casos.filter((_, i) => resp[i] === certa(i)).length;
  return (
    <div className="grid gap-3">
      <Instrucao>Lê o cartaz de cada espaço e escolhe a rede Wi-Fi oficial. Atenção às redes com nomes parecidos.</Instrucao>
      {casos.map((c, i) => (
        <div key={c.local} className="grid gap-2 md:grid-cols-2 items-start">
          <div className="cartao p-4 grid gap-1" style={{ borderTop: "6px solid var(--acento)" }}>
            <div className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>Cartaz na parede · {c.local}</div>
            <div><strong>Rede Wi-Fi:</strong> <span style={{ fontFamily: "var(--fonte-mono)" }}>{c.rede}</span></div>
            <div><strong>Palavra-passe:</strong> {c.senha}</div>
          </div>
          <Janela endereco="definicoes/wi-fi" rotulo={`Redes Wi-Fi disponíveis em ${c.local}`}>
            <fieldset className="border-0 p-4 m-0 grid gap-1" style={feito ? { outline: `2px solid ${resp[i] === certa(i) ? "var(--certo)" : "var(--errado)"}` } : undefined}>
              <legend className="font-bold">Redes disponíveis</legend>
              {c.redes.map((w, j) => (
                <BotaoRadio key={w.nome} id={`wifi-${i}-${j}`} name={`wifi-${i}`} rotulo={`${w.nome} · ${w.protegida ? "🔒 protegida" : "aberta"}`} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
              ))}
              {feito && (
                <p className="m-0 text-sm" style={{ color: resp[i] === certa(i) ? "var(--certo)" : "var(--errado)" }}>
                  {resp[i] === certa(i) ? "Certo. " : `A oficial é ${c.rede}. `}As redes com nomes quase iguais podem ser armadilhas criadas por alguém para ver o que passa nelas.
                </p>
              )}
            </fieldset>
          </Janela>
        </div>
      ))}
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={resp.some((r) => r === null)} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(certas / casos.length, casos.map((c, i) => ({ tarefa: `Rede Wi-Fi oficial: ${c.local}`, resultado: resp[i] === certa(i) ? "certo" : "errado", resposta: resp[i] === null ? undefined : c.redes[resp[i]!].nome, certa: c.rede, feedback: resp[i] === certa(i) ? undefined : "Compara letra a letra com o cartaz. Na dúvida, pergunta a quem trabalha no espaço." })))}>Continuar</Botao>
        )}
        {feito && <span>{certas} de {casos.length} certas.</span>}
      </div>
    </div>
  );
}

/** Pontuação do "antes de sair": certas marcadas menos erradas marcadas, a dividir pelo total de certas. */
export function pontuarAcoes(lista: { certo: boolean }[], marcadas: boolean[]): number {
  const total = lista.filter((a) => a.certo).length;
  const bons = lista.filter((a, i) => a.certo && marcadas[i]).length;
  const maus = lista.filter((a, i) => !a.certo && marcadas[i]).length;
  return total === 0 ? 1 : Math.max(0, (bons - maus) / total);
}

function AntesDeSair({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [lista] = useState(() => {
    const nMaus = Math.max(1, Math.floor(n / 3));
    return misturar([...amostra(ACOES.filter((a) => a.certo), n - nMaus), ...amostra(ACOES.filter((a) => !a.certo), nMaus)]);
  });
  const [marcadas, setMarcadas] = useState<boolean[]>(() => lista.map(() => false));
  const [feito, setFeito] = useState(false);
  const fr = pontuarAcoes(lista, marcadas);
  return (
    <div className="grid gap-3">
      <Instrucao>Acabaste o trabalho no computador da biblioteca. Marca tudo o que deves fazer antes de sair, e só isso.</Instrucao>
      <Janela endereco="computador-publico/terminar" rotulo="Lista antes de sair">
        <fieldset className="border-0 p-4 m-0 grid gap-1">
          <legend className="font-bold">Antes de sair</legend>
          {lista.map((a, i) => (
            <div key={a.texto} className="grid gap-0">
              <CaixaVerificacao id={`acao-${i}`} rotulo={a.texto} checked={marcadas[i]} disabled={feito} onChange={() => setMarcadas((m) => m.map((x, k) => (k === i ? !x : x)))} />
              {feito && marcadas[i] !== a.certo && <p className="m-0 text-sm" style={{ color: "var(--errado)" }}>{a.certo ? "Faltou: " : "Não devias: "}{a.porque}</p>}
            </div>
          ))}
        </fieldset>
      </Janela>
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao onClick={() => aoConcluir(fr, lista.map((a, i) => ({ tarefa: a.texto, resultado: marcadas[i] === a.certo ? "certo" : "errado", resposta: marcadas[i] ? "Marcado" : "Não marcado", certa: a.certo ? "Marcado" : "Não marcado", feedback: marcadas[i] === a.certo ? undefined : a.porque })))}>Continuar</Botao>
        )}
        {feito && <span aria-live="polite">{Math.round(100 * fr)} %</span>}
      </div>
    </div>
  );
}

export const definicao = definir<ConfigPublicos>({
  slug: "publicos",
  numero: 205,
  dominio: "seguranca",
  titulo: { jornal: "Na Biblioteca", laboratorio: "Na Biblioteca" },
  descricao: "Escolhe a rede Wi-Fi certa, deixa o computador público como o encontraste e decide o que fazer fora de casa.",
  duracao: "4 a 6 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ locais: 1, redes: 3, acoes: 3, situacoes: 1 }),
  Componente: Publicos,
  dica: (m) => {
    if (Number(m.redes) < 100) return "Compara o nome da rede letra a letra com o cartaz. “_GRATIS” ou “Free” a mais é um mau sinal.";
    if (Number(m.antesDeSair) < 100) return "Antes de sair: terminar sessões, apagar transferências e reciclagem, retirar a pen e fechar o navegador.";
    return "Bom trabalho. Fora de casa, deixa o banco e as compras para os dados móveis ou uma rede de confiança.";
  },
});
