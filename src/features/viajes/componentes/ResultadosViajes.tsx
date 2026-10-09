import { useSearchParams } from "react-router-dom";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import EstadoVacio from "../../../components/ui/EstadoVacio";
import { useBuscarViajes } from "../consultas";
import { filtroDesdeParametros } from "../parametros";
import TarjetaViaje from "./TarjetaViaje";

export default function ResultadosViajes() {
  const [parametros] = useSearchParams();
  const filtro = filtroDesdeParametros(parametros);
  const consulta = useBuscarViajes(filtro);

  // Mientras no se haya buscado, la página de inicio se ve igual que antes
  if (!filtro) return null;

  return (
    <section aria-labelledby="titulo-resultados" className="pb-12">
      <Contenedor>
        <h2
          id="titulo-resultados"
          className="mb-4 text-xl font-bold text-texto"
        >
          Viajes disponibles
        </h2>

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
            {consulta.data.map((viaje) => (
              <li key={viaje.id}>
                <TarjetaViaje viaje={viaje} />
              </li>
            ))}
          </ul>
        )}
      </Contenedor>
    </section>
  );
}
