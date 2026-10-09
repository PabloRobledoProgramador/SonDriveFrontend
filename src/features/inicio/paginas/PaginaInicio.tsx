import imagenHero from "../../../assets/sonson-2.jpg";
import Contenedor from "../../../components/ui/Contenedor";
import Insignia from "../../../components/ui/Insignia";
import SeccionBeneficios from "../componentes/SeccionBeneficios";
import SeccionQuienesSomos from "../componentes/SeccionQuienesSomos";

export default function PaginaInicio() {
  return (
    <main>
      <section className="relative overflow-hidden pb-12 pt-12 md:pt-16">
        <img
          src={imagenHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-fondo/80 md:bg-transparent md:bg-linear-to-r md:from-fondo md:via-fondo/80 md:to-fondo/30"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-fondo to-transparent"
        />

        <Contenedor className="relative">
          <div className="max-w-2xl">
            <Insignia className="mb-6">
              <span className="size-1.5 rounded-full bg-marca" />
              Suroeste Antioqueño · Viajes compartidos
            </Insignia>

            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
              Tu ruta, <span className="text-marca">tu hora,</span>
              <br />
              tu precio.
            </h1>

            <p className="max-w-md leading-relaxed text-texto-tenue">
              Encuentra cupos disponibles en taxis intermunicipales entre
              Sonsón, La Unión, Rionegro, La Ceja y Medellín.
            </p>
          </div>
        </Contenedor>
      </section>

      <SeccionBeneficios />
      <SeccionQuienesSomos />
    </main>
  );
}
