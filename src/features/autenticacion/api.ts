import { solicitar } from "../../lib/clienteHttp";
import type { InicioSesionRespuesta, InicioSesionSolicitud } from "./tipos";

export function iniciarSesion(datos: InicioSesionSolicitud): Promise<InicioSesionRespuesta> {
  return solicitar<InicioSesionRespuesta>("/api/autenticacion/iniciar-sesion", {
    metodo: "POST",
    cuerpo: datos,
    esInicioSesion: true,
  });
}
