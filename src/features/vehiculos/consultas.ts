import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
import type {
  DatosVehiculo,
  FallaVehiculo,
  NuevaFalla,
  VehiculoFlota,
} from "./tipos";
import type { Usuario } from "../autenticacion";

export const clavesVehiculos = {
  flota: ["vehiculos", "flota"] as const,
  conductores: ["vehiculos", "conductores"] as const,
  fallas: (idVehiculo: number) => ["vehiculos", "fallas", idVehiculo] as const,
};

export function useFlota() {
  return useQuery<VehiculoFlota[], ErrorApi>({
    queryKey: clavesVehiculos.flota,
    queryFn: api.listarVehiculos,
  });
}

export function useFallasVehiculo(idVehiculo: number | undefined) {
  return useQuery<FallaVehiculo[], ErrorApi>({
    queryKey:
      idVehiculo === undefined
        ? ["vehiculos", "fallas", null]
        : clavesVehiculos.fallas(idVehiculo),
    queryFn: () => {
      if (idVehiculo === undefined) {
        throw new Error("useFallasVehiculo requiere un vehículo seleccionado.");
      }
      return api.listarFallas(idVehiculo);
    },
    enabled: idVehiculo !== undefined,
  });
}

export function useConductores(habilitado: boolean) {
  return useQuery<Usuario[], ErrorApi>({
    queryKey: clavesVehiculos.conductores,
    queryFn: api.listarConductores,
    enabled: habilitado,
  });
}

export function useCrearVehiculo() {
  const clienteConsultas = useQueryClient();
  return useMutation<VehiculoFlota, ErrorApi, DatosVehiculo>({
    mutationFn: api.crearVehiculo,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: clavesVehiculos.flota }),
  });
}

export function useReportarFalla() {
  const clienteConsultas = useQueryClient();
  return useMutation<FallaVehiculo, ErrorApi, NuevaFalla>({
    mutationFn: api.reportarFalla,
    onSuccess: (_falla, datos) => {
      void clienteConsultas.invalidateQueries({
        queryKey: clavesVehiculos.flota,
      });
      void clienteConsultas.invalidateQueries({
        queryKey: clavesVehiculos.fallas(datos.vehiculoId),
      });
    },
  });
}

export function useCambiarFallaResuelta(idVehiculo: number) {
  const clienteConsultas = useQueryClient();
  return useMutation<
    FallaVehiculo,
    ErrorApi,
    { id: number; resuelta: boolean }
  >({
    mutationFn: ({ id, resuelta }) =>
      api.cambiarFallaResuelta(id, resuelta),
    onSuccess: () => {
      void clienteConsultas.invalidateQueries({
        queryKey: clavesVehiculos.flota,
      });
      void clienteConsultas.invalidateQueries({
        queryKey: clavesVehiculos.fallas(idVehiculo),
      });
    },
  });
}
