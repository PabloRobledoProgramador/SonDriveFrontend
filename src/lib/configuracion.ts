// Configuración del entorno. La dirección de la API viene de VITE_API_URL o VITE_URL_API
export function obtenerUrlApi(): string {
  const url =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_URL_API ||
    "https://sondrive-api-aka5bfgsh8g9bjfd.mexicocentral-01.azurewebsites.net";

  if (!url) {
    throw new Error("Falta configurar VITE_API_URL en el archivo .env");
  }

  return url.replace(/\/+$/, "");
}
