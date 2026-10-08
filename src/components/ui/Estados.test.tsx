import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { crearErrorDeConexion } from "../../lib/errores";
import EstadoCargando from "./EstadoCargando";
import EstadoError from "./EstadoError";
import EstadoVacio from "./EstadoVacio";

describe("Estados comunes", () => {
  it("EstadoCargando se anuncia como estado con el texto Cargando…", () => {
    render(<EstadoCargando />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });

  it("EstadoVacio muestra el mensaje propio de la sección", () => {
    render(<EstadoVacio mensaje="No hay viajes disponibles para la ruta seleccionada." />);

    expect(screen.getByText("No hay viajes disponibles para la ruta seleccionada.")).toBeInTheDocument();
  });

  it("EstadoError muestra el mensaje del error y Reintentar llama alReintentar", async () => {
    const alReintentar = vi.fn();
    const usuario = userEvent.setup();
    render(<EstadoError error={crearErrorDeConexion()} alReintentar={alReintentar} />);

    expect(
      screen.getByText("No pudimos conectar con SonDrive. Revisa tu conexión e inténtalo de nuevo."),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(alReintentar).toHaveBeenCalledOnce();
  });

  it("EstadoError sin alReintentar no muestra el botón", () => {
    render(<EstadoError error={crearErrorDeConexion()} />);

    expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
  });
});
