import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Boton from "../../../components/ui/Boton";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import EstadoVacio from "../../../components/ui/EstadoVacio";
import { useBuscarViajes } from "../consultas";
import { filtroDesdeParametros } from "../parametros";
import DetalleViajeDisponible from "./DetalleViajeDisponible";
import TarjetaViaje from "./TarjetaViaje";

export default function ResultadosViajes() {
  const [parametros, setParametros] = useSearchParams();
  const filtro = filtroDesdeParametros(parametros);
  const claveFiltro = `${filtro?.origenId ?? ""}|${filtro?.destinoId ?? ""}|${filtro?.fecha ?? ""}`;
  const [paginacion, setPaginacion] = useState({
    claveFiltro,
    pagina: 1,
  });
  const idViaje = parametros.get("viaje");
  const idViajeNumerico = idViaje ? Number(idViaje) : null;
  const idViajeValido =
    idViajeNumerico !== null &&
    Number.isSafeInteger(idViajeNumerico) &&
    idViajeNumerico > 0;
  const consulta = useBuscarViajes(idViaje === null ? filtro : null);
  const viajes = [...(consulta.data ?? [])].sort(
    (viajeA, viajeB) =>
      new Date(viajeA.fechaSalida).getTime() -
        new Date(viajeB.fechaSalida).getTime() ||
      viajeA.id - viajeB.id,
  );
  const viajesPorPagina = 3;
  const totalPaginas = Math.max(
    1,
    Math.ceil(viajes.length / viajesPorPagina),
  );
  const paginaActual =
    paginacion.claveFiltro === claveFiltro ? paginacion.pagina : 1;
  const paginaVisible = Math.min(paginaActual, totalPaginas);
  const indiceInicial = (paginaVisible - 1) * viajesPorPagina;
  const viajesVisibles = viajes.slice(
    indiceInicial,
    indiceInicial + viajesPorPagina,
  );

  const volverAResultados = () => {
    setParametros((actuales) => {
      const siguientes = new URLSearchParams(actuales);
      siguientes.delete("viaje");
      siguientes.delete("hora");
      return siguientes;
    });
  };

  if (idViaje !== null) {
    return idViajeValido ? (
      <DetalleViajeDisponible
        idViaje={idViajeNumerico}
        alVolver={volverAResultados}
      />
    ) : (
      <section className="pb-12">
        <Contenedor>
          <Boton variante="fantasma" onClick={volverAResultados}>
            ← Volver a los resultados
          </Boton>
          <p role="alert" className="mt-4 text-sm text-peligro">
            El identificador del viaje no es válido.
          </p>
        </Contenedor>
      </section>
    );
  }

  // Mientras no se haya buscado, la página de inicio se ve igual que antes
  if (!filtro) return null;

  return (
    <section aria-labelledby="titulo-resultados" className="pb-12">
      <Contenedor>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="titulo-resultados" className="text-xl font-bold text-texto">
              Viajes disponibles
            </h2>
            {consulta.isSuccess && viajes.length > 0 && (
              <p className="mt-1 text-sm text-texto-tenue">
                {viajes.length}{" "}
                {viajes.length === 1 ? "resultado" : "resultados"}
                {" · "}
                mostrando {indiceInicial + 1}–
                {Math.min(indiceInicial + viajesPorPagina, viajes.length)}
              </p>
            )}
          </div>
          {consulta.isSuccess && totalPaginas > 1 && (
            <nav
              aria-label="Paginación de viajes"
              className="flex items-center gap-2"
            >
              <Boton
                variante="secundario"
                compacto
                aria-label="Página anterior"
                disabled={paginaVisible === 1}
                onClick={() =>
                  setPaginacion({
                    claveFiltro,
                    pagina: paginaVisible - 1,
                  })
                }
              >
                ‹
              </Boton>
              <span
                aria-live="polite"
                className="min-w-12 text-center text-sm text-texto-tenue"
              >
                {paginaVisible}/{totalPaginas}
              </span>
              <Boton
                variante="secundario"
                compacto
                aria-label="Página siguiente"
                disabled={paginaVisible === totalPaginas}
                onClick={() =>
                  setPaginacion({
                    claveFiltro,
                    pagina: paginaVisible + 1,
                  })
                }
              >
                ›
              </Boton>
            </nav>
          )}
        </div>

        {consulta.isPending && <EstadoCargando texto="Buscando viajes…" />}
        {consulta.isError && (
          <EstadoError
            error={consulta.error}
            alReintentar={() => consulta.refetch()}
          />
        )}
        {consulta.isSuccess && consulta.data.length === 0 && (
          <EstadoVacio mensaje="No encontramos viajes para esa búsqueda. Prueba con otra fecha o ruta." />
        )}
        {consulta.isSuccess && consulta.data.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {viajesVisibles.map((viaje) => (
              <li key={viaje.id}>
                <TarjetaViaje
                  viaje={viaje}
                  alVerDetalle={() => {
                    setParametros((actuales) => {
                      const siguientes = new URLSearchParams(actuales);
                      siguientes.set("viaje", String(viaje.id));
                      return siguientes;
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </Contenedor>
    </section>
  );
}
