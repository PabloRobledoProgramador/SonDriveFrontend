export default function Home() {
  return (
    <main>
      <section className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-marca/20 bg-marca/10 px-3 py-1 text-xs font-medium text-marca">
              <span className="size-1.5 rounded-full bg-marca" />
              Suroeste Antioqueño · Viajes compartidos
            </span>

            <h1 className="mb-4 text-4xl font-bold leading-tight text-texto md:text-6xl">
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
