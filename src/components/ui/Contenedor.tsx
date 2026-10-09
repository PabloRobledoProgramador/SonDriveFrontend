import type { ReactNode } from "react";

interface PropiedadesContenedor {
  // Clases del bloque interno (el que tiene el ancho máximo), p. ej. el flex de la cabecera
  className?: string;
  children: ReactNode;
}

// Ancho y márgenes laterales comunes de la cabecera y de todas las páginas: relleno lateral
// fuera y ancho máximo dentro, para que el logo quede alineado con el contenido.
export default function Contenedor({ className = "", children }: PropiedadesContenedor) {
  return (
    <div className="px-4 md:px-6">
      <div className={`mx-auto max-w-6xl ${className}`}>{children}</div>
    </div>
  );
}
