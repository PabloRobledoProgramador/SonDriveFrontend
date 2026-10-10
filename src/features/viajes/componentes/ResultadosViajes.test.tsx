import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import { renderizarConApp } from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";

const viaje = {
  id: 24,
  fechaSalida: "2026-11-05T06:30:00",
  precio: 18000,
  ciudadOrigenId: 1,
  ciudadOrigen: "Medellín",
  ciudadDestinoId: 2,
  ciudadDestino: "Rionegro",
  idVehiculo: 3,
  conductor: "Carlos Herrera",
  fotoConductor: null,
  cuposLibres: 2,
  cajuelasLibres: 2,
};

const detalle = {
  ...viaje,
  nombreVehiculo: "Renault Logan 2022",
  placa: "SXK204",
  telefonoConductor: "314 672 8910",
  puestos: [
    {
      idPuesto: 1,
      codigo: "Conductor",
      tipo: "Ventana",
      esConductor: true,
      ocupado: true,
    },
    {
      idPuesto: 2,
      codigo: "Copiloto",
      tipo: "Ventana",
      esConductor: false,
      ocupado: true,
    },
    {
      idPuesto: 3,
      codigo: "Izquierda",
      tipo: "Ventana",
      esConductor: false,
      ocupado: false,
    },
    {
      idPuesto: 4,
      codigo: "Centro",
      tipo: "Ventana",
      esConductor: false,
      ocupado: false,
    },
    {
      idPuesto: 5,
      codigo: "Derecha",
      tipo: "Ventana",
      esConductor: false,
      ocupado: true,
    },
    {
      idPuesto: 6,
      codigo: "C1",
      tipo: "Cajuela",
      esConductor: false,
      ocupado: false,
    },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("Búsqueda y detalle de viajes disponibles", () => {
  it("ordena por salida más temprana, abre el detalle y prepara la reserva por WhatsApp", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const estado = {
      parametrosBusqueda: null as URLSearchParams | null,
    };
    let llamadasOcupaciones = 0;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/ciudad`, () =>
        HttpResponse.json([
          { id: 1, nombre: "Medellín" },
          { id: 2, nombre: "Rionegro" },
        ]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje`, ({ request }) => {
        estado.parametrosBusqueda = new URL(request.url).searchParams;
        return HttpResponse.json([
          viaje,
          {
            ...viaje,
            id: 25,
            fechaSalida: "2026-11-05T14:00:00",
            ciudadDestino: "La Ceja",
          },
          {
            ...viaje,
            id: 26,
            fechaSalida: "2026-11-05T05:00:00",
            ciudadDestino: "La Unión",
          },
          {
            ...viaje,
            id: 27,
            fechaSalida: "2026-11-05T11:00:00",
            ciudadDestino: "Sonsón",
          },
        ]);
      }),
      http.get(`${URL_API_PRUEBA}/api/viaje/24`, () =>
        HttpResponse.json(detalle),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/24/ocupaciones`, () => {
        llamadasOcupaciones++;
        return HttpResponse.json([]);
      }),
    );
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/");

    await screen.findAllByRole("option", { name: "Medellín" });
    await waitFor(() =>
      expect(screen.getByLabelText("Origen")).toBeEnabled(),
    );
    await usuario.selectOptions(screen.getByLabelText("Origen"), "1");
    await usuario.selectOptions(screen.getByLabelText("Destino"), "2");
    await usuario.click(screen.getByRole("button", { name: "Buscar viajes" }));

    expect(
      await screen.findByRole("heading", { name: "Viajes disponibles" }),
    ).toBeInTheDocument();
    await screen.findAllByRole("button", { name: /Ver detalles/ });
    expect(estado.parametrosBusqueda?.get("CiudadOrigenId")).toBe("1");
    expect(estado.parametrosBusqueda?.get("CiudadDestinoId")).toBe("2");
    expect(estado.parametrosBusqueda?.has("Hora")).toBe(false);
    expect(router.state.location.search).not.toContain("hora=");
    expect(screen.getByText("4 resultados · mostrando 1–3")).toBeInTheDocument();
    const regionResultados = screen.getByRole("region", {
      name: "Viajes disponibles",
    });
    const viajesOrdenados = within(regionResultados)
      .getAllByRole("listitem")
      .map((elemento) => elemento.textContent ?? "");
    expect(viajesOrdenados[0]).toContain("La Unión");
    expect(viajesOrdenados[1]).toContain("Rionegro");
    expect(viajesOrdenados[2]).toContain("Sonsón");

    await usuario.click(
      screen.getByRole("button", { name: "Página siguiente" }),
    );
    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("4 resultados · mostrando 4–4")).toBeInTheDocument();
    expect(
      within(regionResultados).getAllByRole("listitem")[0],
    ).toHaveTextContent("La Ceja");
    await usuario.click(
      screen.getByRole("button", { name: "Página anterior" }),
    );

    const botonesDetalle = within(regionResultados).getAllByRole("button", {
      name: /Ver detalles/,
    });
    await usuario.click(botonesDetalle[1]);

    expect(
      await screen.findByRole("heading", {
        name: "Medellín → Rionegro",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Disponibilidad de puestos")).toBeInTheDocument();
    expect(screen.getByLabelText("Copiloto, ocupado")).toBeInTheDocument();
    expect(screen.getByLabelText("Izquierda, libre")).toBeInTheDocument();
    expect(screen.getByText("Renault Logan 2022")).toBeInTheDocument();
    expect(screen.getByText("SXK204")).toBeInTheDocument();
    expect(
      screen.getByText(/Confirma la disponibilidad con el conductor antes del viaje/),
    ).toBeInTheDocument();

    const enlaceWhatsApp = screen.getByRole("link", {
      name: "Reservar por WhatsApp",
    });
    expect(enlaceWhatsApp).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/573146728910?text="),
    );
    expect(
      decodeURIComponent(enlaceWhatsApp.getAttribute("href") ?? ""),
    ).toContain("quisiera reservar un puesto para el viaje Medellín a Rionegro");
    expect(llamadasOcupaciones).toBe(0);
    expect(screen.queryByText("María Pérez")).not.toBeInTheDocument();

    await usuario.click(
      screen.getByRole("button", { name: "← Volver a los resultados" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Viajes disponibles" }),
    ).toBeInTheDocument();
    expect(router.state.location.search).not.toContain("hora=");
    await waitFor(() =>
      expect(router.state.location.search).toContain("origen=1"),
    );
  });
});
