// ─── Ler em voz alta: síntese de voz do navegador e botão "Ouvir" ─────────────
// O botão lê o texto do bloco onde está (o antepassado mais próximo com data-ouvir), sem o próprio botão.
// Só aparece com a opção "Ler em voz alta" ligada em Definições, ou com `sempre`.
import { useEffect, useRef } from "react";
import { usePreferencias } from "../preferencias/preferencias";
import { Botao } from "../ui";
import { Icone } from "./Icone";

export const VOZ_DISPONIVEL = typeof window !== "undefined" && "speechSynthesis" in window;

/** Lê o texto com a síntese de voz do navegador, numa voz de português de Portugal quando existir. */
export function lerEmVozAlta(texto: string) {
  if (!VOZ_DISPONIVEL) return;
  const voz = window.speechSynthesis;
  voz.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-PT";
  fala.rate = 0.95;
  const pt = voz.getVoices().find((v) => v.lang === "pt-PT") ?? voz.getVoices().find((v) => v.lang.startsWith("pt"));
  if (pt) fala.voice = pt;
  voz.speak(fala);
}

/** Texto visível de um bloco, sem os botões "Ouvir" lá dentro. */
export function textoDoBloco(el: HTMLElement): string {
  let t = el.innerText;
  for (const b of el.querySelectorAll<HTMLElement>("[data-ouvir-botao]")) t = t.replace(b.innerText, " ");
  return t.replace(/\s+/g, " ").trim();
}

export function Ouvir({ texto, sempre, rotulo = "Ouvir" }: { texto?: string; sempre?: boolean; rotulo?: string }) {
  const { prefs } = usePreferencias();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => () => { if (VOZ_DISPONIVEL) window.speechSynthesis.cancel(); }, []);
  if (!VOZ_DISPONIVEL || (!prefs.voz && !sempre)) return null;
  return (
    <span ref={ref} data-ouvir-botao="" className="inline-flex">
      <Botao
        variante="discreto"
        type="button"
        onClick={() => {
          const bloco = ref.current?.closest<HTMLElement>("[data-ouvir]");
          lerEmVozAlta(texto ?? (bloco ? textoDoBloco(bloco) : ""));
        }}
      >
        <Icone nome="ouvir" /> {rotulo}
      </Botao>
    </span>
  );
}
