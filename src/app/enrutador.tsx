import { createBrowserRouter, type RouteObject } from "react-router-dom";
import type { ReactNode } from "react";
import { RutaProtegida, RutaSoloVisitantes } from "../features/autenticacion";
import DisenoPrincipal from "./DisenoPrincipal";
import { secciones as seccionesDelSitio, type Seccion } from "./secciones";

// Una ruta por sección dentro del diseño principal. Las secciones con roles se marcan como
// privadas (handle.privada) para que la sesión sepa si debe redirigir al vencer (FR-011).
export function crearRutas(secciones: Seccion[]): RouteObject[] {
  return [
    {
      element: <DisenoPrincipal secciones={secciones} />,
      children: secciones.map((seccion) => {
        const Pagina = seccion.pagina;
        return {
          path: seccion.ruta,
          handle: { privada: Array.isArray(seccion.acceso) },
          element: protegerSegunAcceso(seccion, <Pagina />),
        };
      }),
    },
  ];
}

// Aplica la guarda que corresponde al acceso de la sección (FR-012, FR-015, FR-016)
function protegerSegunAcceso(seccion: Seccion, pagina: ReactNode): ReactNode {
  if (seccion.acceso === "soloVisitantes") return <RutaSoloVisitantes>{pagina}</RutaSoloVisitantes>;
  if (Array.isArray(seccion.acceso)) return <RutaProtegida roles={seccion.acceso}>{pagina}</RutaProtegida>;
  return pagina;
}

export const enrutador = createBrowserRouter(crearRutas(seccionesDelSitio));
