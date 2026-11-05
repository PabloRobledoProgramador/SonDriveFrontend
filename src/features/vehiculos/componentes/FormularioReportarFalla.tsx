import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import CampoSelect from "../../../components/ui/CampoSelect";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useReportarFalla } from "../consultas";
import {
  esquemaReportarFalla,
  type DatosFormularioFalla,
} from "../esquemas";

const hoy = () => new Date().toLocaleDateString("sv-SE");

export default function FormularioReportarFalla({
  idVehiculo,
  alCancelar,
  alReportar,
}: {
  idVehiculo: number;
  alCancelar: () => void;
  alReportar: () => void;
}) {
  const reportar = useReportarFalla();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormularioFalla>({
    resolver: zodResolver(esquemaReportarFalla),
    defaultValues: {
      descripcion: "",
      severidad: "Alerta",
      fecha: hoy(),
    },
  });

  const enviar = async (datos: DatosFormularioFalla) => {
    setMensajeError(null);
    try {
      await reportar.mutateAsync({
        vehiculoId: idVehiculo,
        descripcion: datos.descripcion.trim(),
        severidad: datos.severidad,
        fecha: datos.fecha,
      });
      alReportar();
    } catch (error) {
      setMensajeError(
        error instanceof ErrorApi ? error.mensaje : MENSAJE_GENERICO,
      );
    }
  };

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    void handleSubmit(enviar)(evento);
  };

  return (
    <form
      aria-label="Reportar falla"
      className="mt-4 flex flex-col gap-4 rounded-xl border border-aviso/20 bg-aviso/5 p-4"
      noValidate
      onSubmit={alEnviar}
    >
      <h4 className="text-sm font-semibold text-marca">Nueva falla</h4>
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-texto-tenue">
          Descripción
        </span>
        <textarea
          rows={3}
          placeholder="Describe el problema encontrado…"
          className={`resize-y rounded-lg border bg-elevada px-3 py-2 text-sm text-texto placeholder:text-texto-apagado focus:outline-none focus:ring-2 focus:ring-marca ${
            errors.descripcion ? "border-peligro" : "border-borde"
          }`}
          aria-invalid={errors.descripcion ? true : undefined}
          aria-describedby={
            errors.descripcion ? "descripcion-falla-error" : undefined
          }
          {...register("descripcion")}
        />
        {errors.descripcion?.message && (
          <span id="descripcion-falla-error" className="text-xs text-peligro">
            {errors.descripcion.message}
          </span>
        )}
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Severidad"
          error={errors.severidad?.message}
          {...register("severidad")}
        >
          <option value="Informativo">Informativo</option>
          <option value="Alerta">Alerta</option>
          <option value="Crítico">Crítico</option>
        </CampoSelect>
        <CampoFormulario
          etiqueta="Fecha del reporte"
          type="date"
          max={hoy()}
          error={errors.fecha?.message}
          {...register("fecha")}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          cargando={reportar.isPending}
          textoCargando="Enviando…"
        >
          Reportar falla
        </Boton>
      </div>
    </form>
  );
}
