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

// Lo que devuelve GET /api/vehiculo/usuario/{id} (solo lo que usa el formulario de crear viaje)
export interface VehiculoConductor {
  id: number;
  nombreVehiculo: string;
  placa: string;
}

// Lo que recibe POST /api/viaje (CrearViajeDTO); "hora" viaja como "HH:mm:ss"
export interface NuevoViaje {
  ciudadOrigenId: number;
  ciudadDestinoId: number;
  idVehiculo: number;
  fecha: string; // "AAAA-MM-DD"
  hora: string;
  precio: number;
}

// Puesto de un viaje dentro del detalle (PuestoViajeDTO)
export interface PuestoViaje {
  idPuesto: number;
  codigo: string;
  tipo: string;
  esConductor: boolean;
  ocupado: boolean;
}

// Lo que devuelve GET /api/viaje/{id} (ViajeResponseDTO)
export interface ViajeDetalle extends ViajeResumen {
  nombreVehiculo: string;
  placa: string;
  telefonoConductor: string;
  puestos: PuestoViaje[];
}

// Lo que devuelve GET /api/viaje/{id}/ocupaciones (OcupacionResponseDTO)
export interface OcupacionViaje {
  id: number;
  idViaje: number;
  idPuesto: number;
  codigo: string;
  tipo: string;
  pasajero: {
    nombreCompleto: string;
    celular: string;
    direccion: string | null;
  };
}

// Lo que recibe POST /api/viaje/{idViaje}/ocupaciones/puesto/{idPuesto}
export interface NuevaOcupacion {
  nombreCompleto: string;
  celular: string;
  direccion: string;
}
