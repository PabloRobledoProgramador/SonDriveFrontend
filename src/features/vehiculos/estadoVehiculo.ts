import type { DocumentoVencimiento, VehiculoFlota } from "./tipos";

export type EstadoVehiculo = "critico" | "alerta" | "optimo";

export function estadoDocumento(
  documento: DocumentoVencimiento,
): EstadoVehiculo {
  if (documento.diasRestantes < 0) return "critico";
  if (documento.diasRestantes <= 30) return "alerta";
  return "optimo";
}

export function estadoVehiculo(vehiculo: VehiculoFlota): EstadoVehiculo {
  const documentos = [
    vehiculo.soat,
    vehiculo.tecnomecanica,
    vehiculo.licencia,
  ].map(estadoDocumento);

  if (vehiculo.estado === "Crítico" || documentos.includes("critico")) {
    return "critico";
  }
  if (
    vehiculo.estado === "Alerta" ||
    vehiculo.fallasPendientes > 0 ||
    documentos.includes("alerta")
  ) {
    return "alerta";
  }
  return "optimo";
}
