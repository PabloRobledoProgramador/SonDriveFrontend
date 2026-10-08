import Tarjeta from "../../../components/ui/Tarjeta";
import FormularioInicioSesion from "../componentes/FormularioInicioSesion";

// Pantalla "Iniciar sesión" (captura "Iniciar cesión.png"). Sin registro ni recuperación de
// contraseña: las cuentas las crea la administradora (FR-006).
export default function PaginaIniciarSesion() {
  return (
    <main className="flex justify-center px-4 py-12 md:py-20">
      <div className="flex w-full max-w-sm flex-col items-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-marca text-fondo">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17h14M6 17l1.5-6h9L18 17M7.5 11 9 7h6l1.5 4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="17" r="1.5" />
            <circle cx="16" cy="17" r="1.5" />
          </svg>
        </span>
        <h1 className="mb-1 text-2xl font-bold text-texto">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-texto-tenue">Accede a tu cuenta SonDrive</p>

        <Tarjeta className="w-full">
          <FormularioInicioSesion />
        </Tarjeta>
      </div>
    </main>
  );
}
