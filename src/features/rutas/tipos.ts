// Lo que devuelve GET /api/ruta (RutaResponseDTO)
export interface Ruta {
  id: number;
  ciudadOrigenId: number;
  ciudadOrigen: string;
  ciudadDestinoId: number;
  ciudadDestino: string;
  precioBase: number;
  distanciaKm: number;
  tiempoEstimado: string;
}
