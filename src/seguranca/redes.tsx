// ─── Segurança · Redes sociais: Verdade ou Boato? + situações ────────────────
// Parte 1: publicações (contas fictícias) a verificar com ferramentas (quem publicou, data, outras fontes,
// pesquisa da imagem) e a classificar como verdadeiras, falsas ou enganadoras.
// Parte 2: situações de privacidade, ciberbullying e contactos desconhecidos.
// Pontuação: 60 % publicações + 40 % situações.
import { useState } from "react";
import { amostra, baralharOpcoes, misturar } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio } from "../ui";
import { Janela } from "../componentes/Janela";

type Veredicto = "verdadeiro" | "falso" | "enganador";
type Ferramenta = "conta" | "data" | "fontes" | "imagem";
const NOME_FERRAMENTA: Record<Ferramenta, string> = { conta: "Ver quem publicou", data: "Ver a data", fontes: "Procurar noutras fontes", imagem: "Pesquisar a imagem" };
const NOME_VEREDICTO: Record<Veredicto, string> = { verdadeiro: "Verdadeiro", falso: "Falso", enganador: "Enganador" };

export interface Publicacao {
  id: string;
  autor: string;
  conta: string; // informação da conta
  texto: string;
  imagem?: { emoji: string; descricao: string; origem: string };
  data: string;
  fontes: string[];
  veredicto: Veredicto;
  chave: Ferramenta; // ferramenta que resolve o caso
  explicacao: string;
}

export const PUBLICACOES: Publicacao[] = [
  { id: "aulas", autor: "@NoticiasJa_24h", conta: "Conta criada há 5 dias · 12 seguidores · sem outras publicações.", texto: "URGENTE!!! As aulas vão ser canceladas na próxima semana em todo o país por causa da onda de calor. PARTILHA!", imagem: { emoji: "🌡️", descricao: "um termómetro ao sol", origem: "Imagem de um banco de fotografias, publicada pela primeira vez em 2019." }, data: "Publicado hoje, às 07h12.", fontes: ["Página oficial do Ministério da Educação: nenhum anúncio sobre aulas.", "Jornais nacionais: nenhuma notícia sobre o assunto."], veredicto: "falso", chave: "fontes", explicacao: "Nenhuma fonte oficial ou jornal confirma; a conta é nova e não tem histórico; usa maiúsculas e pede para partilhar." },
  { id: "cheia", autor: "@Rita_dos_Gatos", conta: "Conta pessoal criada em 2015 · 340 seguidores · publica sobretudo fotografias de gatos.", texto: "Lisboa hoje 😱😱 olhem para isto!!", imagem: { emoji: "🌊", descricao: "uma rua completamente inundada", origem: "A mesma fotografia aparece em notícias de 2014 sobre uma cheia noutra cidade, fora de Portugal." }, data: "Publicado hoje, às 15h40.", fontes: ["Proteção civil: hoje há apenas chuva fraca em Lisboa.", "Nenhum jornal fala de inundações."], veredicto: "enganador", chave: "imagem", explicacao: "A fotografia é verdadeira, mas é de outro ano e de outro lugar. Usada fora do contexto, engana." },
  { id: "feira", autor: "@BibliotecaMunicipal", conta: "Página oficial da biblioteca · criada em 2011 · 8 400 seguidores · publica a agenda todas as semanas.", texto: "A Feira do Livro abre no sábado, às 10h, no jardim central. Entrada livre!", imagem: { emoji: "📚", descricao: "o cartaz da feira", origem: "O cartaz só aparece no sítio da Câmara Municipal e nesta página, em 2026." }, data: "Publicado ontem, às 18h05.", fontes: ["Agenda da Câmara Municipal: confirma a data, a hora e o local."], veredicto: "verdadeiro", chave: "fontes", explicacao: "Conta oficial com histórico, confirmada pela agenda da Câmara." },
  { id: "chocolate", autor: "@SaudeTop", conta: "Conta criada em 2023 · 50 mil seguidores · vende suplementos.", texto: "CIÊNCIA CONFIRMA: comer chocolate todos os dias dá melhores notas na escola! 🍫📈", data: "Publicado há 2 dias.", fontes: ["O estudo original foi feito com 20 ratos de laboratório e mediu a memória durante uma semana.", "O estudo não fala de alunos nem de notas."], veredicto: "enganador", chave: "fontes", explicacao: "Parte de um estudo real, mas exagera e tira conclusões que o estudo não tira." },
  { id: "premio", autor: "@TecnoMais_Oficial_Premios", conta: "Conta criada há 2 dias · 30 seguidores · nome parecido com o da loja.", texto: "Damos um telemóvel novo a todos os que partilharem esta publicação e comentarem QUERO! 🎁", imagem: { emoji: "📱", descricao: "um telemóvel embrulhado", origem: "Imagem copiada de um anúncio de 2022 de outra marca." }, data: "Publicado hoje, às 11h00.", fontes: ["Página oficial da TecnoMais: não há nenhum passatempo e avisa para contas falsas."], veredicto: "falso", chave: "conta", explicacao: "Conta falsa que imita a loja, muito recente; a página oficial desmente. Serve para recolher dados ou espalhar burlas." },
  { id: "eclipse", autor: "@ObservatorioAstronomico", conta: "Página oficial do observatório · criada em 2010 · 25 mil seguidores.", texto: "Eclipse parcial do Sol visível em Portugal na quarta-feira de manhã. Nunca olhes diretamente para o Sol: usa óculos próprios.", data: "Publicado hoje, às 09h30.", fontes: ["Agência espacial europeia e outros observatórios: confirmam o eclipse e a data."], veredicto: "verdadeiro", chave: "fontes", explicacao: "Fonte oficial e especializada, confirmada por outras fontes fiáveis." },
  { id: "agua", autor: "@VerdadesEscondidas", conta: "Conta criada há 3 meses · publica teorias sem fontes.", texto: "O professor doutor Artur Valente provou que a água da torneira faz esquecer a matéria. Os governos escondem isto!", data: "Publicado há 4 horas.", fontes: ["Não existe nenhum investigador com este nome nas universidades portuguesas.", "Organismos de saúde: a água da rede pública é controlada e segura."], veredicto: "falso", chave: "fontes", explicacao: "O “especialista” não existe e as fontes oficiais desmentem. Promete um segredo escondido para gerar partilhas." },
  { id: "bicicletas", autor: "@CidadeEmNumeros", conta: "Conta de um jornal local · criada em 2014.", texto: "Os acidentes com bicicletas DUPLICARAM este mês!", data: "Publicado ontem, às 20h00.", fontes: ["O número passou de 2 para 4 acidentes numa só cidade num mês.", "No resto do ano e no país, os acidentes com bicicletas diminuíram."], veredicto: "enganador", chave: "fontes", explicacao: "O número é verdadeiro, mas sem contexto: com valores tão pequenos, “duplicar” assusta sem informar." },
  { id: "velha", autor: "@JornalDaRegiao", conta: "Página de um jornal regional · criada em 2009.", texto: "Escola fecha por falta de professores.", data: "Publicado originalmente em março de 2017; voltou a circular hoje, partilhado por outras contas.", fontes: ["A escola está aberta e funciona normalmente em 2026."], veredicto: "enganador", chave: "data", explicacao: "A notícia era verdadeira em 2017, mas está a ser partilhada como se fosse de hoje." },
];

interface Situacao {
  pergunta: string;
  opcoes: string[]; // a primeira é a certa
  porque: string;
}
export const SITUACOES_REDES: Situacao[] = [
  { pergunta: "Estão a gozar contigo num grupo de mensagens da turma.", opcoes: ["Guardo provas, saio ou bloqueio, denuncio e conto a um adulto", "Respondo com insultos", "Apago a conta e não conto a ninguém"], porque: "Guardar provas e pedir ajuda resolve; responder na mesma moeda piora a situação." },
  { pergunta: "Um desconhecido com um perfil simpático pede para falarem em privado e guardarem segredo.", opcoes: ["Não aceito e falo com um adulto de confiança", "Aceito, porque parece simpático", "Envio-lhe uma fotografia minha"], porque: "Pedir segredo é um sinal de alerta. Um perfil pode ser falso." },
  { pergunta: "Queres publicar uma fotografia em que aparece uma amiga.", opcoes: ["Peço-lhe autorização antes de publicar", "Publico logo, ela não se importa", "Publico e identifico-a sem perguntar"], porque: "Cada pessoa decide sobre a sua imagem. Pergunta sempre." },
  { pergunta: "O teu perfil está público e mostra a escola onde andas e a tua rua.", opcoes: ["Ponho o perfil privado e retiro esses dados", "Deixo como está", "Acrescento também o número de telefone"], porque: "Escola e morada permitem a desconhecidos saber onde te encontrar." },
  { pergunta: "Estão a partilhar um vídeo humilhante de um colega.", opcoes: ["Não partilho, apoio o colega e aviso um adulto", "Partilho para os outros verem", "Comento com emojis a rir"], porque: "Quem partilha também participa no ciberbullying." },
  { pergunta: "Uma aplicação de testes divertidos pede permissão para publicar em teu nome.", opcoes: ["Recuso a permissão", "Aceito, é só um teste", "Aceito e dou-lhe a minha palavra-passe"], porque: "Aplicações com essa permissão podem espalhar spam e burlas pelos teus amigos." },
  { pergunta: "Tens 11 anos e queres criar conta numa rede social.", opcoes: ["Peço autorização aos meus pais", "Minto sobre a idade", "Uso a conta de um amigo"], porque: "Em Portugal, abaixo dos 13 anos é preciso autorização dos pais para dar este consentimento." },
  { pergunta: "Alguém ameaça publicar uma fotografia tua se não lhe enviares dinheiro.", opcoes: ["Não pago, guardo provas e peço ajuda a um adulto e às autoridades", "Pago para o assunto acabar", "Envio mais fotografias para o acalmar"], porque: "Pagar não resolve: costuma levar a mais pedidos. Isto é crime e pode ser denunciado." },
];

export interface ConfigRedes {
  publicacoes: number;
  situacoes: number;
}
const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigRedes> = {
  1: { publicacoes: 2, situacoes: 2 },
  2: { publicacoes: 3, situacoes: 2 },
  3: { publicacoes: 4, situacoes: 3 },
  4: { publicacoes: 4, situacoes: 4 },
  5: { publicacoes: 5, situacoes: 4 },
};

function Redes({ config, aoTerminar }: PropsAtividade<ConfigRedes>) {
  const [parte, setParte] = useState<"publicacoes" | "situacoes">("publicacoes");
  const [res] = useState<{ p: number; linhas: LinhaRelatorio[]; ferramentas: number }>({ p: 0, linhas: [], ferramentas: 0 });
  const [inicio] = useState(() => performance.now());
  return (
    <div className="grid gap-4">
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--suave)" }}>
        Parte {parte === "publicacoes" ? 1 : 2} de 2 · {parte === "publicacoes" ? "Verdade ou boato?" : "O que fazer?"}
      </div>
      {parte === "publicacoes" ? (
        <Publicacoes
          n={config.publicacoes}
          aoConcluir={(fr, l, f) => {
            res.p = fr;
            res.linhas.push(...l);
            res.ferramentas = f;
            setParte("situacoes");
          }}
        />
      ) : (
        <Situacoes
          n={config.situacoes}
          aoConcluir={(fr, l) => {
            aoTerminar({ pontuacao: limitar(100 * (0.6 * res.p + 0.4 * fr)), duracaoMs: performance.now() - inicio, metricas: { publicacoes: Math.round(100 * res.p), situacoes: Math.round(100 * fr), ferramentasPorPublicacao: Math.round((10 * res.ferramentas) / config.publicacoes) / 10 }, relatorio: [...res.linhas, ...l] });
          }}
        />
      )}
    </div>
  );
}

function Publicacoes({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[], ferramentas: number) => void }) {
  const [posts] = useState(() => {
    // Pelo menos um de cada veredicto quando há espaço para isso.
    const porTipo = (v: Veredicto) => misturar(PUBLICACOES.filter((p) => p.veredicto === v));
    const base = n >= 3 ? [porTipo("verdadeiro")[0], porTipo("falso")[0], porTipo("enganador")[0]] : [porTipo("falso")[0], porTipo("verdadeiro")[0]];
    const resto = misturar(PUBLICACOES.filter((p) => !base.includes(p))).slice(0, Math.max(0, n - base.length));
    return misturar([...base, ...resto]).slice(0, n);
  });
  const [usadas, setUsadas] = useState<Record<string, Set<Ferramenta>>>({});
  const [resp, setResp] = useState<Record<string, Veredicto>>({});
  const [feito, setFeito] = useState(false);
  const usar = (id: string, f: Ferramenta) => setUsadas((u) => ({ ...u, [id]: new Set([...(u[id] ?? []), f]) }));
  const certas = posts.filter((p) => resp[p.id] === p.veredicto).length;

  return (
    <div className="grid gap-3">
      <Instrucao>Antes de partilhar, verifica. Usa as ferramentas de cada publicação e decide se é verdadeira, falsa ou enganadora (verdadeira em parte, mas apresentada de forma a enganar).</Instrucao>
      <Janela endereco="rede.escola.pt/inicio">
        <div className="p-4 grid gap-4" style={{ background: "var(--fundo)" }}>
          {posts.map((p, i) => (
            <article key={p.id} className="cartao p-4 grid gap-2" aria-label={`Publicação ${i + 1}`} style={feito ? { outline: `2px solid ${resp[p.id] === p.veredicto ? "var(--certo)" : "var(--errado)"}` } : undefined}>
              <div className="font-bold">{p.autor}</div>
              <p className="m-0">{p.texto}</p>
              {p.imagem && (
                <div className="cartao p-4 text-center" style={{ background: "var(--tecla)" }} role="img" aria-label={`Imagem: ${p.imagem.descricao}`}>
                  <span style={{ fontSize: "2.5rem" }} aria-hidden="true">{p.imagem.emoji}</span>
                  <div className="text-sm" style={{ color: "var(--suave)" }}>{p.imagem.descricao}</div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap" role="group" aria-label="Ferramentas de verificação">
                {(["conta", "data", "fontes", ...(p.imagem ? (["imagem"] as Ferramenta[]) : [])] as Ferramenta[]).map((f) => (
                  <Botao key={f} variante="contorno" onClick={() => usar(p.id, f)} aria-pressed={usadas[p.id]?.has(f) ?? false}>
                    🔎 {NOME_FERRAMENTA[f]}
                  </Botao>
                ))}
              </div>
              <div className="grid gap-1 text-sm" aria-live="polite">
                {usadas[p.id]?.has("conta") && <p className="m-0"><strong>Quem publicou:</strong> {p.conta}</p>}
                {usadas[p.id]?.has("data") && <p className="m-0"><strong>Data:</strong> {p.data}</p>}
                {usadas[p.id]?.has("fontes") && <div><strong>Outras fontes:</strong><ul className="m-0 pl-5">{p.fontes.map((f) => <li key={f}>{f}</li>)}</ul></div>}
                {usadas[p.id]?.has("imagem") && p.imagem && <p className="m-0"><strong>Pesquisa da imagem:</strong> {p.imagem.origem}</p>}
              </div>
              <fieldset className="border-0 p-0 m-0 flex gap-x-4 flex-wrap">
                <legend className="font-bold text-sm">Esta publicação é…</legend>
                {(Object.keys(NOME_VEREDICTO) as Veredicto[]).map((v) => (
                  <BotaoRadio key={v} id={`v-${p.id}-${v}`} name={`v-${p.id}`} rotulo={NOME_VEREDICTO[v]} checked={resp[p.id] === v} disabled={feito} onChange={() => setResp((r) => ({ ...r, [p.id]: v }))} />
                ))}
              </fieldset>
              {feito && <p className="m-0 text-sm" style={{ color: resp[p.id] === p.veredicto ? "var(--certo)" : "var(--errado)" }}>{resp[p.id] === p.veredicto ? "Certo. " : `Era ${NOME_VEREDICTO[p.veredicto].toLowerCase()}. `}{p.explicacao}</p>}
            </article>
          ))}
        </div>
      </Janela>
      <div className="flex gap-3 items-center">
        {!feito ? (
          <Botao disabled={posts.some((p) => !resp[p.id])} onClick={() => setFeito(true)}>Verificar</Botao>
        ) : (
          <Botao
            onClick={() => {
              const total = posts.reduce((s, p) => s + (usadas[p.id]?.size ?? 0), 0);
              aoConcluir(
                certas / posts.length,
                posts.map((p) => ({
                  tarefa: `“${p.texto.slice(0, 60)}${p.texto.length > 60 ? "…" : ""}”`,
                  resultado: resp[p.id] === p.veredicto ? "certo" : "errado",
                  resposta: `${resp[p.id] ? NOME_VEREDICTO[resp[p.id]] : ""}${usadas[p.id]?.size ? ` (usaste: ${[...usadas[p.id]].map((f) => NOME_FERRAMENTA[f].toLowerCase()).join(", ")})` : " (sem verificar)"}`,
                  certa: NOME_VEREDICTO[p.veredicto],
                  feedback: resp[p.id] === p.veredicto && usadas[p.id]?.has(p.chave) ? undefined : `${p.explicacao} A ferramenta decisiva era “${NOME_FERRAMENTA[p.chave].toLowerCase()}”.`,
                })),
                total,
              );
            }}
          >
            Continuar
          </Botao>
        )}
        {feito && <span>{certas} de {posts.length} certas.</span>}
      </div>
    </div>
  );
}

function Situacoes({ n, aoConcluir }: { n: number; aoConcluir: (fr: number, l: LinhaRelatorio[]) => void }) {
  const [qs] = useState(() => amostra(SITUACOES_REDES, n).map((s) => ({ ...s, ...baralharOpcoes(s.opcoes, 0) })));
  const [resp, setResp] = useState<(number | null)[]>(() => qs.map(() => null));
  const [feito, setFeito] = useState(false);
  const certas = qs.filter((q, i) => resp[i] === q.correta).length;
  return (
    <div className="grid gap-3">
      <Instrucao>O que fazes em cada situação?</Instrucao>
      {qs.map((q, i) => (
        <fieldset key={i} className="cartao p-4 grid gap-1 border-0" style={feito ? { outline: `2px solid ${resp[i] === q.correta ? "var(--certo)" : "var(--errado)"}` } : undefined}>
          <legend className="font-bold px-1">{i + 1}. {q.pergunta}</legend>
          {q.opcoes.map((o, j) => (
            <BotaoRadio key={j} id={`rs-${i}-${j}`} name={`rs-${i}`} rotulo={o} checked={resp[i] === j} disabled={feito} onChange={() => setResp((r) => r.map((x, k) => (k === i ? j : x)))} />
          ))}
          {feito && <p className="m-0 text-sm" style={{ color: resp[i] === q.correta ? "var(--certo)" : "var(--errado)" }}>{resp[i] === q.correta ? "Certo. " : `O mais seguro: ${q.opcoes[q.correta]}. `}{q.porque}</p>}
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

export const definicao = definir<ConfigRedes>({
  slug: "redes-sociais",
  numero: 203,
  dominio: "seguranca",
  titulo: { jornal: "Verdade ou Boato?", laboratorio: "Verdade ou Boato?" },
  descricao: "Verifica publicações com ferramentas de pesquisa e decide o que fazer em situações nas redes sociais.",
  duracao: "4 a 7 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ publicacoes: 1, situacoes: 1 }),
  Componente: Redes,
  dica: (m) => {
    if (Number(m.ferramentasPorPublicacao) < 2) return "Antes de decidir, usa pelo menos duas ferramentas: quem publicou e outras fontes resolvem a maior parte dos casos.";
    if (Number(m.publicacoes) < 100) return "Enganador não é o mesmo que falso: muitas publicações usam um facto verdadeiro fora do contexto (outra data, outro lugar, números sem comparação).";
    return "Bom trabalho. Lembra-te: na dúvida, não partilhes.";
  },
});
