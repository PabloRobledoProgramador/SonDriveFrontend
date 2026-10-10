import type { Ruta } from "./tipos";

// Si defines VITE_GOOGLE_MAPS_API_KEY se usa la Embed API oficial de Google Maps (con llave).
// Sin llave se usa el mapa incrustable público, que no requiere configuración.
const LLAVE_GOOGLE: string | undefined = import.meta.env
  .VITE_GOOGLE_MAPS_API_KEY;

const lugar = (nombre: string) => `${nombre}, Antioquia, Colombia`;

export function urlMapaRuta(
  ruta: Pick<Ruta, "ciudadOrigen" | "ciudadDestino">,
): string {
  const origen = lugar(ruta.ciudadOrigen);
  const destino = lugar(ruta.ciudadDestino);

  if (LLAVE_GOOGLE) {
    const consulta = new URLSearchParams({
      key: LLAVE_GOOGLE,
      origin: origen,
      destination: destino,
      mode: "driving",
    });
    return `https://www.google.com/maps/embed/v1/directions?${consulta}`;
  }

  const consulta = new URLSearchParams({
    saddr: origen,
    daddr: destino,
    output: "embed",
  });
  return `https://maps.google.com/maps?${consulta}`;
}
