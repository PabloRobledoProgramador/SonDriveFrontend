import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import { renderizarConApp } from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";

const rutas = [
  {
    id: 1,
    ciudadOrigenId: 1,
    ciudadOrigen: "Sonsón",
    ciudadDestinoId: 2,
    ciudadDestino: "La Unión",
    precioBase: 12000,
    distanciaKm: 37,
    tiempoEstimado: "45 min",
  },
  {
    id: 2,
    ciudadOrigenId: 1,
    ciudadOrigen: "Sonsón",
    ciudadDestinoId: 5,
    ciudadDestino: "Medellín",
    precioBase: 35000,
    distanciaKm: 115,
    tiempoEstimado: "2 h",
  },
];

describe("PaginaRutas", () => {
  it("lista todas las rutas y muestra la primera en el mapa", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/ruta`, () => HttpResponse.json(rutas)),
    );
    renderizarConApp("/rutas");

    expect(
      await screen.findByRole("button", { name: /Sonsón → La Unión/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /Sonsón → Medellín/ }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByTitle("Mapa de la ruta Sonsón → La Unión"),
    ).toBeInTheDocument();
  });

  it("cambia el mapa al elegir otra ruta", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/ruta`, () => HttpResponse.json(rutas)),
    );
    renderizarConApp("/rutas");

    await userEvent.click(
      await screen.findByRole("button", { name: /Sonsón → Medellín/ }),
    );

    expect(
      screen.getByTitle("Mapa de la ruta Sonsón → Medellín"),
    ).toBeInTheDocument();
  });

  it("avisa cuando no hay rutas", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/ruta`, () => HttpResponse.json([])),
    );
    renderizarConApp("/rutas");

    expect(
      await screen.findByText("Todavía no hay rutas disponibles."),
    ).toBeInTheDocument();
  });
});
