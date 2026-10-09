// ─── Ícones da interface (Lucide), escolhidos por nome ───────────────────────
// Os conteúdos guardam o nome do ícone (texto simples, fora do backoffice); este componente desenha-o.
// Os emojis ficam só no conteúdo dos jogos e das mensagens simuladas, nunca nos ícones da interface.
import {
  ArrowUp, ArrowUpDown, BookOpen, Bot, Box, ChartPie, CircleHelp, Command, Compass, Dices, Eye, FastForward, FolderTree, Hand,
  Hash, Keyboard, ListChecks, LockKeyhole, Mail, MessageCircle, PanelsTopLeft, Pencil, Play, Repeat, RotateCcw, RotateCw,
  ScanEye, Search, Sheet, Shield, ShieldCheck, Sigma, Square, Star, Target, TextCursorInput, Timer, UserSearch, Users, Volume2, Wifi,
  Fish,
  type LucideIcon,
} from "lucide-react";
import type { Dominio } from "../motor/tipos";

export const ICONES = {
  avancar: ArrowUp, arrastar: ArrowUpDown, livro: BookOpen, robo: Bot, cubo: Box, grafico: ChartPie, ajuda: CircleHelp, comando: Command,
  bussola: Compass, dados: Dices, olho: Eye, ate: FastForward, pastas: FolderTree, mao: Hand, cardinal: Hash, teclado: Keyboard,
  lista: ListChecks, cadeado: LockKeyhole, email: Mail, mensagem: MessageCircle, interface: PanelsTopLeft, lapis: Pencil, jogar: Play,
  repetir: Repeat, esquerda: RotateCcw, direita: RotateCw, atencao: ScanEye, procurar: Search, folha: Sheet, escudo: Shield,
  escudoCerto: ShieldCheck, soma: Sigma, parar: Square, estrela: Star, alvo: Target, campo: TextCursorInput, tempo: Timer,
  detetive: UserSearch, familia: Users, ouvir: Volume2, wifi: Wifi, anzol: Fish,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof ICONES;

/** Ícone de cada competência (carimbos do cartão). */
export const ICONE_DOMINIO: Record<Dominio, NomeIcone> = {
  teclado: "teclado", interface: "interface", atencao: "atencao", navegacao: "pastas", formularios: "campo", arrastar: "arrastar",
  tempo: "tempo", atalhos: "comando", leitura: "procurar", matematica: "soma", seguranca: "escudo", comunicacao: "email",
  folhas: "folha", pensamento: "detetive", programacao: "robo", tresd: "cubo", todas: "estrela",
};

/** Desenha um ícone decorativo (aria-hidden): o texto ao lado dá o significado. */
export function Icone({ nome, tamanho = "1em", className }: { nome: string; tamanho?: number | string; className?: string }) {
  const C = ICONES[nome as NomeIcone];
  if (!C) return null;
  return <C aria-hidden="true" focusable="false" size={tamanho} strokeWidth={2} className={className} style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }} />;
}
