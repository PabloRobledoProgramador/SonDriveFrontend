import { solicitar } from "../../lib/clienteHttp";
import type {
  Ciudad,
  FiltroViaje,
  NuevaOcupacion,
  NuevoViaje,
  OcupacionViaje,
  VehiculoConductor,
  ViajeDetalle,
  ViajeResumen,
} from "./tipos";

export function listarCiudades(): Promise<Ciudad[]> {
  return solicitar<Ciudad[]>("/api/ciudad");
}

// Los nombres coinciden con BuscarViajeDTO del backend
export function buscarViajes(filtro: FiltroViaje): Promise<ViajeResumen[]> {
  const consulta = new URLSearchParams({
    CiudadOrigenId: filtro.origenId,
    CiudadDestinoId: filtro.destinoId,
  });
  if (filtro.fecha) consulta.set("Fecha", filtro.fecha);
  return solicitar<ViajeResumen[]>(`/api/viaje?${consulta}`);
}

// Próximos viajes del conductor (el backend solo deja consultar los propios, o todos al administrador)
export function listarViajesDeUsuario(
  idUsuario: number,
): Promise<ViajeResumen[]> {
  return solicitar<ViajeResumen[]>(`/api/viaje/usuario/${idUsuario}`);
}

// Vehículos del conductor, para elegir con cuál sale el viaje
export function listarVehiculosDeUsuario(
  idUsuario: number,
): Promise<VehiculoConductor[]> {
  return solicitar<VehiculoConductor[]>(`/api/vehiculo/usuario/${idUsuario}`);
}

export function crearViaje(datos: NuevoViaje): Promise<ViajeResumen> {
  return solicitar<ViajeResumen>("/api/viaje", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarViaje(
  id: number,
  datos: NuevoViaje,
): Promise<ViajeResumen> {
  return solicitar<ViajeResumen>(`/api/viaje/${id}`, {
    metodo: "PUT",
    cuerpo: datos,
  });
}

export function eliminarViaje(id: number): Promise<void> {
  return solicitar<void>(`/api/viaje/${id}`, { metodo: "DELETE" });
}

export function obtenerViaje(id: number): Promise<ViajeDetalle> {
  return solicitar<ViajeDetalle>(`/api/viaje/${id}`);
}

export function listarOcupacionesViaje(
  idViaje: number,
): Promise<OcupacionViaje[]> {
  return solicitar<OcupacionViaje[]>(`/api/viaje/${idViaje}/ocupaciones`);
}

export function ocuparPuesto(
  idViaje: number,
  idPuesto: number,
  datos: NuevaOcupacion,
): Promise<OcupacionViaje> {
  return solicitar<OcupacionViaje>(
    `/api/viaje/${idViaje}/ocupaciones/puesto/${idPuesto}`,
    { metodo: "POST", cuerpo: datos },
  );
}

export function liberarPuesto(
  idViaje: number,
  idPuesto: number,
): Promise<void> {
  return solicitar<void>(
    `/api/viaje/${idViaje}/ocupaciones/puesto/${idPuesto}`,
    { metodo: "DELETE" },
  );
}
