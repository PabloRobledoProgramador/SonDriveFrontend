import { Link } from "react-router-dom";
import Boton from "../../../components/ui/Boton";
import Tarjeta from "../../../components/ui/Tarjeta";
import FormularioRegistro from "../componentes/FormularioRegistro";

export default function PaginaRegistro() {
  return (
    <main className="flex justify-center px-4 py-10 md:py-16">
      <div className="flex w-full max-w-lg flex-col items-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-marca text-fondo">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M5 17h14M6 17l1.5-6h9L18 17M7.5 11 9 7h6l1.5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="17" r="1.5" />
            <circle cx="16" cy="17" r="1.5" />
          </svg>
        </span>
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-6 text-center text-sm text-texto-tenue">
          Regístrate en SonDrive como conductor
        </p>

        <Tarjeta className="w-full">
          <FormularioRegistro />
        </Tarjeta>

        <p className="mt-5 text-center text-sm text-texto-tenue">
          ¿Ya tienes una cuenta?
        </p>
        <Link to="/iniciar-sesion" className="mt-2 w-full">
          <Boton variante="secundario" anchoCompleto>
            Iniciar sesión
          </Boton>
        </Link>
      </div>
    </main>
  );
}
