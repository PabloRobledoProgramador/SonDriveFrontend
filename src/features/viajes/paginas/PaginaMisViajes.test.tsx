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

const viaje = {
  id: 10,
  fechaSalida: "2026-10-20T08:30:00",
  precio: 35000,
  ciudadOrigenId: 1,
  ciudadOrigen: "Sonsón",
  ciudadDestinoId: 5,
  ciudadDestino: "Medellín",
  idVehiculo: 3,
  conductor: "Carlos Gómez",
  fotoConductor: null,
  cuposLibres: 1,
  cajuelasLibres: 2,
};

const ciudades = [
  { id: 1, nombre: "Sonsón" },
  { id: 5, nombre: "Medellín" },
];
const vehiculos = [
  { id: 3, nombreVehiculo: "Renault Logan 2022", placa: "SXK204" },
];

const detalle = {
  ...viaje,
  nombreVehiculo: "Renault Logan 2022",
  placa: "SXK204",
  telefonoConductor: "3001234567",
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
      idPuesto: 6,
      codigo: "C1",
      tipo: "Cajuela",
      esConductor: false,
      ocupado: false,
    },
  ],
};
const ocupaciones = [
  {
    id: 1,
    idViaje: 10,
    idPuesto: 2,
    codigo: "Copiloto",
    tipo: "Ventana",
    pasajero: {
      nombreCompleto: "María Pérez",
      celular: "3105550000",
      direccion: "Calle 10 #5-20",
    },
  },
];

const manana = new Date(
  Date.now() + 2 * 24 * 60 * 60 * 1000,
).toLocaleDateString("sv-SE");

function respuestasBase() {
  servidor.use(
    http.get(`${URL_API_PRUEBA}/api/ciudad`, () => HttpResponse.json(ciudades)),
    http.get(`${URL_API_PRUEBA}/api/vehiculo/usuario/2`, () =>
      HttpResponse.json(vehiculos),
    ),
  );
}

// Abre el modal de crear viaje y llena todos los campos con datos válidos
async function llenarFormulario(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(
    await screen.findByRole("button", { name: "Crear viaje" }),
  );
  const formulario = await screen.findByRole("form", { name: "Nuevo viaje" });
  await within(formulario).findByRole("option", { name: /SXK204/ });
  await waitFor(() =>
    expect(within(formulario).getByLabelText("Origen")).toBeEnabled(),
  );

  await usuario.selectOptions(within(formulario).getByLabelText("Origen"), "1");
  await usuario.selectOptions(
    within(formulario).getByLabelText("Destino"),
    "5",
  );
  fireEvent.change(within(formulario).getByLabelText("Fecha"), {
    target: { value: manana },
  });
  fireEvent.change(within(formulario).getByLabelText("Hora"), {
    target: { value: "08:30" },
  });
  await usuario.type(
    within(formulario).getByLabelText("Precio por puesto (COP)"),
    "35000",
  );
  await usuario.selectOptions(
    within(formulario).getByLabelText("Vehículo"),
    "3",
  );
  return formulario;
}

describe("PaginaMisViajes", () => {
  it("el conductor ve sus próximos viajes y el enlace en la navegación", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
    );
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(
      await screen.findByRole("heading", { name: "Mis viajes" }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Sonsón/)).toBeInTheDocument();
    expect(screen.getByText(/Medellín/)).toBeInTheDocument();
    expect(screen.getByText("1 cupo libre")).toBeInTheDocument();
    expect(screen.getByText(/1 viaje programado/)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Mis viajes" }).length,
    ).toBeGreaterThan(0);
  });

  it("sin viajes programados muestra el mensaje vacío", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
    );
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(
      await screen.findByText("No tienes viajes programados."),
    ).toBeInTheDocument();
  });

  it("si la API falla ofrece reintentar", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.error(),
      ),
    );
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    expect(
      await screen.findByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });

  it("el administrador no entra a la página del conductor", async () => {
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Administrador"),
    });

    expect(
      await screen.findByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Mis viajes" }),
    ).not.toBeInTheDocument();
  });
});

describe("Crear viaje", () => {
  it("publica el viaje con los datos del formulario, cierra el modal y avisa", async () => {
    let cuerpo: unknown = null;
    respuestasBase();
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${URL_API_PRUEBA}/api/viaje`, async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({ ...viaje, id: 11 }, { status: 201 });
      }),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    const formulario = await llenarFormulario(usuario);
    await usuario.click(
      within(formulario).getByRole("button", { name: "Publicar viaje" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("form", { name: "Nuevo viaje" }),
      ).not.toBeInTheDocument(),
    );
    expect(cuerpo).toEqual({
      ciudadOrigenId: 1,
      ciudadDestinoId: 5,
      idVehiculo: 3,
      fecha: manana,
      hora: "08:30:00",
      precio: 35000,
    });
    expect(
      await screen.findByText(/Viaje Sonsón → Medellín publicado/),
    ).toBeInTheDocument();
  });

  it("con el formulario vacío muestra los errores y no llama a la API", async () => {
    let llamadas = 0;
    respuestasBase();
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${URL_API_PRUEBA}/api/viaje`, () => {
        llamadas++;
        return HttpResponse.json(viaje, { status: 201 });
      }),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(
      await screen.findByRole("button", { name: "Crear viaje" }),
    );
    const formulario = await screen.findByRole("form", {
      name: "Nuevo viaje",
    });
    await within(formulario).findByRole("option", { name: /SXK204/ });
    await usuario.click(
      within(formulario).getByRole("button", { name: "Publicar viaje" }),
    );

    expect(
      await within(formulario).findByText("Elige la ciudad de origen."),
    ).toBeInTheDocument();
    expect(within(formulario).getByText("Elige la fecha.")).toBeInTheDocument();
    expect(
      within(formulario).getByText("Escribe el precio."),
    ).toBeInTheDocument();
    expect(llamadas).toBe(0);
  });

  it("si el vehículo ya tiene un viaje a esa hora muestra el mensaje del servidor", async () => {
    respuestasBase();
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${URL_API_PRUEBA}/api/viaje`, () =>
        HttpResponse.json(
          {
            title: "Conflicto",
            status: 409,
            detail:
              "El vehículo ya tiene un viaje programado a esa fecha y hora.",
          },
          { status: 409 },
        ),
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    const formulario = await llenarFormulario(usuario);
    await usuario.click(
      within(formulario).getByRole("button", { name: "Publicar viaje" }),
    );

    expect(await within(formulario).findByRole("alert")).toHaveTextContent(
      "El vehículo ya tiene un viaje programado a esa fecha y hora.",
    );
    expect(
      screen.getByRole("form", { name: "Nuevo viaje" }),
    ).toBeInTheDocument();
  });

  it("sin vehículos registrados avisa y no deja publicar", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/ciudad`, () =>
        HttpResponse.json(ciudades),
      ),
      http.get(`${URL_API_PRUEBA}/api/vehiculo/usuario/2`, () =>
        HttpResponse.json([]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([]),
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(
      await screen.findByRole("button", { name: "Crear viaje" }),
    );
    const formulario = await screen.findByRole("form", {
      name: "Nuevo viaje",
    });

    expect(
      await within(formulario).findByText(/No tienes vehículos registrados/),
    ).toBeInTheDocument();
    expect(
      within(formulario).getByRole("button", { name: "Publicar viaje" }),
    ).toBeDisabled();
  });
});

describe("Detalles del viaje", () => {
  it("muestra el vehículo, los puestos y los pasajeros registrados", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10`, () =>
        HttpResponse.json(detalle),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10/ocupaciones`, () =>
        HttpResponse.json(ocupaciones),
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(
      await screen.findByRole("button", { name: /Ver detalles/ }),
    );

    const dialogo = await screen.findByRole("dialog", {
      name: "Detalles del viaje",
    });
    expect(
      await within(dialogo).findByText("Renault Logan 2022 · SXK204"),
    ).toBeInTheDocument();
    expect(within(dialogo).getByText("3001234567")).toBeInTheDocument();
    expect(within(dialogo).getByText("Copiloto · Ocupado")).toBeInTheDocument();
    expect(within(dialogo).getByText("Izquierda · Libre")).toBeInTheDocument();
    expect(within(dialogo).getByText("C1 · Libre")).toBeInTheDocument();
    expect(within(dialogo).queryByText(/^Conductor ·/)).not.toBeInTheDocument();
    expect(await within(dialogo).findByText("María Pérez")).toBeInTheDocument();
    expect(within(dialogo).getByText("3105550000")).toBeInTheDocument();

    await usuario.click(
      within(dialogo).getByRole("button", { name: "Cerrar" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sin pasajeros muestra el texto vacío y si falla el detalle ofrece reintentar", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10`, () =>
        HttpResponse.json(detalle),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10/ocupaciones`, () =>
        HttpResponse.json([]),
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(
      await screen.findByRole("button", { name: /Ver detalles/ }),
    );
    expect(
      await screen.findByText("Aún no hay pasajeros registrados."),
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Cerrar" }));
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/10`, () => HttpResponse.error()),
    );
    await usuario.click(
      await screen.findByRole("button", { name: /Ver detalles/ }),
    );
    expect(
      await screen.findByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });
});

describe("Editar y cancelar viajes", () => {
  it("actualiza la fecha, la hora y el precio mediante el endpoint PUT", async () => {
    let cuerpo: unknown = null;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
      http.put(`${URL_API_PRUEBA}/api/viaje/10`, async ({ request }) => {
        cuerpo = await request.json();
        return HttpResponse.json({
          ...viaje,
          fechaSalida: `${manana}T09:15:00`,
          precio: 42000,
        });
      }),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(await screen.findByRole("button", { name: "Editar" }));
    const formulario = await screen.findByRole("form", {
      name: "Editar viaje",
    });
    fireEvent.change(within(formulario).getByLabelText("Fecha"), {
      target: { value: manana },
    });
    fireEvent.change(within(formulario).getByLabelText("Hora"), {
      target: { value: "09:15" },
    });
    fireEvent.change(
      within(formulario).getByLabelText("Precio por puesto (COP)"),
      { target: { value: "42000" } },
    );
    await usuario.click(
      within(formulario).getByRole("button", { name: "Guardar cambios" }),
    );

    await waitFor(() =>
      expect(cuerpo).toEqual({
        ciudadOrigenId: 1,
        ciudadDestinoId: 5,
        idVehiculo: 3,
        fecha: manana,
        hora: "09:15:00",
        precio: 42000,
      }),
    );
    expect(
      await screen.findByRole("button", { name: "Editar" }),
    ).toBeInTheDocument();
  });

  it("pide confirmación y elimina el viaje", async () => {
    let viajeDisponible = true;
    let llamadasEliminar = 0;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json(viajeDisponible ? [viaje] : []),
      ),
      http.delete(`${URL_API_PRUEBA}/api/viaje/10`, () => {
        llamadasEliminar++;
        viajeDisponible = false;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(
      await screen.findByRole("button", {
        name: "Cancelar viaje Sonsón a Medellín",
      }),
    );
    expect(llamadasEliminar).toBe(0);
    await usuario.click(
      screen.getByRole("button", { name: "Sí, cancelar viaje" }),
    );

    expect(
      await screen.findByText("Viaje Sonsón → Medellín cancelado."),
    ).toBeInTheDocument();
    expect(llamadasEliminar).toBe(1);
    expect(
      screen.queryByRole("button", { name: /Editar/ }),
    ).not.toBeInTheDocument();
  });
});

describe("Disponibilidad de puestos", () => {
  it("registra un pasajero en un puesto libre", async () => {
    let cuerpo: unknown = null;
    respuestasBase();
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10`, () =>
        HttpResponse.json(detalle),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10/ocupaciones`, () =>
        HttpResponse.json(ocupaciones),
      ),
      http.post(
        `${URL_API_PRUEBA}/api/viaje/10/ocupaciones/puesto/3`,
        async ({ request }) => {
          cuerpo = await request.json();
          return HttpResponse.json({
            id: 2,
            idViaje: 10,
            idPuesto: 3,
            codigo: "Izquierda",
            tipo: "Ventana",
            pasajero: {
              nombreCompleto: "Juan Pérez",
              celular: "3009876543",
              direccion: "Calle 1",
            },
          });
        },
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(await screen.findByRole("button", { name: "Editar" }));
    await usuario.click(
      await screen.findByRole("button", { name: "Izquierda, libre" }),
    );
    await usuario.type(
      screen.getByLabelText("Nombre completo"),
      "Juan Pérez",
    );
    await usuario.type(screen.getByLabelText("Celular"), "3009876543");
    await usuario.type(
      screen.getByLabelText("Dirección (opcional)"),
      "Calle 1",
    );
    await usuario.click(
      screen.getByRole("button", { name: "Registrar pasajero" }),
    );

    await waitFor(() =>
      expect(cuerpo).toEqual({
        nombreCompleto: "Juan Pérez",
        celular: "3009876543",
        direccion: "Calle 1",
      }),
    );
  });

  it("confirma antes de liberar un puesto reservado", async () => {
    let llamadasLiberar = 0;
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/viaje/usuario/2`, () =>
        HttpResponse.json([viaje]),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10`, () =>
        HttpResponse.json(detalle),
      ),
      http.get(`${URL_API_PRUEBA}/api/viaje/10/ocupaciones`, () =>
        HttpResponse.json(ocupaciones),
      ),
      http.delete(
        `${URL_API_PRUEBA}/api/viaje/10/ocupaciones/puesto/2`,
        () => {
          llamadasLiberar++;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/conductor", {
      sesion: crearSesionDePrueba("Conductor"),
    });

    await usuario.click(await screen.findByRole("button", { name: "Editar" }));
    await usuario.click(
      await screen.findByRole("button", { name: "Copiloto, ocupado" }),
    );
    await usuario.click(
      screen.getByRole("button", { name: "Liberar puesto" }),
    );

    expect(llamadasLiberar).toBe(0);
    expect(
      screen.getByText(/eliminará la reserva y los datos del pasajero/),
    ).toBeInTheDocument();
    await usuario.click(
      screen.getByRole("button", { name: "Sí, liberar puesto" }),
    );

    await waitFor(() => expect(llamadasLiberar).toBe(1));
  });
});
