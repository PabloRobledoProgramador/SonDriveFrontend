// API pública de la funcionalidad de autenticación para el resto del sitio (principio VIII)
export { default as ProveedorSesion } from "./ProveedorSesion";
export { useSesion } from "./useSesion";
export type { MotivoCierre, ValorSesion } from "./contextoSesion";
export type { InicioSesionRespuesta, InicioSesionSolicitud, Rol, Sesion, Usuario } from "./tipos";

// Carga diferida de la página (principio VIII: el enrutador la carga con lazy)
export const cargarPaginaIniciarSesion = () => import("./paginas/PaginaIniciarSesion");

export { default as NavegacionSesion } from "./componentes/NavegacionSesion";
export { default as RutaSoloVisitantes } from "./componentes/RutaSoloVisitantes";
export { default as RutaProtegida } from "./componentes/RutaProtegida";
export { default as MostrarSiRol } from "./componentes/MostrarSiRol";
export { RUTA_INICIAR_SESION, rutaIniciarSesion } from "./navegacion";
