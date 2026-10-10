import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import Insignia from "../../../components/ui/Insignia";
import { useDetalleViaje, useOcupacionesViaje } from "../consultas";
import { formatoFecha, formatoHora, formatoPrecio } from "../formato";
import type { PuestoViaje } from "../tipos";

const esCajuela = (puesto: PuestoViaje) =>
  puesto.tipo.toLowerCase() === "cajuela";

function ChipsPuestos({
  titulo,
  puestos,
}: {
  titulo: string;
  puestos: PuestoViaje[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-texto-tenue">
        {titulo}
      </p>
      <ul className="flex flex-wrap gap-2">
        {puestos.map((puesto) => (
          <li key={puesto.idPuesto}>
            <Insignia tono={puesto.ocupado ? "peligro" : "exito"}>
              {puesto.codigo} · {puesto.ocupado ? "Ocupado" : "Libre"}
            </Insignia>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Contenido del modal de detalles: datos del viaje, puestos y pasajeros registrados
export default function DetalleViaje({ idViaje }: { idViaje: number }) {
  const detalle = useDetalleViaje(idViaje);
  const ocupaciones = useOcupacionesViaje(idViaje);

  if (detalle.isPending) return <EstadoCargando texto="Cargando detalles…" />;
  if (detalle.isError)
    return (
      <EstadoError
        error={detalle.error}
        alReintentar={() => detalle.refetch()}
      />
    );

  const viaje = detalle.data;
  const salida = new Date(viaje.fechaSalida);
  // El puesto del conductor siempre va ocupado; no se muestra
  const cupos = viaje.puestos.filter(
    (puesto) => !puesto.esConductor && !esCajuela(puesto),
  );
  const cajuelas = viaje.puestos.filter(esCajuela);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-texto">
            {viaje.ciudadOrigen} <span className="text-marca">→</span>{" "}
            {viaje.ciudadDestino}
          </p>
          <p className="mt-1 text-sm capitalize text-texto-tenue">
            {formatoFecha.format(salida)} ·{" "}
            <span className="text-texto-suave">
              {formatoHora.format(salida)}
            </span>
          </p>
        </div>
        <p className="font-titulo text-xl font-bold text-marca">
          {formatoPrecio.format(viaje.precio)}
        </p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-texto-tenue">Vehículo</dt>
        <dd className="text-texto">
          {viaje.nombreVehiculo} · {viaje.placa}
        </dd>
        <dt className="text-texto-tenue">Conductor</dt>
        <dd className="text-texto">{viaje.conductor}</dd>
        <dt className="text-texto-tenue">Teléfono</dt>
        <dd className="text-texto">{viaje.telefonoConductor}</dd>
      </dl>

      <ChipsPuestos titulo="Puestos" puestos={cupos} />
      {cajuelas.length > 0 && (
        <ChipsPuestos titulo="Cajuelas" puestos={cajuelas} />
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-texto-tenue">
          Pasajeros registrados
        </p>
        {ocupaciones.isPending && (
          <EstadoCargando texto="Cargando pasajeros…" />
        )}
        {ocupaciones.isError && (
          <EstadoError
            error={ocupaciones.error}
            alReintentar={() => ocupaciones.refetch()}
          />
        )}
        {ocupaciones.isSuccess && ocupaciones.data.length === 0 && (
          <p className="text-sm text-texto-tenue">
            Aún no hay pasajeros registrados.
          </p>
        )}
        {ocupaciones.isSuccess && ocupaciones.data.length > 0 && (
          <ul className="flex flex-col gap-2">
            {ocupaciones.data.map((ocupacion) => (
              <li
                key={ocupacion.id}
                className="rounded-xl border border-borde bg-elevada p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-texto">
                    {ocupacion.pasajero.nombreCompleto}
                  </span>
                  <span className="text-xs font-semibold text-marca">
                    {ocupacion.codigo}
                  </span>
                </div>
                <p className="mt-1 text-xs text-texto-tenue">
                  {ocupacion.pasajero.celular}
                </p>
                {ocupacion.pasajero.direccion && (
                  <p className="text-xs text-texto-tenue">
                    {ocupacion.pasajero.direccion}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
