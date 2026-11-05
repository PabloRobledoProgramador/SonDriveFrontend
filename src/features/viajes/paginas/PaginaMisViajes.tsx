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
import { useSesion } from "../../autenticacion";
import DetalleViaje from "../componentes/DetalleViaje";
import EditorDisponibilidadPuestos from "../componentes/EditorDisponibilidadPuestos";
import FormularioCrearViaje from "../componentes/FormularioCrearViaje";
import FormularioEditarViaje from "../componentes/FormularioEditarViaje";
import TarjetaMiViaje from "../componentes/TarjetaMiViaje";
import { useEliminarViaje, useMisViajes } from "../consultas";
import type { ViajeResumen } from "../tipos";

// Próximos viajes del conductor con sesión (el backend ya los devuelve ordenados por salida)
export default function PaginaMisViajes() {
  const { usuario } = useSesion();
  const consulta = useMisViajes(usuario?.id);
  const eliminarViaje = useEliminarViaje();
  const viajes = consulta.data ?? [];

  const [creando, setCreando] = useState(false);
  const [idDetalle, setIdDetalle] = useState<number | null>(null);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [idConfirmandoCancelacion, setIdConfirmandoCancelacion] = useState<
    number | null
  >(null);
  const [publicado, setPublicado] = useState<ViajeResumen | null>(null);
  const [viajeCancelado, setViajeCancelado] = useState<string | null>(null);

  const cerrarDetalle = useCallback(() => setIdDetalle(null), []);

  const alCrear = (viaje: ViajeResumen) => {
    setCreando(false);
    setPublicado(viaje);
  };

  const confirmarCancelacion = (viaje: ViajeResumen) => {
    eliminarViaje.mutate(viaje.id, {
      onSuccess: () => {
        setIdConfirmandoCancelacion(null);
        setIdEditando(null);
        setViajeCancelado(
          `${viaje.ciudadOrigen} → ${viaje.ciudadDestino}`,
        );
      },
    });
  };

  return (
    <main className="pb-12">
      <Contenedor className="pt-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Insignia className="mb-4">Panel del conductor</Insignia>
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Mis viajes</h1>
            {usuario && consulta.isSuccess && (
              <p className="text-sm text-texto-tenue">
                {usuario.nombre} {usuario.apellido} · {viajes.length}{" "}
                {viajes.length === 1
                  ? "viaje programado"
                  : "viajes programados"}
              </p>
            )}
          </div>
          <Boton
            onClick={() => {
              setCreando((abierto) => !abierto);
              setIdEditando(null);
              setIdConfirmandoCancelacion(null);
              setPublicado(null);
            }}
            aria-expanded={creando}
          >
            {creando ? "Cerrar" : "Crear viaje"}
          </Boton>
        </div>

        {publicado && (
          <div className="mb-6">
            <Aviso tipo="exito" alCerrar={() => setPublicado(null)}>
              Viaje {publicado.ciudadOrigen} → {publicado.ciudadDestino}{" "}
              publicado.
            </Aviso>
          </div>
        )}
        {viajeCancelado && (
          <div className="mb-6">
            <Aviso tipo="exito" alCerrar={() => setViajeCancelado(null)}>
              Viaje {viajeCancelado} cancelado.
            </Aviso>
          </div>
        )}

        {creando && (
          <Tarjeta className="mb-6 border-marca/30 p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-marca">Nuevo viaje</h2>
              <Boton
                variante="fantasma"
                compacto
                onClick={() => setCreando(false)}
              >
                Cerrar
              </Boton>
            </div>
            <FormularioCrearViaje alCrear={alCrear} />
          </Tarjeta>
        )}

        {consulta.isPending && <EstadoCargando texto="Cargando tus viajes…" />}
        {consulta.isError && (
          <EstadoError
            error={consulta.error}
            alReintentar={() => consulta.refetch()}
          />
        )}
        {consulta.isSuccess && viajes.length === 0 && (
          <EstadoVacio mensaje="No tienes viajes programados." />
        )}
        {viajes.length > 0 && (
          <ul className="flex flex-col gap-4">
            {viajes.map((viaje) => (
              <li key={viaje.id}>
                <TarjetaMiViaje
                  viaje={viaje}
                  alVerDetalle={() => {
                    setIdEditando(null);
                    setIdDetalle(viaje.id);
                  }}
                  alEditar={() => {
                    setCreando(false);
                    setIdConfirmandoCancelacion(null);
                    setIdEditando((idActual) =>
                      idActual === viaje.id ? null : viaje.id,
                    );
                  }}
                  alCancelar={() => {
                    setCreando(false);
                    setIdEditando(null);
                    setIdConfirmandoCancelacion(viaje.id);
                  }}
                  editando={idEditando === viaje.id}
                  confirmandoCancelacion={
                    idConfirmandoCancelacion === viaje.id
                  }
                  cancelando={
                    eliminarViaje.isPending &&
                    eliminarViaje.variables === viaje.id
                  }
                  errorCancelacion={
                    eliminarViaje.isError &&
                    eliminarViaje.variables === viaje.id
                      ? eliminarViaje.error.mensaje
                      : undefined
                  }
                  alConfirmarCancelacion={() => confirmarCancelacion(viaje)}
                  alMantenerViaje={() => {
                    setIdConfirmandoCancelacion(null);
                    eliminarViaje.reset();
                  }}
                />
                {idEditando === viaje.id && (
                  <div className="-mt-4 rounded-b-2xl border-x border-b border-borde bg-tarjeta">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:items-start">
                      <EditorDisponibilidadPuestos idViaje={viaje.id} />
                      <FormularioEditarViaje
                        viaje={viaje}
                        alGuardar={() => setIdEditando(null)}
                        alCancelar={() => setIdEditando(null)}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Contenedor>

      <Modal
        abierto={idDetalle !== null}
        titulo="Detalles del viaje"
        alCerrar={cerrarDetalle}
      >
        {idDetalle !== null && <DetalleViaje idViaje={idDetalle} />}
      </Modal>
    </main>
  );
}
