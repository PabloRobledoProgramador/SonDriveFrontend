// Clases de los botones, compartidas por Boton y por los enlaces con apariencia de botón

export type VarianteBoton = "principal" | "secundario";

const estilosVariante: Record<VarianteBoton, string> = {
  principal: "bg-marca font-semibold text-fondo hover:bg-marca-oscuro",
  secundario:
    "border border-borde font-medium text-texto-suave hover:border-marca hover:text-marca",
};

export function clasesBoton(variante: VarianteBoton, anchoCompleto = false): string {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    estilosVariante[variante],
    anchoCompleto ? "w-full" : "",
  ].join(" ");
}
