import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Encabezado from "../components/layout/Encabezado";
import type { Enlace } from "../components/layout/NavegacionPrincipal";
import Aviso from "../components/ui/Aviso";
import Contenedor from "../components/ui/Contenedor";
import EstadoCargando from "../components/ui/EstadoCargando";
import { NavegacionSesion, useSesion } from "../features/autenticacion";
import type { Seccion } from "./secciones";

interface EstadoNavegacion {
  aviso?: string;
}

function leerAviso(estado: unknown): string | null {
  const aviso = (estado as EstadoNavegacion | null)?.aviso;
  return typeof aviso === "string" ? aviso : null;
}

export default function DisenoPrincipal({ secciones }: { secciones: Seccion[] }) {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const { tieneRol } = useSesion();

  // El aviso llega en el state de la navegación. Se copia a un estado local (ajustado durante el
  // render) y se borra del historial para que no reaparezca al recargar o volver atrás (F4).
  // Desaparece al cambiar de página o con su botón "Cerrar" (C4).
  const avisoNavegacion = leerAviso(ubicacion.state);
  const [aviso, setAviso] = useState<string | null>(avisoNavegacion);
  const [ubicacionAnterior, setUbicacionAnterior] = useState({
    clave: ubicacion.key,
    ruta: ubicacion.pathname,
  });
  if (ubicacion.key !== ubicacionAnterior.clave) {
    setUbicacionAnterior({ clave: ubicacion.key, ruta: ubicacion.pathname });
    if (avisoNavegacion) setAviso(avisoNavegacion);
    else if (ubicacion.pathname !== ubicacionAnterior.ruta) setAviso(null);
  }

  useEffect(() => {
    if (avisoNavegacion) {
      navegar(ubicacion.pathname + ubicacion.search, { replace: true, state: null });
    }
  }, [avisoNavegacion, navegar, ubicacion.pathname, ubicacion.search]);

  const enlaces: Enlace[] = secciones
    .filter((seccion) => seccion.enNavegacion)
    .filter((seccion) => !Array.isArray(seccion.acceso) || tieneRol(...seccion.acceso))
    .filter((seccion) => seccion.acceso !== "soloVisitantes")
    .map(({ ruta, nombre }) => ({ ruta, nombre }));

  return (
    <>
      <NavegacionSesion />
      <Encabezado enlaces={enlaces} />
      <div className="pt-28 md:pt-16">
        {aviso && (
          <Contenedor className="pt-4">
            <Aviso tipo="info" alCerrar={() => setAviso(null)}>
              {aviso}
            </Aviso>
          </Contenedor>
        )}
        <Suspense fallback={<EstadoCargando />}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
}
