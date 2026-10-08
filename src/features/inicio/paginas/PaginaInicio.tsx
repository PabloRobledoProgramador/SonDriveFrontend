export default function PaginaInicio() {
  return (
    <main>
      <section className="px-4 pb-20 pt-12 md:px-6 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-marca/20 bg-marca/10 px-3 py-1 text-xs font-medium text-marca">
              <span className="size-1.5 rounded-full bg-marca" />
              Suroeste Antioqueño · Viajes compartidos
            </span>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-texto sm:text-4xl md:text-6xl">
              Tu ruta, <span className="text-marca">tu hora,</span>
              <br />
              tu precio.
            </h1>

            <p className="max-w-md leading-relaxed text-texto-tenue">
              Encuentra cupos disponibles en taxis intermunicipales entre
              Sonsón, La Unión, Rionegro, La Ceja y Medellín.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
