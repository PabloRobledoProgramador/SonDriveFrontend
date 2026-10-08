import { createContext } from "react";
import type { InicioSesionRespuesta, Rol, Sesion, Usuario } from "./tipos";

// manual: la persona cerró sesión · vencida: pasó la hora de expiración · rechazada: el servidor
// respondió 401 · externa: se cerró en otra pestaña
export type MotivoCierre = "manual" | "vencida" | "rechazada" | "externa";

export interface ValorSesion {
  sesion: Sesion | null;
  usuario: Usuario | null;
  rol: Rol | null;
  estaAutenticado: boolean;
  tieneRol: (...roles: Rol[]) => boolean;
  iniciarSesion: (respuesta: InicioSesionRespuesta) => void;
  cerrarSesion: (motivo: MotivoCierre) => void;
  // Último cierre pendiente de atender por NavegacionSesion; se consume una sola vez
  ultimoCierre: MotivoCierre | null;
  limpiarUltimoCierre: () => void;
}

export const ContextoSesion = createContext<ValorSesion | null>(null);
