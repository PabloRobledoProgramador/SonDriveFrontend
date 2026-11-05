import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useActualizarConductor } from "../consultas";
import {
  esquemaEditarConductor,
  type DatosFormularioEdicionConductor,
} from "../esquemas";
import type { ConductorActualizarDto, Usuario } from "../tipos";

const CAMPOS_SERVIDOR: Record<string, keyof DatosFormularioEdicionConductor> =
  {
    nombre: "nombre",
    apellido: "apellido",
    correo: "correo",
    celular: "celular",
    foto: "foto",
  };

// Corrige nombre, apellidos, correo, celular y foto. La contraseña, el rol y el estado no se
// editan aquí: el endpoint ni siquiera los recibe.
export default function FormularioEditarConductor({
  conductor,
  alGuardar,
  alCancelar,
}: {
  conductor: Usuario;
  alGuardar: (actualizado: Usuario) => void;
  alCancelar: () => void;
}) {
  const actualizarConductor = useActualizarConductor();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormularioEdicionConductor>({
    resolver: zodResolver(esquemaEditarConductor),
    defaultValues: {
      nombre: conductor.nombre,
      apellido: conductor.apellido,
      correo: conductor.correo,
      celular: conductor.celular,
      foto: conductor.foto ?? "",
    },
  });

  const enviar = async (datos: DatosFormularioEdicionConductor) => {
    setMensajeError(null);
    const solicitud: ConductorActualizarDto = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      correo: datos.correo.trim(),
      celular: datos.celular.trim(),
      foto: datos.foto.trim() || null,
    };
    try {
      alGuardar(
        await actualizarConductor.mutateAsync({
          id: conductor.id,
          datos: solicitud,
        }),
      );
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
      aria-label="Editar datos del conductor"
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
          placeholder="300 000 0000"
          error={errors.celular?.message}
          {...register("celular")}
        />
        <CampoFormulario
          etiqueta="URL de foto (opcional)"
          type="url"
          placeholder="https://..."
          error={errors.foto?.message}
          {...register("foto")}
        />
      </div>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row-reverse">
        <Boton
          type="submit"
          anchoCompleto
          cargando={actualizarConductor.isPending}
          textoCargando="Guardando…"
        >
          Guardar cambios
        </Boton>
        <Boton variante="secundario" anchoCompleto onClick={alCancelar}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
