// ─── Camada de UI com dois formatos ──────────────────────────────────────────
// Cada controlo tem duas implementações: a do formato Kendir (HTML + CSS próprios) e a do formato
// Mosaico (componentes do Ágora Design System, AMA). O formato ativo vem das preferências.
// As atividades usam SEMPRE estes componentes, para que o "sítio simulado" do Painel também mude de aspeto.

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import {
  Button as AgoraButton,
  Checkbox as AgoraCheckbox,
  InputText as AgoraInputText,
  RadioButton as AgoraRadio,
  Switch as AgoraSwitch,
  ProgressBar as AgoraProgressBar,
} from "@ama-pt/agora-design-system";
import { Link } from "react-router";
import { usePreferencias } from "../preferencias/preferencias";

// ── Botão ────────────────────────────────────────────────────────────────────
export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "contorno" | "discreto" | "perigo";
  grande?: boolean;
  children?: ReactNode;
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = "primario", grande, className = "", children, type = "button", ...resto },
  ref,
) {
  const { prefs } = usePreferencias();
  if (prefs.formato === "mosaico") {
    const appearance = variante === "primario" || variante === "perigo" ? "solid" : variante === "contorno" ? "outline" : "link";
    const variant = variante === "perigo" ? "danger" : "primary";
    return (
      <AgoraButton ref={ref} type={type} appearance={appearance} variant={variant} className={className} {...resto}>
        {children}
      </AgoraButton>
    );
  }
  const classes = ["botao", variante === "contorno" && "botao--contorno", variante === "discreto" && "botao--discreto", grande && "botao--grande", className]
    .filter(Boolean)
    .join(" ");
  const estilo = variante === "perigo" ? { background: "var(--errado)", borderColor: "var(--errado)", color: "#fff" } : undefined;
  return (
    <button ref={ref} type={type} className={classes} style={estilo} {...resto}>
      {children}
    </button>
  );
});

/** Ligação com aspeto de botão (navegação interna). */
export function LigacaoBotao({ para, variante = "primario", grande, children, className = "" }: { para: string; variante?: "primario" | "contorno" | "discreto"; grande?: boolean; children: ReactNode; className?: string }) {
  const { prefs } = usePreferencias();
  if (prefs.formato === "mosaico") {
    return (
      <Link to={para} className={`btn btn--${variante === "primario" ? "primary" : variante === "contorno" ? "outline" : "link"} ${className}`} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "8px 16px", borderRadius: 8, background: variante === "primario" ? "var(--acento)" : "transparent", color: variante === "primario" ? "#fff" : "var(--acento)", border: variante === "contorno" ? "2px solid var(--acento)" : "2px solid transparent", fontWeight: 600 }}>
        {children}
      </Link>
    );
  }
  const classes = ["botao", variante === "contorno" && "botao--contorno", variante === "discreto" && "botao--discreto", grande && "botao--grande", className].filter(Boolean).join(" ");
  return (
    <Link to={para} className={classes}>
      {children}
    </Link>
  );
}

// ── Campo de texto ───────────────────────────────────────────────────────────
export interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  rotulo: string;
  ajuda?: ReactNode;
  erro?: ReactNode;
  obrigatorio?: boolean;
}

export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(function CampoTexto({ id, rotulo, ajuda, erro, obrigatorio, className = "", ...resto }, ref) {
  const { prefs } = usePreferencias();
  const rotuloCompleto = obrigatorio ? `${rotulo} (obrigatório)` : rotulo;
  if (prefs.formato === "mosaico") {
    return (
      <AgoraInputText
        ref={ref}
        id={id}
        label={rotuloCompleto}
        hasHelperText={!!ajuda}
        helperText={ajuda}
        hasError={!!erro}
        hasFeedback={!!erro}
        feedbackState="danger"
        feedbackText={erro}
        required={obrigatorio}
        className={className}
        {...resto}
      />
    );
  }
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  return (
    <div className={`campo ${erro ? "campo--erro" : ""} ${className}`}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span aria-hidden="true"> *</span>}
        {obrigatorio && <span className="sr-only"> (obrigatório)</span>}
      </label>
      <input ref={ref} id={id} aria-describedby={[idAjuda, idErro].filter(Boolean).join(" ") || undefined} aria-invalid={erro ? true : undefined} required={obrigatorio} {...resto} />
      {ajuda && <div id={idAjuda} className="ajuda">{ajuda}</div>}
      {erro && <div id={idErro} className="erro" role="alert">{erro}</div>}
    </div>
  );
});

// ── Caixa de verificação ─────────────────────────────────────────────────────
export interface CaixaProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  rotulo: string;
}

export function CaixaVerificacao({ id, rotulo, className = "", ...resto }: CaixaProps) {
  const { prefs } = usePreferencias();
  if (prefs.formato === "mosaico") {
    return <AgoraCheckbox id={id} label={rotulo} className={className} {...resto} />;
  }
  return (
    <label className={`opcao ${className}`} htmlFor={id}>
      <input type="checkbox" id={id} {...resto} />
      <span>{rotulo}</span>
    </label>
  );
}

// ── Botão de opção (rádio) ───────────────────────────────────────────────────
export function BotaoRadio({ id, rotulo, className = "", ...resto }: CaixaProps) {
  const { prefs } = usePreferencias();
  if (prefs.formato === "mosaico") {
    return <AgoraRadio id={id} label={rotulo} className={className} {...resto} />;
  }
  return (
    <label className={`opcao ${className}`} htmlFor={id}>
      <input type="radio" id={id} {...resto} />
      <span>{rotulo}</span>
    </label>
  );
}

// ── Interruptor (toggle) ─────────────────────────────────────────────────────
export function Interruptor({ id, rotulo, className = "", ...resto }: CaixaProps) {
  const { prefs } = usePreferencias();
  if (prefs.formato === "mosaico") {
    return <AgoraSwitch id={id} label={rotulo} className={className} {...resto} />;
  }
  return (
    <label className={`interruptor ${className}`} htmlFor={id}>
      <input type="checkbox" role="switch" id={id} {...resto} />
      <span>{rotulo}</span>
    </label>
  );
}

// ── Seletor (select nativo nos dois formatos: o InputSelect do Ágora é um dropdown próprio com API diferente) ──
export interface SeletorProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  rotulo: string;
  opcoes: { valor: string; texto: string }[];
  vazio?: string;
}

export function Seletor({ id, rotulo, opcoes, vazio, className = "", ...resto }: SeletorProps) {
  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id}>{rotulo}</label>
      <select id={id} {...resto}>
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Barra de progresso ───────────────────────────────────────────────────────
export function Barra({ valor, max = 100, rotulo, tom }: { valor: number; max?: number; rotulo: string; tom?: "normal" | "aviso" | "errado" }) {
  const { prefs } = usePreferencias();
  const pct = Math.max(0, Math.min(100, (valor / max) * 100));
  if (prefs.formato === "mosaico") {
    return <AgoraProgressBar appearance="slim" variant="percentage" value={Math.round(pct)} max={100} label={rotulo} hideLabel hidePercentageValue hasError={tom === "errado"} />;
  }
  return (
    <div className={`barra ${tom === "aviso" ? "barra--aviso" : ""} ${tom === "errado" ? "barra--errado" : ""}`} role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(valor)}>
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Cartão e etiqueta (iguais nos dois formatos, só mudam os tokens) ─────────
export function Cartao({ children, className = "", ...resto }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`cartao p-5 ${className}`} {...resto}>
      {children}
    </div>
  );
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return <span className="etiqueta">{children}</span>;
}

/** Tecla visual: mostra ⌘ em Mac quando o texto é "Ctrl". */
export function Tecla({ children }: { children: ReactNode }) {
  return <kbd>{children}</kbd>;
}
