import Tarjeta from "../../../components/ui/Tarjeta";
import { urlMapaRuta } from "../mapa";
import type { Ruta } from "../tipos";

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function MapaRuta({ ruta }: { ruta: Ruta }) {
  const nombre = `${ruta.ciudadOrigen} → ${ruta.ciudadDestino}`;

  return (
    <div>
      <Tarjeta className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-divisor p-4">
          <div>
            <p className="font-semibold text-texto">{nombre}</p>
            <p className="text-sm text-texto-tenue">
              {ruta.distanciaKm} km · {ruta.tiempoEstimado}
            </p>
          </div>
          <span className="rounded-lg bg-marca/10 px-3 py-1.5 text-xs font-semibold text-marca">
            desde {formatoPrecio.format(ruta.precioBase)}
          </span>
        </div>

        <iframe
          key={ruta.id}
          src={urlMapaRuta(ruta)}
          title={`Mapa de la ruta ${nombre}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[360px] w-full border-0 md:h-[420px]"
          style={{
            filter:
              "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)",
          }}
        />
      </Tarjeta>

      <p className="mt-3 text-center text-xs text-texto-tenue">
        Mapa proporcionado por Google Maps · Los tiempos son estimados y pueden
        variar según el tráfico
      </p>
    </div>
  );
}
