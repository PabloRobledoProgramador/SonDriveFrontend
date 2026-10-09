import Contenedor from "../../../components/ui/Contenedor";
import Insignia from "../../../components/ui/Insignia";

const garantias = [
  "SOAT y revisión técnico-mecánica al día",
  "Precios fijos acordados con cada municipio",
  "Historial de viajes y calificaciones reales",
];

export default function SeccionQuienesSomos() {
  return (
    <section className="py-24">
      <Contenedor>
        <div className="mb-14">
          <Insignia>
            <span className="size-1.5 rounded-full bg-marca" />
            Quiénes somos
          </Insignia>
          <h2 className="mb-5 mt-5 max-w-2xl text-3xl font-bold leading-tight text-texto md:text-5xl">
            Conectamos el suroeste antioqueño,{" "}
            <span className="text-marca">un viaje a la vez.</span>
          </h2>
          <p className="max-w-xl leading-7 text-texto-tenue">
            SonDrive nació en Sonsón para resolver lo que siempre fue un
            inconveniente: saber cuándo sale el próximo taxi, si hay cupo, y a
            qué precio. Hoy conectamos cinco municipios con conductores de
            confianza, tarifas transparentes y reservas desde el celular.
          </p>
        </div>

        <div className="max-w-xl">
          <h3 className="mb-4 text-2xl font-semibold text-texto">
            Rutas que conocemos, conductores que responden
          </h3>
          <p className="mb-4 leading-7 text-texto-tenue">
            Cada conductor en SonDrive tiene su licencia vigente, su vehículo en
            regla y años de experiencia en las carreteras del oriente
            antioqueño. No tercerizamos: conocemos a cada uno por nombre.
          </p>
          <p className="mb-6 leading-7 text-texto-tenue">
            La plataforma muestra en tiempo real los cupos disponibles, el
            precio exacto y el contacto directo con el conductor — sin
            intermediarios, sin sorpresas.
          </p>
          <ul className="flex flex-col gap-3">
            {garantias.map((garantia) => (
              <li
                key={garantia}
                className="flex items-center gap-3 text-sm text-texto-suave"
              >
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-marca/10 text-xs text-marca"
                >
                  ✓
                </span>
                {garantia}
              </li>
            ))}
          </ul>
        </div>
      </Contenedor>
    </section>
  );
}
