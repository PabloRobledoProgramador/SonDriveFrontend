import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import {
  crearSesionDePrueba,
  renderizarConApp,
} from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";
import type { FallaVehiculo, VehiculoFlota } from "../tipos";

const vehiculo: VehiculoFlota = {
  id: 8,
  nombreVehiculo: "Kia Rio 2022",
  placa: "ABC123",
  modelo: "Kia Rio",
  annoModelo: "2022",
  tipo: "Sedan",
  idUsuario: 2,
  conductor: "Carlos Gómez",
  fotoConductor: null,
  kilometraje: 48200,
  fechaUltimoServicio: "2026-06-15T00:00:00",
  estado: "Alerta",
  fallasPendientes: 1,
  soat: { vencimiento: "2027-02-14T00:00:00", diasRestantes: 120 },
  tecnomecanica: {
    vencimiento: "2026-10-10T00:00:00",
    diasRestantes: 20,
  },
  licencia: { vencimiento: "2029-03-05T00:00:00", diasRestantes: 900 },
};

const falla: FallaVehiculo = {
  id: 41,
  vehiculoId: vehiculo.id,
  descripcion: "Desgaste de frenos delanteros",
  severidad: "Alerta",
  fecha: "2026-08-12T00:00:00",
  estaResuelta: false,
};

function configurarFlotaInicial(fallas: FallaVehiculo[] = [falla]) {
  servidor.use(
    http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
      HttpResponse.json([vehiculo]),
    ),
    http.get(`${URL_API_PRUEBA}/api/falla/vehiculo/8`, () =>
      HttpResponse.json(fallas),
    ),
  );
}

describe("PaginaVehiculos", () => {
  it("muestra el monitoreo real de documentos y permite resolver una falla", async () => {
    let resuelta = false;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
        HttpResponse.json([vehiculo]),
      ),
      http.get(`${URL_API_PRUEBA}/api/falla/vehiculo/8`, () =>
        HttpResponse.json([{ ...falla, estaResuelta: resuelta }]),
      ),
      http.patch(
        `${URL_API_PRUEBA}/api/falla/41/resuelta`,
        ({ request }) => {
          expect(new URL(request.url).searchParams.get("resuelta")).toBe(
            "true",
          );
          resuelta = true;
          return HttpResponse.json({ ...falla, estaResuelta: true });
        },
      ),
    );
    renderizarConApp("/vehiculos", {
      sesion: crearSesionDePrueba("Administrador"),
    });

    expect(
      await screen.findByRole("heading", { name: "Monitoreo de flota" }),
    ).toBeInTheDocument();
    expect((await screen.findAllByText("Kia Rio 2022")).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Revisión tecnomecánica")).toBeInTheDocument();
    expect(screen.getByText("Vence en 20 días")).toBeInTheDocument();
    expect(
      await screen.findByText("Desgaste de frenos delanteros"),
    ).toBeInTheDocument();

    await userEvent.setup().click(
      screen.getByRole("button", { name: "Resolver" }),
    );
    await waitFor(() =>
      expect(screen.getByText(/Resuelta/)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "＋ Agregar vehículo" }),
    ).toBeInTheDocument();
  });

  it("reporta fallas usando los niveles de severidad aceptados por la API", async () => {
    let fallas: FallaVehiculo[] = [];
    let solicitud: Record<string, unknown> | null = null;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
        HttpResponse.json([vehiculo]),
      ),
      http.get(`${URL_API_PRUEBA}/api/falla/vehiculo/8`, () =>
        HttpResponse.json(fallas),
      ),
      http.post(`${URL_API_PRUEBA}/api/falla`, async ({ request }) => {
        solicitud = (await request.json()) as Record<string, unknown>;
        const creada: FallaVehiculo = {
          ...falla,
          id: 42,
          descripcion: String(solicitud.descripcion),
          severidad: solicitud.severidad as FallaVehiculo["severidad"],
          fecha: String(solicitud.fecha),
        };
        fallas = [creada];
        return HttpResponse.json(creada, { status: 201 });
      }),
    );
    renderizarConApp("/vehiculos", {
      sesion: crearSesionDePrueba("Administrador"),
    });
    const usuario = userEvent.setup();

    await usuario.click(
      await screen.findByRole("button", { name: "＋ Reportar falla" }),
    );
    const formulario = await screen.findByRole("form", {
      name: "Reportar falla",
    });
    await usuario.type(
      within(formulario).getByLabelText("Descripción"),
      "Ruido en el motor al encender",
    );
    await usuario.selectOptions(
      within(formulario).getByLabelText("Severidad"),
      "Crítico",
    );
    await usuario.click(
      within(formulario).getByRole("button", { name: "Reportar falla" }),
    );

    expect(
      await screen.findByText("Ruido en el motor al encender"),
    ).toBeInTheDocument();
    expect(solicitud).toMatchObject({
      vehiculoId: vehiculo.id,
      descripcion: "Ruido en el motor al encender",
      severidad: "Crítico",
    });
  });

  it("registra vehículos con los campos del contrato del backend", async () => {
    const nuevoVehiculo: VehiculoFlota = {
      ...vehiculo,
      id: 9,
      nombreVehiculo: "Renault Logan 2024",
      placa: "XYZ987",
      idUsuario: 2,
      fallasPendientes: 0,
      estado: "Óptimo",
    };
    let lista = [] as VehiculoFlota[];
    let solicitud: Record<string, unknown> | null = null;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
        HttpResponse.json(lista),
      ),
      http.get(`${URL_API_PRUEBA}/api/usuario`, () =>
        HttpResponse.json([
          {
            id: 2,
            nombre: "Carlos",
            apellido: "Gómez",
            correo: "carlos@sondrive.com",
            celular: "3000000000",
            estado: true,
            rol: "Conductor",
            foto: null,
          },
        ]),
      ),
      http.post(`${URL_API_PRUEBA}/api/vehiculo`, async ({ request }) => {
        solicitud = (await request.json()) as Record<string, unknown>;
        lista = [nuevoVehiculo];
        return HttpResponse.json(nuevoVehiculo, { status: 201 });
      }),
      http.get(`${URL_API_PRUEBA}/api/falla/vehiculo/9`, () =>
        HttpResponse.json([]),
      ),
    );
    renderizarConApp("/vehiculos", {
      sesion: crearSesionDePrueba("Administrador"),
    });
    const usuario = userEvent.setup();

    await usuario.click(
      await screen.findByRole("button", { name: "＋ Agregar vehículo" }),
    );
    const formulario = await screen.findByRole("form", {
      name: "Agregar vehículo",
    });
    await usuario.selectOptions(
      within(formulario).getByLabelText("Conductor asignado"),
      "2",
    );
    await usuario.type(within(formulario).getByLabelText("Placa"), "xyz987");
    await usuario.type(
      within(formulario).getByLabelText("Modelo del vehículo"),
      "Renault Logan",
    );
    fireEvent.change(within(formulario).getByLabelText("Año del modelo"), {
      target: { value: "2024" },
    });
    await usuario.selectOptions(
      within(formulario).getByLabelText("Tipo de vehículo"),
      "Sedan",
    );
    fireEvent.change(within(formulario).getByLabelText("Vencimiento SOAT"), {
      target: { value: "2027-01-01" },
    });
    fireEvent.change(
      within(formulario).getByLabelText("Vencimiento tecnomecánica"),
      { target: { value: "2027-02-01" } },
    );
    fireEvent.change(
      within(formulario).getByLabelText("Vencimiento licencia de conducción"),
      { target: { value: "2028-01-01" } },
    );
    await usuario.click(
      within(formulario).getByRole("button", { name: "Guardar vehículo" }),
    );

    expect(
      await screen.findByText("Renault Logan 2024 se agregó a la flota."),
    ).toBeInTheDocument();
    expect(solicitud).toMatchObject({
      idUsuario: 2,
      placa: "XYZ987",
      modelo: "Renault Logan",
      annoModelo: "2024",
      tipo: "Sedan",
      kilometraje: 0,
      vencimientoSoat: "2027-01-01",
      vencimientoTecnomecanica: "2027-02-01",
      vencimientoLicencia: "2028-01-01",
    });
  });

  it("reserva la navegación de vehículos para administradores", async () => {
    configurarFlotaInicial();
    renderizarConApp("/vehiculos", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(
      await screen.findByText("Acceso restringido"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Monitoreo de flota" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Vehículos" }),
    ).not.toBeInTheDocument();
  });
});
