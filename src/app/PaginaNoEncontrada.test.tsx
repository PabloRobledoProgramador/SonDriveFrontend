import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderizarConApp } from "../pruebas/renderizarConApp";

describe("PaginaNoEncontrada", () => {
  it("una dirección inexistente muestra la página no encontrada con la cabecera y vuelve al inicio", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/no-existe");

    expect(await screen.findByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "SonDrive" })).toBeInTheDocument();

    await usuario.click(screen.getByRole("link", { name: "Volver al inicio" }));

    expect(router.state.location.pathname).toBe("/");
  });
});
