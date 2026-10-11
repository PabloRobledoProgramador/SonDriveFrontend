export type { Usuario, UsuarioCrearDto } from "../autenticacion";
export type { ViajeResumen } from "../viajes";
export type { VehiculoFlota } from "../vehiculos";

// Lo que recibe PUT /api/usuario/{id}/conductor (ConductorActualizarDto del backend)
export interface ConductorActualizarDto {
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  foto: string | null;
}
