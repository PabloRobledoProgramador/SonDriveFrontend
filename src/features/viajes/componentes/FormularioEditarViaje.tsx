import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useActualizarViaje } from "../consultas";
import { esquemaEditarViaje, type DatosEditarViaje } from "../esquemas";
import type { ViajeResumen } from "../tipos";

function fechaLocal(salida: Date) {
  return [
    salida.getFullYear(),
    String(salida.getMonth() + 1).padStart(2, "0"),
    String(salida.getDate()).padStart(2, "0"),
  ].join("-");
}

function horaLocal(salida: Date) {
  return `${String(salida.getHours()).padStart(2, "0")}:${String(salida.getMinutes()).padStart(2, "0")}`;
}

const CAMPOS_SERVIDOR: Record<string, keyof DatosEditarViaje> = {
  fecha: "fecha",
  hora: "hora",
  precio: "precio",
};

interface PropiedadesFormularioEditarViaje {
  viaje: ViajeResumen;
  alGuardar: () => void;
  alCancelar: () => void;
}

export default function FormularioEditarViaje({
  viaje,
  alGuardar,
  alCancelar,
}: PropiedadesFormularioEditarViaje) {
  const actualizarViaje = useActualizarViaje();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const salida = new Date(viaje.fechaSalida);
  const hoy = new Date().toLocaleDateString("sv-SE");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosEditarViaje>({
    resolver: zodResolver(esquemaEditarViaje),
    defaultValues: {
      fecha: fechaLocal(salida),
      hora: horaLocal(salida),
      precio: String(viaje.precio),
    },
  });

  const enviar = async (datos: DatosEditarViaje) => {
    setMensajeError(null);

    try {
      await actualizarViaje.mutateAsync({
        id: viaje.id,
        datos: {
          ciudadOrigenId: viaje.ciudadOrigenId,
          ciudadDestinoId: viaje.ciudadDestinoId,
          idVehiculo: viaje.idVehiculo,
          fecha: datos.fecha,
          hora: `${datos.hora}:00`,
          precio: Number(datos.precio),
        },
      });
      alGuardar();
    } catch (error) {
      if (!(error instanceof ErrorApi)) {
        setMensajeError(MENSAJE_GENERICO);
        return;
      }

      let hayErrorDeCampo = false;
      if (error.tipo === "validacion") {
        for (const [campo, mensajes] of Object.entries(error.errores)) {
          const destino = CAMPOS_SERVIDOR[campo];
          if (destino) {
            setError(destino, { type: "servidor", message: mensajes[0] });
            hayErrorDeCampo = true;
          }
        }
      }
      if (!hayErrorDeCampo) setMensajeError(error.mensaje);
    }
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) =>
    handleSubmit(enviar)(evento);

  return (
    <form
      onSubmit={alEnviar}
      noValidate
      aria-label="Editar viaje"
      className="grid auto-rows-min grid-cols-1 content-start gap-4 border-t border-divisor px-4 py-5 md:grid-cols-2 md:border-l md:border-t-0 md:border-divisor md:px-5"
    >
      <div className="md:col-span-2">
        <h2 className="text-lg font-semibold text-marca">
          Editar datos del viaje
        </h2>
        <p className="mt-1 text-sm text-texto-tenue">
          Actualiza la fecha, la hora o el precio. La ruta y el vehículo se
          mantienen.
        </p>
      </div>

      {mensajeError && (
        <div className="md:col-span-2">
          <Aviso tipo="error">{mensajeError}</Aviso>
        </div>
      )}

      <CampoFormulario
        etiqueta="Fecha"
        type="date"
        min={hoy}
        error={errors.fecha?.message}
        {...register("fecha")}
      />
      <CampoFormulario
        etiqueta="Hora"
        type="time"
        error={errors.hora?.message}
        {...register("hora")}
      />
      <div className="md:col-span-2">
        <CampoFormulario
          etiqueta="Precio por puesto (COP)"
          type="number"
          min="1"
          step="500"
          inputMode="numeric"
          error={errors.precio?.message}
          {...register("precio")}
        />
      </div>

      <div className="flex flex-wrap items-end justify-end gap-2 md:col-span-2">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          cargando={actualizarViaje.isPending}
          textoCargando="Guardando…"
        >
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
