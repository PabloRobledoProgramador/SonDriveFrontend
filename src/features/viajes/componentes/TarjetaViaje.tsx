import Boton from "../../../components/ui/Boton";
import Insignia from "../../../components/ui/Insignia";
import Tarjeta from "../../../components/ui/Tarjeta";
import {
  formatoFecha,
  formatoHora,
  formatoPrecio,
  textoCupos,
  tonoCupos,
} from "../formato";
import type { ViajeResumen } from "../tipos";

export default function TarjetaViaje({
  viaje,
  alVerDetalle,
}: {
  viaje: ViajeResumen;
  alVerDetalle: () => void;
}) {
  const salida = new Date(viaje.fechaSalida);

  return (
    <Tarjeta className="flex flex-col gap-4">
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

      <div className="flex items-center gap-3 border-t border-divisor pt-4">
        {viaje.fotoConductor ? (
          <img
            src={viaje.fotoConductor}
            alt=""
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-elevada text-sm font-semibold text-texto-suave"
          >
            {viaje.conductor.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-texto">
            {viaje.conductor}
          </p>
          <p className="text-xs text-texto-tenue">
            {viaje.cajuelasLibres === 1
              ? "1 cajuela libre"
              : `${viaje.cajuelasLibres} cajuelas libres`}
          </p>
        </div>
        <Insignia tono={tonoCupos(viaje.cuposLibres)}>
          {textoCupos(viaje.cuposLibres)}
        </Insignia>
      </div>
      <div className="flex justify-end border-t border-divisor pt-3">
        <Boton variante="fantasma" compacto onClick={alVerDetalle}>
          Ver detalles →
        </Boton>
      </div>
    </Tarjeta>
  );
}
