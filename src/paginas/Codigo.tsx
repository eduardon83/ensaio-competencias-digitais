// ─── Aluno: entrar com o código do professor e fazer a prova montada por ele ──
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { porSlug } from "../atividades";
import { descodificar, formatarCodigo, type CodigoSessao } from "../codigo/codigo";
import { estadoSessao, telemetriaConfigurada } from "../dados/telemetria";
import type { Tentativa } from "../dados/repositorio";
import { NOME_NIVEL } from "../motor/tipos";
import { Botao, CampoTexto } from "../ui";
import { PrimeiraPagina, Sequencia } from "./Teste";

export function Codigo() {
  const { codigo: doUrl } = useParams();
  const navegar = useNavigate();
  const [texto, setTexto] = useState(doUrl ? formatarCodigo(doUrl) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [sessao, setSessao] = useState<CodigoSessao | null>(null);
  const [aVerificar, setAVerificar] = useState(false);

  async function entrar(valor: string) {
    const c = descodificar(valor);
    if (!c) {
      setErro("Este código não é válido. Confirma as letras e os números com o teu professor.");
      return;
    }
    if (c.config.atividades.every((s) => !porSlug(s)?.disponivel)) {
      setErro("As atividades deste código ainda não estão disponíveis nesta versão.");
      return;
    }
    if (telemetriaConfigurada) {
      setAVerificar(true);
      const r = await estadoSessao(c.sessao);
      setAVerificar(false);
      if (!("erro" in r) && r.fechada) {
        setErro("O professor já fechou esta sessão. Pede-lhe um código novo.");
        return;
      }
    }
    setErro(null);
    setSessao(c);
  }

  useEffect(() => {
    if (doUrl) void entrar(doUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doUrl]);

  if (sessao) return <ProvaDoProfessor sessao={sessao} aoSair={() => (setSessao(null), navegar("/codigo"))} />;

  return (
    <div className="grid gap-5 max-w-xl">
      <h1 className="text-4xl">Entrar com código</h1>
      <p className="m-0">O teu professor deu-te um código com duas partes, do tipo <code style={{ fontFamily: "var(--fonte-mono)" }}>TEC7·4F7KQ2</code>. Escreve-o aqui para fazeres a prova que ele montou.</p>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void entrar(texto);
        }}
      >
        <CampoTexto id="codigo" rotulo="Código da sessão" value={texto} onChange={(e) => setTexto(formatarCodigo(e.target.value))} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXX·XXXXXX" erro={erro} obrigatorio maxLength={12} style={{ fontFamily: "var(--fonte-mono)", fontSize: "1.4rem", letterSpacing: ".08em" }} />
        <div className="flex gap-3 flex-wrap">
          <Botao type="submit" disabled={texto.replace(/[^A-Za-z0-9]/g, "").length < 10 || aVerificar}>
            {aVerificar ? "A verificar…" : "Entrar"}
          </Botao>
          <Link to="/treinar" className="botao botao--discreto">
            Voltar
          </Link>
        </div>
      </form>
    </div>
  );
}

function ProvaDoProfessor({ sessao, aoSair }: { sessao: CodigoSessao; aoSair: () => void }) {
  const { config } = sessao;
  const atividades = useMemo(() => config.atividades.map((s) => porSlug(s)!).filter((a) => a && a.disponivel), [config.atividades]);
  const chaveAluno = `ecd.codigo.aluno.${sessao.sessao}`;
  const [aluno, setAluno] = useState(() => {
    try {
      return localStorage.getItem(chaveAluno) ?? "";
    } catch {
      return "";
    }
  });
  const [fim, setFim] = useState<Tentativa[] | null>(null);
  const precisa = config.identificacao !== "nenhuma";
  const valido = !precisa || (config.identificacao === "numero" ? /^\d{1,3}$/.test(aluno.trim()) : aluno.trim().length >= 2);

  useEffect(() => {
    try {
      localStorage.setItem(chaveAluno, aluno);
    } catch {
      /* nada */
    }
  }, [aluno, chaveAluno]);

  if (fim) return <PrimeiraPagina tentativas={fim} ciclo="codigo" titulo="a prova do professor" nivel={config.nivel} codigo={sessao.codigo} aluno={precisa ? aluno.trim() : undefined} />;

  return (
    <Sequencia
      chave={`codigo:${sessao.sessao}`}
      titulo={`Prova do professor · ${sessao.codigo}`}
      atividades={atividades}
      nivel={config.nivel}
      origem="codigo"
      extensaoTempo={config.extensaoTempo}
      etiquetas={{ codigo: sessao.sessao, aluno: precisa ? aluno.trim() : undefined }}
      podeComecar={valido}
      aoVoltar={aoSair}
      aoTerminar={setFim}
      antesDeComecar={
        <div className="grid gap-3">
          <p className="m-0 text-sm" style={{ color: "var(--suave)" }}>
            Nível {config.nivel} · {NOME_NIVEL[config.nivel]}
            {config.extensaoTempo !== 1 && <> · tempo alargado ×{config.extensaoTempo}</>}
          </p>
          {precisa && (
            <div className="cartao p-5 max-w-md">
              {config.identificacao === "numero" ? (
                <CampoTexto id="aluno" rotulo="O teu número de turma" inputMode="numeric" value={aluno} onChange={(e) => setAluno(e.target.value.replace(/\D/g, "").slice(0, 3))} ajuda="O professor pediu o número para saber de quem é cada resultado." obrigatorio />
              ) : (
                <CampoTexto id="aluno" rotulo="A tua alcunha" value={aluno} onChange={(e) => setAluno(e.target.value.slice(0, 30))} ajuda="Escolhe uma alcunha que o professor reconheça. Não uses o nome completo." obrigatorio />
              )}
            </div>
          )}
        </div>
      }
    />
  );
}
