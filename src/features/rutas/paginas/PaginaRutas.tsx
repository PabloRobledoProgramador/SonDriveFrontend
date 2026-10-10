import { useState } from "react";
import Contenedor from "../../../components/ui/Contenedor";
import EstadoCargando from "../../../components/ui/EstadoCargando";
import EstadoError from "../../../components/ui/EstadoError";
import EstadoVacio from "../../../components/ui/EstadoVacio";
import Insignia from "../../../components/ui/Insignia";
import Tarjeta from "../../../components/ui/Tarjeta";
import ItemRuta from "../componentes/ItemRuta";
import MapaRuta from "../componentes/MapaRuta";
import { useRutas } from "../consultas";

export default function PaginaRutas() {
  const consulta = useRutas();
  const [idElegida, setIdElegida] = useState<number | null>(null);

  const rutas = consulta.data ?? [];
  // Si no se ha elegido ninguna (o ya no existe), se muestra la primera
  const activa = rutas.find((ruta) => ruta.id === idElegida) ?? rutas[0];

  // Municipios conectados: salen de las rutas reales, sin repetir
  const municipios = [
    ...new Set(
      rutas.flatMap((ruta) => [ruta.ciudadOrigen, ruta.ciudadDestino]),
    ),
  ];

  return (
    <main className="pb-12">
      <Contenedor className="pt-10">
        <Insignia className="mb-4">Rutas operativas</Insignia>
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">
          Rutas disponibles
        </h1>
        <p className="mb-8 max-w-lg leading-relaxed text-texto-tenue">
          Conectamos los municipios del suroeste antioqueño. Elige una ruta para
          verla en el mapa.
        </p>

        {consulta.isPending && <EstadoCargando texto="Cargando rutas…" />}
        {consulta.isError && (
          <EstadoError
            error={consulta.error}
            alReintentar={() => consulta.refetch()}
          />
        )}
        {consulta.isSuccess && rutas.length === 0 && (
          <EstadoVacio mensaje="Todavía no hay rutas disponibles." />
        )}

        {activa && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-3">
              {rutas.map((ruta) => (
                <ItemRuta
                  key={ruta.id}
                  ruta={ruta}
                  activa={ruta.id === activa.id}
                  alElegir={() => setIdElegida(ruta.id)}
                />
              ))}

              <Tarjeta className="mt-2">
                <p className="mb-3 text-xs uppercase tracking-wide text-texto-tenue">
                  Municipios conectados
                </p>
                <ul>
                  {municipios.map((municipio) => (
                    <li
                      key={municipio}
                      className="flex items-center gap-2 py-1.5 text-sm text-texto-suave"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-marca"
                      />
                      {municipio}
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            </div>

            <div className="lg:col-span-2">
              <MapaRuta ruta={activa} />
            </div>
          </div>
        )}
      </Contenedor>
    </main>
  );
}
