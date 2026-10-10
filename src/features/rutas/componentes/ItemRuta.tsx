import type { Ruta } from "../tipos";

const formatoPrecio = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

interface PropiedadesItemRuta {
  ruta: Ruta;
  activa: boolean;
  alElegir: () => void;
}

export default function ItemRuta({
  ruta,
  activa,
  alElegir,
}: PropiedadesItemRuta) {
  return (
    <button
      type="button"
      onClick={alElegir}
      aria-pressed={activa}
      className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-marca ${
        activa
          ? "border-marca/30 bg-marca/10"
          : "border-borde bg-tarjeta hover:bg-elevada"
      }`}
    >
      <p
        className={`mb-2 flex items-center gap-2 text-sm font-semibold ${activa ? "text-marca" : "text-texto-suave"}`}
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${activa ? "bg-marca" : "bg-borde"}`}
        />
        {ruta.ciudadOrigen} → {ruta.ciudadDestino}
      </p>
      <p className="ml-4 text-xs text-texto-tenue">
        {ruta.distanciaKm} km · {ruta.tiempoEstimado}
      </p>
      <p
        className={`ml-4 mt-1 text-sm font-semibold ${activa ? "text-marca" : "text-texto-suave"}`}
      >
        desde {formatoPrecio.format(ruta.precioBase)}
      </p>
    </button>
  );
}
