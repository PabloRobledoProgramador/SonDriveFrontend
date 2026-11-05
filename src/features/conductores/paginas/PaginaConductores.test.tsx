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
    // La ruta llega con los viajes de cada conductor, después del listado
    await waitFor(() =>
      expect(screen.getAllByText("Bogotá ↔ Medellín")).toHaveLength(2),
    );
    const cuadroCarlos = screen.getByText("Carlos Gómez").closest("article")!;
    expect(
      within(cuadroCarlos).getByText("Viajes realizados").nextElementSibling,
    ).toHaveTextContent("—");
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
      await screen.findByRole("button", { name: "Agregar conductor" }),
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

  describe("edición de los datos del conductor", () => {
    const RUTA_EDICION = `${URL_API_PRUEBA}/api/usuario/2/conductor`;

    // Listado que cambia entre consultas; cuenta cuántas veces se pide
    function configurarListado(inicial: Usuario[]) {
      const estado = { lista: inicial, consultas: 0 };
      servidor.use(
        http.get(`${URL_API_PRUEBA}/api/usuario`, () => {
          estado.consultas++;
          return HttpResponse.json(estado.lista);
        }),
        http.get(`${URL_API_PRUEBA}/api/vehiculo`, () => HttpResponse.json([])),
        http.get(`${URL_API_PRUEBA}/api/viaje/usuario/:id`, () =>
          HttpResponse.json([]),
        ),
      );
      return estado;
    }

    // Para las pruebas en las que no debe guardarse nada
    function prohibirGuardado() {
      const estado = { solicitudes: 0 };
      servidor.use(
        http.put(RUTA_EDICION, () => {
          estado.solicitudes++;
          return HttpResponse.json(conductor);
        }),
      );
      return estado;
    }

    function abrirPagina() {
      return renderizarConApp("/conductores", {
        sesion: crearSesionDePrueba("Administrador"),
      });
    }

    const botonEditar = (nombre: string) =>
      screen.findByRole("button", {
        name: `Editar datos del conductor ${nombre}`,
      });

    it("muestra el botón de editar al final de cada cuadro, después de WhatsApp", async () => {
      configurarListado([conductor, conductorInactivo]);
      abrirPagina();

      const botonCarlos = await botonEditar("Carlos Gómez");
      const cuadroCarlos = botonCarlos.closest("article");
      expect(botonCarlos).toHaveTextContent("Editar datos del conductor");
      expect(cuadroCarlos?.lastElementChild).toBe(botonCarlos);
      expect(botonCarlos.previousElementSibling).toBe(
        within(cuadroCarlos!).getByRole("link", {
          name: "Contactar a Carlos por WhatsApp",
        }),
      );

      const botonLaura = await botonEditar("Laura Pérez");
      const cuadroLaura = botonLaura.closest("article");
      expect(cuadroLaura?.lastElementChild).toBe(botonLaura);
      expect(
        within(cuadroLaura!).queryByRole("link", { name: /WhatsApp/ }),
      ).not.toBeInTheDocument();
      expect(botonLaura).toBeEnabled();
    });

    it("abre los datos del conductor, los guarda y actualiza su cuadro", async () => {
      const listado = configurarListado([conductor]);
      let solicitud: Record<string, unknown> | null = null;
      servidor.use(
        http.put(RUTA_EDICION, async ({ request }) => {
          solicitud = (await request.json()) as Record<string, unknown>;
          const actualizado: Usuario = {
            ...conductor,
            nombre: "Carla",
            celular: "3109876543",
          };
          listado.lista = [actualizado];
          return HttpResponse.json(actualizado);
        }),
      );
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog", {
        name: "Editar datos de Carlos Gómez",
      });
      const nombre = within(dialogo).getByLabelText("Nombre");
      const celular = within(dialogo).getByLabelText("Celular");
      expect(nombre).toHaveValue("Carlos");
      expect(within(dialogo).getByLabelText("Correo electrónico")).toHaveValue(
        "carlos@sondrive.com",
      );
      await usuario.clear(nombre);
      await usuario.type(nombre, "Carla");
      await usuario.clear(celular);
      await usuario.type(celular, "3109876543");
      await usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(
        await screen.findByText("Los datos de Carla Gómez se actualizaron."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        await screen.findByRole("heading", { name: "Carla Gómez" }),
      ).toBeInTheDocument();
      expect(screen.getByText("3109876543")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Contactar a Carla por WhatsApp" }),
      ).toHaveAttribute("href", expect.stringContaining("wa.me/573109876543"));
      expect(solicitud).toEqual({
        nombre: "Carla",
        apellido: "Gómez",
        correo: "carlos@sondrive.com",
        celular: "3109876543",
        foto: null,
      });
    });

    it("mantiene la edición abierta y el cuadro igual si el correo ya está en uso", async () => {
      configurarListado([conductor]);
      servidor.use(
        http.put(RUTA_EDICION, () =>
          HttpResponse.json(
            {
              title: "Conflicto",
              status: 409,
              detail:
                "Ya existe otro usuario con el correo 'laura@sondrive.com'.",
            },
            { status: 409 },
          ),
        ),
      );
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog");
      const correo = within(dialogo).getByLabelText("Correo electrónico");
      await usuario.clear(correo);
      await usuario.type(correo, "laura@sondrive.com");
      await usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(
        await within(dialogo).findByText(
          "Ya existe otro usuario con el correo 'laura@sondrive.com'.",
        ),
      ).toBeInTheDocument();
      expect(correo).toHaveValue("laura@sondrive.com");
      expect(screen.queryByText(/se actualizaron/)).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Carlos Gómez" }),
      ).toBeInTheDocument();
    });

    it("al quitar la foto el cuadro muestra las iniciales", async () => {
      const conFoto: Usuario = {
        ...conductor,
        foto: "https://ejemplo.com/carlos.png",
      };
      const listado = configurarListado([conFoto]);
      let solicitud: Record<string, unknown> | null = null;
      servidor.use(
        http.put(RUTA_EDICION, async ({ request }) => {
          solicitud = (await request.json()) as Record<string, unknown>;
          listado.lista = [conductor];
          return HttpResponse.json(conductor);
        }),
      );
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog");
      await usuario.clear(
        within(dialogo).getByLabelText("URL de foto (opcional)"),
      );
      await usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(
        await screen.findByLabelText("Foto de Carlos no disponible"),
      ).toHaveTextContent("CG");
      expect(solicitud).toMatchObject({ foto: null });
    });

    it("vuelve a consultar el listado si el conductor ya no existe", async () => {
      const listado = configurarListado([conductor]);
      servidor.use(
        http.put(RUTA_EDICION, () => {
          listado.lista = [];
          return HttpResponse.json(
            {
              title: "No encontrado",
              status: 404,
              detail: "No existe un usuario con Id 2.",
            },
            { status: 404 },
          );
        }),
      );
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog");
      const consultasAntes = listado.consultas;
      await usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

      expect(
        await within(dialogo).findByText("No existe un usuario con Id 2."),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(listado.consultas).toBeGreaterThan(consultasAntes),
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { name: "Carlos Gómez" }),
        ).not.toBeInTheDocument(),
      );
    });

    it("cierra la sesión y lleva a iniciar sesión si el servidor rechaza el token", async () => {
      configurarListado([conductor]);
      servidor.use(
        http.put(RUTA_EDICION, () =>
          HttpResponse.json(
            { title: "No autorizado", status: 401 },
            { status: 401 },
          ),
        ),
      );
      const { router } = abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog");
      await usuario.click(
        within(dialogo).getByRole("button", { name: "Guardar cambios" }),
      );

      await waitFor(() =>
        expect(router.state.location.pathname).toBe("/iniciar-sesion"),
      );
    });

    it.each([
      ["el botón Cancelar", "Cancelar"],
      ["el botón Cerrar del modal", "Cerrar"],
    ])("no guarda nada al cerrar con %s", async (_descripcion, nombreBoton) => {
      configurarListado([conductor]);
      const guardado = prohibirGuardado();
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogo = await screen.findByRole("dialog");
      const nombre = within(dialogo).getByLabelText("Nombre");
      await usuario.clear(nombre);
      await usuario.type(nombre, "Otro");
      await usuario.click(
        within(dialogo).getByRole("button", { name: nombreBoton }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Carlos Gómez" }),
      ).toBeInTheDocument();
      expect(guardado.solicitudes).toBe(0);
    });

    it("no guarda nada al cerrar con Escape y al reabrir muestra los datos guardados", async () => {
      configurarListado([conductor]);
      const guardado = prohibirGuardado();
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const nombre = within(await screen.findByRole("dialog")).getByLabelText(
        "Nombre",
      );
      await usuario.clear(nombre);
      await usuario.type(nombre, "Otro");
      await usuario.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await usuario.click(await botonEditar("Carlos Gómez"));

      expect(
        within(await screen.findByRole("dialog")).getByLabelText("Nombre"),
      ).toHaveValue("Carlos");
      expect(guardado.solicitudes).toBe(0);
    });

    it("al pasar a otro conductor muestra sus datos y solo hay una edición abierta", async () => {
      configurarListado([conductor, conductorInactivo]);
      prohibirGuardado();
      abrirPagina();
      const usuario = userEvent.setup();

      await usuario.click(await botonEditar("Carlos Gómez"));
      const dialogoCarlos = await screen.findByRole("dialog");
      const nombre = within(dialogoCarlos).getByLabelText("Nombre");
      await usuario.clear(nombre);
      await usuario.type(nombre, "Otro");
      await usuario.click(
        within(dialogoCarlos).getByRole("button", { name: "Cancelar" }),
      );
      await usuario.click(await botonEditar("Laura Pérez"));

      const dialogos = await screen.findAllByRole("dialog");
      expect(dialogos).toHaveLength(1);
      expect(dialogos[0]).toHaveAccessibleName("Editar datos de Laura Pérez");
      expect(within(dialogos[0]).getByLabelText("Nombre")).toHaveValue("Laura");
      expect(
        within(dialogos[0]).getByLabelText("Correo electrónico"),
      ).toHaveValue("laura@sondrive.com");
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
