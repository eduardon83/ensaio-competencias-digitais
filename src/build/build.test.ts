// Guardas do aspeto Mosaico: o CSS do Ágora tem de chegar inteiro ao navegador e as classes do Tailwind
// usadas na aplicação não podem coincidir com as utilidades do Ágora que têm outra escala.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { retirarGoogleFonts } from "./semGoogleFonts";

const AGORA = "node_modules/@ama-pt/agora-design-system";

describe("retirarGoogleFonts", () => {
  const url = "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap";

  it("retira o @import inteiro, mesmo com ';' dentro do endereço", () => {
    for (const css of [`@import"${url}";.a{color:red}`, `@import url('${url}');.a{color:red}`, `@import url("${url}");.a{color:red}`, `@import "${url}";.a{color:red}`, `@import url( "${url}" ) ;\n.a{color:red}`]) {
      expect(retirarGoogleFonts(css).trim()).toBe(".a{color:red}");
    }
  });

  it("deixa o tema do Ágora sem restos do endereço", () => {
    const tema = retirarGoogleFonts(readFileSync(`${AGORA}/src/styles/theme.css`, "utf8"));
    expect(tema).not.toMatch(/googleapis|100\.\.900|display=swap/);
  });
});

describe("classes do Tailwind que o Ágora redefine", () => {
  // O CSS do Ágora traz utilidades fora de qualquer @layer (ganham sempre ao Tailwind da aplicação) com
  // outra escala: no Ágora, .py-8 é 8 px; no Tailwind, 32 px. A aplicação não pode usar esses nomes.
  const agora = readFileSync(`${AGORA}/artifacts/dist/index.css`, "utf8");
  const conflitos = new Set<string>();
  for (const [, nome, n, px] of agora.matchAll(/\.(-?[a-z]+(?:-[a-z]+)*-(\d+))\{[^}]*var\(--spacing-\d+,(\d+)px\)/g)) {
    if (Number(n) * 4 !== Number(px)) conflitos.add(nome);
  }

  function ficheiros(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? ficheiros(p) : /\.tsx?$/.test(f) && !/\.test\.ts$/.test(f) ? [p] : [];
    });
  }

  it("encontra as utilidades do Ágora (o teste está a ler o ficheiro certo)", () => {
    expect(conflitos.has("py-8")).toBe(true);
  });

  it("nenhum componente usa um nome em conflito", () => {
    const usos: string[] = [];
    for (const f of ficheiros("src")) {
      const texto = readFileSync(f, "utf8");
      for (const nome of conflitos) {
        // Só a classe simples conta: "md:py-8" ou "min-w-32" são outras classes.
        if (new RegExp(`(^|[\\s"'\`])${nome.replace(/-/g, "\\-")}(?=[\\s"'\`])`).test(texto)) usos.push(`${f}: ${nome}`);
      }
    }
    expect(usos).toEqual([]);
  });
});
