import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useIniciarSesion } from "../consultas";
import { esquemaInicioSesion, type DatosInicioSesion } from "../esquemas";
import { destinoSeguro } from "../navegacion";

export default function FormularioInicioSesion() {
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const inicioSesion = useIniciarSesion();
  const enviando = useRef(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { correo: parametros.get("correo") ?? "", clave: "" },
  });

  const enviar = async (datos: DatosInicioSesion) => {
    // Evita envíos repetidos (doble clic) mientras hay una solicitud en curso (FR-005)
    if (enviando.current) return;
    enviando.current = true;
    setMensajeError(null);

    try {
      await inicioSesion.mutateAsync({ correo: datos.correo.trim(), clave: datos.clave });
      navegar(destinoSeguro(parametros.get("volver")), { replace: true });
    } catch (error) {
      if (error instanceof ErrorApi && error.tipo === "validacion" && Object.keys(error.errores).length > 0) {
        for (const [campo, mensajes] of Object.entries(error.errores)) {
          if (campo === "correo" || campo === "clave") {
            setError(campo, { type: "servidor", message: mensajes[0] });
          }
        }
      } else {
        setMensajeError(error instanceof ErrorApi ? error.mensaje : MENSAJE_GENERICO);
        resetField("clave");
      }
    } finally {
      enviando.current = false;
    }
  };

  // handleSubmit se invoca en el evento, no durante el render (la referencia solo se lee al enviar)
  const alEnviar = (evento: FormEvent<HTMLFormElement>) => handleSubmit(enviar)(evento);

  return (
    <form onSubmit={alEnviar} noValidate className="flex flex-col gap-4">
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}

      <CampoFormulario
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
        error={errors.correo?.message}
        {...register("correo")}
      />
      <CampoFormulario
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.clave?.message}
        {...register("clave")}
      />

      <Boton type="submit" anchoCompleto cargando={inicioSesion.isPending} textoCargando="Entrando…">
        Entrar
      </Boton>
    </form>
  );
}
