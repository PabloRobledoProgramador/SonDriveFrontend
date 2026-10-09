// Clases de los botones, compartidas por Boton y por los enlaces con apariencia de botón

export type VarianteBoton = "principal" | "secundario" | "fantasma";

export interface OpcionesBoton {
  anchoCompleto?: boolean;
  // Relleno lateral menor. Va aquí y no como className: en Tailwind 4 un px-3 agregado por fuera
  // no le gana al px-4 base (ambas reglas tienen la misma especificidad y px-4 va después)
  compacto?: boolean;
}

const estilosVariante: Record<VarianteBoton, string> = {
  principal: "bg-marca font-semibold text-fondo hover:bg-marca-oscuro",
  secundario:
    "border border-borde font-medium text-texto-suave hover:border-marca hover:text-marca",
  // Acciones discretas sin borde, como "Cerrar" en el Modal
  fantasma: "font-medium text-texto-suave hover:bg-divisor hover:text-marca",
};

export function clasesBoton(
  variante: VarianteBoton,
  { anchoCompleto = false, compacto = false }: OpcionesBoton = {},
): string {
  return [
    "inline-flex min-h-11 items-center justify-center rounded-lg text-sm transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    compacto ? "px-3" : "px-4",
    estilosVariante[variante],
    anchoCompleto ? "w-full" : "",
  ].join(" ");
}
