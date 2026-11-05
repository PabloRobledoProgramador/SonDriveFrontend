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
import type { ViajeResumen } from "../viajes";

export const clavesVehiculos = {
  flota: ["vehiculos", "flota"] as const,
  conductores: ["vehiculos", "conductores"] as const,
  fallas: (idVehiculo: number) => ["vehiculos", "fallas", idVehiculo] as const,
  viajes: (idUsuario: number) => ["vehiculos", "viajes", idUsuario] as const,
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

export function useViajesProximosDeConductor(idUsuario: number) {
  return useQuery<ViajeResumen[], ErrorApi>({
    queryKey: clavesVehiculos.viajes(idUsuario),
    queryFn: () => api.listarViajesDeConductor(idUsuario),
  });
}

export function useActualizarVehiculo() {
  const clienteConsultas = useQueryClient();
  return useMutation<
    VehiculoFlota,
    ErrorApi,
    { id: number; datos: DatosVehiculo }
  >({
    mutationFn: ({ id, datos }) => api.actualizarVehiculo(id, datos),
    onSuccess: () => {
      // El conductor y los datos del vehículo también se muestran en conductores y en viajes
      void clienteConsultas.invalidateQueries({ queryKey: ["conductores"] });
      void clienteConsultas.invalidateQueries({ queryKey: ["viajes"] });
      // Se espera la flota para que el detalle ya esté al día cuando se cierre el formulario
      return clienteConsultas.invalidateQueries({ queryKey: ["vehiculos"] });
    },
    onError: (error) => {
      // El vehículo ya no existe: la lista que se muestra quedó vieja
      if (error.tipo === "noEncontrado") {
        void clienteConsultas.invalidateQueries({ queryKey: ["vehiculos"] });
        void clienteConsultas.invalidateQueries({ queryKey: ["conductores"] });
      }
    },
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
