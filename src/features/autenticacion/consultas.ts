import { useMutation } from "@tanstack/react-query";
import type { ErrorApi } from "../../lib/errores";
import * as api from "./api";
import type { InicioSesionRespuesta, InicioSesionSolicitud } from "./tipos";
import { useSesion } from "./useSesion";

export function useIniciarSesion() {
  const { iniciarSesion } = useSesion();

  return useMutation<InicioSesionRespuesta, ErrorApi, InicioSesionSolicitud>({
    mutationFn: api.iniciarSesion,
    onSuccess: (respuesta) => iniciarSesion(respuesta),
  });
}
