import { NavLink } from "react-router-dom";

export interface Enlace {
  ruta: string;
  nombre: string;
}

interface PropiedadesNavegacion {
  enlaces: Enlace[];
  // cabecera: dentro de la barra superior (≥ md) · fila: barra deslizable bajo la cabecera (< md)
  variante: "cabecera" | "fila";
}

export default function NavegacionPrincipal({ enlaces, variante }: PropiedadesNavegacion) {
  if (enlaces.length === 0) return null;

  const contenedor =
    variante === "cabecera"
      ? "hidden items-center gap-1 md:flex"
      : "sin-barra flex gap-1 overflow-x-auto whitespace-nowrap border-t border-borde px-4 py-1 md:hidden";

  return (
    <nav aria-label="Navegación principal" className={contenedor}>
      {enlaces.map((enlace) => (
        <NavLink
          key={enlace.ruta}
          to={enlace.ruta}
          end={enlace.ruta === "/"}
          className={({ isActive }) =>
            `inline-flex min-h-11 shrink-0 items-center rounded-lg px-4 text-sm font-medium transition-colors ${
              isActive ? "bg-divisor text-marca" : "text-texto-suave hover:bg-divisor hover:text-marca"
            }`
          }
        >
          {enlace.nombre}
        </NavLink>
      ))}
    </nav>
  );
}
