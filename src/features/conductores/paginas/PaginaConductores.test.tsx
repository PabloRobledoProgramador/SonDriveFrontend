import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import {
  crearSesionDePrueba,
  renderizarConApp,
} from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";
import type { Usuario } from "../../autenticacion";

const conductor: Usuario = {
  id: 2,
  nombre: "Carlos",
  apellido: "Gómez",
  correo: "carlos@sondrive.com",
  celular: "3001234567",
  estado: true,
  rol: "Conductor",
  foto: null,
};

const conductorInactivo: Usuario = {
  ...conductor,
  id: 3,
  nombre: "Laura",
  apellido: "Pérez",
  correo: "laura@sondrive.com",
  estado: false,
};

function configurarConductoresIniciales() {
  servidor.use(
    http.get(`${URL_API_PRUEBA}/api/usuario`, () =>
      HttpResponse.json([
        conductor,
        conductorInactivo,
        { ...conductor, id: 1, rol: "Administrador", nombre: "Admin" },
      ]),
    ),
    http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
      HttpResponse.json([
        {
          id: 10,
          nombreVehiculo: "Kia Rio 2022",
          placa: "ABC123",
          modelo: "Kia Rio",
          annoModelo: "2022",
          tipo: "Sedan",
          idUsuario: conductor.id,
          conductor: "Carlos Gómez",
          fotoConductor: null,
          kilometraje: 20000,
          fechaUltimoServicio: null,
          estado: "Óptimo",
          fallasPendientes: 0,
          soat: { vencimiento: "2030-01-01", diasRestantes: 900 },
          tecnomecanica: { vencimiento: "2030-01-01", diasRestantes: 900 },
          licencia: { vencimiento: "2030-01-01", diasRestantes: 900 },
        },
      ]),
    ),
    http.get(`${URL_API_PRUEBA}/api/viaje/usuario/:id`, () =>
      HttpResponse.json([
        {
          id: 20,
          fechaSalida: "2030-06-01T10:00:00",
          ciudadOrigen: "Bogotá",
          ciudadDestino: "Medellín",
          idVehiculo: 10,
        },
      ]),
    ),
  );
}

describe("PaginaConductores", () => {
  it("reproduce las tarjetas del prototipo con los datos disponibles de la API", async () => {
    configurarConductoresIniciales();
    renderizarConApp("/conductores", {
      sesion: crearSesionDePrueba("Administrador"),
    });

    expect(
      await screen.findByRole("heading", { name: "Conductores" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Carlos Gómez")).toBeInTheDocument();
    expect(screen.getByText("Laura Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Admin SonDrive")).not.toBeInTheDocument();
    expect(screen.getByText("Red de conductores")).toBeInTheDocument();
    expect(screen.getByText("Gestiona el estado de cada conductor. Los conductores deshabilitados no aparecen en búsquedas.")).toBeInTheDocument();
    expect(screen.getByText("activos").previousElementSibling).toHaveTextContent("1");
    expect(screen.getByText("deshabilitados").previousElementSibling).toHaveTextContent("1");
    expect(screen.getByText("total").previousElementSibling).toHaveTextContent("2");
    expect(screen.getByText("Medellín ↔ Bogotá")).toBeInTheDocument();
    expect(screen.getByText("Viajes realizados").nextElementSibling).toHaveTextContent("—");
    expect(screen.getByText("Kia Rio 2022")).toBeInTheDocument();
    expect(screen.getByText("ABC 123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contactar a Carlos por WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/573001234567"),
    );
    expect(screen.getByRole("switch", { name: "Deshabilitar a Carlos Gómez" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("switch", { name: "Habilitar a Laura Pérez" })).toBeInTheDocument();
  });

  it("cambia el estado del conductor desde el control visual del prototipo", async () => {
    let activo = true;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/usuario`, () =>
        HttpResponse.json([{ ...conductor, estado: activo }]),
      ),
      http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
        HttpResponse.json([]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
      http.patch(`${URL_API_PRUEBA}/api/usuario/2/estado`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("estado")).toBe("false");
        activo = false;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderizarConApp("/conductores", {
      sesion: crearSesionDePrueba("Administrador"),
    });

    const tarjeta = (await screen.findByText("Carlos Gómez")).closest("li");
    expect(tarjeta).not.toBeNull();
    await userEvent.setup().click(
      within(tarjeta!).getByRole("switch", { name: "Deshabilitar a Carlos Gómez" }),
    );
    await waitFor(() =>
      expect(
        within(tarjeta!).getByRole("switch", { name: "Habilitar a Carlos Gómez" }),
      ).toHaveAttribute("aria-checked", "false"),
    );
    expect(within(tarjeta!).getByText("Deshabilitado")).toBeInTheDocument();
  });

  it("crea un conductor activo con el contrato administrativo", async () => {
    let lista = [] as Usuario[];
    let solicitud: Record<string, unknown> | null = null;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/usuario`, () =>
        HttpResponse.json(lista),
      ),
      http.get(`${URL_API_PRUEBA}/api/vehiculo`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${URL_API_PRUEBA}/api/usuario`, async ({ request }) => {
        solicitud = (await request.json()) as Record<string, unknown>;
        const creado: Usuario = {
          ...conductor,
          id: 4,
          nombre: "Ana",
          apellido: "Torres",
          correo: "ana@sondrive.com",
          celular: "3012345678",
        };
        lista = [creado];
        return HttpResponse.json(creado, { status: 201 });
      }),
    );
    renderizarConApp("/conductores", {
      sesion: crearSesionDePrueba("Administrador"),
    });
    const usuario = userEvent.setup();

    await usuario.click(
      await screen.findByRole("button", { name: "＋ Agregar conductor" }),
    );
    const formulario = await screen.findByRole("form", {
      name: "Agregar conductor",
    });
    await usuario.type(within(formulario).getByLabelText("Nombre"), "Ana");
    await usuario.type(
      within(formulario).getByLabelText("Apellidos"),
      "Torres",
    );
    await usuario.type(
      within(formulario).getByLabelText("Correo electrónico"),
      "ana@sondrive.com",
    );
    await usuario.type(
      within(formulario).getByLabelText("Celular"),
      "3012345678",
    );
    await usuario.type(
      within(formulario).getByLabelText("Contraseña inicial"),
      "ClaveSegura123",
    );
    await usuario.click(
      within(formulario).getByRole("button", { name: "Agregar conductor" }),
    );

    expect(await screen.findByText("Ana Torres")).toBeInTheDocument();
    expect(solicitud).toMatchObject({
      nombre: "Ana",
      apellido: "Torres",
      correo: "ana@sondrive.com",
      celular: "3012345678",
      clave: "ClaveSegura123",
      rol: "Conductor",
      estado: true,
      foto: null,
    });
  });

  it("impide el acceso al módulo a los conductores", async () => {
    renderizarConApp("/conductores", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(
      await screen.findByText("Acceso restringido"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Conductores" }),
    ).not.toBeInTheDocument();
  });
});
