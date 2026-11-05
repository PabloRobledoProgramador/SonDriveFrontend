import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
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

// Sin idUsuario (todavía sin sesión) no se llama a la API
export function useMisViajes(idUsuario: number | undefined) {
  return useQuery<ViajeResumen[], ErrorApi>({
    queryKey: ["viajes", "usuario", idUsuario],
    queryFn: () => api.listarViajesDeUsuario(idUsuario as number),
    enabled: idUsuario !== undefined,
  });
}

export function useVehiculosDeUsuario(idUsuario: number | undefined) {
  return useQuery<VehiculoConductor[], ErrorApi>({
    queryKey: ["vehiculos", "usuario", idUsuario],
    queryFn: () => api.listarVehiculosDeUsuario(idUsuario as number),
    enabled: idUsuario !== undefined,
  });
}

// Al crear, se refrescan las listas de viajes (mis viajes y resultados de búsqueda)
export function useCrearViaje() {
  const clienteConsultas = useQueryClient();

  return useMutation<ViajeResumen, ErrorApi, NuevoViaje>({
    mutationFn: api.crearViaje,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: ["viajes"] }),
  });
}

export function useActualizarViaje() {
  const clienteConsultas = useQueryClient();

  return useMutation<
    ViajeResumen,
    ErrorApi,
    { id: number; datos: NuevoViaje }
  >({
    mutationFn: ({ id, datos }) => api.actualizarViaje(id, datos),
    onSuccess: (_viaje, { id }) => {
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "detalle", id],
      });
    },
  });
}

export function useEliminarViaje() {
  const clienteConsultas = useQueryClient();

  return useMutation<void, ErrorApi, number>({
    mutationFn: api.eliminarViaje,
    onSuccess: (_resultado, id) => {
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "detalle", id],
      });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "ocupaciones", id],
      });
    },
  });
}

export function useDetalleViaje(id: number) {
  return useQuery<ViajeDetalle, ErrorApi>({
    queryKey: ["viajes", "detalle", id],
    queryFn: () => api.obtenerViaje(id),
  });
}

export function useOcupacionesViaje(idViaje: number) {
  return useQuery<OcupacionViaje[], ErrorApi>({
    queryKey: ["viajes", "ocupaciones", idViaje],
    queryFn: () => api.listarOcupacionesViaje(idViaje),
  });
}

export function useOcuparPuesto(idViaje: number) {
  const clienteConsultas = useQueryClient();

  return useMutation<
    OcupacionViaje,
    ErrorApi,
    { idPuesto: number; datos: NuevaOcupacion }
  >({
    mutationFn: ({ idPuesto, datos }) =>
      api.ocuparPuesto(idViaje, idPuesto, datos),
    onSuccess: () => {
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "detalle", idViaje],
      });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "ocupaciones", idViaje],
      });
    },
  });
}

export function useLiberarPuesto(idViaje: number) {
  const clienteConsultas = useQueryClient();

  return useMutation<void, ErrorApi, number>({
    mutationFn: (idPuesto) => api.liberarPuesto(idViaje, idPuesto),
    onSuccess: () => {
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "detalle", idViaje],
      });
      void clienteConsultas.invalidateQueries({
        queryKey: ["viajes", "ocupaciones", idViaje],
      });
    },
  });
}
