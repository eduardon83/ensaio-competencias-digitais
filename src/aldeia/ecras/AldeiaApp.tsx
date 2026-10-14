// ─── Aldeia Digital · aplicação do aluno (/aldeia e /aldeia/:codigo/…) ───────
// Carregada à parte (React.lazy). Decide entre servidor e modo local, retoma a sessão deste navegador
// ("Continuar como…"), faz a primeira entrada (nome, fato, nascimento, personalização, guardar o nome) e
// depois mostra a aldeia e as suas páginas.
import { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { Botao } from "../../ui";
import { Espera } from "../arte/componentes";
import { codigoTurmaValido } from "../nucleo/codigos";
import type { VistaAluno, VistaPublica } from "../nucleo/modelo";
import { AldeiaProvider, useAldeia } from "../cliente/estado";
import { obterLigacao, servidorLocal, type Entrada, type Ligacao } from "../cliente/servidor";
import { apagarSessaoAluno, guardarSessaoAluno, sessaoAluno, vistaGuardada, type SessaoAluno } from "../cliente/sessao";
import { ALDEIA } from "../textos";
import { CabecalhoAldeia } from "./comum";
import { EntradaCodigo, Identificacao } from "./Entrada";
import { Nascimento } from "./Nascimento";
import { GuardaNome, Personalizar } from "./Personalizar";
import { Jogo } from "./Jogo";
import { Lista } from "./Lista";
import { Missao } from "./Missao";
import { GuardaRoupa } from "./GuardaRoupa";
import { Casa } from "./Casa";
import { Ajuda, Jornal } from "./Jornal";

type Estado =
  | { fase: "a-carregar" }
  | { fase: "indisponivel"; ligacao: Ligacao }
  | { fase: "sem-turma"; aviso: string }
  | { fase: "identificar"; ligacao: Ligacao; publico: VistaPublica }
  | { fase: "jogo"; ligacao: Ligacao; sessao: SessaoAluno; vista: VistaAluno; novo: boolean };

/** /aldeia (sem código): escrever o código ou continuar uma sessão. */
export function AldeiaInicio() {
  const local = useLocation();
  const saiu = (local.state as { saiu?: boolean } | null)?.saiu;
  return <EntradaCodigo aviso={saiu ? ALDEIA.interface.ajuda.jaSaiu : undefined} />;
}

export default function AldeiaApp() {
  const { codigo: bruto = "" } = useParams();
  const codigo = codigoTurmaValido(bruto);
  const [estado, setEstado] = useState<Estado>({ fase: "a-carregar" });
  const [forcarLocal, setForcarLocal] = useState(false);

  const carregar = useCallback(async () => {
    if (!codigo) return setEstado({ fase: "sem-turma", aviso: ALDEIA.interface.entrada.invalido });
    let ligacao = await obterLigacao();
    if (forcarLocal) ligacao = { estado: "local", email: false, servidor: servidorLocal };
    if (ligacao.estado === "indisponivel") return setEstado({ fase: "indisponivel", ligacao });
    const s = sessaoAluno(codigo);
    if (s && s.local === (ligacao.servidor.modo === "local")) {
      const r = await ligacao.servidor.eu(codigo, s.id, s.chave);
      if (r.ok) return setEstado({ fase: "jogo", ligacao, sessao: s, vista: r.valor, novo: false });
      if (r.rede) {
        const v = vistaGuardada(codigo);
        if (v) return setEstado({ fase: "jogo", ligacao, sessao: s, vista: v, novo: false });
      }
      if (r.erro === "chave" || r.erro === "turma") apagarSessaoAluno(codigo);
    }
    const p = await ligacao.servidor.publico(codigo);
    if (!p.ok) return setEstado({ fase: "sem-turma", aviso: p.rede ? ALDEIA.interface.erros.rede : p.estado === 429 ? ALDEIA.interface.entrada.limite : ALDEIA.interface.entrada.naoExiste });
    setEstado({ fase: "identificar", ligacao, publico: p.valor });
  }, [codigo, forcarLocal]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (estado.fase === "a-carregar") return <div className="aldeia-pagina"><CabecalhoAldeia seccao={ALDEIA.nome} /><main id="conteudo" className="aldeia-conteudo"><Espera /></main></div>;
  if (estado.fase === "sem-turma") return <EntradaCodigo aviso={estado.aviso} />;
  if (estado.fase === "indisponivel")
    return (
      <div className="aldeia-pagina">
        <CabecalhoAldeia seccao={ALDEIA.nome} />
        <main id="conteudo" className="aldeia-conteudo grid gap-3" style={{ maxWidth: 640 }}>
          <h1 className="text-3xl">{ALDEIA.nome}</h1>
          <p className="m-0">{ALDEIA.interface.entrada.indisponivel}</p>
          <div>
            <Botao variante="contorno" onClick={() => setForcarLocal(true)}>{ALDEIA.interface.entrada.experimentarLocal}</Botao>
          </div>
        </main>
      </div>
    );
  if (estado.fase === "identificar") {
    const { ligacao, publico } = estado;
    return (
      <Identificacao
        ligacao={ligacao}
        publico={publico}
        aoEntrar={(r: Entrada, nome: string) => {
          const s: SessaoAluno = { codigo: publico.codigo, id: r.vista.aluno.id, chave: r.chave, nome, fato: r.vista.aluno.aparencia.fato, local: ligacao.servidor.modo === "local", em: new Date().toISOString() };
          guardarSessaoAluno(s);
          setEstado({ fase: "jogo", ligacao, sessao: s, vista: r.vista, novo: !r.vista.aluno.progresso.nascimento });
        }}
      />
    );
  }
  return (
    <AldeiaProvider key={estado.sessao.id} ligacao={estado.ligacao} sessao={estado.sessao} inicial={estado.vista} aoPerderSessao={() => void carregar()}>
      <Chegada novo={estado.novo}>
        <Routes>
          <Route index element={<Jogo />} />
          <Route path="lista" element={<Lista />} />
          <Route path="casa" element={<Casa />} />
          <Route path="guarda-roupa" element={<GuardaRoupa />} />
          <Route path="missao/:id" element={<Missao />} />
          <Route path="treinar/:id" element={<Missao treino />} />
          <Route path="jornal" element={<Jornal />} />
          <Route path="ajuda" element={<Ajuda />} />
          <Route path="*" element={<Jogo />} />
        </Routes>
      </Chegada>
    </AldeiaProvider>
  );
}

/** Primeira entrada: nascimento, personalização da cara e do cabelo, e “Guarda o teu nome”. Depois, a aldeia. */
function Chegada({ novo, children }: { novo: boolean; children: React.ReactNode }) {
  const { vista, enviar, codigo, ciclo, ligacao } = useAldeia();
  const nav = useNavigate();
  const aluno = vista.aluno;
  const [passo, setPasso] = useState<"nascer" | "personalizar" | "guardar" | "pronto">(!aluno.progresso.nascimento ? "nascer" : "pronto");
  useEffect(() => {
    if (passo === "pronto" && novo) nav(`/aldeia/${codigo}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo]);
  if (passo === "nascer")
    return (
      <div className="aldeia-pagina">
        <CabecalhoAldeia seccao={ALDEIA.edificios.casa.nome} />
        <main id="conteudo" tabIndex={-1} className="aldeia-conteudo">
          <h1 className="sr-only">{ALDEIA.nascimento.vaiNascer}</h1>
          {ligacao.estado !== "servidor" && <p className="cartao p-3 m-0 mb-4 text-sm" role="note">{ALDEIA.interface.entrada.local}</p>}
          <Nascimento aparencia={aluno.aparencia} nome={aluno.nome} aoTerminar={() => { void enviar([{ op: "evento", missao: "nascimento" }]); setPasso("personalizar"); }} />
        </main>
      </div>
    );
  if (passo === "personalizar") return <Personalizar aparencia={aluno.aparencia} nome={aluno.nome} aoGuardar={(a) => { void enviar([{ op: "aparencia", valor: a }]); setPasso("guardar"); }} />;
  if (passo === "guardar") return <GuardaNome codigo={codigo} nome={aluno.nome} aparencia={aluno.aparencia} ciclo={ciclo} aoContinuar={() => setPasso("pronto")} />;
  return <>{children}</>;
}
