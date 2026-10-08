import type { ReactNode } from "react";
import type { Rol } from "../tipos";
import { useSesion } from "../useSesion";

// Muestra acciones (crear, editar, cambiar estado…) solo a los roles permitidos (FR-017).
// Es solo visual: la autorización real la hace el backend (principio IV).
export default function MostrarSiRol({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { tieneRol } = useSesion();
  return tieneRol(...roles) ? children : null;
}
