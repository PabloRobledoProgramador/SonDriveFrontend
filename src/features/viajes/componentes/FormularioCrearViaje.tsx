import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import CampoSelect from "../../../components/ui/CampoSelect";
import { ErrorApi, MENSAJE_GENERICO } from "../../../lib/errores";
import { useSesion } from "../../autenticacion";
import {
  useCiudades,
  useCrearViaje,
  useVehiculosDeUsuario,
} from "../consultas";
import { esquemaCrearViaje, type DatosCrearViaje } from "../esquemas";
import type { ViajeResumen } from "../tipos";

// El backend nombra algunos campos distinto que el formulario
const CAMPOS_SERVIDOR: Record<string, keyof DatosCrearViaje> = {
  ciudadOrigenId: "origenId",
  ciudadDestinoId: "destinoId",
  idVehiculo: "vehiculoId",
  fecha: "fecha",
  hora: "hora",
  precio: "precio",
};

// <input type="time"> entrega "HH:mm"; la API espera "HH:mm:ss"
const conSegundos = (hora: string) => (hora.length === 5 ? `${hora}:00` : hora);

export default function FormularioCrearViaje({
  alCrear,
}: {
  alCrear: (viaje: ViajeResumen) => void;
}) {
  const { usuario } = useSesion();
  const ciudades = useCiudades();
  const vehiculos = useVehiculosDeUsuario(usuario?.id);
  const crearViaje = useCrearViaje();
  const enviando = useRef(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const hoy = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD en hora local

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DatosCrearViaje>({
    resolver: zodResolver(esquemaCrearViaje),
    defaultValues: {
      origenId: "",
      destinoId: "",
      vehiculoId: "",
      fecha: "",
      hora: "",
      precio: "",
    },
  });

  const enviar = async (datos: DatosCrearViaje) => {
    // Evita envíos repetidos (doble clic) mientras hay una solicitud en curso
    if (enviando.current) return;
    enviando.current = true;
    setMensajeError(null);

    try {
      const viaje = await crearViaje.mutateAsync({
        ciudadOrigenId: Number(datos.origenId),
        ciudadDestinoId: Number(datos.destinoId),
        idVehiculo: Number(datos.vehiculoId),
        fecha: datos.fecha,
        hora: conSegundos(datos.hora),
        precio: Number(datos.precio),
      });
      alCrear(viaje);
    } catch (error) {
      if (!(error instanceof ErrorApi)) {
        setMensajeError(MENSAJE_GENERICO);
      } else {
        // Errores por campo (400) se muestran junto al campo; el resto (por ejemplo, el vehículo
        // ya tiene un viaje a esa hora, 409) va en un aviso general
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
    } finally {
      enviando.current = false;
    }
  };

  // handleSubmit se invoca en el evento, no durante el render
  const alEnviar = (evento: FormEvent<HTMLFormElement>) =>
    handleSubmit(enviar)(evento);

  const opcionesCiudades = ciudades.data ?? [];
  const opcionesVehiculos = vehiculos.data ?? [];
  const sinCiudades = ciudades.isPending || ciudades.isError;
  const sinVehiculos =
    vehiculos.isPending || vehiculos.isError || opcionesVehiculos.length === 0;

  return (
    <form
      onSubmit={alEnviar}
      noValidate
      aria-label="Nuevo viaje"
      className="flex flex-col gap-4"
    >
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}
      {ciudades.isError && <Aviso tipo="error">{ciudades.error.mensaje}</Aviso>}
      {vehiculos.isError && (
        <Aviso tipo="error">{vehiculos.error.mensaje}</Aviso>
      )}
      {vehiculos.isSuccess && opcionesVehiculos.length === 0 && (
        <Aviso tipo="info">
          No tienes vehículos registrados. Pide al administrador que registre
          uno.
        </Aviso>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Origen"
          disabled={sinCiudades}
          error={errors.origenId?.message}
          {...register("origenId")}
        >
          <option value="">
            {ciudades.isPending ? "Cargando…" : "Selecciona"}
          </option>
          {opcionesCiudades.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id}>
              {ciudad.nombre}
            </option>
          ))}
        </CampoSelect>

        <CampoSelect
          etiqueta="Destino"
          disabled={sinCiudades}
          error={errors.destinoId?.message}
          {...register("destinoId")}
        >
          <option value="">
            {ciudades.isPending ? "Cargando…" : "Selecciona"}
          </option>
          {opcionesCiudades.map((ciudad) => (
            <option key={ciudad.id} value={ciudad.id}>
              {ciudad.nombre}
            </option>
          ))}
        </CampoSelect>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <CampoFormulario
        etiqueta="Precio por puesto (COP)"
        type="number"
        min="1"
        step="500"
        inputMode="numeric"
        placeholder="25000"
        error={errors.precio?.message}
        {...register("precio")}
      />

      <CampoSelect
        etiqueta="Vehículo"
        disabled={sinVehiculos}
        error={errors.vehiculoId?.message}
        {...register("vehiculoId")}
      >
        <option value="">
          {vehiculos.isPending ? "Cargando…" : "Selecciona"}
        </option>
        {opcionesVehiculos.map((vehiculo) => (
          <option key={vehiculo.id} value={vehiculo.id}>
            {vehiculo.nombreVehiculo} · {vehiculo.placa}
          </option>
        ))}
      </CampoSelect>

      <Boton
        type="submit"
        anchoCompleto
        disabled={sinCiudades || sinVehiculos}
        cargando={crearViaje.isPending}
        textoCargando="Publicando…"
      >
        Publicar viaje
      </Boton>
    </form>
  );
}
