import Boton from "../../../components/ui/Boton";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import Insignia from "../../../components/ui/Insignia";
import Tarjeta from "../../../components/ui/Tarjeta";
import { useDetalleViaje } from "../consultas";
import { formatoFecha, formatoHora, formatoPrecio } from "../formato";
import type { PuestoViaje } from "../tipos";

const esCajuela = (puesto: PuestoViaje) =>
  puesto.tipo.toLowerCase() === "cajuela";

function MapaDisponibilidad({ puestos }: { puestos: PuestoViaje[] }) {
  const conductor = puestos.find((puesto) => puesto.esConductor);
  const asientos = puestos.filter(
    (puesto) => !puesto.esConductor && !esCajuela(puesto),
  );
  const copiloto =
    asientos.find((puesto) =>
      puesto.codigo.toLowerCase().includes("copiloto"),
    ) ?? asientos[0];
  const traseros = asientos.filter(
    (puesto) => puesto.idPuesto !== copiloto?.idPuesto,
  );
  const cajuelas = puestos.filter(esCajuela);
  const puestosLibres = asientos.filter((puesto) => !puesto.ocupado).length;

  const puestoVisual = (puesto: PuestoViaje) => (
    <div
      key={puesto.idPuesto}
      aria-label={`${puesto.codigo}, ${puesto.ocupado ? "ocupado" : "libre"}`}
      className={`flex min-h-20 flex-col items-center justify-center border-borde px-2 py-4 text-center ${
        puesto.ocupado ? "bg-elevada" : "bg-marca/10"
      }`}
    >
      <span
        className={`text-xs font-semibold ${
          puesto.ocupado ? "text-texto-apagado" : "text-marca"
        }`}
      >
        {puesto.codigo.toUpperCase()}
      </span>
      <span
        className={`mt-1 text-[0.65rem] ${
          puesto.ocupado ? "text-texto-apagado" : "text-marca/70"
        }`}
      >
        {puesto.ocupado ? "OCUPADO" : "LIBRE"}
      </span>
    </div>
  );

  return (
    <Tarjeta className="p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold">Disponibilidad de puestos</h2>
      <div className="overflow-hidden rounded-xl border border-borde text-center text-[0.68rem]">
        <div className="flex items-center justify-between border-b border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
          <span className="font-semibold">FRONTAL</span>
          <span aria-hidden="true">▲</span>
        </div>
        <div className="grid grid-cols-2 border-b border-borde">
          {conductor ? (
            <div className="flex min-h-20 flex-col items-center justify-center border-r border-borde bg-tarjeta px-2 py-4">
              <span className="text-xs font-semibold text-texto-apagado">
                {conductor.codigo.toUpperCase()}
              </span>
              <span className="mt-1 text-[0.65rem] text-texto-apagado">
                OCUPADO
              </span>
            </div>
          ) : (
            <div className="min-h-20 border-r border-borde bg-tarjeta" />
          )}
          {copiloto ? (
            puestoVisual(copiloto)
          ) : (
            <div className="min-h-20 bg-tarjeta" />
          )}
        </div>
        {traseros.length > 0 && (
          <div className="grid grid-cols-3 border-b border-borde">
            {traseros.map(puestoVisual)}
          </div>
        )}
        {cajuelas.length > 0 && (
          <>
            <div className="flex items-center justify-between border-b border-t border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
              <span className="font-semibold">CAJUELA</span>
              <span>{cajuelas.length} espacios</span>
            </div>
            <div className="grid grid-cols-4">{cajuelas.map(puestoVisual)}</div>
          </>
        )}
        <div className="flex items-center justify-between border-t border-borde bg-fondo px-3 py-1.5 text-texto-apagado">
          <span className="font-semibold">TRASERO</span>
          <span aria-hidden="true">▼</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-texto-tenue">
        <span>
          <span className="mr-1.5 inline-block size-2 rounded-full bg-marca" />
          Disponible
        </span>
        <span>
          <span className="mr-1.5 inline-block size-2 rounded-full bg-texto-apagado" />
          Ocupado
        </span>
        <span className="ml-auto font-medium text-exito">
          {puestosLibres}{" "}
          {puestosLibres === 1 ? "puesto disponible" : "puestos disponibles"}
        </span>
      </div>
    </Tarjeta>
  );
}

function telefonoWhatsApp(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length === 10) return `57${digitos}`;
  if (digitos.startsWith("57") && digitos.length === 12) return digitos;
  return null;
}

export default function DetalleViajeDisponible({
  idViaje,
  alVolver,
}: {
  idViaje: number;
  alVolver: () => void;
}) {
  const consulta = useDetalleViaje(idViaje);

  if (consulta.isPending) {
    return (
      <section className="pb-12">
        <Contenedor>
          <Boton variante="fantasma" onClick={alVolver}>
            ← Volver a los resultados
          </Boton>
          <div className="mt-6">
            <EstadoCargando texto="Cargando detalles del viaje…" />
          </div>
        </Contenedor>
      </section>
    );
  }
  if (consulta.isError) {
    return (
      <section className="pb-12">
        <Contenedor>
          <Boton variante="fantasma" onClick={alVolver}>
            ← Volver a los resultados
          </Boton>
          <div className="mt-6">
            <EstadoError
              error={consulta.error}
              alReintentar={() => consulta.refetch()}
            />
          </div>
        </Contenedor>
      </section>
    );
  }

  const viaje = consulta.data;
  const salida = new Date(viaje.fechaSalida);
  const telefono = telefonoWhatsApp(viaje.telefonoConductor);
  const mensaje = `Hola ${viaje.conductor}, quisiera reservar un puesto para el viaje ${viaje.ciudadOrigen} a ${viaje.ciudadDestino} del ${formatoFecha.format(salida)} a las ${formatoHora.format(salida)}.`;
  const enlaceWhatsApp = telefono
    ? `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
    : null;

  return (
    <section className="pb-12">
      <Contenedor>
        <Boton variante="fantasma" onClick={alVolver}>
          ← Volver a los resultados
        </Boton>

        <Tarjeta className="mt-5 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <Insignia className="mb-3">Viaje disponible</Insignia>
            <h1 className="text-3xl font-bold md:text-4xl">
              {viaje.ciudadOrigen}{" "}
              <span className="text-marca">→</span>{" "}
              {viaje.ciudadDestino}
            </h1>
            <p className="mt-2 text-sm capitalize text-texto-tenue">
              {formatoFecha.format(salida)} · {formatoHora.format(salida)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="text-right">
              <p className="font-titulo text-3xl font-bold text-marca">
                {formatoPrecio.format(viaje.precio)}
              </p>
              <p className="text-xs text-texto-tenue">por puesto</p>
            </div>
            <Insignia tono="exito">
              {viaje.cuposLibres}{" "}
              {viaje.cuposLibres === 1 ? "cupo" : "cupos"}
            </Insignia>
            <Insignia tono="marca">
              {viaje.cajuelasLibres}{" "}
              {viaje.cajuelasLibres === 1 ? "cajuela" : "cajuelas"}
            </Insignia>
          </div>
        </Tarjeta>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <MapaDisponibilidad puestos={viaje.puestos} />

          <div className="flex flex-col gap-4">
            <Tarjeta className="p-5 md:p-6">
              <h2 className="mb-4 text-lg font-semibold">Conductor</h2>
              <div className="mb-5 flex items-center gap-3">
                {viaje.fotoConductor ? (
                  <img
                    src={viaje.fotoConductor}
                    alt=""
                    className="size-14 rounded-xl border border-borde object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-xl border border-borde bg-elevada text-lg font-semibold text-texto-suave"
                  >
                    {viaje.conductor.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-texto">{viaje.conductor}</p>
                  <p className="text-sm text-texto-tenue">
                    Conductor de SonDrive
                  </p>
                </div>
              </div>
              <dl className="divide-y divide-divisor text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-texto-tenue">Vehículo</dt>
                  <dd className="text-right text-texto">
                    {viaje.nombreVehiculo}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-texto-tenue">Placa</dt>
                  <dd className="text-right text-texto">{viaje.placa}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-texto-tenue">Teléfono</dt>
                  <dd className="text-right text-texto">
                    {viaje.telefonoConductor}
                  </dd>
                </div>
              </dl>
            </Tarjeta>

            {enlaceWhatsApp ? (
              <a
                href={enlaceWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-whatsapp/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 fill-current"
                >
                  <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.94c0 2.1.55 4.16 1.6 5.97L.05 24l6.25-1.64a11.93 11.93 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.94a11.85 11.85 0 0 0-3.5-8.41ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.9 9.9 0 0 1-1.52-5.25c0-5.79 4.71-10.5 10.5-10.5a10.43 10.43 0 0 1 7.43 3.08 10.43 10.43 0 0 1 3.07 7.43c0 5.79-4.71 10.5-10.5 10.5Zm5.76-7.86c-.31-.16-1.83-.9-2.12-1-.28-.11-.49-.16-.7.16-.2.31-.8 1-1 1.21-.18.21-.36.24-.67.08-.31-.15-1.32-.48-2.52-1.53-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.3-.52.11-.21.06-.39-.02-.55-.08-.15-.7-1.68-.96-2.3-.25-.6-.51-.51-.7-.52h-.6c-.2 0-.54.08-.82.39-.28.31-1.07 1.05-1.07 2.57s1.1 2.98 1.25 3.19c.16.2 2.16 3.3 5.23 4.62.73.32 1.3.51 1.74.65.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.73.26-1.35.18-1.47-.08-.13-.28-.21-.59-.37Z" />
                </svg>
                Reservar por WhatsApp
              </a>
            ) : (
              <p role="alert" className="text-sm text-aviso">
                El conductor no tiene un teléfono disponible para reservar por
                WhatsApp.
              </p>
            )}

            <div className="rounded-xl border border-info/20 bg-info/10 px-4 py-3 text-sm leading-relaxed text-info">
              Confirma la disponibilidad con el conductor antes del viaje. El
              pago se realiza en efectivo directamente al conductor.
            </div>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
