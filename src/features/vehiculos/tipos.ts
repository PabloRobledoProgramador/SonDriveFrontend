export interface DocumentoVencimiento {
  vencimiento: string;
  diasRestantes: number;
}

export interface VehiculoFlota {
  id: number;
  nombreVehiculo: string;
  placa: string;
  modelo: string;
  annoModelo: string;
  tipo: string;
  idUsuario: number;
  conductor: string;
  fotoConductor: string | null;
  kilometraje: number;
  fechaUltimoServicio: string | null;
  estado: string;
  fallasPendientes: number;
  soat: DocumentoVencimiento;
  tecnomecanica: DocumentoVencimiento;
  licencia: DocumentoVencimiento;
}

export interface DatosVehiculo {
  idUsuario: number;
  placa: string;
  modelo: string;
  annoModelo: string;
  tipo: string;
  kilometraje: number;
  fechaUltimoServicio: string | null;
  vencimientoSoat: string;
  vencimientoTecnomecanica: string;
  vencimientoLicencia: string;
}

export type SeveridadFalla = "Informativo" | "Alerta" | "Crítico";

export interface FallaVehiculo {
  id: number;
  vehiculoId: number;
  descripcion: string;
  severidad: SeveridadFalla;
  fecha: string;
  estaResuelta: boolean;
}

export interface NuevaFalla {
  vehiculoId: number;
  descripcion: string;
  severidad: SeveridadFalla;
  fecha: string;
}
