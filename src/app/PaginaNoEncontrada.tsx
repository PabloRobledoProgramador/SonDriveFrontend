import { Link } from "react-router-dom";
import Contenedor from "../components/ui/Contenedor";
import { clasesBoton } from "../components/ui/estilosBoton";

// Dirección inexistente dentro del sitio (FR-021)
export default function PaginaNoEncontrada() {
  return (
    <main className="py-20">
      <Contenedor className="flex flex-col items-center text-center">
        <p className="mb-2 font-titulo text-5xl font-bold text-marca">404</p>
        <h1 className="mb-3 text-2xl font-bold">Página no encontrada</h1>
        <p className="mb-8 max-w-md text-sm text-texto-tenue">
          La dirección que buscas no existe o cambió de lugar.
        </p>
        <Link to="/" className={clasesBoton("principal")}>
          Volver al inicio
        </Link>
      </Contenedor>
    </main>
  );
}
