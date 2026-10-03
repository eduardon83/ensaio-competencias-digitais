// ─── Jogo · Correio da Redação (email formal) ────────────────────────────────
// Um pedido (entrevista, reserva de material, entrega de relatório, justificação de falta, convite) para
// cumprir num email: destinatários em Para/CC/CCO escolhidos numa lista com nomes parecidos, assunto,
// saudação, conteúdo pedido, despedida, assinatura, anexo certo e linguagem adequada.
// Pontuação: percentagem dos critérios cumpridos (os critérios crescem com o nível).
import { useState } from "react";
import { definir, limitar, type PropsAtividade } from "../../motor/tipos";
import { Instrucao } from "../../motor/util";
import { Botao, CaixaVerificacao, CampoTexto } from "../../ui";
import { Janela } from "../../componentes/Janela";
import { avaliarEmail, enderecos, gerarEncomenda, type ConfigCorreio, type Email } from "./avaliar";

const NIVEIS: Record<1 | 2 | 3 | 4 | 5, ConfigCorreio> = {
  1: { cc: false, cco: false, anexo: false, informal: false, conteudo: 2, distratores: 1 },
  2: { cc: true, cco: false, anexo: true, informal: false, conteudo: 2, distratores: 2 },
  3: { cc: true, cco: false, anexo: true, informal: true, conteudo: 3, distratores: 3 },
  4: { cc: true, cco: true, anexo: true, informal: true, conteudo: 3, distratores: 4 },
  5: { cc: true, cco: true, anexo: true, informal: true, conteudo: 4, distratores: 5 },
};

type Campo = "para" | "cc" | "cco";

function Correio({ config, aoTerminar }: PropsAtividade<ConfigCorreio>) {
  const [enc] = useState(() => gerarEncomenda(config));
  const [email, setEmail] = useState<Email>({ para: "", cc: "", cco: "", assunto: "", corpo: "", anexos: [] });
  const [inicio] = useState(() => performance.now());
  const m = enc.missao;
  const campos: Campo[] = ["para", "cc", "cco"];
  const nomeCampo: Record<Campo, string> = { para: "Para", cc: "CC", cco: "CCO" };

  const adicionar = (c: Campo, end: string) =>
    setEmail((e) => {
      const atuais = enderecos(e[c]);
      return atuais.includes(end) ? e : { ...e, [c]: [...atuais, end].join("; ") };
    });

  function enviar() {
    const criterios = avaliarEmail(email, enc, config);
    const ok = criterios.filter((c) => c.ok).length;
    aoTerminar({
      pontuacao: limitar((100 * ok) / criterios.length),
      duracaoMs: performance.now() - inicio,
      metricas: { missao: m.id, criterios: criterios.length, cumpridos: ok, destinatarios: criterios.filter((c) => /Para|CC/.test(c.criterio)).every((c) => c.ok), formal: criterios.filter((c) => /Saudação|Despedida|Linguagem/.test(c.criterio)).every((c) => c.ok), conteudo: criterios.filter((c) => c.criterio.startsWith("Conteúdo")).every((c) => c.ok) },
      relatorio: criterios.map((c) => ({ tarefa: c.criterio, resultado: c.ok ? "certo" : "errado", resposta: c.resposta || undefined, certa: c.certa, feedback: c.ok ? undefined : c.feedback })),
    });
  }

  return (
    <div className="grid gap-4">
      <Instrucao>
        {m.pedido} Escreve o email.
      </Instrucao>
      <div className="cartao p-4 grid gap-2">
        <strong>O email deve ter:</strong>
        <ul className="m-0 pl-5 grid gap-1">
          <li>
            Para: {m.para.nome} ({m.para.papel.toLowerCase()})
          </li>
          {config.cc && (
            <li>
              Com conhecimento (CC): {m.cc.nome} ({m.cc.papel.toLowerCase()})
            </li>
          )}
          {config.cco && (
            <li>
              Em cópia oculta (CCO): {m.cco.nome} ({m.cco.papel.toLowerCase()})
            </li>
          )}
          <li>Um assunto claro, uma saudação e uma despedida formais</li>
          {m.conteudo.slice(0, config.conteudo).map((p) => (
            <li key={p.descricao}>{p.descricao}</li>
          ))}
          {config.anexo && <li>O anexo certo ({m.anexo.replace(/_/g, " ").replace(/\.\w+$/, "")})</li>}
          <li>A assinatura: {enc.assinatura}</li>
        </ul>
      </div>
      <Janela endereco="correio.escola-exemplo.pt/novo" rotulo="Correio eletrónico simulado">
        <div className="grid md:grid-cols-[16rem_1fr]">
          <section aria-labelledby="contactos-t" className="p-3 border-b md:border-b-0 md:border-r grid gap-2 content-start" style={{ borderColor: "var(--linha)", background: "var(--tecla)" }}>
            <h3 id="contactos-t" className="text-base">Contactos</h3>
            <ul className="m-0 p-0 list-none grid gap-2">
              {enc.contactos.map((c) => (
                <li key={c.email} className="cartao p-2 grid gap-1 text-sm">
                  <strong>{c.nome}</strong>
                  <span style={{ color: "var(--suave)" }}>{c.papel}</span>
                  <span style={{ fontFamily: "var(--fonte-mono)", wordBreak: "break-all" }}>{c.email}</span>
                  <span className="flex gap-1 flex-wrap">
                    {campos
                      .filter((f) => f === "para" || (f === "cc" && config.cc) || (f === "cco" && config.cco))
                      .map((f) => (
                        <button key={f} type="button" className="botao botao--contorno" style={{ minHeight: 36, padding: "2px 10px" }} onClick={() => adicionar(f, c.email)} aria-label={`Adicionar ${c.nome} (${c.email}) a ${nomeCampo[f]}`}>
                          + {nomeCampo[f]}
                        </button>
                      ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <div className="p-4 grid gap-3" style={{ background: "var(--superficie)" }}>
            {campos.map((f) => (
              <CampoTexto key={f} id={`correio-${f}`} rotulo={nomeCampo[f]} value={email[f]} onChange={(e) => setEmail((x) => ({ ...x, [f]: e.target.value }))} autoComplete="off" spellCheck={false} />
            ))}
            <CampoTexto id="correio-assunto" rotulo="Assunto" value={email.assunto} onChange={(e) => setEmail((x) => ({ ...x, assunto: e.target.value }))} autoComplete="off" />
            <div className="campo">
              <label htmlFor="correio-corpo">Mensagem</label>
              <textarea id="correio-corpo" rows={10} value={email.corpo} onChange={(e) => setEmail((x) => ({ ...x, corpo: e.target.value }))} />
            </div>
            <fieldset className="border-0 p-0 m-0 grid gap-1">
              <legend className="font-bold text-sm">Anexar ficheiros (os meus documentos)</legend>
              {enc.anexos.map((a) => (
                <CaixaVerificacao key={a} id={`anexo-${a}`} rotulo={`📎 ${a}`} checked={email.anexos.includes(a)} onChange={() => setEmail((x) => ({ ...x, anexos: x.anexos.includes(a) ? x.anexos.filter((y) => y !== a) : [...x.anexos, a] }))} />
              ))}
            </fieldset>
            <div>
              <Botao onClick={enviar} disabled={!email.para.trim()}>
                Enviar
              </Botao>
            </div>
          </div>
        </div>
      </Janela>
    </div>
  );
}

export const definicao = definir<ConfigCorreio>({
  slug: "correio",
  numero: 105,
  dominio: "comunicacao",
  titulo: { jornal: "Correio da Redação", laboratorio: "Correio do Laboratório" },
  descricao: "Escrever emails formais: destinatários em Para, CC e CCO, assunto, saudação, conteúdo, anexos e tom adequado.",
  duracao: "5 a 8 min",
  disponivel: true,
  niveis: NIVEIS,
  pratica: () => ({ cc: false, cco: false, anexo: false, informal: false, conteudo: 1, distratores: 0 }),
  Componente: Correio,
  dica: (m) => {
    if (m.destinatarios === false) return "Confirma os endereços na lista de contactos: há nomes e domínios parecidos. Para = destinatário; CC = quem deve saber; CCO = escondido dos outros.";
    if (m.formal === false) return "Usa uma estrutura formal: saudação (“Ex.ma Senhora”, “Caro Professor”), texto, despedida (“Com os melhores cumprimentos”) e assinatura.";
    if (m.conteudo === false) return "Antes de enviar, relê o pedido e confirma que o email tem todas as informações (data, hora, local, quantidades).";
    return "Email bem escrito. Antes de enviar, confirma sempre os destinatários e os anexos.";
  },
});
