// Entrada pública y carga diferida del módulo de flota.
export type { VehiculoFlota } from "./tipos";

export const cargarPaginaVehiculos = () => import("./paginas/PaginaVehiculos");
