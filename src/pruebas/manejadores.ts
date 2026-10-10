import { http, HttpResponse, type RequestHandler } from "msw";
import type {
  InicioSesionRespuesta,
  InicioSesionSolicitud,
} from "../features/autenticacion";

// Manejadores MSW por defecto para todas las pruebas. Cada prueba puede agregar o
// reemplazar manejadores con servidor.use(...).
export const URL_API_PRUEBA = "http://api.prueba";

export const CORREO_ADMIN = "admin@sondrive.com";
export const CLAVE_ADMIN = "Admin12345*";
export const CORREO_INACTIVO = "inactivo@sondrive.com";

function respuestaAdministrador(): InicioSesionRespuesta {
  return {
    token: "token-administrador",
    expiracion: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    usuario: {
      id: 1,
      nombre: "Administrador",
      apellido: "SonDrive",
      correo: CORREO_ADMIN,
      celular: "3000000000",
      estado: true,
      rol: "Administrador",
      foto: null,
    },
  };
}

const problema = (detalle: string) =>
  HttpResponse.json(
    { title: "No autorizado", status: 401, detail: detalle },
    { status: 401 },
  );

export const manejadores: RequestHandler[] = [
  // Ciudades del buscador de viajes de la página de inicio
  http.get(`${URL_API_PRUEBA}/api/ciudad`, () => HttpResponse.json([])),
  http.post(
    `${URL_API_PRUEBA}/api/autenticacion/iniciar-sesion`,
    async ({ request }) => {
      const datos = (await request.json()) as InicioSesionSolicitud;
      if (datos.correo === CORREO_INACTIVO) {
        return problema(
          "El usuario está desactivado. Contacta al administrador.",
        );
      }
      if (datos.correo === CORREO_ADMIN && datos.clave === CLAVE_ADMIN) {
        return HttpResponse.json(respuestaAdministrador());
      }
      return problema("Correo o clave incorrectos.");
    },
  ),
];
