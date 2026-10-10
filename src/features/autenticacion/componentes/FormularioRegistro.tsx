import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useRegistrarUsuario } from "../consultas";
import { esquemaRegistro, type DatosRegistro } from "../esquemas";

const CAMPOS_SERVIDOR: Record<string, keyof DatosRegistro> = {
  nombre: "nombre",
  apellido: "apellido",
  correo: "correo",
  clave: "clave",
  celular: "celular",
};

export default function FormularioRegistro() {
  const navegar = useNavigate();
  const registrar = useRegistrarUsuario();
  const enviando = useRef(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      nombre: "",
      apellido: "",
      correo: "",
      celular: "",
      clave: "",
      confirmarClave: "",
    },
  });

  const enviar = async (datos: DatosRegistro) => {
    if (enviando.current) return;
    enviando.current = true;
    setMensajeError(null);

    try {
      await registrar.mutateAsync({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        correo: datos.correo.trim(),
        celular: datos.celular.trim(),
        clave: datos.clave,
        estado: true,
        rol: "Conductor",
        foto: null,
      });
      navegar(
        `/iniciar-sesion?correo=${encodeURIComponent(datos.correo.trim())}`,
        {
          replace: true,
          state: {
            aviso: "Tu cuenta fue creada. Inicia sesión con tus datos.",
          },
        },
      );
    } catch (error) {
      if (
        error instanceof ErrorApi &&
        error.tipo === "validacion" &&
        Object.keys(error.errores).length > 0
      ) {
        let hayErrorDeCampo = false;
        for (const [campo, mensajes] of Object.entries(error.errores)) {
          const destino = CAMPOS_SERVIDOR[campo];
          if (destino) {
            setError(destino, { type: "servidor", message: mensajes[0] });
            hayErrorDeCampo = true;
          }
        }
        if (!hayErrorDeCampo) setMensajeError(error.mensaje);
      } else {
        setMensajeError(
          error instanceof ErrorApi ? error.mensaje : MENSAJE_GENERICO,
        );
        resetField("clave");
        resetField("confirmarClave");
      }
    } finally {
      enviando.current = false;
    }
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    void handleSubmit(enviar)(evento);
  };

  return (
    <form
      aria-label="Crear cuenta"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={alEnviar}
    >
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoFormulario
          etiqueta="Nombre"
          autoComplete="given-name"
          maxLength={100}
          error={errors.nombre?.message}
          {...register("nombre")}
        />
        <CampoFormulario
          etiqueta="Apellido"
          autoComplete="family-name"
          maxLength={100}
          error={errors.apellido?.message}
          {...register("apellido")}
        />
      </div>
      <CampoFormulario
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        maxLength={150}
        error={errors.correo?.message}
        {...register("correo")}
      />
      <CampoFormulario
        etiqueta="Celular"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        placeholder="3001234567"
        maxLength={10}
        error={errors.celular?.message}
        {...register("celular")}
      />
      <CampoFormulario
        etiqueta="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.clave?.message}
        {...register("clave")}
      />
      <CampoFormulario
        etiqueta="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.confirmarClave?.message}
        {...register("confirmarClave")}
      />

      <p className="text-xs leading-relaxed text-texto-tenue">
        Al registrarte, se creará una cuenta de conductor.
      </p>
      <Boton
        type="submit"
        anchoCompleto
        cargando={registrar.isPending}
        textoCargando="Creando cuenta…"
      >
        Registrarse
      </Boton>
    </form>
  );
}
