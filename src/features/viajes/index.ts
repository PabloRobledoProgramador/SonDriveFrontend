// API pública de la funcionalidad de viajes para el resto del sitio (principio VIII)
export { default as FormularioBuscarViaje } from "./componentes/FormularioBuscarViaje";
export { default as ResultadosViajes } from "./componentes/ResultadosViajes";
export type { Ciudad, FiltroViaje, ViajeResumen } from "./tipos";

// Carga diferida de la página (el enrutador la carga con lazy)
export const cargarPaginaMisViajes = () => import("./paginas/PaginaMisViajes");
