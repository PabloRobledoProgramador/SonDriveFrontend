import type { ErrorApi } from "../../lib/errores";
import Boton from "./Boton";

interface PropiedadesEstadoError {
  error: ErrorApi;
  alReintentar?: () => void;
}

// Mensaje común de error (siempre en español, sin textos técnicos) con opción de reintentar (FR-028)
export default function EstadoError({ error, alReintentar }: PropiedadesEstadoError) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-2xl border border-peligro/20 bg-peligro/10 px-6 py-8 text-center"
    >
      <p className="text-sm text-peligro">{error.mensaje}</p>
      {alReintentar && (
        <Boton variante="secundario" onClick={alReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}
