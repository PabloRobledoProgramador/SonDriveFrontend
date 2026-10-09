// Lo que devuelve GET /api/ciudad (CiudadResponseDTO)
export interface Ciudad {
  id: number;
  nombre: string;
}

// Lo que devuelve GET /api/viaje (ViajeResumenDTO)
export interface ViajeResumen {
  id: number;
  fechaSalida: string;
  precio: number;
  ciudadOrigenId: number;
  ciudadOrigen: string;
  ciudadDestinoId: number;
  ciudadDestino: string;
  idVehiculo: number;
  conductor: string;
  fotoConductor: string | null;
  cuposLibres: number;
  cajuelasLibres: number;
}

// Filtro de la búsqueda; los ids viajan como texto porque vienen de los <select> y de la URL
export interface FiltroViaje {
  origenId: string;
  destinoId: string;
  fecha?: string; // "AAAA-MM-DD"
}
