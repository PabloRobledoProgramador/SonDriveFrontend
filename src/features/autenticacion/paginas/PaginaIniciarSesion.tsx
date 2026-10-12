import { useNavigate } from "react-router-dom";
import IconoMarca from "../../../components/ui/IconoMarca";
import Boton from "../../../components/ui/Boton";
import Tarjeta from "../../../components/ui/Tarjeta";
import FormularioInicioSesion from "../componentes/FormularioInicioSesion";

// Pantalla para acceder a una cuenta SonDrive o crear una cuenta de conductor.
export default function PaginaIniciarSesion() {
  const navegar = useNavigate();

  return (
    <main className="flex justify-center px-4 py-12 md:py-20">
      <div className="flex w-full max-w-sm flex-col items-center">
        <IconoMarca className="mb-4" />
        <h1 className="mb-1 text-2xl font-bold">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-texto-tenue">Accede a tu cuenta SonDrive</p>

        <Tarjeta className="w-full">
          <FormularioInicioSesion />
        </Tarjeta>
        <p className="mt-5 text-center text-sm text-texto-tenue">
          ¿Aún no tienes cuenta?
        </p>
        <Boton
          variante="secundario"
          anchoCompleto
          className="mt-2"
          onClick={() => navegar("/registrarse")}
        >
          Registrarse
        </Boton>
      </div>
    </main>
  );
}
