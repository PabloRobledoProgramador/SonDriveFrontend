const CLASES_TAMANO = {
  normal: { caja: "size-12 rounded-xl", icono: "size-6" },
  pequeno: { caja: "size-8 rounded-lg", icono: "size-5" },
} as const;

// Emblema de SonDrive: el carro sobre el color de marca. Es decorativo; el nombre lo da el texto
// que lo acompaña. El icono de la pestaña (public/favicon.svg) repite este mismo dibujo.
export default function IconoMarca({
  tamano = "normal",
  className = "",
}: {
  tamano?: keyof typeof CLASES_TAMANO;
  className?: string;
}) {
  const clases = CLASES_TAMANO[tamano];

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center bg-marca text-fondo ${clases.caja} ${className}`}
    >
      <svg viewBox="0 0 24 24" className={clases.icono} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17h14M6 17l1.5-6h9L18 17M7.5 11 9 7h6l1.5 4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </svg>
    </span>
  );
}
