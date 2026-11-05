import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
import type {
  ConductorActualizarDto,
  Usuario,
  UsuarioCrearDto,
  VehiculoFlota,
} from "./tipos";

export const clavesConductores = {
  lista: ["conductores", "lista"] as const,
  vehiculos: ["conductores", "vehiculos"] as const,
  viajes: (id: number) => ["conductores", "viajes", id] as const,
};

export function useConductores() {
  return useQuery<Usuario[], ErrorApi>({
    queryKey: clavesConductores.lista,
    queryFn: api.listarConductores,
  });
}

export function useVehiculosConductores() {
  return useQuery<VehiculoFlota[], ErrorApi>({
    queryKey: clavesConductores.vehiculos,
    queryFn: api.listarVehiculos,
  });
}

export function useViajesConductor(id: number) {
  return useQuery({
    queryKey: clavesConductores.viajes(id),
    queryFn: () => api.listarViajes(id),
  });
}

export function useCrearConductor() {
  const clienteConsultas = useQueryClient();
  return useMutation<Usuario, ErrorApi, UsuarioCrearDto>({
    mutationFn: api.crearConductor,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: clavesConductores.lista,
      }),
  });
}

export function useActualizarConductor() {
  const clienteConsultas = useQueryClient();
  return useMutation<
    Usuario,
    ErrorApi,
    { id: number; datos: ConductorActualizarDto }
  >({
    mutationFn: ({ id, datos }) => api.actualizarConductor(id, datos),
    onSuccess: () => {
      void clienteConsultas.invalidateQueries({
        queryKey: clavesConductores.lista,
      });
      // El nombre y el celular del conductor también se muestran en la flota y en los viajes
      void clienteConsultas.invalidateQueries({ queryKey: ["vehiculos"] });
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
    },
    onError: (error) => {
      // El conductor ya no existe: el listado quedó desactualizado
      if (error.tipo === "noEncontrado") {
        void clienteConsultas.invalidateQueries({
          queryKey: clavesConductores.lista,
        });
      }
    },
  });
}

export function useCambiarEstadoConductor() {
  const clienteConsultas = useQueryClient();
  return useMutation<void, ErrorApi, { id: number; estado: boolean }>({
    mutationFn: ({ id, estado }) => api.cambiarEstadoConductor(id, estado),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({
        queryKey: clavesConductores.lista,
      }),
  });
}
