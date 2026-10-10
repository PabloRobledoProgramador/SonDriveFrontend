// Formatos de precio, fecha y cupos compartidos por las tarjetas y listas de viajes
export const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
export const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
export const formatoHora = new Intl.DateTimeFormat("es-CO", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function tonoCupos(cupos: number) {
  if (cupos <= 0) return "peligro";
  if (cupos === 1) return "aviso";
  return "exito";
}

export function textoCupos(cupos: number) {
  if (cupos <= 0) return "Sin cupos";
  return cupos === 1 ? "1 cupo" : `${cupos} cupos`;
}
