import { useQuery } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
import type { Ciudad, FiltroViaje, ViajeResumen } from "./tipos";

export function useCiudades() {
  return useQuery<Ciudad[], ErrorApi>({
    queryKey: ["ciudades"],
    queryFn: api.listarCiudades,
    staleTime: 10 * 60 * 1000, // las ciudades casi no cambian
  });
}

// filtro === null => todavía no se ha buscado nada: no se llama a la API
export function useBuscarViajes(filtro: FiltroViaje | null) {
  return useQuery<ViajeResumen[], ErrorApi>({
    queryKey: ["viajes", "buscar", filtro],
    queryFn: () => api.buscarViajes(filtro as FiltroViaje),
    enabled: filtro !== null,
  });
}
