// Rutas y avisos de la sesión, compartidos por el formulario, las guardas y NavegacionSesion

export const RUTA_INICIAR_SESION = "/iniciar-sesion";
export const AVISO_SESION_VENCIDA = "Tu sesión venció. Inicia sesión de nuevo.";
export const AVISO_INICIA_SESION = "Inicia sesión para continuar.";
export const AVISO_ACCESO_RESTRINGIDO = "Acceso restringido";

// Solo se vuelve a direcciones del propio sitio (FR-007)
export function destinoSeguro(volver: string | null): string {
  if (!volver || !volver.startsWith("/") || volver.startsWith("//") || volver.startsWith("/\\")) {
    return "/";
  }
  return volver;
}

export function rutaIniciarSesion(volver: string): string {
  return `${RUTA_INICIAR_SESION}?volver=${encodeURIComponent(volver)}`;
}
