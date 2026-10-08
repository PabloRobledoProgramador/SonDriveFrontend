import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AVISO_ACCESO_RESTRINGIDO, AVISO_INICIA_SESION, rutaIniciarSesion } from "../navegacion";
import type { Rol } from "../tipos";
import { useSesion } from "../useSesion";

// Guarda de las secciones privadas (FR-015, FR-016). Nunca renderiza el contenido antes de decidir.
export default function RutaProtegida({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { estaAutenticado, tieneRol, ultimoCierre } = useSesion();
  const ubicacion = useLocation();

  if (!estaAutenticado) {
    // La sesión acaba de vencer o ser rechazada: NavegacionSesion hace la única redirección,
    // con el aviso de sesión vencida (C5)
    if (ultimoCierre === "vencida" || ultimoCierre === "rechazada") return null;

    return (
      <Navigate
        to={rutaIniciarSesion(ubicacion.pathname + ubicacion.search)}
        replace
        state={{ aviso: AVISO_INICIA_SESION }}
      />
    );
  }

  if (!tieneRol(...roles)) {
    return <Navigate to="/" replace state={{ aviso: AVISO_ACCESO_RESTRINGIDO }} />;
  }

  return children;
}
