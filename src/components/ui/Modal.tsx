import { useEffect, useId, useRef, type ReactNode } from "react";
import Boton from "./Boton";
import Tarjeta from "./Tarjeta";

interface PropiedadesModal {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  // "amplio" para formularios de dos columnas
  ancho?: "normal" | "amplio";
  children: ReactNode;
}

const CLASES_ANCHO = {
  normal: "max-w-md",
  amplio: "max-w-2xl",
} as const;

// Ventana flotante accesible: se cierra con Escape o con su botón y recibe el foco al abrirse
export default function Modal({
  abierto,
  titulo,
  alCerrar,
  ancho = "normal",
  children,
}: PropiedadesModal) {
  const idTitulo = useId();
  const refDialogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    // Foco inicial: el primer campo habilitado del contenido o, si no hay, el propio diálogo
    const dialogo = refDialogo.current;
    const primerEnfocable = dialogo?.querySelector<HTMLElement>(
      "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not([data-cerrar]):not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
    );
    (primerEnfocable ?? dialogo)?.focus();

    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") alCerrar();
    };
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fondo/80 p-4 sm:items-center">
      <Tarjeta
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`max-h-[90vh] w-full overflow-y-auto outline-none ${CLASES_ANCHO[ancho]}`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <Boton variante="fantasma" compacto data-cerrar onClick={alCerrar}>
            Cerrar
          </Boton>
        </div>
        {children}
      </Tarjeta>
    </div>
  );
}
