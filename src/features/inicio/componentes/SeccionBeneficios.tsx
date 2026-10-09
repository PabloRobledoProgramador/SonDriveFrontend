import Contenedor from "../../../components/ui/Contenedor";
import Tarjeta from "../../../components/ui/Tarjeta";

const beneficios = [
  {
    icono: "🛡️",
    titulo: "Conductores verificados",
    descripcion:
      "Todos nuestros taxistas tienen licencia vigente y vehículo en perfecto estado.",
  },
  {
    icono: "⚡",
    titulo: "Reserva en segundos",
    descripcion:
      "Elige tu puesto, confirma con el conductor por WhatsApp y listo.",
  },
  {
    icono: "💰",
    titulo: "Tarifas fijas",
    descripcion: "Sin sorpresas. El precio que ves es el precio que pagas.",
  },
];

export default function SeccionBeneficios() {
  return (
    <section className="pb-4">
      <Contenedor className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {beneficios.map((beneficio) => (
          <Tarjeta key={beneficio.titulo}>
            <div aria-hidden="true" className="mb-3 text-2xl">
              {beneficio.icono}
            </div>
            <h3 className="mb-2 text-base font-semibold text-texto">
              {beneficio.titulo}
            </h3>
            <p className="text-sm leading-relaxed text-texto-tenue">
              {beneficio.descripcion}
            </p>
          </Tarjeta>
        ))}
      </Contenedor>
    </section>
  );
}
