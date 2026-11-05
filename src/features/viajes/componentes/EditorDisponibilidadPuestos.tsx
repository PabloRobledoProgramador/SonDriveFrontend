import { useState, type FormEvent } from "react";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import CampoFormulario from "../../../components/ui/CampoFormulario";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import {
  useDetalleViaje,
  useLiberarPuesto,
  useOcuparPuesto,
  useOcupacionesViaje,
} from "../consultas";
import type { PuestoViaje } from "../tipos";

const esCajuela = (puesto: PuestoViaje) =>
  puesto.tipo.toLowerCase() === "cajuela";

const estiloPuesto =
  "flex min-h-20 flex-col items-center justify-center border-borde px-2 py-4 text-center transition-colors";

export default function EditorDisponibilidadPuestos({
  idViaje,
}: {
  idViaje: number;
}) {
  const detalle = useDetalleViaje(idViaje);
  const ocupaciones = useOcupacionesViaje(idViaje);
  const ocuparPuesto = useOcuparPuesto(idViaje);
  const liberarPuesto = useLiberarPuesto(idViaje);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [confirmandoLiberacion, setConfirmandoLiberacion] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [celular, setCelular] = useState("");
  const [direccion, setDireccion] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  if (detalle.isPending) return <EstadoCargando texto="Cargando puestos…" />;
  if (detalle.isError)
    return (
      <EstadoError
        error={detalle.error}
        alReintentar={() => detalle.refetch()}
      />
    );

  const puestos = detalle.data.puestos;
  const conductor = puestos.find((puesto) => puesto.esConductor);
  const pasajeros = puestos.filter(
    (puesto) => !puesto.esConductor && !esCajuela(puesto),
  );
  const copiloto =
    pasajeros.find((puesto) =>
      puesto.codigo.toLowerCase().includes("copiloto"),
    ) ?? pasajeros[0];
  const traseros = pasajeros.filter(
    (puesto) => puesto.idPuesto !== copiloto?.idPuesto,
  );
  const cajuelas = puestos.filter(esCajuela);
  const puestoSeleccionado = puestos.find(
    (puesto) => puesto.idPuesto === idSeleccionado,
  );
  const ocupacionSeleccionada = ocupaciones.data?.find(
    (ocupacion) => ocupacion.idPuesto === idSeleccionado,
  );

  const seleccionarPuesto = (puesto: PuestoViaje) => {
    setIdSeleccionado(puesto.idPuesto);
    setConfirmandoLiberacion(false);
    setNombreCompleto("");
    setCelular("");
    setDireccion("");
    setMensajeError(null);
  };

  const registrarPasajero = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!puestoSeleccionado) return;

    setMensajeError(null);
    try {
      await ocuparPuesto.mutateAsync({
        idPuesto: puestoSeleccionado.idPuesto,
        datos: {
          nombreCompleto: nombreCompleto.trim(),
          celular: celular.trim(),
          direccion: direccion.trim(),
        },
      });
      setIdSeleccionado(null);
      setNombreCompleto("");
      setCelular("");
      setDireccion("");
    } catch (error) {
      setMensajeError(
        error instanceof Error ? error.message : "No se pudo ocupar el puesto.",
      );
    }
  };

  const confirmarLiberacion = async () => {
    if (!puestoSeleccionado) return;

    setMensajeError(null);
    try {
      await liberarPuesto.mutateAsync(puestoSeleccionado.idPuesto);
      setIdSeleccionado(null);
      setConfirmandoLiberacion(false);
    } catch (error) {
      setMensajeError(
        error instanceof Error ? error.message : "No se pudo liberar el puesto.",
      );
    }
  };

  const dibujarPuesto = (puesto: PuestoViaje) => {
    const ocupacion = ocupaciones.data?.find(
      (registro) => registro.idPuesto === puesto.idPuesto,
    );
    const libre = !ocupacion && !puesto.ocupado;
    const seleccionado = puesto.idPuesto === idSeleccionado;

    return (
      <button
        key={puesto.idPuesto}
        type="button"
        aria-pressed={seleccionado}
        aria-label={`${puesto.codigo}, ${libre ? "libre" : "ocupado"}`}
        onClick={() => seleccionarPuesto(puesto)}
        className={`${estiloPuesto} cursor-pointer ${
          seleccionado
            ? "bg-marca/20 ring-1 ring-inset ring-marca"
            : libre
              ? "bg-marca/10 hover:bg-marca/20"
              : "bg-elevada hover:bg-divisor"
        }`}
      >
        <span
          className={`text-xs font-semibold ${
            libre ? "text-marca" : "text-texto-apagado"
          }`}
        >
          {puesto.codigo.toUpperCase()}
        </span>
        <span
          className={`mt-1 text-[0.65rem] ${
            libre ? "text-marca/70" : "text-texto-apagado"
          }`}
        >
          {libre ? "LIBRE" : "OCUPADO"}
        </span>
      </button>
    );
  };

  return (
    <section className="border-t border-divisor px-4 py-5 md:px-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-marca">
          Disponibilidad de puestos
        </h2>
        <p className="mt-1 text-sm text-texto-tenue">
          Selecciona un puesto libre para registrar al pasajero o uno ocupado
          para revisar y liberar su reserva.
        </p>
      </div>

      {ocupaciones.isPending && <EstadoCargando texto="Cargando reservas…" />}
      {ocupaciones.isError && (
        <EstadoError
          error={ocupaciones.error}
          alReintentar={() => ocupaciones.refetch()}
        />
      )}
      {mensajeError && <Aviso tipo="error">{mensajeError}</Aviso>}

      {ocupaciones.isSuccess && (
        <>
          <div className="overflow-hidden rounded-xl border border-borde text-center text-[0.68rem]">
            <div className="flex items-center justify-between border-b border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
              <span className="font-semibold">FRONTAL</span>
              <span aria-hidden="true">▲</span>
            </div>
            <div className="grid grid-cols-2 border-b border-borde">
              {conductor ? (
                <div className={`${estiloPuesto} border-r bg-tarjeta`}>
                  <span className="text-xs font-semibold text-texto-apagado">
                    {conductor.codigo.toUpperCase()}
                  </span>
                  <span className="mt-1 text-[0.65rem] text-texto-apagado">
                    OCUPADO
                  </span>
                </div>
              ) : (
                <div className={`${estiloPuesto} border-r bg-tarjeta`} />
              )}
              {copiloto ? (
                dibujarPuesto(copiloto)
              ) : (
                <div className={`${estiloPuesto} bg-tarjeta`} />
              )}
            </div>
            {traseros.length > 0 && (
              <div className="grid grid-cols-3 border-b border-borde">
                {traseros.map(dibujarPuesto)}
              </div>
            )}
            {cajuelas.length > 0 && (
              <>
                <div className="flex items-center justify-between border-b border-t border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
                  <span className="font-semibold">CAJUELA</span>
                  <span>{cajuelas.length} espacios</span>
                </div>
                <div className="grid grid-cols-4">
                  {cajuelas.map(dibujarPuesto)}
                </div>
              </>
            )}
            <div className="flex items-center justify-between border-t border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
              <span className="font-semibold">TRASERO</span>
              <span aria-hidden="true">▼</span>
            </div>
          </div>

          {ocupaciones.isSuccess && puestoSeleccionado && (
            <div className="mt-4 rounded-xl border border-borde bg-elevada p-4">
              <h3 className="mb-3 text-sm font-semibold text-texto">
                {ocupacionSeleccionada
                  ? `Reserva: ${ocupacionSeleccionada.pasajero.nombreCompleto}`
                  : `Registrar pasajero en ${puestoSeleccionado.codigo}`}
              </h3>

              {ocupacionSeleccionada ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-texto-tenue">
                    {ocupacionSeleccionada.pasajero.celular}
                    {ocupacionSeleccionada.pasajero.direccion &&
                      ` · ${ocupacionSeleccionada.pasajero.direccion}`}
                  </p>
                  {confirmandoLiberacion ? (
                    <>
                      <p className="text-sm text-peligro">
                        Esta acción eliminará la reserva y los datos del
                        pasajero. ¿Deseas continuar?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Boton
                          variante="secundario"
                          onClick={() => setConfirmandoLiberacion(false)}
                        >
                          Mantener reserva
                        </Boton>
                        <Boton
                          className="bg-peligro font-semibold text-fondo hover:bg-peligro/80"
                          cargando={liberarPuesto.isPending}
                          textoCargando="Liberando…"
                          onClick={confirmarLiberacion}
                        >
                          Sí, liberar puesto
                        </Boton>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Boton
                        variante="secundario"
                        onClick={() => setIdSeleccionado(null)}
                      >
                        Cerrar
                      </Boton>
                      <Boton
                        variante="secundario"
                        onClick={() => setConfirmandoLiberacion(true)}
                      >
                        Liberar puesto
                      </Boton>
                    </div>
                  )}
                </div>
              ) : puestoSeleccionado.ocupado ? (
                <p className="text-sm text-aviso">
                  Este puesto figura ocupado, pero no se recibieron los datos
                  de la reserva. Vuelve a cargar los puestos antes de
                  modificarlo.
                </p>
              ) : (
                <form
                  onSubmit={registrarPasajero}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <CampoFormulario
                    etiqueta="Nombre completo"
                    autoComplete="name"
                    required
                    value={nombreCompleto}
                    onChange={(evento) => setNombreCompleto(evento.target.value)}
                  />
                  <CampoFormulario
                    etiqueta="Celular"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={celular}
                    onChange={(evento) => setCelular(evento.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <CampoFormulario
                      etiqueta="Dirección (opcional)"
                      autoComplete="street-address"
                      value={direccion}
                      onChange={(evento) => setDireccion(evento.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <Boton
                      variante="secundario"
                      onClick={() => setIdSeleccionado(null)}
                    >
                      Cerrar
                    </Boton>
                    <Boton
                      type="submit"
                      cargando={ocuparPuesto.isPending}
                      textoCargando="Guardando…"
                    >
                      Registrar pasajero
                    </Boton>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
