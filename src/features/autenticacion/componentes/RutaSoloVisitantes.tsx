import type { ReactNode } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { destinoSeguro } from "../navegacion";
import { useSesion } from "../useSesion";

// Secciones solo para visitantes (iniciar sesión): con sesión se va al inicio (FR-012) o, justo
// después de iniciar sesión, a la página de la que se venía (FR-007).
export default function RutaSoloVisitantes({ children }: { children: ReactNode }) {
  const { estaAutenticado } = useSesion();
  const [parametros] = useSearchParams();

  if (estaAutenticado) return <Navigate to={destinoSeguro(parametros.get("volver"))} replace />;
  return children;
}
