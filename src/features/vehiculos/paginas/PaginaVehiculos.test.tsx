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

  describe("edición de los datos del vehículo", () => {
    const RUTA_EDICION = `${URL_API_PRUEBA}/api/vehiculo/8`;
    // Sin fecha de último servicio: el formulario no acepta una futura y el reloj es el real
    const kia: VehiculoFlota = { ...vehiculo, fechaUltimoServicio: null };
    const mazda: VehiculoFlota = {
      ...kia,
      id: 9,
      nombreVehiculo: "Mazda 3 2023",
      placa: "MNO456",
      modelo: "Mazda 3",
      annoModelo: "2023",
      idUsuario: 3,
      conductor: "Laura Pérez",
    };
    const conductores = [
      { id: 2, nombre: "Carlos", apellido: "Gómez" },
      { id: 3, nombre: "Laura", apellido: "Pérez" },
    ].map((conductor) => ({
      ...conductor,
      correo: `conductor${conductor.id}@sondrive.com`,
      celular: "3000000000",
      estado: true,
      rol: "Conductor",
      foto: null,
    }));

    // Flota que cambia entre consultas; cuenta las consultas y las ediciones
    function configurarEdicion(inicial: VehiculoFlota[]) {
      const estado = {
        lista: inicial,
        consultas: 0,
        solicitudes: [] as Record<string, unknown>[],
      };
      servidor.use(
        http.get(`${URL_API_PRUEBA}/api/vehiculo`, () => {
          estado.consultas++;
          return HttpResponse.json(estado.lista);
        }),
        http.get(`${URL_API_PRUEBA}/api/falla/vehiculo/:id`, () =>
          HttpResponse.json([]),
        ),
        http.get(`${URL_API_PRUEBA}/api/usuario`, () =>
          HttpResponse.json(conductores),
        ),
        http.get(`${URL_API_PRUEBA}/api/viaje/usuario/:id`, () =>
          HttpResponse.json([]),
        ),
      );
      return estado;
    }

    // El PUT responde con el vehículo dado y lo deja en la lista que se consulte después
    function responderEdicion(
      estado: ReturnType<typeof configurarEdicion>,
      actualizado: VehiculoFlota,
      listaDespues: VehiculoFlota[] = [actualizado],
    ) {
      servidor.use(
        http.put(RUTA_EDICION, async ({ request }) => {
          estado.solicitudes.push(
            (await request.json()) as Record<string, unknown>,
          );
          estado.lista = listaDespues;
          return HttpResponse.json(actualizado);
        }),
      );
    }

    function montarPagina() {
      const { router } = renderizarConApp("/vehiculos", {
        sesion: crearSesionDePrueba("Administrador"),
      });
      return { router, usuario: userEvent.setup() };
    }

    const detalle = () =>
      screen.getByRole("region", { name: "Detalle del vehículo" });
    const conteoResumen = (etiqueta: string) =>
      within(screen.getByLabelText("Resumen de estado de la flota")).getByText(
        etiqueta,
      ).previousElementSibling?.textContent;

    async function abrirEdicion(
      usuario: ReturnType<typeof userEvent.setup>,
      nombre = "Editar datos del vehículo Kia Rio 2022 ABC123",
    ) {
      await usuario.click(await screen.findByRole("button", { name: nombre }));
      const dialogo = await screen.findByRole("dialog");
      await waitFor(() =>
        expect(
          within(dialogo).getByRole("button", { name: "Guardar cambios" }),
        ).toBeEnabled(),
      );
      return dialogo;
    }

    const cambiar = (dialogo: HTMLElement, etiqueta: string, valor: string) =>
      fireEvent.change(within(dialogo).getByLabelText(etiqueta), {
        target: { value: valor },
      });
    const guardar = (
      usuario: ReturnType<typeof userEvent.setup>,
      dialogo: HTMLElement,
    ) =>
      usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

    it("edita los datos desde el detalle y actualiza detalle, lista y resumen", async () => {
      const estado = configurarEdicion([kia]);
      responderEdicion(estado, {
        ...kia,
        kilometraje: 49500,
        estado: "Óptimo",
        fallasPendientes: 0,
        tecnomecanica: {
          vencimiento: "2027-08-07T00:00:00",
          diasRestantes: 300,
        },
      });
      const { usuario } = montarPagina();

      const boton = await screen.findByRole("button", {
        name: "Editar datos del vehículo Kia Rio 2022 ABC123",
      });
      expect(boton).toHaveTextContent("Editar datos del vehículo");
      expect(conteoResumen("Alerta")).toBe("1");
      expect(conteoResumen("Óptimo")).toBe("0");

      const dialogo = await abrirEdicion(usuario);
      expect(dialogo).toHaveAccessibleName(
        "Editar datos de Kia Rio 2022 · ABC123",
      );
      expect(within(dialogo).getByLabelText("Placa")).toHaveValue("ABC123");
      expect(within(dialogo).getByLabelText("Conductor asignado")).toHaveValue(
        "2",
      );
      expect(
        within(dialogo).getByLabelText("Vencimiento tecnomecánica"),
      ).toHaveValue("2026-10-10");

      cambiar(dialogo, "Vencimiento tecnomecánica", "2027-08-07");
      cambiar(dialogo, "Kilometraje actual", "49500");
      await guardar(usuario, dialogo);

      expect(
        await screen.findByText("Los datos de Kia Rio 2022 se actualizaron."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(estado.solicitudes).toHaveLength(1);
      expect(estado.solicitudes[0]).toMatchObject({
        idUsuario: 2,
        kilometraje: 49500,
        vencimientoTecnomecanica: "2027-08-07",
      });
      expect(within(detalle()).getByText(/49\.500/)).toBeInTheDocument();
      expect(screen.queryByText("Vence en 20 días")).not.toBeInTheDocument();
      expect(
        within(detalle()).getByText("300 días restantes"),
      ).toBeInTheDocument();
      expect(conteoResumen("Alerta")).toBe("0");
      expect(conteoResumen("Óptimo")).toBe("1");
    });

    it("mantiene seleccionado el vehículo editado aunque cambie de lugar en la lista", async () => {
      const estado = configurarEdicion([kia, mazda]);
      const renombrado = { ...kia, placa: "ZZZ999" };
      responderEdicion(estado, renombrado, [mazda, renombrado]);
      const { usuario } = montarPagina();

      const dialogo = await abrirEdicion(usuario);
      cambiar(dialogo, "Placa", "ZZZ999");
      await guardar(usuario, dialogo);

      await screen.findByText("Los datos de Kia Rio 2022 se actualizaron.");
      expect(
        within(detalle()).getByRole("heading", { name: "Kia Rio 2022" }),
      ).toBeInTheDocument();
      expect(within(detalle()).getByText("ZZZ999")).toBeInTheDocument();
    });

    it("ofrece la edición en un vehículo crítico con el conductor deshabilitado", async () => {
      const duster: VehiculoFlota = {
        ...kia,
        id: 10,
        nombreVehiculo: "Renault Duster 2020",
        placa: "DEF456",
        idUsuario: 4,
        conductor: "Pedro Ruiz",
        soat: { vencimiento: "2026-01-01T00:00:00", diasRestantes: -5 },
      };
      configurarEdicion([kia, duster]);
      const { usuario } = montarPagina();

      await usuario.click(
        await screen.findByRole("button", { name: /Renault Duster 2020/ }),
      );
      // El estado crítico aparece en la insignia del vehículo y en la del SOAT vencido
      expect(
        (await within(detalle()).findAllByText("Acción urgente")).length,
      ).toBeGreaterThan(0);
      const dialogo = await abrirEdicion(
        usuario,
        "Editar datos del vehículo Renault Duster 2020 DEF456",
      );

      expect(dialogo).toHaveAccessibleName(
        "Editar datos de Renault Duster 2020 · DEF456",
      );
      expect(
        within(dialogo).getByLabelText("Conductor asignado"),
      ).toHaveDisplayValue("Pedro Ruiz (deshabilitado)");
    });

    it("al reasignar el vehículo nombra al nuevo conductor", async () => {
      const estado = configurarEdicion([kia]);
      responderEdicion(estado, {
        ...kia,
        idUsuario: 3,
        conductor: "Laura Pérez",
      });
      const { usuario } = montarPagina();

      const dialogo = await abrirEdicion(usuario);
      await usuario.selectOptions(
        within(dialogo).getByLabelText("Conductor asignado"),
        "3",
      );
      await guardar(usuario, dialogo);

      expect(
        await screen.findByText(
          "Los datos de Kia Rio 2022 se actualizaron. Ahora está asignado a Laura Pérez.",
        ),
      ).toBeInTheDocument();
      expect(estado.solicitudes[0]).toMatchObject({ idUsuario: 3 });
      expect(within(detalle()).getByText("Laura Pérez")).toBeInTheDocument();
      expect(
        within(
          screen.getByRole("region", { name: "Vehículos de la flota" }),
        ).getByText("Laura Pérez"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Carlos Gómez")).not.toBeInTheDocument();
    });

    it("con la placa repetida deja el formulario abierto y el vehículo sin cambios", async () => {
      configurarEdicion([kia]);
      servidor.use(
        http.put(RUTA_EDICION, () =>
          HttpResponse.json(
            {
              title: "Conflicto",
              status: 409,
              detail: "Ya existe otro vehículo con la placa 'XYZ789'.",
            },
            { status: 409 },
          ),
        ),
      );
      const { usuario } = montarPagina();

      const dialogo = await abrirEdicion(usuario);
      cambiar(dialogo, "Placa", "XYZ789");
      await guardar(usuario, dialogo);

      expect(
        await within(dialogo).findByText(
          "Ya existe otro vehículo con la placa 'XYZ789'.",
        ),
      ).toBeInTheDocument();
      expect(within(dialogo).getByLabelText("Placa")).toHaveValue("XYZ789");
      expect(screen.queryByText(/se actualizaron/)).not.toBeInTheDocument();
      expect(within(detalle()).getByText("ABC123")).toBeInTheDocument();
    });

    it("si el vehículo ya no existe vuelve a consultar la flota y conserva el formulario", async () => {
      const estado = configurarEdicion([kia, mazda]);
      servidor.use(
        http.put(RUTA_EDICION, () => {
          estado.lista = [mazda];
          return HttpResponse.json(
            {
              title: "No encontrado",
              status: 404,
              detail: "No existe el vehículo con id 8.",
            },
            { status: 404 },
          );
        }),
      );
      const { usuario } = montarPagina();

      const dialogo = await abrirEdicion(usuario);
      const consultasAntes = estado.consultas;
      cambiar(dialogo, "Kilometraje actual", "50000");
      await guardar(usuario, dialogo);

      expect(
        await within(dialogo).findByText("No existe el vehículo con id 8."),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(estado.consultas).toBeGreaterThan(consultasAntes),
      );
      expect(
        await within(detalle()).findByRole("heading", { name: "Mazda 3 2023" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toHaveAccessibleName(
        "Editar datos de Kia Rio 2022 · ABC123",
      );
      expect(
        within(screen.getByRole("dialog")).getByLabelText("Kilometraje actual"),
      ).toHaveValue(50000);
    });

    it("con la sesión rechazada lleva a iniciar sesión", async () => {
      configurarEdicion([kia]);
      servidor.use(
        http.put(RUTA_EDICION, () => new HttpResponse(null, { status: 401 })),
      );
      const { usuario, router } = montarPagina();

      const dialogo = await abrirEdicion(usuario);
      await guardar(usuario, dialogo);

      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/iniciar-sesion"),
      );
    });

    it("cancelar, cerrar o Escape no cambian nada y al reabrir trae los datos guardados", async () => {
      const estado = configurarEdicion([kia]);
      responderEdicion(estado, kia);
      const { usuario } = montarPagina();

      const cierres = [
        (dialogo: HTMLElement) =>
          usuario.click(
            within(dialogo).getByRole("button", { name: "Cancelar" }),
          ),
        (dialogo: HTMLElement) =>
          usuario.click(within(dialogo).getByRole("button", { name: "Cerrar" })),
        () => usuario.keyboard("{Escape}"),
      ];
      for (const cerrar of cierres) {
        const dialogo = await abrirEdicion(usuario);
        expect(screen.getAllByRole("dialog")).toHaveLength(1);
        // Al reabrir, los campos traen lo guardado y no lo que se escribió antes
        expect(
          within(dialogo).getByLabelText("Kilometraje actual"),
        ).toHaveValue(48200);
        expect(
          within(dialogo).getByLabelText("Conductor asignado"),
        ).toHaveValue("2");

        cambiar(dialogo, "Kilometraje actual", "99999");
        await usuario.selectOptions(
          within(dialogo).getByLabelText("Conductor asignado"),
          "3",
        );
        await cerrar(dialogo);

        await waitFor(() =>
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
        expect(within(detalle()).getByText(/48\.200/)).toBeInTheDocument();
        expect(within(detalle()).getByText("Carlos Gómez")).toBeInTheDocument();
      }

      expect(estado.solicitudes).toHaveLength(0);
      expect(screen.queryByText(/se actualizaron/)).not.toBeInTheDocument();
    });
  });
});
