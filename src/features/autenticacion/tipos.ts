// Tipos que reflejan los DTO de autenticación del backend (principio VI)

export type Rol = "Administrador" | "Conductor";

// UsuarioDto
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  estado: boolean;
  rol: Rol;
  foto: string | null;
}

// InicioSesionDTO
export interface InicioSesionSolicitud {
  correo: string;
  clave: string;
}

// Campos del UsuarioCrearDto del backend utilizados por el registro público.
export interface UsuarioCrearDto {
  nombre: string;
  apellido: string;
  correo: string;
  clave: string;
  celular: string;
  estado?: boolean;
  rol?: Rol;
  foto?: string | null;
}

// InicioSesionRespuestaDTO
export interface InicioSesionRespuesta {
  token: string;
  // Fecha y hora UTC en formato ISO 8601
  expiracion: string;
  usuario: Usuario;
}

// Sesión guardada en el navegador
export type Sesion = InicioSesionRespuesta;
