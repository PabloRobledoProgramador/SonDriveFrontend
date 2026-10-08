// Único punto de comunicación con la API: agrega la URL base y el token, y convierte toda
// respuesta de error en un ErrorApi (principio VIII). lib/ no importa de features/: la sesión se
// conecta registrando un proveedor de token y un manejador de sesión vencida.
import { obtenerUrlApi } from "./configuracion";
import { crearErrorDeConexion, crearErrorDesdeRespuesta } from "./errores";

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface OpcionesSolicitud {
  metodo?: Metodo;
  cuerpo?: unknown;
  // El 401 de iniciar sesión es "credenciales incorrectas", no "sesión vencida"
  esInicioSesion?: boolean;
}

let proveedorToken: () => string | null = () => null;
let manejadorSesionVencida: () => void = () => {};

export function registrarProveedorToken(fn: () => string | null): void {
  proveedorToken = fn;
}

export function registrarManejadorSesionVencida(fn: () => void): void {
  manejadorSesionVencida = fn;
}

export async function solicitar<T>(ruta: string, opciones: OpcionesSolicitud = {}): Promise<T> {
  const { metodo = "GET", cuerpo, esInicioSesion = false } = opciones;

  const cabeceras: Record<string, string> = { Accept: "application/json" };
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  const token = proveedorToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${obtenerUrlApi()}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw crearErrorDeConexion();
  }

  if (!respuesta.ok) {
    const error = await crearErrorDesdeRespuesta(respuesta, { esInicioSesion });
    if (error.tipo === "sesionVencida") manejadorSesionVencida();
    throw error;
  }

  if (respuesta.status === 204) return undefined as T;
  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}
