import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { secciones as seccionesDelSitio, type Seccion } from "../../../app/secciones";
import { CLAVE_ADMIN, CORREO_ADMIN } from "../../../pruebas/manejadores";
import { crearSesionDePrueba, renderizarConApp } from "../../../pruebas/renderizarConApp";
import { guardarSesion } from "../sesion";

const seccionesDePrueba: Seccion[] = [
  ...seccionesDelSitio,
  {
    ruta: "/solo-admin",
    nombre: "Panel administradora",
    acceso: ["Administrador"],
    enNavegacion: false,
    pagina: () => <p>Contenido de administradora</p>,
  },
  {
    ruta: "/solo-conductor",
    nombre: "Panel conductor",
    acceso: ["Conductor"],
    enNavegacion: false,
    pagina: () => <p>Contenido de conductor</p>,
  },
];

describe("RutaProtegida", () => {
  it("visitante: no ve el contenido, va a iniciar sesión y al entrar vuelve a la sección", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/solo-admin", { secciones: seccionesDePrueba });

    await waitFor(() => expect(router.state.location.pathname).toBe("/iniciar-sesion"));
    expect(router.state.location.search).toBe("?volver=%2Fsolo-admin");
    expect(await screen.findByText("Inicia sesión para continuar.")).toBeInTheDocument();
    expect(screen.queryByText("Contenido de administradora")).not.toBeInTheDocument();

    await usuario.type(await screen.findByLabelText("Correo electrónico"), CORREO_ADMIN);
    await usuario.type(screen.getByLabelText("Contraseña"), CLAVE_ADMIN);
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Contenido de administradora")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/solo-admin");
  });

  it("conductor en una sección de administradora: nunca ve el contenido y va al inicio", async () => {
    const { router } = renderizarConApp("/solo-admin", {
      secciones: seccionesDePrueba,
      sesion: crearSesionDePrueba("Conductor"),
    });

    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(await screen.findByText("Acceso restringido")).toBeInTheDocument();
    expect(screen.queryByText("Contenido de administradora")).not.toBeInTheDocument();
  });

  it("administradora en su sección: ve el contenido", async () => {
    renderizarConApp("/solo-admin", {
      secciones: seccionesDePrueba,
      sesion: crearSesionDePrueba("Administrador"),
    });

    expect(await screen.findByText("Contenido de administradora")).toBeInTheDocument();
  });

  it("conductor en su sección: ve el contenido", async () => {
    renderizarConApp("/solo-conductor", {
      secciones: seccionesDePrueba,
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(await screen.findByText("Contenido de conductor")).toBeInTheDocument();
  });

  it("abrir una sección privada con una sesión vencida: una sola redirección con el aviso de vencimiento", async () => {
    guardarSesion(crearSesionDePrueba("Administrador", new Date(Date.now() - 1000)));
    const { router } = renderizarConApp("/solo-admin", { secciones: seccionesDePrueba });

    await waitFor(() => expect(router.state.location.pathname).toBe("/iniciar-sesion"));
    expect(router.state.location.search).toBe("?volver=%2Fsolo-admin");
    expect(await screen.findByText("Tu sesión venció. Inicia sesión de nuevo.")).toBeInTheDocument();
    expect(screen.queryByText("Inicia sesión para continuar.")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido de administradora")).not.toBeInTheDocument();
  });
});
