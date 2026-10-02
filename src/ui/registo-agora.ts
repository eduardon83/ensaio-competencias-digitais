// ─── Registo do módulo Ágora carregado dinamicamente ─────────────────────────
// `carregarAgora()` é chamado em main.tsx antes de renderizar, só quando o formato é Mosaico.
// Mudar de formato recarrega a página, por isso o módulo está sempre presente quando é preciso.
type ModuloAgora = typeof import("./agora");

let modulo: ModuloAgora | null = null;

export async function carregarAgora(): Promise<void> {
  modulo = await import("./agora");
  await import("../styles/mosaico.css");
}

export function agora(): ModuloAgora {
  if (!modulo) throw new Error("Ágora Design System não carregado: o formato Mosaico exige carregarAgora() no arranque.");
  return modulo;
}
