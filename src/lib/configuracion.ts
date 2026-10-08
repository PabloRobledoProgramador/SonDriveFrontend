// Configuración del entorno. La dirección de la API viene de VITE_URL_API (archivos .env).

export function obtenerUrlApi(): string {
  const url: string | undefined = import.meta.env.VITE_URL_API;
  if (!url) {
    throw new Error("Falta configurar VITE_URL_API en el archivo .env");
  }
  return url.replace(/\/+$/, "");
}
