import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Seccion } from "../../app/secciones";
import type { Rol } from "../../features/autenticacion";
import { crearSesionDePrueba, renderizarConApp } from "../../pruebas/renderizarConApp";

const Pagina = () => <p>Página</p>;

const seccionesDePrueba: Seccion[] = [
  { ruta: "/", nombre: "Inicio", acceso: "publico", enNavegacion: true, pagina: Pagina },
  { ruta: "/rutas", nombre: "Rutas", acceso: "publico", enNavegacion: true, pagina: Pagina },
  { ruta: "/conductor", nombre: "Mis viajes", acceso: ["Conductor"], enNavegacion: true, pagina: Pagina },
  { ruta: "/admin", nombre: "Vehículos", acceso: ["Administrador"], enNavegacion: true, pagina: Pagina },
  { ruta: "/oculta", nombre: "Oculta", acceso: "publico", enNavegacion: false, pagina: Pagina },
];

async function enlacesVisibles(rol?: Rol): Promise<string[]> {
  renderizarConApp("/", {
    secciones: seccionesDePrueba,
    sesion: rol ? crearSesionDePrueba(rol) : undefined,
  });
  // La barra de la cabecera (≥ md) y la fila deslizable (< md) muestran los mismos enlaces
  const [cabecera] = await screen.findAllByRole("navigation", { name: "Navegación principal" });
  return within(cabecera)
    .getAllByRole("link")
    .map((enlace) => enlace.textContent ?? "");
}

describe("NavegacionPrincipal", () => {
  it("el visitante ve solo los enlaces públicos", async () => {
    expect(await enlacesVisibles()).toEqual(["Inicio", "Rutas"]);
  });

  it("el conductor ve además los suyos", async () => {
    expect(await enlacesVisibles("Conductor")).toEqual(["Inicio", "Rutas", "Mis viajes"]);
  });

  it("la administradora ve además los suyos", async () => {
    expect(await enlacesVisibles("Administrador")).toEqual(["Inicio", "Rutas", "Vehículos"]);
  });

  it("las secciones fuera de la navegación no aparecen", async () => {
    expect(await enlacesVisibles("Administrador")).not.toContain("Oculta");
  });
});
