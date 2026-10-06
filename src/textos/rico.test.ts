import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { rico } from "./Rico";

describe("Texto rico", () => {
  it("aceita ligações internas, https e mailto", () => {
    const [a] = rico("[Sobre](/sobre)") as ReactElement<{ to: string }>[];
    expect(a.props.to).toBe("/sobre");
    const [b] = rico("[IAVE](https://iave.pt)") as ReactElement<{ href: string }>[];
    expect(b.props.href).toBe("https://iave.pt");
    const [c] = rico("[Email](mailto:geral@exemplo.pt)") as ReactElement<{ href: string }>[];
    expect(c.props.href).toBe("mailto:geral@exemplo.pt");
  });
  it("mostra só o texto quando o destino não é seguro", () => {
    expect(rico("[clica](javascript:alert(1))")).toEqual(["clica", ")"]);
    expect(rico("[x](data:text/html,oi)")).toEqual(["x"]);
  });
});
