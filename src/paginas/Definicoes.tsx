// ─── Definições: aspeto (Kendir / Mosaico), contexto narrativo, tema, tamanho do texto, tempo alargado, nome ──
import { CONTEXTOS } from "../contextos";
import { usePreferencias, type ExtensaoTempo } from "../preferencias/preferencias";
import { BotaoRadio, CampoTexto, Cartao } from "../ui";

export function Definicoes() {
  const { prefs, definir } = usePreferencias();
  return (
    <div className="grid gap-6 max-w-3xl">
      <header className="grid gap-2">
        <h1 className="text-4xl">Definições</h1>
        <p className="m-0">Tudo fica guardado neste navegador. Nenhuma destas escolhas afeta a pontuação, exceto o tempo alargado, que fica registado no resultado como acomodação.</p>
      </header>

      <Cartao className="grid gap-3">
        <h2 className="text-xl">Aspeto da interface</h2>
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          Dois formatos de UI. Mudar o aspeto recarrega a página.
        </p>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="sr-only">Aspeto</legend>
          <BotaoRadio id="fmt-kendir" name="formato" rotulo="Kendir · editorial, inspirado num jornal de escola (Atkinson Hyperlegible, Bricolage Grotesque)" checked={prefs.formato === "kendir"} onChange={() => definir({ formato: "kendir" })} />
          <BotaoRadio id="fmt-mosaico" name="formato" rotulo="Mosaico · Ágora Design System da AMA, o aspeto dos serviços públicos digitais (gov.pt)" checked={prefs.formato === "mosaico"} onChange={() => definir({ formato: "mosaico" })} />
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
          <BotaoRadio id="tema-escuro" name="tema" rotulo="Escuro (só no aspeto Kendir)" checked={prefs.tema === "escuro"} onChange={() => definir({ tema: "escuro" })} />
        </fieldset>
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-bold text-sm">Tamanho do texto</legend>
          <BotaoRadio id="tam-normal" name="tamanho" rotulo="Normal" checked={prefs.tamanho === "normal"} onChange={() => definir({ tamanho: "normal" })} />
          <BotaoRadio id="tam-grande" name="tamanho" rotulo="Grande (recomendado no 1.º ciclo)" checked={prefs.tamanho === "grande"} onChange={() => definir({ tamanho: "grande" })} />
        </fieldset>
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
        <h2 className="text-xl">Nome na primeira página</h2>
        <CampoTexto id="nome" rotulo="Nome ou alcunha (opcional)" ajuda="Aparece só no ecrã de resultado do teste, neste navegador. Não é enviado." value={prefs.nome} onChange={(e) => definir({ nome: e.target.value })} autoComplete="nickname" maxLength={40} />
      </Cartao>
    </div>
  );
}
