import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import EstadoError from "../../../components/ui/EstadoError";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import {
  useActualizarVehiculo,
  useConductores,
  useViajesProximosDeConductor,
} from "../consultas";
import { esquemaVehiculo, type DatosFormularioVehiculo } from "../esquemas";
import type { VehiculoFlota } from "../tipos";
import CamposVehiculo from "./CamposVehiculo";

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

const TIPOS_DE_LA_LISTA = ["Sedan", "Hatchback", "SUV", "Pickup"];

// La API devuelve las fechas como AAAA-MM-DDT00:00:00; el campo de fecha usa AAAA-MM-DD
const soloFecha = (fecha: string | null) => fecha?.slice(0, 10) ?? "";

export default function FormularioEditarVehiculo({
  vehiculo,
  alGuardar,
  alCancelar,
}: {
  vehiculo: VehiculoFlota;
  alGuardar: (actualizado: VehiculoFlota) => void;
  alCancelar: () => void;
}) {
  const conductores = useConductores(true);
  const viajesProximos = useViajesProximosDeConductor(vehiculo.idUsuario);
  const actualizarVehiculo = useActualizarVehiculo();
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<DatosFormularioVehiculo>({
    resolver: zodResolver(esquemaVehiculo),
    defaultValues: {
      idUsuario: String(vehiculo.idUsuario),
      placa: vehiculo.placa,
      modelo: vehiculo.modelo,
      annoModelo: vehiculo.annoModelo,
      tipo: vehiculo.tipo,
      kilometraje: String(vehiculo.kilometraje),
      fechaUltimoServicio: soloFecha(vehiculo.fechaUltimoServicio),
      vencimientoSoat: soloFecha(vehiculo.soat.vencimiento),
      vencimientoTecnomecanica: soloFecha(vehiculo.tecnomecanica.vencimiento),
      vencimientoLicencia: soloFecha(vehiculo.licencia.vencimiento),
    },
  });

  // El conductor actual es una opción desde el primer render: un select cuyo valor no tiene
  // opción muestra la primera y no recupera el valor cuando llegan las demás.
  const conductorActual = { id: vehiculo.idUsuario, nombre: vehiculo.conductor };
  const habilitados = conductores.data?.map((conductor) => ({
    id: conductor.id,
    nombre: `${conductor.nombre} ${conductor.apellido}`,
  }));
  const opcionesConductor = !habilitados
    ? [conductorActual]
    : habilitados.some((conductor) => conductor.id === vehiculo.idUsuario)
      ? habilitados
      : [
          { ...conductorActual, nombre: `${vehiculo.conductor} (deshabilitado)` },
          ...habilitados,
        ];

  // Al cambiar las opciones, el select vuelve a mostrar el valor que tiene el formulario
  const listaCargada = conductores.isSuccess;
  useEffect(() => {
    if (listaCargada) setValue("idUsuario", getValues("idUsuario"));
  }, [listaCargada, setValue, getValues]);

  const idElegido = Number(useWatch({ control, name: "idUsuario" }));
  const cambiaConductor = idElegido > 0 && idElegido !== vehiculo.idUsuario;
  const conductorElegido =
    opcionesConductor.find((conductor) => conductor.id === idElegido)?.nombre ??
    "el nuevo conductor";
  const viajesDelVehiculo =
    viajesProximos.data?.filter((viaje) => viaje.idVehiculo === vehiculo.id)
      .length ?? 0;

  const enviar = async (datos: DatosFormularioVehiculo) => {
    setMensajeError(null);
    try {
      const actualizado = await actualizarVehiculo.mutateAsync({
        id: vehiculo.id,
        datos: {
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
        },
      });
      alGuardar(actualizado);
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
  const sinListaDeConductores = conductores.isPending || conductores.isError;

  return (
    <form
      aria-label="Editar datos del vehículo"
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

      <CamposVehiculo
        register={register}
        errors={errors}
        conductores={opcionesConductor}
        conductoresDeshabilitado={sinListaDeConductores}
        tiposAdicionales={
          TIPOS_DE_LA_LISTA.includes(vehiculo.tipo) ? [] : [vehiculo.tipo]
        }
      />

      {cambiaConductor && viajesProximos.isError && (
        <Aviso tipo="info">
          No pudimos comprobar si este vehículo tiene viajes próximos. Si los
          tiene, pasarán al nuevo conductor.
        </Aviso>
      )}
      {cambiaConductor && viajesDelVehiculo > 0 && (
        <Aviso tipo="info">
          {viajesDelVehiculo === 1
            ? `Este vehículo tiene 1 viaje próximo. Al guardar pasará a ${conductorElegido}, con sus puestos ocupados.`
            : `Este vehículo tiene ${viajesDelVehiculo} viajes próximos. Al guardar pasarán a ${conductorElegido}, con sus puestos ocupados.`}
        </Aviso>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Boton variante="secundario" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton
          type="submit"
          disabled={sinListaDeConductores}
          cargando={actualizarVehiculo.isPending}
          textoCargando="Guardando…"
        >
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
}
