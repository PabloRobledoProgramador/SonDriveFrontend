import { Link } from "react-router-dom";
import IconoMarca from "../../../components/ui/IconoMarca";
import Boton from "../../../components/ui/Boton";
import Tarjeta from "../../../components/ui/Tarjeta";
import FormularioRegistro from "../componentes/FormularioRegistro";

export default function PaginaRegistro() {
  return (
    <main className="flex justify-center px-4 py-10 md:py-16">
      <div className="flex w-full max-w-lg flex-col items-center">
        <IconoMarca className="mb-4" />
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
