// ─── Escolha do contexto de aprendizagem (redação do jornal ou laboratório) ──
// Aparece antes de começar uma atividade ou um teste: muda a história, os títulos, os briefings e os textos
// das atividades; não muda as regras nem a pontuação.
import { CONTEXTOS } from "../contextos";
import { usePreferencias } from "../preferencias/preferencias";

export function SeletorContexto({ compacto }: { compacto?: boolean }) {
  const { prefs, definir } = usePreferencias();
  return (
    <fieldset className="grid gap-2 border-0 p-0 m-0">
      <legend className="font-bold mb-1">Em que cenário queres jogar?</legend>
      {!compacto && (
        <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
          O cenário muda a história, as personagens e os textos das tarefas. As regras e a pontuação são iguais. Podes mudar sempre que começares uma atividade.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {Object.values(CONTEXTOS).map((c) => {
          const ativo = prefs.contexto === c.id;
          return (
            <label key={c.id} className="cartao p-4 grid gap-1 cursor-pointer" style={{ outline: ativo ? "3px solid var(--acento)" : undefined, background: ativo ? "var(--acento-suave)" : undefined }}>
              <span className="flex items-center gap-2">
                <input type="radio" name="contexto" value={c.id} checked={ativo} onChange={() => definir({ contexto: c.id })} style={{ width: 20, height: 20, accentColor: "var(--acento)" }} />
                <strong style={{ fontFamily: "var(--fonte-titulo)" }}>{c.nome}</strong>
              </span>
              <span className="text-sm">{c.descricao}</span>
              {!compacto && (
                <span className="text-xs" style={{ color: "var(--suave)" }}>
                  Personagens: {c.personagens.responsavel}, {c.personagens.ficheiros}, {c.personagens.revisao}, {c.personagens.relogio}.
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
