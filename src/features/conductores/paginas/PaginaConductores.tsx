import { useCallback, useState } from "react";
import Aviso from "../../../components/ui/Aviso";
import Boton from "../../../components/ui/Boton";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import Insignia from "../../../components/ui/Insignia";
import Modal from "../../../components/ui/Modal";
import Tarjeta from "../../../components/ui/Tarjeta";
import {
  useCambiarEstadoConductor,
  useConductores,
  useVehiculosConductores,
  useViajesConductor,
} from "../consultas";
import FormularioCrearConductor from "../componentes/FormularioCrearConductor";
import FormularioEditarConductor from "../componentes/FormularioEditarConductor";
import type { Usuario, VehiculoFlota, ViajeResumen } from "../tipos";

const conductoresVacios: Usuario[] = [];
const vehiculosVacios: VehiculoFlota[] = [];
const viajesVacios: ViajeResumen[] = [];

function ToggleEstado({
  conductor,
  alCambiar,
  cargando,
}: {
  conductor: Usuario;
  alCambiar: () => void;
  cargando: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={conductor.estado}
      aria-label={`${conductor.estado ? "Deshabilitar" : "Habilitar"} a ${conductor.nombre} ${conductor.apellido}`}
      disabled={cargando}
      onClick={alCambiar}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-wait disabled:opacity-60 ${
        conductor.estado
          ? "border-exito/30 bg-[#0a1f0a]"
          : "border-borde bg-divisor"
      }`}
    >
      <span
        className={`absolute top-[3px] size-4 rounded-full transition-all ${
          conductor.estado
            ? "left-[calc(100%-19px)] bg-exito shadow-[0_0_6px_#22c55e55]"
            : "left-[3px] bg-texto-apagado"
        }`}
      />
    </button>
  );
}

function obtenerRutaPrincipal(viajes: ViajeResumen[]): string | null {
  if (viajes.length === 0) return null;
  const frecuencias = new Map<string, number>();
  for (const viaje of viajes) {
    const ruta = `${viaje.ciudadOrigen} ↔ ${viaje.ciudadDestino}`;
    frecuencias.set(ruta, (frecuencias.get(ruta) ?? 0) + 1);
  }
  return [...frecuencias].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function formatearPlaca(placa: string): string {
  return placa.replace(/^([A-Za-z]{3})\s?(\d{3})$/, "$1 $2").toUpperCase();
}

function colorVehiculo(tipo: string): string {
  switch (tipo.toLowerCase()) {
    case "sedan":
      return "bg-[#eaeae0]";
    case "hatchback":
      return "bg-[#8a8a9a]";
    case "suv":
      return "bg-[#2252a0]";
    case "pickup":
      return "bg-[#c42200]";
    default:
      return "bg-texto-apagado";
  }
}

function BotonWhatsApp({ conductor, ruta }: { conductor: Usuario; ruta: string | null }) {
  const celular = conductor.celular.replace(/\D/g, "");
  const mensaje = ruta
    ? `Hola ${conductor.nombre}, quiero información sobre sus viajes en la ruta ${ruta}.`
    : `Hola ${conductor.nombre}, quiero información sobre sus viajes.`;
  const url = `https://wa.me/57${celular}?text=${encodeURIComponent(mensaje)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-whatsapp/20 bg-whatsapp/10 px-4 py-3 text-sm font-semibold text-whatsapp transition-colors hover:bg-whatsapp hover:text-white"
      aria-label={`Contactar a ${conductor.nombre} por WhatsApp`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.4" />
      </svg>
      Contactar por WhatsApp
    </a>
  );
}

function TarjetaConductor({
  conductor,
  vehiculos,
  estadoVehiculos,
  alCambiarEstado,
  cambiandoEstado,
  alEditar,
}: {
  conductor: Usuario;
  vehiculos: VehiculoFlota[] | null;
  estadoVehiculos: "cargando" | "error" | "listo";
  alCambiarEstado: () => void;
  cambiandoEstado: boolean;
  alEditar: () => void;
}) {
  const viajes = useViajesConductor(conductor.id);
  const vehiculosDelConductor =
    vehiculos?.filter((vehiculo) => vehiculo.idUsuario === conductor.id) ?? [];
  const ruta = obtenerRutaPrincipal(viajes.data ?? viajesVacios);
  const iniciales =
    `${conductor.nombre.charAt(0)}${conductor.apellido.charAt(0)}`.toUpperCase();

  return (
    <article
      className={`rounded-2xl border bg-tarjeta p-6 transition-[opacity,border-color] duration-300 ${
        conductor.estado
          ? "border-borde opacity-100"
          : "border-[#1a1a1a] opacity-50 grayscale"
      }`}
    >
      <header className="mb-4 flex items-start gap-4">
        <div className="relative size-14 shrink-0">
          {conductor.foto ? (
            <img
              src={conductor.foto}
              alt={conductor.nombre}
              className={`size-14 rounded-2xl border-2 border-divisor bg-elevada object-cover ${
                conductor.estado ? "" : "grayscale"
              }`}
            />
          ) : (
            <div
              aria-label={`Foto de ${conductor.nombre} no disponible`}
              className={`flex size-14 items-center justify-center rounded-2xl border-2 border-divisor bg-elevada font-titulo text-lg font-semibold text-marca ${
                conductor.estado ? "" : "grayscale"
              }`}
            >
              {iniciales}
            </div>
          )}
          <span
            aria-label={conductor.estado ? "Activo" : "Deshabilitado"}
            className={`absolute bottom-0.5 right-0.5 size-2.5 rounded-full border-2 border-tarjeta ${
              conductor.estado
                ? "bg-exito shadow-[0_0_5px_#22c55e66]"
                : "bg-texto-apagado"
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate font-titulo text-base font-semibold text-texto">
              {conductor.nombre} {conductor.apellido}
            </h2>
            <ToggleEstado
              conductor={conductor}
              alCambiar={alCambiarEstado}
              cargando={cambiandoEstado}
            />
          </div>
          <p className="mb-2 mt-0.5 text-xs text-texto-tenue">
            Conductor registrado
          </p>
          {ruta ? (
            <span className="inline-flex rounded bg-marca/10 px-2 py-0.5 text-xs text-marca">
              {ruta}
            </span>
          ) : (
            <span className="inline-flex rounded bg-elevada px-2 py-0.5 text-xs text-texto-tenue">
              Sin viajes publicados
            </span>
          )}
          {!conductor.estado && (
            <span className="ml-2 inline-flex rounded bg-peligro/10 px-2 py-0.5 text-xs font-semibold text-peligro">
              Deshabilitado
            </span>
          )}
        </div>
      </header>
      {viajes.isError && (
        <p role="status" className="-mt-2 mb-3 text-xs text-peligro">
          No se pudo cargar la ruta publicada.
        </p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-elevada px-3 py-2">
          <p className="mb-0.5 text-[0.68rem] uppercase tracking-[0.06em] text-texto-tenue">
            Viajes realizados
          </p>
          <p
            className="text-sm font-semibold text-texto-suave"
            title="El servicio disponible solo informa los viajes futuros."
          >
            —
          </p>
        </div>
        <div className="rounded-xl bg-elevada px-3 py-2">
          <p className="mb-0.5 text-[0.68rem] uppercase tracking-[0.06em] text-texto-tenue">
            Teléfono
          </p>
          <p className="truncate text-sm text-texto-suave">{conductor.celular}</p>
        </div>
      </div>

      <section className="mb-4">
        <p className="mb-2 text-[0.68rem] uppercase tracking-[0.06em] text-texto-tenue">
          Vehículos (
          {estadoVehiculos === "listo"
            ? vehiculosDelConductor.length
            : estadoVehiculos === "cargando"
              ? "…"
              : "—"}
          )
        </p>
        {estadoVehiculos === "error" ? (
          <p role="status" className="rounded-xl bg-elevada px-3 py-2 text-sm text-peligro">
            No se pudieron cargar los vehículos.
          </p>
        ) : estadoVehiculos === "cargando" ? (
          <p className="rounded-xl bg-elevada px-3 py-2 text-sm text-texto-tenue">
            Cargando vehículos…
          </p>
        ) : vehiculosDelConductor.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {vehiculosDelConductor.map((vehiculo) => (
              <li
                key={vehiculo.id}
                className="flex min-h-9 items-center gap-3 rounded-xl bg-elevada px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className={`size-3.5 shrink-0 rounded-full border border-white/10 ${colorVehiculo(vehiculo.tipo)}`}
                />
                <span className="min-w-0 truncate text-[0.82rem] text-texto-suave">
                  {vehiculo.modelo} {vehiculo.annoModelo}
                </span>
                <span className="ml-auto shrink-0 text-xs font-semibold tracking-wide text-marca">
                  {formatearPlaca(vehiculo.placa)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-elevada px-3 py-2 text-sm text-texto-tenue">
            Sin vehículos asignados
          </p>
        )}
      </section>

      {conductor.estado && (
        <BotonWhatsApp conductor={conductor} ruta={ruta} />
      )}
      {/* Siempre el último elemento del cuadro, también en conductores deshabilitados */}
      <Boton
        variante="secundario"
        anchoCompleto
        className="mt-3"
        aria-label={`Editar datos del conductor ${conductor.nombre} ${conductor.apellido}`}
        onClick={alEditar}
      >
        Editar datos del conductor
      </Boton>
    </article>
  );
}

export default function PaginaConductores() {
  const conductores = useConductores();
  const vehiculos = useVehiculosConductores();
  const cambiarEstado = useCambiarEstadoConductor();
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  // null = sin edición abierta; solo se edita un conductor a la vez
  const [conductorEnEdicion, setConductorEnEdicion] = useState<Usuario | null>(
    null,
  );
  // Estable entre renders: Modal la usa en un efecto
  const cerrarEdicion = useCallback(() => setConductorEnEdicion(null), []);
  const lista = conductores.data ?? conductoresVacios;
  const activos = lista.filter((conductor) => conductor.estado).length;
  const deshabilitados = lista.length - activos;

  return (
    <main className="min-h-screen pb-12">
      <Contenedor className="max-w-5xl pt-8 md:pt-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Insignia className="mb-4 border-[#3a3000] bg-[#1e1a00] text-marca">
              Red de conductores
            </Insignia>
            <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight">
              Conductores
            </h1>
            <p className="max-w-[500px] leading-[1.7] text-texto-tenue">
              Gestiona el estado de cada conductor. Los conductores
              deshabilitados no aparecen en búsquedas.
            </p>
          </div>
          <Boton
            onClick={() => setFormularioAbierto((abierto) => !abierto)}
            className={`shrink-0 rounded-xl px-5 py-3 font-semibold shadow-[0_4px_16px_rgba(245,192,0,0.3)] ${
              formularioAbierto
                ? "border border-borde bg-elevada text-texto shadow-none hover:border-borde hover:text-texto"
                : ""
            }`}
          >
            <span aria-hidden="true" className="mr-2 text-base">
              {formularioAbierto ? "×" : "+"}
            </span>
            {formularioAbierto ? "Cancelar" : "Agregar conductor"}
          </Boton>
        </div>

        {mensajeExito && (
          <div className="mb-6">
            <Aviso tipo="exito" alCerrar={() => setMensajeExito(null)}>
              {mensajeExito}
            </Aviso>
          </div>
        )}
        {cambiarEstado.isError && (
          <div className="mb-6">
            <Aviso tipo="error" alCerrar={() => cambiarEstado.reset()}>
              {cambiarEstado.error.mensaje}
            </Aviso>
          </div>
        )}

        {formularioAbierto && (
          <Tarjeta className="mb-6 border-marca/20 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-marca">
                Nuevo conductor
              </h2>
              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={() => setFormularioAbierto(false)}
                className="min-h-9 min-w-9 text-lg text-texto-apagado hover:text-texto"
              >
                ×
              </button>
            </div>
            <FormularioCrearConductor
              alCrear={(conductor) => {
                setFormularioAbierto(false);
                setMensajeExito(
                  `${conductor.nombre} ${conductor.apellido} se agregó a la red.`,
                );
              }}
            />
          </Tarjeta>
        )}

        {conductores.isPending && (
          <EstadoCargando texto="Cargando conductores…" />
        )}
        {conductores.isError && (
          <EstadoError
            error={conductores.error}
            alReintentar={() => void conductores.refetch()}
          />
        )}

        {conductores.isSuccess && (
          <>
            <div
              aria-label="Estado de conductores"
              className="mb-7 flex flex-wrap gap-3 sm:gap-4"
            >
              <div className="rounded-xl border border-[#1a3a1a] bg-[#0a1f0a] px-5 py-3">
                <p className="text-[1.3rem] font-bold leading-none text-exito">
                  {activos}
                </p>
                <p className="mt-1 text-xs text-exito/70">activos</p>
              </div>
              <div className="rounded-xl border border-[#3a1010] bg-[#1a0808] px-5 py-3">
                <p className="text-[1.3rem] font-bold leading-none text-peligro">
                  {deshabilitados}
                </p>
                <p className="mt-1 text-xs text-peligro/70">deshabilitados</p>
              </div>
              <div className="rounded-xl border border-divisor bg-tarjeta px-5 py-3">
                <p className="text-[1.3rem] font-bold leading-none text-texto-suave">
                  {lista.length}
                </p>
                <p className="mt-1 text-xs text-texto-tenue">total</p>
              </div>
            </div>

            {lista.length === 0 ? (
              <div className="rounded-2xl border border-borde bg-tarjeta px-6 py-12 text-center text-sm text-texto-tenue">
                Todavía no hay conductores registrados.
              </div>
            ) : (
              <ul className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                {lista.map((conductor) => (
                  <li key={conductor.id}>
                    <TarjetaConductor
                      conductor={conductor}
                      vehiculos={
                        vehiculos.isSuccess
                          ? vehiculos.data
                          : vehiculosVacios
                      }
                      estadoVehiculos={
                        vehiculos.isError
                          ? "error"
                          : vehiculos.isSuccess
                            ? "listo"
                            : "cargando"
                      }
                      cambiandoEstado={
                        cambiarEstado.isPending &&
                        cambiarEstado.variables?.id === conductor.id
                      }
                      alCambiarEstado={() => {
                        setMensajeExito(null);
                        cambiarEstado.mutate({
                          id: conductor.id,
                          estado: !conductor.estado,
                        });
                      }}
                      alEditar={() => {
                        setMensajeExito(null);
                        setConductorEnEdicion(conductor);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Contenedor>

      <Modal
        abierto={conductorEnEdicion !== null}
        titulo={
          conductorEnEdicion
            ? `Editar datos de ${conductorEnEdicion.nombre} ${conductorEnEdicion.apellido}`
            : ""
        }
        alCerrar={cerrarEdicion}
      >
        {conductorEnEdicion && (
          <FormularioEditarConductor
            key={conductorEnEdicion.id}
            conductor={conductorEnEdicion}
            alGuardar={(actualizado) => {
              setConductorEnEdicion(null);
              setMensajeExito(
                `Los datos de ${actualizado.nombre} ${actualizado.apellido} se actualizaron.`,
              );
            }}
            alCancelar={cerrarEdicion}
          />
        )}
      </Modal>
    </main>
  );
}
