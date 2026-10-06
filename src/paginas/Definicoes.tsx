// ─── Definições: aspeto (Original / Mosaico), contexto narrativo, leitura, ajudas (alvos, Ouvir, modo calmo), tempo alargado, nome ──
import { Rico } from "../textos/Rico";
import { PAGINAS } from "../textos/paginas";
import { Caminho } from "../componentes/Caminho";
import { CONTEXTOS } from "../contextos";
import { usePreferencias, type ExtensaoTempo } from "../preferencias/preferencias";
import { BotaoRadio, CampoTexto, Cartao, Interruptor } from "../ui";

export function Definicoes() {
  const { prefs, definir } = usePreferencias();
  const A = PAGINAS.definicoes.ajudas;
  return (
    <div className="grid gap-6 max-w-3xl">
      <header className="grid gap-2">
        <Caminho itens={[]} atual={PAGINAS.definicoes.titulo} />
        <h1 className="text-4xl">{PAGINAS.definicoes.titulo}</h1>
        <p className="m-0"><Rico texto={PAGINAS.definicoes.introducao} /></p>
      </header>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Aspeto da interface</h2>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          Dois formatos de UI. Mudar o aspeto recarrega a página.
        </p>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="sr-only">Aspeto</legend>
          <BotaoRadio id="fmt-original" name="formato" rotulo="Original · editorial, inspirado num jornal de escola" checked={prefs.formato === "original"} onChange={() => definir({ formato: "original" })} />
          <BotaoRadio id="fmt-mosaico" name="formato" rotulo="Mosaico · Ágora Design System da AMA, o aspeto dos serviços públicos digitais (predefinido)" checked={prefs.formato === "mosaico"} onChange={() => definir({ formato: "mosaico" })} />
        </fieldset>
      </Cartao>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Contexto de aprendizagem</h2>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="sr-only">Contexto</legend>
          {Object.values(CONTEXTOS).map((c) => (
            <BotaoRadio key={c.id} id={`ctx-${c.id}`} name="contexto" rotulo={`${c.nome} · ${c.descricao}`} checked={prefs.contexto === c.id} onChange={() => definir({ contexto: c.id })} />
          ))}
        </fieldset>
      </Cartao>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Leitura</h2>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">Tema</legend>
          <BotaoRadio id="tema-auto" name="tema" rotulo="Automático (segue o sistema)" checked={prefs.tema === "auto"} onChange={() => definir({ tema: "auto" })} />
          <BotaoRadio id="tema-claro" name="tema" rotulo="Claro" checked={prefs.tema === "claro"} onChange={() => definir({ tema: "claro" })} />
          <BotaoRadio id="tema-escuro" name="tema" rotulo="Escuro" checked={prefs.tema === "escuro"} onChange={() => definir({ tema: "escuro" })} />
        </fieldset>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">Tamanho do texto</legend>
          <BotaoRadio id="tam-normal" name="tamanho" rotulo="Normal" checked={prefs.tamanho === "normal"} onChange={() => definir({ tamanho: "normal" })} />
          <BotaoRadio id="tam-grande" name="tamanho" rotulo="Grande (recomendado no 1.º ciclo)" checked={prefs.tamanho === "grande"} onChange={() => definir({ tamanho: "grande" })} />
        </fieldset>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">Contraste</legend>
          <BotaoRadio id="contraste-normal" name="contraste" rotulo="Normal (AA)" checked={prefs.contraste === "normal"} onChange={() => definir({ contraste: "normal" })} />
          <BotaoRadio id="contraste-reforcado" name="contraste" rotulo="Reforçado (AAA): textos secundários e contornos mais escuros" checked={prefs.contraste === "reforcado"} onChange={() => definir({ contraste: "reforcado" })} />
        </fieldset>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">{A.leitura.titulo}</legend>
          <BotaoRadio id="leitura-normal" name="leitura" rotulo={A.leitura.normal} checked={prefs.leitura === "normal"} onChange={() => definir({ leitura: "normal" })} />
          <BotaoRadio id="leitura-facilitada" name="leitura" rotulo={A.leitura.facilitada} checked={prefs.leitura === "facilitada"} onChange={() => definir({ leitura: "facilitada" })} />
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{A.leitura.ajuda}</p>
        </fieldset>
      </Cartao>

      <Cartao className="grid gap-4">
        <h2 className="text-xl">{A.titulo}</h2>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">{A.alvos.titulo}</legend>
          <BotaoRadio id="alvos-normais" name="alvos" rotulo={A.alvos.normais} checked={prefs.alvos === "normais"} onChange={() => definir({ alvos: "normais" })} />
          <BotaoRadio id="alvos-grandes" name="alvos" rotulo={A.alvos.grandes} checked={prefs.alvos === "grandes"} onChange={() => definir({ alvos: "grandes" })} />
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{A.alvos.ajuda}</p>
        </fieldset>
        <div className="grid gap-1">
          <h3 className="text-base font-bold">{A.voz.titulo}</h3>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>{A.voz.ajuda}</p>
          <Interruptor id="voz" rotulo={prefs.voz ? A.voz.ligado : A.voz.desligado} checked={prefs.voz} onChange={(e) => definir({ voz: e.target.checked })} />
        </div>
        <div className="grid gap-1">
          <h3 className="text-base font-bold">{A.calmo.titulo}</h3>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}><Rico texto={A.calmo.oQueFaz} /></p>
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}><Rico texto={A.calmo.paraQue} /></p>
          <Interruptor id="calmo" rotulo={prefs.calmo ? A.calmo.ligado : A.calmo.desligado} checked={prefs.calmo} onChange={(e) => definir({ calmo: e.target.checked })} />
        </div>
      </Cartao>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Tempo alargado (acomodação)</h2>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          Como nas provas reais, o tempo pode ser alargado para alunos que precisem. O resultado regista que foi usado.
        </p>
        <fieldset className="flex gap-4 flex-wrap border-0 p-0 m-0">
          <legend className="sr-only">Multiplicador de tempo</legend>
          {([1, 1.25, 1.5, 2] as ExtensaoTempo[]).map((x) => (
            <BotaoRadio key={x} id={`ext-${x}`} name="ext" rotulo={x === 1 ? "Normal (×1)" : `×${x}`} checked={prefs.extensaoTempo === x} onChange={() => definir({ extensaoTempo: x })} />
          ))}
        </fieldset>
      </Cartao>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Estatísticas anónimas</h2>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          Cada atividade concluída envia um registo anónimo (atividade, nível, pontuação, duração, tipo de dispositivo) para que se saiba que competências faltam e a quantas pessoas. Nunca envia nome, email, IP ou identificação. Se desligares, a aplicação funciona igual, mas os professores também deixam de receber os resultados das provas feitas com código. Ver a página Privacidade.
        </p>
        <Interruptor id="telemetria" rotulo={prefs.telemetria ? "A enviar estatísticas anónimas" : "Sem envio de estatísticas"} checked={prefs.telemetria} onChange={(e) => definir({ telemetria: e.target.checked })} />
      </Cartao>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Nome na primeira página</h2>
        <CampoTexto id="nome" rotulo="Nome ou alcunha (opcional)" ajuda="Aparece só no ecrã de resultado da preparação, neste navegador. Não é enviado." value={prefs.nome} onChange={(e) => definir({ nome: e.target.value })} autoComplete="nickname" maxLength={40} />
      </Cartao>
    </div>
  );
}
