import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import EstadoError from "../../../components/ui/EstadoError";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useConductores, useCrearVehiculo } from "../consultas";
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
    resolver: zodResolver(esquemaVehiculo),
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

      <CamposVehiculo
        register={register}
        errors={errors}
        conductores={(conductores.data ?? []).map((conductor) => ({
          id: conductor.id,
          nombre: `${conductor.nombre} ${conductor.apellido}`,
        }))}
        conductoresDeshabilitado={sinConductores}
        textoSinSeleccion={
          conductores.isPending ? "Cargando…" : "Selecciona un conductor"
        }
      />

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
