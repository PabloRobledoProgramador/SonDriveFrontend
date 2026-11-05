import { solicitar } from "../../lib/clienteHttp";
import type { Usuario } from "../autenticacion";
import type { ViajeResumen } from "../viajes";
import type {
  DatosVehiculo,
  FallaVehiculo,
  NuevaFalla,
  VehiculoFlota,
} from "./tipos";

export function listarVehiculos(): Promise<VehiculoFlota[]> {
  return solicitar<VehiculoFlota[]>("/api/vehiculo");
}

export async function listarConductores(): Promise<Usuario[]> {
  const usuarios = await solicitar<Usuario[]>("/api/usuario");
  return usuarios.filter(
    (usuario) => usuario.rol === "Conductor" && usuario.estado,
  );
}

export function crearVehiculo(datos: DatosVehiculo): Promise<VehiculoFlota> {
  return solicitar<VehiculoFlota>("/api/vehiculo", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarVehiculo(
  id: number,
  datos: DatosVehiculo,
): Promise<VehiculoFlota> {
  return solicitar<VehiculoFlota>(`/api/vehiculo/${id}`, {
    metodo: "PUT",
    cuerpo: datos,
  });
}

// Viajes próximos de un conductor, para avisar cuáles pasarán a otro al reasignar un vehículo
export function listarViajesDeConductor(
  idUsuario: number,
): Promise<ViajeResumen[]> {
  return solicitar<ViajeResumen[]>(`/api/viaje/usuario/${idUsuario}`);
}

export function listarFallas(idVehiculo: number): Promise<FallaVehiculo[]> {
  return solicitar<FallaVehiculo[]>(`/api/falla/vehiculo/${idVehiculo}`);
}

export function reportarFalla(datos: NuevaFalla): Promise<FallaVehiculo> {
  return solicitar<FallaVehiculo>("/api/falla", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function cambiarFallaResuelta(
  id: number,
  resuelta: boolean,
): Promise<FallaVehiculo> {
  const consulta = new URLSearchParams({ resuelta: String(resuelta) });
  return solicitar<FallaVehiculo>(`/api/falla/${id}/resuelta?${consulta}`, {
    metodo: "PATCH",
  });
}
