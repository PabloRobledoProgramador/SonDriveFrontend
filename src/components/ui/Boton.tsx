import type { ButtonHTMLAttributes } from "react";
import { clasesBoton, type VarianteBoton } from "./estilosBoton";

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
  textoCargando?: string;
  anchoCompleto?: boolean;
}

export default function Boton({
  variante = "principal",
  cargando = false,
  textoCargando,
  anchoCompleto = false,
  type = "button",
  disabled,
  className = "",
  children,
  ...resto
}: PropiedadesBoton) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${clasesBoton(variante, anchoCompleto)} ${className}`}
      {...resto}
    >
      {cargando && textoCargando ? textoCargando : children}
    </button>
  );
}
