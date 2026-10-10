import Boton from "../../../components/ui/Boton";
import Insignia from "../../../components/ui/Insignia";
import Tarjeta from "../../../components/ui/Tarjeta";
import type { ReactNode } from "react";
import {
  formatoFecha,
  formatoHora,
  formatoPrecio,
  textoCupos,
  tonoCupos,
} from "../formato";
import type { ViajeResumen } from "../tipos";

interface PropiedadesTarjetaMiViaje {
  viaje: ViajeResumen;
  alVerDetalle: () => void;
  alEditar: () => void;
  alCancelar: () => void;
  editando: boolean;
  confirmandoCancelacion: boolean;
  cancelando: boolean;
  errorCancelacion?: string;
  alConfirmarCancelacion: () => void;
  alMantenerViaje: () => void;
  children?: ReactNode;
}

// Fila de un viaje del conductor en la página "Mis viajes"
export default function TarjetaMiViaje({
  viaje,
  alVerDetalle,
  alEditar,
  alCancelar,
  editando,
  confirmandoCancelacion,
  cancelando,
  errorCancelacion,
  alConfirmarCancelacion,
  alMantenerViaje,
  children,
}: PropiedadesTarjetaMiViaje) {
  const salida = new Date(viaje.fechaSalida);

  return (
    <Tarjeta sinRelleno className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-base font-semibold text-texto">
            {viaje.ciudadOrigen} <span className="text-marca">→</span>{" "}
            {viaje.ciudadDestino}
          </p>
          <p className="mt-1 text-sm capitalize text-texto-tenue">
            {formatoFecha.format(salida)} ·{" "}
            <span className="text-texto-suave">
              {formatoHora.format(salida)}
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-marca">
              {formatoPrecio.format(viaje.precio)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Insignia tono={tonoCupos(viaje.cuposLibres)}>
            {textoCupos(viaje.cuposLibres)}{" "}
            {viaje.cuposLibres === 1 ? "libre" : "libres"}
          </Insignia>
          <Insignia tono="marca">
            {viaje.cajuelasLibres === 1
              ? "1 cajuela"
              : `${viaje.cajuelasLibres} cajuelas`}
          </Insignia>
          <Boton
            variante="secundario"
            compacto
            onClick={alEditar}
            aria-expanded={editando}
          >
            {editando ? "Cerrar edición" : "Editar"}
          </Boton>
          <Boton
            variante="secundario"
            compacto
            onClick={alCancelar}
            aria-label={`Cancelar viaje ${viaje.ciudadOrigen} a ${viaje.ciudadDestino}`}
            className="border-peligro/20 text-peligro hover:border-peligro hover:text-peligro"
          >
            Cancelar viaje
          </Boton>
          <Boton
            variante="fantasma"
            compacto
            onClick={alVerDetalle}
            aria-label={`Ver detalles del viaje ${viaje.ciudadOrigen} a ${viaje.ciudadDestino}`}
          >
            Ver detalles
          </Boton>
        </div>
      </div>

      {confirmandoCancelacion && (
        <div className="border-t border-peligro/20 bg-peligro/5 px-4 py-4 sm:px-5">
          <p className="mb-3 text-sm text-peligro">
            ¿Cancelar este viaje? Esta acción no se puede deshacer.
          </p>
          {errorCancelacion && (
            <p role="alert" className="mb-3 text-sm text-peligro">
              {errorCancelacion}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Boton
              variante="secundario"
              compacto
              disabled={cancelando}
              onClick={alMantenerViaje}
            >
              Mantener viaje
            </Boton>
            <Boton
              compacto
              cargando={cancelando}
              textoCargando="Cancelando…"
              className="bg-peligro font-semibold text-fondo hover:bg-peligro/80"
              onClick={alConfirmarCancelacion}
            >
              Sí, cancelar viaje
            </Boton>
          </div>
        </div>
      )}

      {children}
    </Tarjeta>
  );
}
