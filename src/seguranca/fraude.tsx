// ─── Segurança · O Email Desconfiado (exemplos de fraude) ────────────────────
// Caixa de entrada com emails, SMS e mensagens de organizações fictícias: umas verdadeiras, outras burlas.
// Para cada uma: legítima ou fraude; a partir do nível 2, indicar os sinais de alerta.
// Pontuação: classificação 70 % + sinais 30 % (nível 1: só classificação).
import { useMemo, useState } from "react";
import { amostra, misturar } from "../motor/aleatorio";
import { definir, limitar, type LinhaRelatorio, type PropsAtividade } from "../motor/tipos";
import { Instrucao } from "../motor/util";
import { Botao, BotaoRadio, CaixaVerificacao } from "../ui";
import { Janela } from "../componentes/Janela";

export type Sinal = "remetente" | "ligacao" | "urgencia" | "dados" | "premio" | "erros" | "anexo";
export const NOME_SINAL: Record<Sinal, string> = {
  remetente: "Remetente ou número suspeito",
  ligacao: "Ligação que leva a outro sítio",
  urgencia: "Urgência ou ameaça",
  dados: "Pede dados, códigos ou dinheiro",
  premio: "Prémio inesperado",
  erros: "Erros de escrita ou tratamento estranho",
  anexo: "Anexo perigoso",
};

export interface Mensagem {
  id: string;
  canal: "email" | "sms" | "whatsapp";
  de: string;
  assunto?: string;
  corpo: string;
  ligacao?: { texto: string; destino: string };
  anexo?: string;
  fraude: boolean;
  sinais: Sinal[];
  explicacao: string;
}

export const MENSAGENS: Mensagem[] = [
  // ── Legítimas
  { id: "l-banco", canal: "email", de: "Banco Horizonte <avisos@bancohorizonte.pt>", assunto: "O seu extrato de setembro está disponível", corpo: "Olá, Ana Costa.\nO seu extrato de setembro já está disponível na aplicação Banco Horizonte e em bancohorizonte.pt.\nPor segurança, nunca lhe pediremos a palavra-passe nem códigos por email.", ligacao: { texto: "bancohorizonte.pt", destino: "https://www.bancohorizonte.pt/extratos" }, fraude: false, sinais: [], explicacao: "Remetente com o domínio oficial, ligação que vai para o sítio oficial, sem pedidos de dados nem urgência." },
  { id: "l-envios", canal: "sms", de: "EnviosJa", corpo: "Envios Já: a encomenda EJ48213 será entregue amanhã entre as 9h e as 13h. Acompanhe em enviosja.pt/seguir", ligacao: { texto: "enviosja.pt/seguir", destino: "https://enviosja.pt/seguir" }, fraude: false, sinais: [], explicacao: "Mensagem informativa, com o endereço oficial e sem pedir pagamento." },
  { id: "l-escola", canal: "email", de: "Secretaria da Escola <secretaria@escola.pt>", assunto: "Reunião de encarregados de educação", corpo: "Caros encarregados de educação,\nA reunião do 1.º período é na sexta-feira, às 18h30, na sala 12.\nCom os melhores cumprimentos,\nA Secretaria", fraude: false, sinais: [], explicacao: "Remetente oficial da escola, informação concreta e nenhum pedido." },
  { id: "l-loja", canal: "email", de: "TecnoMais <faturas@tecnomais.pt>", assunto: "Fatura n.º 2026/481 da sua encomenda", corpo: "Olá, Rui.\nObrigado pela sua compra. Em anexo segue a fatura da encomenda n.º 48190.\nPode consultar as suas encomendas na sua conta em tecnomais.pt.", ligacao: { texto: "tecnomais.pt", destino: "https://www.tecnomais.pt/conta" }, anexo: "fatura_2026_481.pdf", fraude: false, sinais: [], explicacao: "Corresponde a uma compra feita, domínio oficial e anexo PDF esperado." },
  { id: "l-sessao", canal: "email", de: "Streamly <seguranca@streamly.com>", assunto: "Novo início de sessão na sua conta", corpo: "Olá, Marta.\nDetetámos um início de sessão num computador em Lisboa, hoje às 10h12.\nSe foi você, não precisa de fazer nada. Se não foi, abra a aplicação Streamly e mude a palavra-passe.", fraude: false, sinais: [], explicacao: "Aviso de segurança verdadeiro: não tem ligações nem pede dados, manda usar a aplicação oficial." },
  { id: "l-mae", canal: "sms", de: "Mãe", corpo: "Chego às 19h. Tira o arroz do frigorífico, por favor. Beijinhos", fraude: false, sinais: [], explicacao: "Contacto conhecido e guardado, mensagem normal, sem pedidos estranhos." },
  // ── Fraudes
  { id: "f-banco", canal: "email", de: "Banco Horizonte Segurança <alerta@bancohorizonte-seguranca.com>", assunto: "URGENTE: a sua conta será bloqueada", corpo: "Caro cliente,\nDetetámos atividade suspeita. A sua conta será bloqueada em 24 horas se não confirmar os seus dados de acesso.\nConfirme já:", ligacao: { texto: "www.bancohorizonte.pt/confirmar", destino: "http://bancohorizonte-seguranca.com/login.php" }, fraude: true, sinais: ["remetente", "ligacao", "urgencia", "dados"], explicacao: "O domínio não é o oficial, a ligação mostra um endereço e leva a outro, ameaça com bloqueio e pede dados de acesso." },
  { id: "f-envios", canal: "sms", de: "+351 912 004 731", corpo: "Envios Já: a sua encomenda esta retida. Pague 1,99 EUR de taxas ate hoje: enviosja-taxas.com", ligacao: { texto: "enviosja-taxas.com", destino: "http://enviosja-taxas.com/pagar" }, fraude: true, sinais: ["remetente", "ligacao", "urgencia", "dados", "erros"], explicacao: "Número desconhecido, endereço que não é o oficial, prazo curto, pagamento pequeno para parecer inofensivo e acentos em falta." },
  { id: "f-filho", canal: "whatsapp", de: "+351 936 220 118", corpo: "Olá mãe, mudei de número, o telemóvel caiu na água 😢 Guarda este. Preciso de pagar uma conta urgente hoje, podes transferir 450 € para este IBAN? Depois explico.", fraude: true, sinais: ["remetente", "urgencia", "dados"], explicacao: "Burla “olá mãe”: número novo e desconhecido, urgência e pedido de dinheiro. Confirma sempre ligando para o número antigo." },
  { id: "f-premio", canal: "email", de: "TecnoMais Prémios <premios@tecnomais-promo.shop>", assunto: "Parabéns! Ganhou um telemóvel novo", corpo: "Foi selecionado entre milhares de clientes para receber um telemóvel topo de gama.\nSó tem de pagar os portes (2 €) nas próximas 2 horas.", ligacao: { texto: "Reclamar o meu prémio", destino: "http://tecnomais-promo.shop/premio" }, fraude: true, sinais: ["premio", "remetente", "ligacao", "urgencia", "dados"], explicacao: "Prémio de um concurso em que ninguém entrou, domínio estranho e pagamento “pequeno” com prazo." },
  { id: "f-stream", canal: "email", de: "Streamly <suporte@streamly-pagamentos.net>", assunto: "Pagamento recusado", corpo: "Prezado usuario,\nO seu pagamento falhou. Atualize os dados do cartão em 12 horas ou perdera o acesso a sua conta.", ligacao: { texto: "Atualizar pagamento", destino: "http://streamly-pagamentos.net/cartao" }, fraude: true, sinais: ["remetente", "ligacao", "urgencia", "dados", "erros"], explicacao: "Domínio falso, tratamento estranho e erros, ameaça de perder o acesso e pedido de dados do cartão." },
  { id: "f-anexo", canal: "email", de: "Secretaria <secretaria@escola-pt.info>", assunto: "Horario do 2 periodo", corpo: "Bom dia,\nSegue em anexo o novo horario. Abra o ficheiro para ver as alteraçoes.", anexo: "horario.pdf.exe", fraude: true, sinais: ["remetente", "anexo", "erros"], explicacao: "O domínio imita o da escola (escola-pt.info), o anexo termina em .exe (é um programa, não um PDF) e há erros de escrita." },
  { id: "f-suporte", canal: "email", de: "Apoio Técnico <alerta@seguranca-computador.net>", assunto: "O seu computador tem 3 vírus!", corpo: "ATENÇÃO! O seu computador está infetado. Ligue já para o 707 000 999 e dê acesso remoto ao nosso técnico para remover os vírus.", fraude: true, sinais: ["remetente", "urgencia", "dados"], explicacao: "Falso apoio técnico: assusta, pressiona e pede acesso ao computador." },
];

export interface ConfigFraude {
  mensagens: number;
  sinais: boolean;
}

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigFraude> = {
  1: { mensagens: 4, sinais: false },
  2: { mensagens: 5, sinais: true },
  3: { mensagens: 6, sinais: true },
  4: { mensagens: 7, sinais: true },
  5: { mensagens: 8, sinais: true },
};

/** Sorteia n mensagens, com metade (arredondada) de fraudes e pelo menos uma de cada tipo. */
export function sortearMensagens(n: number, r: () => number = Math.random): Mensagem[] {
  const f = Math.max(1, Math.min(n - 1, Math.round(n / 2)));
  const fraudes = amostra(MENSAGENS.filter((m) => m.fraude), f, r);
  const legit = amostra(MENSAGENS.filter((m) => !m.fraude), n - f, r);
  return misturar([...fraudes, ...legit], r);
}

const ICONE = { email: "✉", sms: "💬", whatsapp: "🟢" };

function Fraude({ config, aoTerminar }: PropsAtividade<ConfigFraude>) {
  const [msgs] = useState(() => sortearMensagens(config.mensagens));
  const [atual, setAtual] = useState(0);
  const [decisao, setDecisao] = useState<Record<string, "legitima" | "fraude">>({});
  const [sinais, setSinais] = useState<Record<string, Set<Sinal>>>({});
  const [verLigacao, setVerLigacao] = useState<Record<string, boolean>>({});
  const [inicio] = useState(() => performance.now());
  const m = msgs[atual];
  const feitas = Object.keys(decisao).length;

  function terminar() {
    let classif = 0;
    let pontosSinais = 0;
    let nFraudes = 0;
    const linhas: LinhaRelatorio[] = msgs.map((x) => {
      const d = decisao[x.id];
      const certa = (d === "fraude") === x.fraude;
      if (certa) classif++;
      let fr = 1;
      if (x.fraude && config.sinais) {
        nFraudes++;
        const esc = sinais[x.id] ?? new Set<Sinal>();
        const tp = [...esc].filter((s) => x.sinais.includes(s)).length;
        const fp = esc.size - tp;
        fr = d === "fraude" ? Math.max(0, (tp - fp) / x.sinais.length) : 0;
        pontosSinais += fr;
      }
      const nomeMsg = `${ICONE[x.canal]} ${x.assunto ?? x.corpo.slice(0, 40) + "…"}`;
      return {
        tarefa: nomeMsg,
        resultado: !certa ? "errado" : x.fraude && config.sinais && fr < 1 ? "parcial" : "certo",
        resposta: d === "fraude" ? `Fraude${config.sinais && sinais[x.id]?.size ? ` (${[...sinais[x.id]].map((s) => NOME_SINAL[s].toLowerCase()).join(", ")})` : ""}` : d === "legitima" ? "Legítima" : undefined,
        certa: x.fraude ? `Fraude: ${x.sinais.map((s) => NOME_SINAL[s].toLowerCase()).join(", ")}` : "Legítima",
        feedback: x.explicacao,
      };
    });
    const pontuacao = config.sinais && nFraudes > 0 ? 0.7 * (classif / msgs.length) + 0.3 * (pontosSinais / nFraudes) : classif / msgs.length;
    aoTerminar({ pontuacao: limitar(100 * pontuacao), duracaoMs: performance.now() - inicio, metricas: { certas: classif, mensagens: msgs.length, sinais: nFraudes ? Math.round((100 * pontosSinais) / nFraudes) : "nao_aplicavel" }, relatorio: linhas });
  }

  const corpo = useMemo(() => m.corpo.split("\n"), [m]);
  return (
    <div className="grid gap-3">
      <Instrucao>
        Abre cada mensagem e decide se é legítima ou uma fraude.{config.sinais && " Se for fraude, marca os sinais de alerta que encontraste."} Antes de decidir, podes ver para onde vai cada ligação.
      </Instrucao>
      <Janela endereco="correio.escola.pt/caixa-de-entrada">
        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="list-none m-0 p-2 border-r grid gap-1 content-start" style={{ borderColor: "var(--linha)" }} aria-label="Caixa de entrada">
            {msgs.map((x, i) => (
              <li key={x.id}>
                <button type="button" onClick={() => setAtual(i)} aria-current={i === atual ? "true" : undefined} className="w-full text-left p-2 rounded grid" style={{ border: i === atual ? "2px solid var(--acento)" : "1px solid var(--linha)", background: decisao[x.id] ? "var(--tecla)" : "var(--superficie)", color: "var(--tinta)", cursor: "pointer", font: "inherit" }}>
                  <span className="text-sm font-bold flex gap-1">
                    <span aria-hidden="true">{ICONE[x.canal]}</span>
                    <span className="truncate">{x.de.replace(/ <.*>$/, "")}</span>
                    {decisao[x.id] && <span className="ml-auto etiqueta">{decisao[x.id] === "fraude" ? "Fraude" : "Legítima"}</span>}
                  </span>
                  <span className="text-sm truncate" style={{ color: "var(--suave)" }}>{x.assunto ?? x.corpo}</span>
                </button>
              </li>
            ))}
          </ul>
          <article className="p-4 grid gap-3 content-start" aria-label="Mensagem aberta">
            <div className="text-sm grid gap-0.5">
              <span><strong>{m.canal === "email" ? "De" : "Número"}:</strong> {m.de}</span>
              {m.assunto && <span><strong>Assunto:</strong> {m.assunto}</span>}
              <span style={{ color: "var(--suave)" }}>{m.canal === "email" ? "Email" : m.canal === "sms" ? "SMS" : "Mensagem instantânea"}</span>
            </div>
            <div className="cartao p-3 grid gap-1">
              {corpo.map((l, i) => <p key={i} className="m-0">{l}</p>)}
              {m.ligacao && (
                <div className="grid gap-1 mt-1">
                  <span><span className="ligacao-simples" style={{ minHeight: "auto" }}>{m.ligacao.texto}</span></span>
                  <button type="button" className="ligacao-simples text-sm" style={{ minHeight: 32 }} aria-expanded={!!verLigacao[m.id]} onClick={() => setVerLigacao((v) => ({ ...v, [m.id]: !v[m.id] }))}>
                    {verLigacao[m.id] ? "Esconder o destino" : "Ver para onde vai a ligação (como passar o rato por cima)"}
                  </button>
                  {verLigacao[m.id] && <span className="text-sm" style={{ fontFamily: "var(--fonte-mono)" }} role="status">Destino real: {m.ligacao.destino}</span>}
                </div>
              )}
              {m.anexo && <span className="etiqueta mt-1" style={{ textTransform: "none", width: "fit-content" }}>📎 {m.anexo}</span>}
            </div>
            <fieldset className="border-0 p-0 m-0 grid gap-1">
              <legend className="font-bold">Esta mensagem é…</legend>
              <BotaoRadio id={`d-${m.id}-l`} name={`d-${m.id}`} rotulo="Legítima" checked={decisao[m.id] === "legitima"} onChange={() => setDecisao((d) => ({ ...d, [m.id]: "legitima" }))} />
              <BotaoRadio id={`d-${m.id}-f`} name={`d-${m.id}`} rotulo="Fraude" checked={decisao[m.id] === "fraude"} onChange={() => setDecisao((d) => ({ ...d, [m.id]: "fraude" }))} />
            </fieldset>
            {config.sinais && decisao[m.id] === "fraude" && (
              <fieldset className="border-0 p-0 m-0 grid gap-0">
                <legend className="font-bold">Que sinais de alerta encontraste?</legend>
                {(Object.keys(NOME_SINAL) as Sinal[]).map((s) => (
                  <CaixaVerificacao key={s} id={`s-${m.id}-${s}`} rotulo={NOME_SINAL[s]} checked={sinais[m.id]?.has(s) ?? false} onChange={(e) => setSinais((x) => { const n = new Set(x[m.id] ?? []); if (e.target.checked) n.add(s); else n.delete(s); return { ...x, [m.id]: n }; })} />
                ))}
              </fieldset>
            )}
            <div className="flex gap-2 flex-wrap">
              {atual + 1 < msgs.length && <Botao variante="contorno" onClick={() => setAtual(atual + 1)}>Mensagem seguinte</Botao>}
            </div>
          </article>
        </div>
      </Janela>
      <div className="flex gap-3 items-center flex-wrap">
        <Botao disabled={feitas < msgs.length} onClick={terminar}>Terminar ({feitas} de {msgs.length} classificadas)</Botao>
      </div>
    </div>
  );
}

export const definicao = definir<ConfigFraude>({
  slug: "fraude",
  numero: 202,
  dominio: "seguranca",
  titulo: { jornal: "O Email Desconfiado", laboratorio: "O Email Desconfiado" },
  descricao: "Uma caixa de correio com mensagens verdadeiras e burlas. Descobre quais são falsas e porquê.",
  duracao: "4 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ mensagens: 2, sinais: false }),
  Componente: Fraude,
  dica: (m) => {
    if (Number(m.certas) < Number(m.mensagens)) return "Antes de decidir, olha para o endereço completo do remetente e para o destino real das ligações: as burlas imitam o nome, mas não o endereço oficial.";
    if (typeof m.sinais === "number" && m.sinais < 100) return "Uma burla tem quase sempre vários sinais ao mesmo tempo: remetente estranho, ligação enganadora, urgência e pedido de dados.";
    return "Muito bem. Lembra-te: na dúvida, confirma pelo canal oficial, escrevendo tu o endereço ou ligando para o número que já conheces.";
  },
});
