import { Link } from "react-router-dom";
import { clasesBoton } from "../components/ui/estilosBoton";

// Dirección inexistente dentro del sitio (FR-021)
export default function PaginaNoEncontrada() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:px-6">
      <p className="mb-2 font-titulo text-5xl font-bold text-marca">404</p>
      <h1 className="mb-3 text-2xl font-bold text-texto">Página no encontrada</h1>
      <p className="mb-8 max-w-md text-sm text-texto-tenue">
        La dirección que buscas no existe o cambió de lugar.
      </p>
      <Link to="/" className={clasesBoton("principal")}>
        Volver al inicio
      </Link>
    </main>
  );
}
