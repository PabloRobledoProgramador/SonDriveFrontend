import type { ReactNode } from "react";

type TipoAviso = "info" | "exito" | "error";

const estilosTipo: Record<TipoAviso, string> = {
  info: "border-marca/20 bg-marca/10 text-marca",
  exito: "border-exito/20 bg-exito/10 text-exito",
  error: "border-peligro/20 bg-peligro/10 text-peligro",
};

interface PropiedadesAviso {
  tipo?: TipoAviso;
  children: ReactNode;
  alCerrar?: () => void;
}

// Mensaje destacado. Los errores se anuncian de inmediato (alert); el resto con cortesía (status).
export default function Aviso({ tipo = "info", children, alCerrar }: PropiedadesAviso) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${estilosTipo[tipo]}`}
    >
      <span>{children}</span>
      {alCerrar && (
        <button
          type="button"
          onClick={alCerrar}
          className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-medium opacity-80 hover:opacity-100"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
