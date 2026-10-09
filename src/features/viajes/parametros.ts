import type { FiltroViaje } from "./tipos";

// La búsqueda vive en la URL (/?origen=1&destino=3&fecha=2026-10-15): se puede compartir,
// el botón "atrás" funciona y al recargar no se pierde.
export function filtroDesdeParametros(
  parametros: URLSearchParams,
): FiltroViaje | null {
  const origenId = parametros.get("origen");
  const destinoId = parametros.get("destino");
  if (!origenId || !destinoId) return null;
  return { origenId, destinoId, fecha: parametros.get("fecha") || undefined };
}

export function parametrosDesdeFiltro(filtro: FiltroViaje): URLSearchParams {
  const parametros = new URLSearchParams({
    origen: filtro.origenId,
    destino: filtro.destinoId,
  });
  if (filtro.fecha) parametros.set("fecha", filtro.fecha);
  return parametros;
}
