import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { registrarManejadorSesionVencida, registrarProveedorToken } from "../../lib/clienteHttp";
import { ContextoSesion, type MotivoCierre, type ValorSesion } from "./contextoSesion";
import { borrarSesion, CLAVE_SESION, guardarSesion, leerSesion, obtenerTokenVigente } from "./sesion";
import type { InicioSesionRespuesta, Rol, Sesion } from "./tipos";

// Se registra al cargar el módulo: las consultas que las páginas disparan al montarse (antes que
// los efectos de este proveedor) ya llevan el token.
registrarProveedorToken(() => obtenerTokenVigente());

interface EstadoSesion {
  sesion: Sesion | null;
  ultimoCierre: MotivoCierre | null;
}

function estadoInicial(): EstadoSesion {
  const { sesion, descartadaPorVencimiento } = leerSesion();
  return { sesion, ultimoCierre: descartadaPorVencimiento ? "vencida" : null };
}

export default function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>(estadoInicial);

  const iniciarSesion = useCallback((respuesta: InicioSesionRespuesta) => {
    guardarSesion(respuesta);
    setEstado({ sesion: respuesta, ultimoCierre: null });
  }, []);

  const cerrarSesion = useCallback((motivo: MotivoCierre) => {
    borrarSesion();
    setEstado({ sesion: null, ultimoCierre: motivo });
  }, []);

  const limpiarUltimoCierre = useCallback(() => {
    setEstado((anterior) => (anterior.ultimoCierre ? { ...anterior, ultimoCierre: null } : anterior));
  }, []);

  // Cierra la sesión al llegar su hora de vencimiento (FR-011)
  const expiracion = estado.sesion?.expiracion;
  useEffect(() => {
    if (!expiracion) return;
    // setTimeout admite como máximo ~24,8 días; la sesión del servidor dura 8 horas
    const restante = Math.min(Date.parse(expiracion) - Date.now(), 2_147_483_647);
    const temporizador = setTimeout(() => cerrarSesion("vencida"), Math.max(restante, 0));
    return () => clearTimeout(temporizador);
  }, [expiracion, cerrarSesion]);

  // Si otra pestaña cierra la sesión, esta también la cierra
  const autenticado = estado.sesion !== null;
  useEffect(() => {
    if (!autenticado) return;
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      if ((evento.key === CLAVE_SESION || evento.key === null) && evento.newValue === null) {
        cerrarSesion("externa");
      }
    };
    window.addEventListener("storage", alCambiarAlmacenamiento);
    return () => window.removeEventListener("storage", alCambiarAlmacenamiento);
  }, [autenticado, cerrarSesion]);

  // Un 401 del servidor fuera del inicio de sesión cierra la sesión y siempre redirige (principio IV)
  useEffect(() => {
    registrarManejadorSesionVencida(() => cerrarSesion("rechazada"));
    return () => registrarManejadorSesionVencida(() => {});
  }, [cerrarSesion]);

  const valor = useMemo<ValorSesion>(() => {
    const rol = estado.sesion?.usuario.rol ?? null;
    return {
      sesion: estado.sesion,
      usuario: estado.sesion?.usuario ?? null,
      rol,
      estaAutenticado: estado.sesion !== null,
      tieneRol: (...roles: Rol[]) => rol !== null && roles.includes(rol),
      iniciarSesion,
      cerrarSesion,
      ultimoCierre: estado.ultimoCierre,
      limpiarUltimoCierre,
    };
  }, [estado, iniciarSesion, cerrarSesion, limpiarUltimoCierre]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
