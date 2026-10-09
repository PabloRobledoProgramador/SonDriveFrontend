import { solicitar } from "../../lib/clienteHttp";
import type { Ciudad, FiltroViaje, ViajeResumen } from "./tipos";

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
