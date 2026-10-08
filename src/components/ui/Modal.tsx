import { useEffect, useId, useRef, type ReactNode } from "react";

interface PropiedadesModal {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
}

// Ventana flotante accesible: se cierra con Escape o con su botón y recibe el foco al abrirse
export default function Modal({ abierto, titulo, alCerrar, children }: PropiedadesModal) {
  const idTitulo = useId();
  const refDialogo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    // Foco inicial: el primer campo del contenido o, si no hay, el propio diálogo
    const dialogo = refDialogo.current;
    const primerEnfocable = dialogo?.querySelector<HTMLElement>(
      "input, select, textarea, button:not([data-cerrar]), [href], [tabindex]:not([tabindex='-1'])",
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
      <div
        ref={refDialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-borde bg-tarjeta p-6 outline-none"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={idTitulo} className="text-lg font-semibold text-texto">
            {titulo}
          </h2>
          <button
            type="button"
            data-cerrar
            onClick={alCerrar}
            className="min-h-11 rounded-lg px-3 text-sm text-texto-suave transition-colors hover:bg-divisor hover:text-marca"
          >
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
