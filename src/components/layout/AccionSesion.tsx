import { Link, useLocation } from "react-router-dom";
import Boton from "../ui/Boton";
import { clasesBoton } from "../ui/estilosBoton";
import {
  RUTA_INICIAR_SESION,
  rutaIniciarSesion,
  useSesion,
} from "../../features/autenticacion";

// Visitante: "Iniciar sesión" (recordando la página actual, FR-007).
// Con sesión: nombre de la persona y "Cerrar sesión" (FR-008, FR-010).
export default function AccionSesion() {
  const { usuario, cerrarSesion } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    const destino =
      ubicacion.pathname === RUTA_INICIAR_SESION
        ? RUTA_INICIAR_SESION
        : rutaIniciarSesion(ubicacion.pathname + ubicacion.search);
    return (
      <Link to={destino} className={clasesBoton("secundario")}>
        Iniciar sesión
      </Link>
    );
  }

  const primerNombre = usuario.nombre.split(" ")[0];

  return (
    <div className="flex min-w-0 items-center gap-2 md:gap-3">
      <span className="max-w-[8rem] truncate text-sm font-medium md:hidden">
        {primerNombre}
      </span>
      <span className="hidden text-sm font-medium md:inline">
        {usuario.nombre} {usuario.apellido}
      </span>
      <Boton
        variante="secundario"
        compacto
        className="shrink-0 md:px-4"
        onClick={() => cerrarSesion("manual")}
      >
        Cerrar sesión
      </Boton>
    </div>
  );
}
