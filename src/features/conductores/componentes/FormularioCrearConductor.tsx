import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useCrearConductor } from "../consultas";
import {
  esquemaCrearConductor,
  type DatosFormularioConductor,
} from "../esquemas";
import type { Usuario, UsuarioCrearDto } from "../tipos";

const CAMPOS_SERVIDOR: Record<string, keyof DatosFormularioConductor> = {
  nombre: "nombre",
  apellido: "apellido",
  correo: "correo",
  celular: "celular",
  clave: "clave",
};

export default function FormularioCrearConductor({
  alCrear,
}: {
  alCrear: (conductor: Usuario) => void;
}) {
  const crearConductor = useCrearConductor();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormularioConductor>({
    resolver: zodResolver(esquemaCrearConductor),
    defaultValues: {
      nombre: "",
      apellido: "",
      correo: "",
      celular: "",
      clave: "",
      foto: "",
    },
  });

  const enviar = async (datos: DatosFormularioConductor) => {
    setMensajeError(null);
    const solicitud: UsuarioCrearDto = {
      ...datos,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim(),
      celular: datos.celular.trim(),
      estado: true,
      rol: "Conductor",
      foto: datos.foto.trim() || null,
    };
    try {
      alCrear(await crearConductor.mutateAsync(solicitud));
    } catch (error) {
      if (!(error instanceof ErrorApi)) {
        setMensajeError(MENSAJE_GENERICO);
        return;
      }
      let hayErrorDeCampo = false;
      if (error.tipo === "validacion") {
        for (const [campo, mensajes] of Object.entries(error.errores)) {
          const destino = CAMPOS_SERVIDOR[campo.toLowerCase()];
          if (destino) {
            setError(destino, { type: "servidor", message: mensajes[0] });
            hayErrorDeCampo = true;
          }
        }
      }
      if (!hayErrorDeCampo) setMensajeError(error.mensaje);
    }
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    void handleSubmit(enviar)(evento);
  };

  return (
    <form
      aria-label="Agregar conductor"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={alEnviar}
    >
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CampoFormulario
          etiqueta="Nombre"
          autoComplete="given-name"
          maxLength={100}
          placeholder="Nombre"
          error={errors.nombre?.message}
          {...register("nombre")}
        />
        <CampoFormulario
          etiqueta="Apellidos"
          autoComplete="family-name"
          maxLength={100}
          placeholder="Apellidos"
          error={errors.apellido?.message}
          {...register("apellido")}
        />
        <CampoFormulario
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          maxLength={150}
          placeholder="correo@ejemplo.com"
          error={errors.correo?.message}
          {...register("correo")}
        />
        <CampoFormulario
          etiqueta="Celular"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="300 000 0000"
          error={errors.celular?.message}
          {...register("celular")}
        />
        <CampoFormulario
          etiqueta="Contraseña inicial"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          placeholder="Mínimo 8 caracteres"
          error={errors.clave?.message}
          {...register("clave")}
        />
        <CampoFormulario
          etiqueta="URL de foto (opcional)"
          type="url"
          placeholder="https://..."
          error={errors.foto?.message}
          {...register("foto")}
        />
      </div>
      <Boton
        type="submit"
        anchoCompleto
        cargando={crearConductor.isPending}
        textoCargando="Guardando…"
        className="mt-1 rounded-xl py-2.5"
      >
        Agregar conductor
      </Boton>
    </form>
  );
}
