// ─── Aldeia Digital · estado do aluno no navegador ───────────────────────────
// As operações aplicam-se logo aqui (o mesmo serviço da turma, em memória: resposta imediata e jogo sem rede) e vão
// para uma fila enviada em grupo (o servidor aceita 5 escritas em 10 s por aluno). A resposta do servidor manda sempre.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cicloDoNivel, missoesDaTurma, type CicloTexto, type DefMissao } from "../nucleo/catalogo";
import type { Op } from "../nucleo/esquema";
import type { TurmaDados, VistaAluno } from "../nucleo/modelo";
import { armazemMemoria } from "../nucleo/armazem";
import { desbloqueios, estadoCapitulos, type Desbloqueios, type EstadoCapitulo } from "../nucleo/regras";
import { ServicoTurma } from "../nucleo/servico";
import { idAleatorio } from "../nucleo/cripto";
import type { Ligacao } from "./servidor";
import { apagarSessaoAluno, filaGuardada, guardarFila, guardarVista, type SessaoAluno } from "./sessao";
import { guardarAvatarLocal } from "../arte/componentes";

/** Aplica operações a uma cópia da vista, com as regras do servidor (resposta imediata e modo sem rede). */
export async function aplicarLocalmente(v: VistaAluno, ops: Op[]): Promise<VistaAluno> {
  const a = armazemMemoria();
  const t: TurmaDados = {
    codigo: v.turma.codigo, hashProfessor: "", config: { ...v.turma.config, nome: "", lugares: 32 }, capitulosAbertos: v.turma.capitulosAbertos,
    criadoEm: v.aluno.criadoEm, atualizadoEm: v.aluno.criadoEm, email: null, versao: 1,
  };
  await a.guardar("turma", t);
  await a.guardar(`aluno:${v.aluno.id}`, v.aluno);
  const r = await new ServicoTurma(a).aplicar(v.aluno.id, ops);
  if (!r.ok) return v;
  return { ...v, aluno: r.valor.vista.aluno };
}

export type EstadoFila = "ok" | "a-guardar" | "sem-rede" | "sessao";

export interface ValorAldeia {
  codigo: string;
  ligacao: Ligacao;
  sessao: SessaoAluno;
  vista: VistaAluno;
  missoes: DefMissao[];
  caps: EstadoCapitulo[];
  d: Desbloqueios;
  ciclo: CicloTexto;
  fila: EstadoFila;
  enviar: (ops: Op[]) => Promise<VistaAluno>;
  novoId: () => string;
  sair: () => Promise<void>;
  recarregar: () => Promise<void>;
}

const Ctx = createContext<ValorAldeia | null>(null);

export function useAldeia(): ValorAldeia {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAldeia fora de AldeiaProvider");
  return v;
}

export function AldeiaProvider({ ligacao, sessao, inicial, aoPerderSessao, children }: { ligacao: Ligacao; sessao: SessaoAluno; inicial: VistaAluno; aoPerderSessao: () => void; children: ReactNode }) {
  const [vista, setVista] = useState(inicial);
  const [fila, setFila] = useState<EstadoFila>(filaGuardada(sessao.codigo).length ? "a-guardar" : "ok");
  const atual = useRef(inicial);
  const pendentes = useRef<Op[]>(filaGuardada(sessao.codigo));
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aEnviar = useRef(false);
  const perder = useRef(aoPerderSessao);
  perder.current = aoPerderSessao;

  const definirVista = useCallback(
    (v: VistaAluno) => {
      atual.current = v;
      setVista(v);
      guardarVista(sessao.codigo, v);
      guardarAvatarLocal(v.aluno.aparencia);
    },
    [sessao.codigo],
  );

  const despejarRef = useRef<() => Promise<void>>(async () => {});
  const agendar = useCallback((ms = 1200) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => void despejarRef.current(), ms);
  }, []);

  const despejar = useCallback(async () => {
    if (aEnviar.current || !pendentes.current.length) return;
    aEnviar.current = true;
    const lote = pendentes.current.slice(0, 30);
    setFila("a-guardar");
    const r = await ligacao.servidor.aplicar(sessao.codigo, sessao.id, sessao.chave, lote);
    aEnviar.current = false;
    if (r.ok) {
      pendentes.current = pendentes.current.slice(lote.length);
      guardarFila(sessao.codigo, pendentes.current);
      // O servidor manda; as operações que chegaram entretanto voltam a aplicar-se por cima.
      definirVista(pendentes.current.length ? await aplicarLocalmente(r.valor.vista, pendentes.current) : r.valor.vista);
      setFila(pendentes.current.length ? "a-guardar" : "ok");
      if (pendentes.current.length) agendar(300);
      return;
    }
    if (r.erro === "chave") {
      setFila("sessao");
      apagarSessaoAluno(sessao.codigo);
      perder.current();
      return;
    }
    if (r.rede || r.erro === "limite" || r.estado === 429 || (r.estado ?? 0) >= 500) {
      setFila(r.rede ? "sem-rede" : "a-guardar");
      agendar(r.rede ? 8000 : 4000);
      return;
    }
    // Pedido recusado (turma fechada, pedido inválido): descarta este lote e volta ao estado do servidor.
    pendentes.current = pendentes.current.slice(lote.length);
    guardarFila(sessao.codigo, pendentes.current);
    setFila("ok");
    const v = await ligacao.servidor.eu(sessao.codigo, sessao.id, sessao.chave);
    if (v.ok) definirVista(v.valor);
  }, [ligacao, sessao, definirVista, agendar]);
  despejarRef.current = despejar;

  const enviar = useCallback(
    async (ops: Op[]) => {
      const nova = await aplicarLocalmente(atual.current, ops);
      definirVista(nova);
      pendentes.current = [...pendentes.current, ...ops];
      guardarFila(sessao.codigo, pendentes.current);
      setFila("a-guardar");
      agendar();
      return nova;
    },
    [agendar, definirVista, sessao.codigo],
  );

  useEffect(() => {
    if (pendentes.current.length) agendar(500);
    const online = () => agendar(200);
    const esconder = () => {
      if (document.visibilityState === "hidden") void despejar();
    };
    window.addEventListener("online", online);
    document.addEventListener("visibilitychange", esconder);
    return () => {
      window.removeEventListener("online", online);
      document.removeEventListener("visibilitychange", esconder);
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [agendar, despejar]);

  const recarregar = useCallback(async () => {
    const v = await ligacao.servidor.eu(sessao.codigo, sessao.id, sessao.chave);
    if (v.ok) definirVista(pendentes.current.length ? await aplicarLocalmente(v.valor, pendentes.current) : v.valor);
    else if (v.erro === "chave") {
      apagarSessaoAluno(sessao.codigo);
      perder.current();
    }
  }, [ligacao, sessao, definirVista]);

  const sair = useCallback(async () => {
    await despejar();
    await ligacao.servidor.sair(sessao.codigo, sessao.id, sessao.chave);
    apagarSessaoAluno(sessao.codigo);
  }, [despejar, ligacao, sessao]);

  const valor = useMemo<ValorAldeia>(() => {
    const config = vista.turma.config;
    const caps = estadoCapitulos(config, vista.turma.capitulosAbertos, vista.aluno);
    return {
      codigo: sessao.codigo, ligacao, sessao, vista, fila, enviar, sair, recarregar,
      missoes: missoesDaTurma(config), caps, d: desbloqueios(vista.aluno, config, vista.turma.capitulosAbertos, vista.objetivo.atingido),
      ciclo: cicloDoNivel(config.nivel), novoId: idAleatorio,
    };
  }, [vista, fila, enviar, sair, recarregar, ligacao, sessao]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
