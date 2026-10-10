import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import CampoSelect from "../../../components/ui/CampoSelect";
import EstadoError from "../../../components/ui/EstadoError";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useConductores, useCrearVehiculo } from "../consultas";
import {
  esquemaCrearVehiculo,
  type DatosFormularioVehiculo,
} from "../esquemas";
import type { VehiculoFlota } from "../tipos";

const CAMPOS_SERVIDOR: Record<string, keyof DatosFormularioVehiculo> = {
  idUsuario: "idUsuario",
  placa: "placa",
  modelo: "modelo",
  annoModelo: "annoModelo",
  tipo: "tipo",
  kilometraje: "kilometraje",
  fechaUltimoServicio: "fechaUltimoServicio",
  vencimientoSoat: "vencimientoSoat",
  vencimientoTecnomecanica: "vencimientoTecnomecanica",
  vencimientoLicencia: "vencimientoLicencia",
};

const hoy = () => new Date().toLocaleDateString("sv-SE");

export default function FormularioCrearVehiculo({
  alCrear,
  alCancelar,
}: {
  alCrear: (vehiculo: VehiculoFlota) => void;
  alCancelar: () => void;
}) {
  const conductores = useConductores(true);
  const crearVehiculo = useCrearVehiculo();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosFormularioVehiculo>({
    resolver: zodResolver(esquemaCrearVehiculo),
    defaultValues: {
      idUsuario: "",
      placa: "",
      modelo: "",
      annoModelo: String(new Date().getFullYear()),
      tipo: "",
      kilometraje: "0",
      fechaUltimoServicio: "",
      vencimientoSoat: "",
      vencimientoTecnomecanica: "",
      vencimientoLicencia: "",
    },
  });

  const enviar = async (datos: DatosFormularioVehiculo) => {
    setMensajeError(null);
    try {
      const vehiculo = await crearVehiculo.mutateAsync({
        idUsuario: Number(datos.idUsuario),
        placa: datos.placa.trim().toUpperCase(),
        modelo: datos.modelo.trim(),
        annoModelo: datos.annoModelo,
        tipo: datos.tipo,
        kilometraje: Number(datos.kilometraje),
        fechaUltimoServicio: datos.fechaUltimoServicio || null,
        vencimientoSoat: datos.vencimientoSoat,
        vencimientoTecnomecanica: datos.vencimientoTecnomecanica,
        vencimientoLicencia: datos.vencimientoLicencia,
      });
      alCrear(vehiculo);
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

  const alEnviar = (evento: FormEvent<HTMLFormElement>) => {
    void handleSubmit(enviar)(evento);
  };
  const sinConductores =
    conductores.isPending ||
    conductores.isError ||
    conductores.data?.length === 0;

  return (
    <form
      aria-label="Agregar vehículo"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={alEnviar}
    >
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}
      {conductores.isError && (
        <EstadoError
          error={conductores.error}
          alReintentar={() => void conductores.refetch()}
        />
      )}
      {conductores.isSuccess && conductores.data.length === 0 && (
        <Aviso tipo="info">
          No hay conductores disponibles para asignar un vehículo.
        </Aviso>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Conductor asignado"
          disabled={sinConductores}
          error={errors.idUsuario?.message}
          {...register("idUsuario")}
        >
          <option value="">
            {conductores.isPending ? "Cargando…" : "Selecciona un conductor"}
          </option>
          {conductores.data?.map((conductor) => (
            <option key={conductor.id} value={conductor.id}>
              {conductor.nombre} {conductor.apellido}
            </option>
          ))}
        </CampoSelect>
        <CampoFormulario
          etiqueta="Placa"
          autoCapitalize="characters"
          placeholder="ABC 123"
          maxLength={7}
          error={errors.placa?.message}
          {...register("placa")}
        />
        <CampoFormulario
          etiqueta="Modelo del vehículo"
          placeholder="Renault Logan"
          maxLength={100}
          error={errors.modelo?.message}
          {...register("modelo")}
        />
        <CampoFormulario
          etiqueta="Año del modelo"
          type="number"
          min="1990"
          max={new Date().getFullYear() + 1}
          error={errors.annoModelo?.message}
          {...register("annoModelo")}
        />
        <CampoSelect
          etiqueta="Tipo de vehículo"
          error={errors.tipo?.message}
          {...register("tipo")}
        >
          <option value="">Selecciona</option>
          <option value="Sedan">Sedán</option>
          <option value="Hatchback">Hatchback</option>
          <option value="SUV">SUV</option>
          <option value="Pickup">Pickup</option>
        </CampoSelect>
        <CampoFormulario
          etiqueta="Kilometraje actual"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          error={errors.kilometraje?.message}
          {...register("kilometraje")}
        />
      </div>

      <div className="rounded-xl border border-borde bg-elevada/50 p-4">
        <h3 className="mb-3 text-sm font-semibold">Documentos y servicio</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoFormulario
            etiqueta="Vencimiento SOAT"
            type="date"
            error={errors.vencimientoSoat?.message}
            {...register("vencimientoSoat")}
          />
          <CampoFormulario
            etiqueta="Vencimiento tecnomecánica"
            type="date"
            error={errors.vencimientoTecnomecanica?.message}
            {...register("vencimientoTecnomecanica")}
          />
          <CampoFormulario
            etiqueta="Vencimiento licencia de conducción"
            type="date"
            error={errors.vencimientoLicencia?.message}
            {...register("vencimientoLicencia")}
          />
          <CampoFormulario
            etiqueta="Fecha del último servicio (opcional)"
            type="date"
            max={hoy()}
            error={errors.fechaUltimoServicio?.message}
            {...register("fechaUltimoServicio")}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          disabled={sinConductores}
          cargando={crearVehiculo.isPending}
          textoCargando="Guardando…"
        >
          Guardar vehículo
        </Boton>
      </div>
    </form>
  );
}
