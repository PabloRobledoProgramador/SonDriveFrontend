import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { crearSesionDePrueba } from "../../../pruebas/renderizarConApp";
import ProveedorSesion from "../ProveedorSesion";
import { guardarSesion } from "../sesion";
import type { Rol } from "../tipos";
import MostrarSiRol from "./MostrarSiRol";

function renderizar(rolSesion: Rol | null, rolesPermitidos: Rol[]) {
  if (rolSesion) guardarSesion(crearSesionDePrueba(rolSesion));
  render(
    <ProveedorSesion>
      <MostrarSiRol roles={rolesPermitidos}>
        <button type="button">Agregar conductor</button>
      </MostrarSiRol>
    </ProveedorSesion>,
  );
}

describe("MostrarSiRol", () => {
  it("muestra la acción a un rol permitido", () => {
    renderizar("Administrador", ["Administrador"]);

    expect(screen.getByRole("button", { name: "Agregar conductor" })).toBeInTheDocument();
  });

  it("oculta la acción a un rol no permitido", () => {
    renderizar("Conductor", ["Administrador"]);

    expect(screen.queryByRole("button", { name: "Agregar conductor" })).not.toBeInTheDocument();
  });

  it("oculta la acción a un visitante", () => {
    renderizar(null, ["Administrador", "Conductor"]);

    expect(screen.queryByRole("button", { name: "Agregar conductor" })).not.toBeInTheDocument();
  });
});
