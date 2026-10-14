// ─── Aldeia Digital · peças leves de pixel para todo o ECD ───────────────────
// Usadas também fora da Aldeia (briefing e resultado das atividades, relógio): por isso não importam os manifestos
// nem os textos da Aldeia. A interface fica vetorial; o pixel vive em janelas bem delimitadas, a escala inteira.
import type { CSSProperties, ReactNode } from "react";
import { usePreferencias } from "../../preferencias/preferencias";

export const pixelado: CSSProperties = { imageRendering: "pixelated" };
export const urlPixel = (caminho: string) => `${import.meta.env.BASE_URL}aldeia/${caminho}.png`;

/** Moldura 9-slice do pacote (claro/escuro): a peça de ligação entre o pixel e a interface. */
export function Moldura({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const { escuro } = usePreferencias();
  return (
    <div className={className} style={{ borderStyle: "solid", borderWidth: 16, borderImage: `url(${urlPixel(escuro ? "ui/moldura-escuro" : "ui/moldura-claro")}) 8 fill / 16px round`, imageRendering: "pixelated", ...style }}>
      {children}
    </div>
  );
}

export type Expressao = "neutra" | "contente" | "preocupada" | "surpreendida";
const CRIANCAS = new Set(["ana", "leo", "nina", "tiago"]);
export function caminhoRetrato(id: string, expr: Expressao = "neutra"): string {
  return CRIANCAS.has(id) ? `personagens/criancas/${id}/retrato-${id}-${expr}` : `personagens/${id}/retrato-${id}-${expr}`;
}

/** Retrato 48 × 48 de uma personagem, numa moldura. */
export function Retrato({ id, expr = "neutra", escala = 2, alt = "", moldura = true }: { id: string; expr?: Expressao; escala?: number; alt?: string; moldura?: boolean }) {
  const img = <img src={urlPixel(caminhoRetrato(id, expr))} alt={alt} aria-hidden={alt ? undefined : true} width={48 * escala} height={48 * escala} draggable={false} style={{ ...pixelado, display: "block" }} />;
  if (!moldura) return img;
  return (
    <Moldura style={{ flex: "none", lineHeight: 0, borderWidth: 8, borderImageWidth: "16px", alignSelf: "flex-start" }}>
      {img}
    </Moldura>
  );
}

/** Estrelas em pixel (regra atual: abaixo de 50 tenta outra vez; 50 a 74 uma; 75 a 90 duas; 91 a 100 três). */
export function EstrelasPixel({ n, escala = 3, entrar = false }: { n: 0 | 1 | 2 | 3; escala?: number; entrar?: boolean }) {
  return (
    <span role="img" aria-label={`${n} de 3 estrelas`} className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <img key={i} src={urlPixel(i < n ? "ui/estrela-cheia" : "ui/estrela-vazia")} alt="" width={13 * escala} height={13 * escala} className={entrar && i < n ? "aldeia-estrela-entra" : undefined} style={{ ...pixelado, animationDelay: `${i * 160}ms`, opacity: i < n ? 1 : 0.45 }} />
      ))}
    </span>
  );
}

/** Centro de cada edifício no mapa inteiro (píxeis nativos), para a banda do briefing. Teste em mapa/mundo.test.ts. */
export const CENTRO_EDIFICIO: Record<string, [number, number]> = {
  escola: [1464, 528], jornal: [1704, 680], laboratorio: [1736, 792], biblioteca: [1096, 536], arquivo: [936, 616], junta: [1448, 840],
  seguranca: [1512, 936], mercado: [1096, 696], oficina: [1768, 936], museu: [1128, 392], largo: [1320, 696], horta: [2040, 800],
};

/** Banda com o edifício do contexto (recorte do mapa inteiro, dia ou entardecer) e o nome numa etiqueta. */
export function BandaEdificio({ edificio, nome, altura = 150, escala = 2 }: { edificio: string; nome: string; altura?: number; escala?: number }) {
  const { escuro } = usePreferencias();
  const c = CENTRO_EDIFICIO[edificio] ?? CENTRO_EDIFICIO.largo;
  return (
    <div className="banda-edificio" style={{ height: altura }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute", left: "50%", top: Math.round(altura / 2 - c[1] * escala), marginLeft: -c[0] * escala, width: 2640 * escala, height: 1500 * escala,
          backgroundImage: `url(${urlPixel(escuro ? "mundo/mapa/mapa-entardecer" : "mundo/mapa/mapa-dia")})`, backgroundSize: "100% 100%", ...pixelado,
        }}
      />
      <span className="banda-edificio__nome">{nome}</span>
    </div>
  );
}

// ── Ligação das atividades do ECD aos edifícios e às personagens da aldeia ───
const JOGOS: Record<string, [string, string]> = {
  leitura: ["biblioteca", "bibliotecaria"], "sala-trancada": ["museu", "rui"], misterio: ["junta", "presidente-junta"], orcamento: ["mercado", "marta"],
  correio: ["junta", "dona-cegonha"], robo: ["oficina", "robo"],
};
export const NOME_EDIFICIO: Record<string, string> = {
  escola: "Escola", jornal: "Redação do Jornal", laboratorio: "Laboratório", biblioteca: "Biblioteca", arquivo: "Arquivo", junta: "Junta de Freguesia e Correios",
  seguranca: "Centro de Segurança Digital", mercado: "Mercado", oficina: "Oficina dos Robôs", museu: "Museu", largo: "Largo e Torre do Relógio", horta: "Horta e Ecoponto",
};

/** Edifício e personagem de uma atividade (desafios pelo cenário, jogos e segurança pelo seu edifício). */
export function cenaDaAtividade(slug: string, numero: number, contexto: "jornal" | "laboratorio"): { edificio: string; personagem: string } {
  if (numero >= 200 && numero < 300) return { edificio: "seguranca", personagem: "mae" };
  if (numero >= 100 && JOGOS[slug]) return { edificio: JOGOS[slug][0], personagem: JOGOS[slug][1] };
  return contexto === "laboratorio" ? { edificio: "laboratorio", personagem: "doutora-ines" } : { edificio: "jornal", personagem: "diretora-graca" };
}

/** Personagem do tempo de cada cenário, com a expressão dos avisos (neutra, surpreendida, preocupada). */
export function PersonagemTempo({ restanteMs, totalMs }: { restanteMs: number; totalMs: number }) {
  const { prefs } = usePreferencias();
  const id = prefs.contexto === "laboratorio" ? "cronometro" : "sr-prazo";
  const expr: Expressao = restanteMs <= 30_000 ? "preocupada" : restanteMs <= 120_000 || restanteMs / totalMs <= 0.5 ? "surpreendida" : "neutra";
  return <img src={urlPixel(caminhoRetrato(id, expr))} alt="" aria-hidden="true" width={48} height={48} style={{ ...pixelado, flex: "none", borderRadius: 6 }} />;
}

/** Nomes das personagens que aparecem nos briefings fora da Aldeia (jogos e segurança). Os do cenário vêm dos contextos. */
export const NOME_PERSONAGEM: Record<string, string> = {
  "diretora-graca": "Diretora Graça", "doutora-ines": "Doutora Inês", bibliotecaria: "Dona Amélia", rui: "Rui", "presidente-junta": "Senhor Joaquim",
  marta: "Marta", "dona-cegonha": "Dona Cegonha", robo: "Robô de limpeza", mae: "Mãe Rita", professora: "Professora Sara", avo: "Avô Zé", tome: "Tomé",
};

/** Emblemas em pixel (um por carimbo): os 12 desafios e a Biblioteca Viva. */
export const EMBLEMAS_PIXEL = new Set(["noticia", "painel", "revisao", "arquivo", "cartao", "paginacao", "fecho", "teclas", "encontra", "simulador", "matematica", "maqueta", "leitura"]);
