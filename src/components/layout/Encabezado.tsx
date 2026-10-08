import { Link } from "react-router-dom";
import AccionSesion from "./AccionSesion";
import NavegacionPrincipal, { type Enlace } from "./NavegacionPrincipal";

// Cabecera fija de todas las secciones. En pantallas pequeñas los enlaces van en una fila
// deslizable debajo; desde md, centrados en la propia cabecera (FR-018, FR-019).
export default function Encabezado({ enlaces }: { enlaces: Enlace[] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-borde bg-fondo">
      {/* Relleno lateral fuera y ancho máximo dentro, igual que las páginas: el logo queda
          alineado con el contenido */}
      <div className="px-4 md:px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="flex min-h-11 shrink-0 items-center font-titulo text-lg font-semibold text-marca">
            SonDrive
          </Link>
          <NavegacionPrincipal enlaces={enlaces} variante="cabecera" />
          <AccionSesion />
        </div>
      </div>
      <NavegacionPrincipal enlaces={enlaces} variante="fila" />
    </header>
  );
}
