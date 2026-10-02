// ─── Cartão de Imprensa: pessoa fictícia e definição dos campos por nível ────
import type { Contexto } from "../../preferencias/preferencias";
import { escolher, inteiro, type Gerador } from "../../motor/aleatorio";

const NOMES = ["Joana", "Tiago", "Beatriz", "Rodrigo", "Inês", "Martim", "Leonor", "Duarte", "Matilde", "Afonso", "Carolina", "Gonçalo", "Mariana", "Tomás", "Sofia", "Francisco"];
const APELIDOS = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques", "Almeida", "Ribeiro"];
// Código postal, localidade, concelho, distrito (coerentes entre si).
const MORADAS: [string, string, string, string][] = [
  ["4400", "Vila Nova de Gaia", "Vila Nova de Gaia", "Porto"],
  ["4710", "Braga", "Braga", "Braga"],
  ["3810", "Aveiro", "Aveiro", "Aveiro"],
  ["3000", "Coimbra", "Coimbra", "Coimbra"],
  ["8000", "Faro", "Faro", "Faro"],
  ["2900", "Setúbal", "Setúbal", "Setúbal"],
  ["3500", "Viseu", "Viseu", "Viseu"],
  ["2735", "Cacém", "Sintra", "Lisboa"],
  ["4450", "Matosinhos", "Matosinhos", "Porto"],
  ["2400", "Leiria", "Leiria", "Leiria"],
];
const RUAS = ["Rua das Flores", "Avenida da Liberdade", "Rua do Sol", "Travessa da Escola", "Rua Nova", "Largo do Rossio", "Rua dos Combatentes"];
export const DISTRITOS = ["Aveiro", "Braga", "Coimbra", "Faro", "Leiria", "Lisboa", "Porto", "Setúbal", "Viseu"];
export const TURMAS = ["5.º A", "5.º B", "6.º A", "6.º B", "7.º A", "7.º B", "8.º A", "8.º B", "9.º A", "9.º B"];
export const CORES = ["Azul", "Verde", "Amarelo", "Vermelho"];
export const CURSOS = ["Ciências e Tecnologias", "Línguas e Humanidades", "Ciências Socioeconómicas", "Artes Visuais", "Curso Profissional"];
export const ANOS = ["10.º ano", "11.º ano", "12.º ano", "1.º ano de licenciatura", "2.º ano de licenciatura"];

export const FUNCOES: Record<Contexto, string[]> = {
  jornal: ["Repórter", "Fotógrafo", "Revisor"],
  laboratorio: ["Investigador", "Técnico", "Observador"],
};
export const SECCOES: Record<Contexto, string[]> = {
  jornal: ["Desporto", "Cultura", "Escola", "Opinião"],
  laboratorio: ["Biologia", "Química", "Física", "Geologia"],
};

export interface Pessoa {
  nome: string;
  primeiro: string;
  nascimento: string; // dd/mm/aaaa
  idade: number;
  turma: string;
  email: string;
  telefone: string; // 9 dígitos sem espaços
  rua: string;
  codigoPostal: string;
  localidade: string;
  concelho: string;
  distrito: string;
  cor: string;
  funcao: string;
  seccao: string;
  nif: string;
  curso: string;
  ano: string;
  irmaos: "Sim" | "Não";
  numeroIrmaos: string;
  bolsaAnterior: "Sim" | "Não";
}

function semAcentos(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function gerarPessoa(ctx: Contexto, adulto: boolean, r: Gerador = Math.random): Pessoa {
  const primeiro = escolher(NOMES, r);
  const apelidos = [escolher(APELIDOS, r), escolher(APELIDOS, r)];
  if (apelidos[0] === apelidos[1]) apelidos[1] = APELIDOS[(APELIDOS.indexOf(apelidos[0]) + 3) % APELIDOS.length];
  const ano = adulto ? inteiro(2002, 2008, r) : inteiro(2011, 2016, r);
  const [cp, localidade, concelho, distrito] = escolher(MORADAS, r);
  const dia = inteiro(1, 28, r);
  const mes = inteiro(1, 12, r);
  const dominio = ctx === "jornal" ? "escola.pt" : "lab.escola.pt";
  return {
    nome: `${primeiro} ${apelidos.join(" ")}`,
    primeiro,
    nascimento: `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`,
    idade: 2026 - ano - (mes > 10 ? 1 : 0),
    turma: escolher(TURMAS, r),
    email: `${semAcentos(primeiro)}.${semAcentos(apelidos[1])}@${dominio}`,
    telefone: `9${escolher(["1", "2", "3", "6"], r)}${String(inteiro(1000000, 9999999, r))}`,
    rua: `${escolher(RUAS, r)}, ${inteiro(2, 180, r)}`,
    codigoPostal: `${cp}-${String(inteiro(100, 999, r))}`,
    localidade,
    concelho,
    distrito,
    cor: escolher(CORES, r),
    funcao: escolher(FUNCOES[ctx], r),
    seccao: escolher(SECCOES[ctx], r),
    nif: String(inteiro(200000000, 299999999, r)),
    curso: escolher(CURSOS, r),
    ano: escolher(ANOS, r),
    irmaos: r() < 0.5 ? "Sim" : "Não",
    numeroIrmaos: String(inteiro(1, 3, r)),
    bolsaAnterior: r() < 0.5 ? "Sim" : "Não",
  };
}

export function formatarTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(" ");
}

// ─── Campos ──────────────────────────────────────────────────────────────────
export type TipoCampo = "texto" | "numero" | "data" | "email" | "telefone" | "cp" | "nif" | "select" | "radio" | "checkbox" | "ficheiro" | "opcional";

export interface Campo {
  id: keyof Pessoa | "aceito" | "fotografia" | "observacoes";
  rotulo: string;
  tipo: TipoCampo;
  passo: number;
  opcoes?: string[];
  ajuda?: string;
  /** Só aparece quando outro campo tem um valor (campo condicional). */
  se?: { campo: string; valor: string };
}

const ERROS: Partial<Record<TipoCampo, (v: string) => string | null>> = {
  texto: (v) => (v.trim().split(/\s+/).length >= 1 && v.trim().length >= 2 ? null : "Este campo é obrigatório."),
  numero: (v) => (/^\d{1,2}$/.test(v.trim()) && Number(v) >= 5 && Number(v) <= 99 ? null : "Escreve a idade só com algarismos, por exemplo 11."),
  data: (v) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim());
    if (!m) return "Escreve a data no formato dd/mm/aaaa, por exemplo 03/11/2010.";
    const [d, mm] = [Number(m[1]), Number(m[2])];
    return d >= 1 && d <= 31 && mm >= 1 && mm <= 12 ? null : "Esta data não existe. Confirma o dia e o mês.";
  },
  email: (v) => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? null : "Escreve um email completo, com @ e domínio, por exemplo nome@escola.pt."),
  telefone: (v) => (/^[29]\d{8}$/.test(v.replace(/\s/g, "")) ? null : "O telemóvel tem 9 algarismos e começa por 9, por exemplo 912 345 678."),
  cp: (v) => (/^\d{4}-\d{3}$/.test(v.trim()) ? null : "O código postal tem 4 algarismos, hífen e 3 algarismos, por exemplo 4400-123."),
  nif: (v) => (/^\d{9}$/.test(v.replace(/\s/g, "")) ? null : "O NIF tem 9 algarismos, sem espaços nem letras."),
  select: (v) => (v ? null : "Escolhe uma opção da lista."),
  radio: (v) => (v ? null : "Escolhe uma das opções."),
  checkbox: (v) => (v === "sim" ? null : "Tens de marcar esta caixa para continuar."),
  ficheiro: (v) => (v ? null : "Escolhe uma fotografia."),
};

export function validar(c: Campo, v: string): string | null {
  if (c.tipo === "opcional") return null;
  return ERROS[c.tipo]?.(v ?? "") ?? null;
}

export function camposDoNivel(nivel: number, ctx: Contexto): Campo[] {
  const funcao: Campo = { id: "funcao", rotulo: ctx === "jornal" ? "Função na redação" : "Função no laboratório", tipo: "radio", passo: 1, opcoes: FUNCOES[ctx] };
  const aceito: Campo = { id: "aceito", rotulo: ctx === "jornal" ? "Declaro que os dados são verdadeiros e aceito as regras do evento" : "Declaro que os dados são verdadeiros e aceito as regras de segurança", tipo: "checkbox", passo: 1 };
  const obs: Campo = { id: "observacoes", rotulo: "Observações (opcional)", tipo: "opcional", passo: 1, ajuda: "Só se precisares de dizer alguma coisa." };
  if (nivel <= 1)
    return [
      { id: "nome", rotulo: "Nome", tipo: "texto", passo: 1 },
      { id: "idade", rotulo: "Idade", tipo: "numero", passo: 1 },
      { id: "turma", rotulo: "Turma", tipo: "select", passo: 1, opcoes: TURMAS },
      { id: "cor", rotulo: "Cor preferida", tipo: "radio", passo: 1, opcoes: CORES },
      { ...aceito, rotulo: "Aceito as regras do evento" },
    ];
  if (nivel === 2)
    return [
      { id: "nome", rotulo: "Nome completo", tipo: "texto", passo: 1 },
      { id: "nascimento", rotulo: "Data de nascimento", tipo: "data", passo: 1, ajuda: "dd/mm/aaaa" },
      { id: "turma", rotulo: "Turma", tipo: "select", passo: 1, opcoes: TURMAS },
      { id: "email", rotulo: "Email", tipo: "email", passo: 1 },
      { id: "telefone", rotulo: "Telemóvel", tipo: "telefone", passo: 1, ajuda: "9 algarismos" },
      funcao,
      obs,
      aceito,
    ];
  if (nivel === 3)
    return [
      { id: "nome", rotulo: "Nome completo", tipo: "texto", passo: 1 },
      { id: "nascimento", rotulo: "Data de nascimento", tipo: "data", passo: 1, ajuda: "dd/mm/aaaa" },
      { id: "email", rotulo: "Email", tipo: "email", passo: 1 },
      { id: "telefone", rotulo: "Telemóvel", tipo: "telefone", passo: 1, ajuda: "9 algarismos" },
      { id: "codigoPostal", rotulo: "Código postal", tipo: "cp", passo: 1, ajuda: "0000-000" },
      { id: "localidade", rotulo: "Localidade", tipo: "texto", passo: 1 },
      { id: "concelho", rotulo: "Concelho", tipo: "texto", passo: 1 },
      { ...funcao, passo: 2 },
      { id: "seccao", rotulo: ctx === "jornal" ? "Secção" : "Área", tipo: "select", passo: 2, opcoes: SECCOES[ctx] },
      { id: "fotografia", rotulo: "Fotografia", tipo: "ficheiro", passo: 2, ajuda: "Escolhe a tua fotografia." },
      { ...obs, passo: 2 },
      { ...aceito, passo: 2 },
    ];
  return [
    { id: "nome", rotulo: "Nome completo", tipo: "texto", passo: 1 },
    { id: "nascimento", rotulo: "Data de nascimento", tipo: "data", passo: 1, ajuda: "dd/mm/aaaa" },
    { id: "email", rotulo: "Email", tipo: "email", passo: 1 },
    { id: "telefone", rotulo: "Telemóvel", tipo: "telefone", passo: 1, ajuda: "Os espaços são postos automaticamente." },
    { id: "nif", rotulo: "NIF", tipo: "nif", passo: 1, ajuda: "9 algarismos" },
    { id: "rua", rotulo: "Morada", tipo: "texto", passo: 2 },
    { id: "codigoPostal", rotulo: "Código postal", tipo: "cp", passo: 2, ajuda: "0000-000" },
    { id: "localidade", rotulo: "Localidade", tipo: "texto", passo: 2 },
    { id: "concelho", rotulo: "Concelho", tipo: "texto", passo: 2 },
    { id: "distrito", rotulo: "Distrito", tipo: "select", passo: 2, opcoes: DISTRITOS },
    { id: "curso", rotulo: "Curso", tipo: "select", passo: 3, opcoes: CURSOS },
    { id: "ano", rotulo: "Ano que frequenta", tipo: "select", passo: 3, opcoes: ANOS },
    { id: "irmaos", rotulo: "Tem irmãos a estudar?", tipo: "radio", passo: 3, opcoes: ["Sim", "Não"] },
    { id: "numeroIrmaos", rotulo: "Quantos irmãos a estudar?", tipo: "numero", passo: 3, se: { campo: "irmaos", valor: "Sim" } },
    { id: "bolsaAnterior", rotulo: "Já teve bolsa no ano anterior?", tipo: "radio", passo: 3, opcoes: ["Sim", "Não"] },
    { ...obs, passo: 3 },
    { ...aceito, passo: 3, rotulo: "Declaro que as informações são verdadeiras" },
  ];
}

/** Valor esperado de cada campo, a partir da ficha. */
export function esperado(c: Campo, p: Pessoa): string {
  if (c.id === "aceito") return "sim";
  if (c.id === "observacoes") return "";
  if (c.id === "fotografia") return `foto_${semAcentos(p.primeiro)}.jpg`;
  return String(p[c.id as keyof Pessoa] ?? "");
}

export function iguais(c: Campo, v: string, e: string): boolean {
  if (c.tipo === "telefone" || c.tipo === "nif") return v.replace(/\D/g, "") === e.replace(/\D/g, "");
  return semAcentos(v.trim().replace(/\s+/g, " ")) === semAcentos(e.trim());
}
