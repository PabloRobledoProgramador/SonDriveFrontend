import { useEffect, useRef } from "react";
import { useLocation, useMatches, useNavigate } from "react-router-dom";
import { AVISO_SESION_VENCIDA, rutaIniciarSesion } from "../navegacion";
import { useSesion } from "../useSesion";

// Ejecuta la navegación que corresponde a cada cierre de sesión (data-model.md, FR-011).
// Vive dentro del enrutador y consume ultimoCierre una sola vez.
export default function NavegacionSesion() {
  const { ultimoCierre, limpiarUltimoCierre } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const coincidencias = useMatches();
  // React Router aplica la navegación en una transición: ultimoCierre se limpia cuando la
  // ubicación ya cambió. Si se limpiara antes, RutaProtegida redirigiría por su cuenta desde la
  // ruta anterior con otro aviso (C5).
  // Guarda la key de la ubicación desde la que se navegó (null = sin navegación pendiente)
  const navegacionPendienteDesde = useRef<string | null>(null);

  const rutaActual = ubicacion.pathname + ubicacion.search;
  const esPrivada = coincidencias.some(
    (coincidencia) => (coincidencia.handle as { privada?: boolean } | undefined)?.privada === true,
  );

  // Declarado antes que el efecto de limpieza: en el render con la nueva ubicación se ejecuta
  // primero y no vuelve a navegar porque la navegación sigue marcada como pendiente.
  useEffect(() => {
    if (!ultimoCierre || navegacionPendienteDesde.current !== null) return;

    if (ultimoCierre === "externa") {
      limpiarUltimoCierre();
      return;
    }

    const conAviso = { replace: true, state: { aviso: AVISO_SESION_VENCIDA } };
    navegacionPendienteDesde.current = ubicacion.key;
    if (ultimoCierre === "manual") {
      navegar("/");
    } else if (ultimoCierre === "vencida") {
      // En una ruta pública la persona se queda; solo se muestra el aviso
      navegar(esPrivada ? rutaIniciarSesion(rutaActual) : rutaActual, conAviso);
    } else {
      // "rechazada" — principio IV: un 401 del servidor siempre lleva a iniciar sesión
      navegar(rutaIniciarSesion(rutaActual), conAviso);
    }
  }, [ultimoCierre, limpiarUltimoCierre, navegar, esPrivada, rutaActual, ubicacion.key]);

  useEffect(() => {
    // Solo cuando la ubicación ya cambió (también evita limpiar en el mismo commit del montaje)
    const desde = navegacionPendienteDesde.current;
    if (desde === null || desde === ubicacion.key) return;
    navegacionPendienteDesde.current = null;
    limpiarUltimoCierre();
  }, [ubicacion.key, limpiarUltimoCierre]);

  return null;
}
