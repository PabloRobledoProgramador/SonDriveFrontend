import { useCallback, useState } from "react";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import EstadoVacio from "../../../components/ui/EstadoVacio";
import Insignia from "../../../components/ui/Insignia";
import Modal from "../../../components/ui/Modal";
import Tarjeta from "../../../components/ui/Tarjeta";
import DetalleVehiculo from "../componentes/DetalleVehiculo";
import FormularioCrearVehiculo from "../componentes/FormularioCrearVehiculo";
import FormularioEditarVehiculo from "../componentes/FormularioEditarVehiculo";
import { useFallasVehiculo, useFlota } from "../consultas";
import { estadoVehiculo } from "../estadoVehiculo";
import type { VehiculoFlota } from "../tipos";

const ETIQUETAS_ESTADO = {
  critico: "Crítico",
  alerta: "Alerta",
  optimo: "Óptimo",
} as const;

function TarjetaVehiculo({
  vehiculo,
  seleccionado,
  alSeleccionar,
}: {
  vehiculo: VehiculoFlota;
  seleccionado: boolean;
  alSeleccionar: () => void;
}) {
  const estado = estadoVehiculo(vehiculo);

  return (
    <button
      type="button"
      aria-pressed={seleccionado}
      onClick={alSeleccionar}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        seleccionado
          ? "border-marca/50 bg-elevada ring-1 ring-marca/20"
          : "border-borde bg-tarjeta hover:border-texto-apagado"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-label={ETIQUETAS_ESTADO[estado]}
          className={`size-2.5 shrink-0 rounded-full ${
            estado === "critico"
              ? "bg-peligro"
              : estado === "alerta"
                ? "bg-aviso"
                : "bg-exito"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">
              {vehiculo.nombreVehiculo}
            </p>
            {vehiculo.fallasPendientes > 0 && (
              <span className="shrink-0 rounded bg-peligro/10 px-1.5 py-0.5 text-xs font-bold text-peligro">
                {vehiculo.fallasPendientes}
              </span>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-2 text-xs text-texto-tenue">
            {vehiculo.fotoConductor ? (
              <img
                src={vehiculo.fotoConductor}
                alt=""
                className="size-4 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center rounded-full bg-elevada text-[9px] text-marca"
              >
                {vehiculo.conductor.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate">{vehiculo.conductor}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 tracking-wide">{vehiculo.placa}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PaginaVehiculos() {
  const flota = useFlota();
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  // Copia del vehículo con la que se abrió la edición (null = formulario cerrado). Es una copia
  // para que el formulario siga abierto aunque la lista cambie mientras se edita.
  const [vehiculoEnEdicion, setVehiculoEnEdicion] =
    useState<VehiculoFlota | null>(null);
  // Estable: Modal la usa en un efecto
  const cerrarEdicion = useCallback(() => setVehiculoEnEdicion(null), []);
  const vehiculos = flota.data ?? [];
  const vehiculoSeleccionado =
    vehiculos.find((vehiculo) => vehiculo.id === idSeleccionado) ??
    vehiculos[0];
  const consultaFallas = useFallasVehiculo(vehiculoSeleccionado?.id);

  const resumen = vehiculos.reduce(
    (conteo, vehiculo) => {
      conteo[estadoVehiculo(vehiculo)] += 1;
      return conteo;
    },
    { critico: 0, alerta: 0, optimo: 0 },
  );

  return (
    <main className="pb-12">
      <Contenedor className="pt-8 md:pt-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Insignia className="mb-4">Panel de control</Insignia>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">
              Monitoreo de flota
            </h1>
            <p className="text-sm text-texto-tenue">
              {flota.isSuccess
                ? `${vehiculos.length} ${
                    vehiculos.length === 1 ? "vehículo" : "vehículos"
                  } ${vehiculos.length === 1 ? "registrado" : "registrados"}`
                : "Estado y documentación de los vehículos"}
            </p>
          </div>

          {flota.isSuccess && vehiculos.length > 0 && (
            <div
              aria-label="Resumen de estado de la flota"
              className="flex gap-2 sm:gap-3"
            >
              {(["critico", "alerta", "optimo"] as const).map((estado) => (
                <div
                  key={estado}
                  className={`min-w-20 rounded-xl border px-3 py-2.5 text-center sm:min-w-24 ${
                    estado === "critico"
                      ? "border-peligro/20 bg-peligro/5"
                      : estado === "alerta"
                        ? "border-aviso/20 bg-aviso/5"
                        : "border-exito/20 bg-exito/5"
                  }`}
                >
                  <p
                    className={`text-xl font-bold ${
                      estado === "critico"
                        ? "text-peligro"
                        : estado === "alerta"
                          ? "text-aviso"
                          : "text-exito"
                    }`}
                  >
                    {resumen[estado]}
                  </p>
                  <p className="text-xs text-texto-tenue">
                    {ETIQUETAS_ESTADO[estado]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {mensajeExito && (
          <div className="mb-6">
            <Aviso tipo="exito" alCerrar={() => setMensajeExito(null)}>
              {mensajeExito}
            </Aviso>
          </div>
        )}

        {flota.isPending && <EstadoCargando texto="Cargando flota…" />}
        {flota.isError && (
          <EstadoError error={flota.error} alReintentar={() => void flota.refetch()} />
        )}
        {flota.isSuccess && vehiculos.length === 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Boton onClick={() => setAgregando((abierto) => !abierto)}>
                {agregando ? "Cerrar formulario" : "＋ Agregar vehículo"}
              </Boton>
            </div>
            {agregando ? (
              <Tarjeta className="p-5 md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-marca">
                    Nuevo vehículo
                  </h2>
                  <p className="mt-1 text-sm text-texto-tenue">
                    Registra el vehículo, su conductor y la documentación.
                  </p>
                </div>
                <FormularioCrearVehiculo
                  alCancelar={() => setAgregando(false)}
                  alCrear={(vehiculo) => {
                    setIdSeleccionado(vehiculo.id);
                    setAgregando(false);
                    setMensajeExito(
                      `${vehiculo.nombreVehiculo} se agregó a la flota.`,
                    );
                  }}
                />
              </Tarjeta>
            ) : (
              <EstadoVacio mensaje="No hay vehículos registrados en la flota." />
            )}
          </div>
        )}

        {flota.isSuccess && vehiculos.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6">
            <section aria-label="Vehículos de la flota">
              <Boton
                anchoCompleto
                aria-expanded={agregando}
                className="mb-3"
                onClick={() => setAgregando((abierto) => !abierto)}
              >
                {agregando ? "Cerrar formulario" : "＋ Agregar vehículo"}
              </Boton>
              {agregando && (
                <Tarjeta className="mb-4 p-4">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-marca">
                      Nuevo vehículo
                    </h2>
                    <p className="mt-1 text-xs text-texto-tenue">
                      Registra el vehículo, su conductor y la documentación.
                    </p>
                  </div>
                  <FormularioCrearVehiculo
                    alCancelar={() => setAgregando(false)}
                    alCrear={(vehiculo) => {
                      setIdSeleccionado(vehiculo.id);
                      setAgregando(false);
                      setMensajeExito(
                      `${vehiculo.nombreVehiculo} se agregó a la flota.`,
                    );
                    }}
                  />
                </Tarjeta>
              )}
              <ul className="flex max-h-[580px] flex-col gap-2 overflow-y-auto pr-1">
                {vehiculos.map((vehiculo) => (
                  <li key={vehiculo.id}>
                    <TarjetaVehiculo
                      vehiculo={vehiculo}
                      seleccionado={
                        vehiculoSeleccionado?.id === vehiculo.id
                      }
                      alSeleccionar={() => setIdSeleccionado(vehiculo.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-label="Detalle del vehículo"
              className="lg:col-span-2"
            >
              {vehiculoSeleccionado && consultaFallas ? (
                <DetalleVehiculo
                  key={vehiculoSeleccionado.id}
                  vehiculo={vehiculoSeleccionado}
                  consultaFallas={consultaFallas}
                  alEditar={() => {
                    setMensajeExito(null);
                    setVehiculoEnEdicion(vehiculoSeleccionado);
                  }}
                />
              ) : (
                <EstadoCargando texto="Cargando información del vehículo…" />
              )}
            </section>
          </div>
        )}
      </Contenedor>

      <Modal
        abierto={vehiculoEnEdicion !== null}
        ancho="amplio"
        titulo={
          vehiculoEnEdicion
            ? `Editar datos de ${vehiculoEnEdicion.nombreVehiculo} · ${vehiculoEnEdicion.placa}`
            : ""
        }
        alCerrar={cerrarEdicion}
      >
        {vehiculoEnEdicion && (
          <FormularioEditarVehiculo
            key={vehiculoEnEdicion.id}
            vehiculo={vehiculoEnEdicion}
            alCancelar={cerrarEdicion}
            alGuardar={(actualizado) => {
              const cambioDeConductor =
                actualizado.idUsuario !== vehiculoEnEdicion.idUsuario;
              setVehiculoEnEdicion(null);
              setIdSeleccionado(actualizado.id);
              setMensajeExito(
                cambioDeConductor
                  ? `Los datos de ${actualizado.nombreVehiculo} se actualizaron. Ahora está asignado a ${actualizado.conductor}.`
                  : `Los datos de ${actualizado.nombreVehiculo} se actualizaron.`,
              );
            }}
          />
        )}
      </Modal>
    </main>
  );
}
