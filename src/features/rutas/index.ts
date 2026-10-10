// API pública de la funcionalidad de rutas (principio VIII)
export type { Ruta } from "./tipos";

// Carga diferida de la página (el enrutador la carga con lazy)
export const cargarPaginaRutas = () => import("./paginas/PaginaRutas");
