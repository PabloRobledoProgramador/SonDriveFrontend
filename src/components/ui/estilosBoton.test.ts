import { describe, expect, it } from "vitest";
import { clasesBoton } from "./estilosBoton";

const clases = (texto: string) => texto.split(" ").filter(Boolean);

describe("clasesBoton", () => {
  it("clasesBoton_PorDefecto_UsaRellenoNormalYAnchoAutomatico", () => {
    const resultado = clases(clasesBoton("principal"));

    expect(resultado).toContain("px-4");
    expect(resultado).not.toContain("px-3");
    expect(resultado).not.toContain("w-full");
  });

  it("clasesBoton_Compacto_UsaSoloPx3", () => {
    // Si ambas clases llegaran juntas, px-4 ganaría en el CSS de Tailwind 4
    const resultado = clases(clasesBoton("secundario", { compacto: true }));

    expect(resultado).toContain("px-3");
    expect(resultado).not.toContain("px-4");
  });

  it("clasesBoton_AnchoCompleto_AgregaWFull", () => {
    expect(clases(clasesBoton("principal", { anchoCompleto: true }))).toContain("w-full");
  });

  it("clasesBoton_Fantasma_NoTieneBordeNiFondoDeMarca", () => {
    const resultado = clases(clasesBoton("fantasma"));

    expect(resultado).toContain("text-texto-suave");
    expect(resultado).not.toContain("border");
    expect(resultado).not.toContain("bg-marca");
  });
});
