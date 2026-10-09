// ─── Retirar o @import do Google Fonts do CSS do Ágora (usado em vite.config.ts) ──
// O endereço tem ";" dentro (wght@0,100..900;1,100..900): a expressão vai até ao fim das aspas e do url(),
// e só depois procura o ";" final. Se cortar a meio, o resto do endereço fica no CSS e o navegador
// deita fora a folha de estilos inteira do Mosaico.
export const SEM_GOOGLE_FONTS = /@import\s*(?:url\(\s*)?(["'])https:\/\/fonts\.googleapis\.com[^"']*\1\s*\)?[^;]*;/g;

export function retirarGoogleFonts(css: string): string {
  return css.replace(SEM_GOOGLE_FONTS, "");
}
