import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  secciones as seccionesDelSitio,
  type Seccion,
} from "../../app/secciones";
import { renderizarConApp } from "../../pruebas/renderizarConApp";

const seccionesDePrueba: Seccion[] = [
  ...seccionesDelSitio.filter((seccion) => seccion.ruta !== "/rutas"),
  {
    ruta: "/rutas",
    nombre: "Rutas",
    acceso: "publico",
    enNavegacion: true,
    pagina: () => <h1>Rutas disponibles</h1>,
  },
];

describe("Encabezado", () => {
  it("el logo lleva al inicio", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/rutas", {
      secciones: seccionesDePrueba,
    });

    await usuario.click(await screen.findByRole("link", { name: "SonDrive" }));

    expect(router.state.location.pathname).toBe("/");
  });

  it("marca el enlace de la sección actual en ambas variantes de navegación", async () => {
    renderizarConApp("/rutas", { secciones: seccionesDePrueba });

    const navegaciones = await screen.findAllByRole("navigation", {
      name: "Navegación principal",
    });
    expect(navegaciones).toHaveLength(2);
    for (const navegacion of navegaciones) {
      expect(
        within(navegacion).getByRole("link", { name: "Rutas" }),
      ).toHaveAttribute("aria-current", "page");
      expect(
        within(navegacion).getByRole("link", { name: "Inicio" }),
      ).not.toHaveAttribute("aria-current");
    }
  });

  it("navegar con un enlace cambia la sección sin recargar la página", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/", { secciones: seccionesDePrueba });
    const [cabecera] = await screen.findAllByRole("navigation", {
      name: "Navegación principal",
    });

    await usuario.click(within(cabecera).getByRole("link", { name: "Rutas" }));

    expect(
      await screen.findByRole("heading", { name: "Rutas disponibles" }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/rutas");
  });

  it("muestra Registrarse junto a Iniciar sesión para visitantes", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/");
    const [cabecera] = await screen.findAllByRole("navigation", {
      name: "Navegación principal",
    });
    const enlaceRegistro = await screen.findByRole("link", {
      name: "Registrarse",
    });

    expect(enlaceRegistro).toHaveAttribute("href", "/registrarse");
    expect(enlaceRegistro).toHaveClass("bg-marca", "text-fondo");
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    await usuario.click(enlaceRegistro);
    expect(router.state.location.pathname).toBe("/registrarse");
    expect(
      await screen.findByRole("form", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
    expect(cabecera).toBeInTheDocument();
  });
});
