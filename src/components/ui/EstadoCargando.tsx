// Indicador común mientras se espera información del servidor
export default function EstadoCargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 px-4 py-12 text-sm text-texto-tenue">
      <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca" />
      <span>{texto}</span>
    </div>
  );
}
