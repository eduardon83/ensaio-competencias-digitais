// ─── Administração: agregados completos da telemetria, protegidos pela chave verificada no ponto de recolha ──
import { Caminho } from "../componentes/Caminho";
import { useEffect, useState } from "react";
import { obterAgregados, telemetriaConfigurada, type Agregados } from "../dados/telemetria";
import { Botao, CampoTexto } from "../ui";
import { PainelObservatorio } from "./Observatorio";

const CHAVE_SESSAO = "ecd.admin.chave";

export function Admin() {
  const [chave, setChave] = useState(() => {
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) ?? "";
    } catch {
      return "";
    }
  });
  const [dados, setDados] = useState<Agregados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(false);

  async function carregar(c: string) {
    setACarregar(true);
    setErro(null);
    const r = await obterAgregados(c);
    setACarregar(false);
    if (!r) return setErro("Ponto de recolha não configurado (VITE_TELEMETRIA_URL).");
    if ("erro" in r) {
      setDados(null);
      setErro(r.erro === "chave" ? "Chave incorreta." : r.erro === "tentativas" ? "Demasiadas tentativas erradas. Aguarde 15 minutos." : `Não foi possível obter os dados (${r.erro}).`);
      return;
    }
    if (!r.completo) {
      setDados(null);
      setErro("Chave incorreta.");
      return;
    }
    try {
      sessionStorage.setItem(CHAVE_SESSAO, c);
    } catch {
      /* nada */
    }
    setDados(r);
  }

  useEffect(() => {
    if (chave) void carregar(chave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!telemetriaConfigurada) {
    return (
      <div className="grid gap-3 max-w-2xl">
        <Caminho itens={[]} atual="Administração" />
        <h1 className="text-4xl">Administração</h1>
        <p className="m-0">A recolha de estatísticas não está configurada nesta instalação. Defina `VITE_TELEMETRIA_URL` (ver README.txt), que deve ser implementado num novo deployment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-2 max-w-3xl">
        <Caminho itens={[]} atual="Administração" />
        <h1 className="text-4xl">Administração</h1>
        <p className="m-0">Estatísticas completas da recolha anónima (sem limiar). A chave é verificada no ponto de recolha e fica só nesta sessão do navegador.</p>
      </header>
      {!dados && (
        <form
          className="flex gap-3 items-end flex-wrap max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            void carregar(chave);
          }}
        >
          <CampoTexto id="chave" rotulo="Chave de administração" type="password" value={chave} onChange={(e) => setChave(e.target.value)} autoComplete="current-password" erro={erro} className="flex-1" />
          <Botao type="submit" disabled={!chave || aCarregar}>
            {aCarregar ? "A verificar…" : "Entrar"}
          </Botao>
        </form>
      )}
      {dados && (
        <>
          <div className="flex gap-3 items-center flex-wrap text-sm" style={{ color: "var(--suave)" }}>
            <span>Gerado em {new Date(dados.gerado_em).toLocaleString("pt-PT")}</span>
            <Botao variante="discreto" onClick={() => void carregar(chave)}>
              Atualizar
            </Botao>
            <Botao
              variante="discreto"
              onClick={() => {
                setDados(null);
                setChave("");
                try {
                  sessionStorage.removeItem(CHAVE_SESSAO);
                } catch {
                  /* nada */
                }
              }}
            >
              Sair
            </Botao>
          </div>
          <PainelObservatorio chave={chave} />
        </>
      )}
    </div>
  );
}
