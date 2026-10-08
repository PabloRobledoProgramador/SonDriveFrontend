import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

describe("Modal", () => {
  it("no muestra nada cuando está cerrado", () => {
    render(
      <Modal abierto={false} titulo="Registrar pasajero" alCerrar={() => {}}>
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abierto es un diálogo modal accesible con su título", () => {
    render(
      <Modal abierto titulo="Registrar pasajero" alCerrar={() => {}}>
        <p>Contenido</p>
      </Modal>,
    );

    const dialogo = screen.getByRole("dialog", { name: "Registrar pasajero" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("se cierra con Escape y con el botón de cierre", async () => {
    const alCerrar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <Modal abierto titulo="Registrar pasajero" alCerrar={alCerrar}>
        <p>Contenido</p>
      </Modal>,
    );

    await usuario.keyboard("{Escape}");
    await usuario.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(alCerrar).toHaveBeenCalledTimes(2);
  });

  it("el foco inicial queda dentro del diálogo", () => {
    render(
      <Modal abierto titulo="Registrar pasajero" alCerrar={() => {}}>
        <input aria-label="Nombre" />
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
  });
});
