import { solicitar } from "../../lib/clienteHttp";
import type { Usuario, UsuarioCrearDto } from "./tipos";
import type { ViajeResumen } from "../viajes/tipos";
import type { VehiculoFlota } from "../vehiculos/tipos";

export async function listarConductores(): Promise<Usuario[]> {
  const usuarios = await solicitar<Usuario[]>("/api/usuario");
  return usuarios.filter((usuario) => usuario.rol === "Conductor");
}

export function listarVehiculos(): Promise<VehiculoFlota[]> {
  return solicitar<VehiculoFlota[]>("/api/vehiculo");
}

export function listarViajes(idUsuario: number): Promise<ViajeResumen[]> {
  return solicitar<ViajeResumen[]>(`/api/viaje/usuario/${idUsuario}`);
}

export function crearConductor(datos: UsuarioCrearDto): Promise<Usuario> {
  return solicitar<Usuario>("/api/usuario", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function cambiarEstadoConductor(
  id: number,
  estado: boolean,
): Promise<void> {
  const consulta = new URLSearchParams({ estado: String(estado) });
  return solicitar<void>(`/api/usuario/${id}/estado?${consulta}`, {
    metodo: "PATCH",
  });
}
