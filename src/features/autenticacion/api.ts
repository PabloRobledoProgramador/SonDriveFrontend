import { solicitar } from "../../lib/clienteHttp";
import type {
  InicioSesionRespuesta,
  InicioSesionSolicitud,
  UsuarioCrearDto,
  Usuario,
} from "./tipos";

export function iniciarSesion(datos: InicioSesionSolicitud): Promise<InicioSesionRespuesta> {
  return solicitar<InicioSesionRespuesta>("/api/autenticacion/iniciar-sesion", {
    metodo: "POST",
    cuerpo: datos,
    esInicioSesion: true,
  });
}

export function registrarUsuario(datos: UsuarioCrearDto): Promise<Usuario> {
  return solicitar<Usuario>("/api/usuario/registro", {
    metodo: "POST",
    cuerpo: datos,
  });
}
