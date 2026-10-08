// Traducción de las respuestas de error de la API (ProblemDetails) a un error tipado con mensajes
// en español listos para mostrar (principio III).

export type TipoErrorApi =
  | "conexion"
  | "validacion"
  | "credenciales"
  | "sesionVencida"
  | "prohibido"
  | "noEncontrado"
  | "reglaNegocio"
  | "servidor";

export const MENSAJE_CONEXION =
  "No pudimos conectar con SonDrive. Revisa tu conexión e inténtalo de nuevo.";
export const MENSAJE_GENERICO = "Ocurrió un error inesperado. Inténtalo de nuevo.";
export const MENSAJE_SESION_VENCIDA = "Tu sesión venció. Inicia sesión de nuevo.";
export const MENSAJE_PROHIBIDO = "No tienes permiso para realizar esta acción.";

export class ErrorApi extends Error {
  readonly tipo: TipoErrorApi;
  readonly estado: number | null;
  readonly mensaje: string;
  // Errores por campo, con las claves en camelCase como los nombres de los formularios
  readonly errores: Record<string, string[]>;

  constructor(
    tipo: TipoErrorApi,
    estado: number | null,
    mensaje: string,
    errores: Record<string, string[]> = {},
  ) {
    super(mensaje);
    this.name = "ErrorApi";
    this.tipo = tipo;
    this.estado = estado;
    this.mensaje = mensaje;
    this.errores = errores;
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface OpcionesError {
  // El 401 del inicio de sesión significa credenciales incorrectas, no sesión vencida
  esInicioSesion?: boolean;
}

export function crearErrorDeConexion(): ErrorApi {
  return new ErrorApi("conexion", null, MENSAJE_CONEXION);
}

export async function crearErrorDesdeRespuesta(
  respuesta: Response,
  opciones: OpcionesError = {},
): Promise<ErrorApi> {
  const problema = await leerProblema(respuesta);
  const estado = respuesta.status;
  const detalle = problema?.detail?.trim() || null;

  if (estado === 400) {
    const errores = normalizarErrores(problema?.errors);
    const primerError = Object.values(errores)[0]?.[0];
    return new ErrorApi("validacion", estado, detalle ?? primerError ?? MENSAJE_GENERICO, errores);
  }
  if (estado === 401) {
    return opciones.esInicioSesion
      ? new ErrorApi("credenciales", estado, detalle ?? MENSAJE_GENERICO)
      : new ErrorApi("sesionVencida", estado, MENSAJE_SESION_VENCIDA);
  }
  if (estado === 403) return new ErrorApi("prohibido", estado, MENSAJE_PROHIBIDO);
  if (estado === 404) return new ErrorApi("noEncontrado", estado, detalle ?? MENSAJE_GENERICO);
  if (estado === 409) return new ErrorApi("reglaNegocio", estado, detalle ?? MENSAJE_GENERICO);

  // 5xx u otros: el detalle del servidor no se muestra (puede ser técnico)
  return new ErrorApi("servidor", estado, MENSAJE_GENERICO);
}

async function leerProblema(respuesta: Response): Promise<ProblemDetails | null> {
  try {
    const texto = await respuesta.text();
    if (!texto) return null;
    const json: unknown = JSON.parse(texto);
    return typeof json === "object" && json !== null ? (json as ProblemDetails) : null;
  } catch {
    return null;
  }
}

// "Correo" -> "correo"; "Usuario.Correo" -> "usuario.correo"
function normalizarErrores(errores?: Record<string, string[]>): Record<string, string[]> {
  if (!errores) return {};
  return Object.fromEntries(
    Object.entries(errores).map(([clave, mensajes]) => [
      clave
        .split(".")
        .map((parte) => parte.charAt(0).toLowerCase() + parte.slice(1))
        .join("."),
      mensajes,
    ]),
  );
}
