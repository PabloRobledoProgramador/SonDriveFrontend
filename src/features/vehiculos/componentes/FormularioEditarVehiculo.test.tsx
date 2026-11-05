import { useQuery } from "@tanstack/react-query";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Seccion } from "../../../app/secciones";
import { MENSAJE_CONEXION } from "../../../lib/errores";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import {
  crearSesionDePrueba,
  renderizarConApp,
} from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";
import type { VehiculoFlota } from "../tipos";
import FormularioEditarVehiculo from "./FormularioEditarVehiculo";

const RUTA_EDICION = `${URL_API_PRUEBA}/api/vehiculo/8`;
const RUTA_CONDUCTORES = `${URL_API_PRUEBA}/api/usuario`;
const RUTA_VIAJES = `${URL_API_PRUEBA}/api/viaje/usuario/2`;

// Fechas relativas a hoy: el esquema lee el reloj
const fechaLocal = (dias: number) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toLocaleDateString("sv-SE");
};
const SERVICIO = fechaLocal(-30);
const SOAT = fechaLocal(120);
const TECNOMECANICA = fechaLocal(20);
const LICENCIA = fechaLocal(900);

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
  fechaUltimoServicio: `${SERVICIO}T00:00:00`,
  estado: "Óptimo",
  fallasPendientes: 0,
  soat: { vencimiento: `${SOAT}T00:00:00`, diasRestantes: 120 },
  tecnomecanica: { vencimiento: `${TECNOMECANICA}T00:00:00`, diasRestantes: 20 },
  licencia: { vencimiento: `${LICENCIA}T00:00:00`, diasRestantes: 900 },
};

const usuario = (id: number, nombre: string, apellido: string, cambios = {}) => ({
  id,
  nombre,
  apellido,
  correo: `usuario${id}@sondrive.com`,
  celular: "3001234567",
  estado: true,
  rol: "Conductor",
  foto: null,
  ...cambios,
});
const carlos = usuario(2, "Carlos", "Gómez");
const laura = usuario(3, "Laura", "Pérez");

const viaje = (id: number, idVehiculo: number) => ({
  id,
  fechaSalida: "2030-06-01T10:00:00",
  precio: 12000,
  ciudadOrigenId: 1,
  ciudadOrigen: "Sonsón",
  ciudadDestinoId: 2,
  ciudadDestino: "La Unión",
  idVehiculo,
  conductor: "Carlos Gómez",
  fotoConductor: null,
  cuposLibres: 3,
  cajuelasLibres: 4,
});

const alGuardar = vi.fn();
const alCancelar = vi.fn();
// Consultas con los prefijos que la edición debe invalidar
const consultarVehiculos = vi.fn(() => Promise.resolve("vehiculos"));
const consultarConductores = vi.fn(() => Promise.resolve("conductores"));
const consultarViajes = vi.fn(() => Promise.resolve("viajes"));
let vehiculoEnPrueba: VehiculoFlota = vehiculo;

function PaginaDePrueba() {
  useQuery({ queryKey: ["vehiculos", "prueba"], queryFn: consultarVehiculos });
  useQuery({
    queryKey: ["conductores", "prueba"],
    queryFn: consultarConductores,
  });
  useQuery({ queryKey: ["viajes", "prueba"], queryFn: consultarViajes });
  return (
    <FormularioEditarVehiculo
      vehiculo={vehiculoEnPrueba}
      alGuardar={alGuardar}
      alCancelar={alCancelar}
    />
  );
}

const secciones: Seccion[] = [
  {
    ruta: "/",
    nombre: "Prueba",
    acceso: "publico",
    enNavegacion: false,
    pagina: PaginaDePrueba,
  },
];

// Respuesta que la prueba libera cuando quiere
function retener() {
  let liberar = () => {};
  const espera = new Promise<void>((resolver) => {
    liberar = resolver;
  });
  return { espera, liberar };
}

// El PUT guarda lo que recibe y responde con el vehículo actualizado
function configurarEdicion(respuesta: VehiculoFlota = vehiculo) {
  const estado = { solicitudes: [] as Record<string, unknown>[] };
  servidor.use(
    http.put(RUTA_EDICION, async ({ request }) => {
      estado.solicitudes.push((await request.json()) as Record<string, unknown>);
      return HttpResponse.json(respuesta);
    }),
  );
  return estado;
}

const campoConductor = () =>
  screen.getByLabelText<HTMLSelectElement>("Conductor asignado");
const botonGuardar = () => screen.getByRole("button", { name: "Guardar cambios" });
const cambiar = (etiqueta: string, valor: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

async function montarFormulario(datos: VehiculoFlota = vehiculo) {
  vehiculoEnPrueba = datos;
  renderizarConApp("/", {
    sesion: crearSesionDePrueba("Administrador"),
    secciones,
  });
  await screen.findByRole("form", { name: "Editar datos del vehículo" });
  return userEvent.setup();
}

// Monta y espera a que la lista de conductores haya cargado
async function montarConListaCargada(datos: VehiculoFlota = vehiculo) {
  const usuarioEvento = await montarFormulario(datos);
  await waitFor(() => expect(botonGuardar()).toBeEnabled());
  return usuarioEvento;
}

beforeEach(() => {
  vi.clearAllMocks();
  servidor.use(
    http.get(RUTA_CONDUCTORES, () => HttpResponse.json([carlos, laura])),
    http.get(RUTA_VIAJES, () => HttpResponse.json([])),
  );
});

describe("FormularioEditarVehiculo", () => {
  describe("datos del vehículo", () => {
    it("muestra precargados los diez datos con el conductor actual elegido", async () => {
      await montarConListaCargada({ ...vehiculo, fechaUltimoServicio: null });

      expect(campoConductor()).toHaveValue("2");
      expect(campoConductor()).toHaveDisplayValue("Carlos Gómez");
      expect(screen.getByLabelText("Placa")).toHaveValue("ABC123");
      expect(screen.getByLabelText("Modelo del vehículo")).toHaveValue("Kia Rio");
      expect(screen.getByLabelText("Año del modelo")).toHaveValue(2022);
      expect(screen.getByLabelText("Tipo de vehículo")).toHaveValue("Sedan");
      expect(screen.getByLabelText("Kilometraje actual")).toHaveValue(48200);
      expect(screen.getByLabelText("Vencimiento SOAT")).toHaveValue(SOAT);
      expect(screen.getByLabelText("Vencimiento tecnomecánica")).toHaveValue(
        TECNOMECANICA,
      );
      expect(
        screen.getByLabelText("Vencimiento licencia de conducción"),
      ).toHaveValue(LICENCIA);
      expect(
        screen.getByLabelText("Fecha del último servicio (opcional)"),
      ).toHaveValue("");
    });

    it("muestra la fecha del último servicio sin la hora", async () => {
      await montarFormulario();

      expect(
        screen.getByLabelText("Fecha del último servicio (opcional)"),
      ).toHaveValue(SERVICIO);
    });

    it("conserva un tipo guardado que no está en la lista", async () => {
      await montarFormulario({ ...vehiculo, tipo: "Camioneta" });

      expect(screen.getByLabelText("Tipo de vehículo")).toHaveValue("Camioneta");
    });

    it("mantiene elegido al conductor actual mientras la lista carga y cuando llega", async () => {
      const lista = retener();
      servidor.use(
        http.get(RUTA_CONDUCTORES, async () => {
          await lista.espera;
          return HttpResponse.json([laura, carlos]);
        }),
      );
      const edicion = configurarEdicion();
      const usuarioEvento = await montarFormulario();

      expect(campoConductor()).toHaveValue("2");
      expect(campoConductor()).toHaveDisplayValue("Carlos Gómez");
      expect(
        screen.queryByText("Selecciona un conductor"),
      ).not.toBeInTheDocument();
      expect(botonGuardar()).toBeDisabled();

      lista.liberar();
      await waitFor(() => expect(botonGuardar()).toBeEnabled());
      expect(campoConductor()).toHaveValue("2");
      expect(campoConductor()).toHaveDisplayValue("Carlos Gómez");

      await usuarioEvento.click(botonGuardar());
      await waitFor(() => expect(alGuardar).toHaveBeenCalled());
      expect(edicion.solicitudes[0]).toMatchObject({ idUsuario: 2 });
    });

    it("envía los diez datos del contrato y avisa con el vehículo devuelto", async () => {
      const nuevoSoat = fechaLocal(365);
      const actualizado: VehiculoFlota = { ...vehiculo, kilometraje: 49500 };
      const edicion = configurarEdicion(actualizado);
      const usuarioEvento = await montarConListaCargada();

      cambiar("Placa", "abc123");
      cambiar("Kilometraje actual", "49500");
      cambiar("Vencimiento SOAT", nuevoSoat);
      cambiar("Fecha del último servicio (opcional)", "");
      await usuarioEvento.click(botonGuardar());

      await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(actualizado));
      expect(edicion.solicitudes).toEqual([
        {
          idUsuario: 2,
          placa: "ABC123",
          modelo: "Kia Rio",
          annoModelo: "2022",
          tipo: "Sedan",
          kilometraje: 49500,
          fechaUltimoServicio: null,
          vencimientoSoat: nuevoSoat,
          vencimientoTecnomecanica: TECNOMECANICA,
          vencimientoLicencia: LICENCIA,
        },
      ]);
    });

    it("guarda aunque no se haya modificado nada", async () => {
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.click(botonGuardar());

      await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(vehiculo));
      expect(edicion.solicitudes[0]).toMatchObject({
        idUsuario: 2,
        placa: "ABC123",
        kilometraje: 48200,
        fechaUltimoServicio: SERVICIO,
      });
    });

    it("mientras guarda deshabilita el botón y no envía dos veces", async () => {
      const respuesta = retener();
      let solicitudes = 0;
      servidor.use(
        http.put(RUTA_EDICION, async () => {
          solicitudes++;
          await respuesta.espera;
          return HttpResponse.json(vehiculo);
        }),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.click(botonGuardar());
      const enCurso = await screen.findByRole("button", { name: "Guardando…" });
      expect(enCurso).toBeDisabled();
      await usuarioEvento.click(enCurso);

      respuesta.liberar();
      await waitFor(() => expect(alGuardar).toHaveBeenCalledTimes(1));
      expect(solicitudes).toBe(1);
    });

    it("vuelve a consultar los vehículos, los conductores y los viajes al guardar", async () => {
      configurarEdicion();
      const usuarioEvento = await montarConListaCargada();
      await waitFor(() => expect(consultarViajes).toHaveBeenCalledTimes(1));

      await usuarioEvento.click(botonGuardar());

      await waitFor(() => {
        expect(consultarVehiculos).toHaveBeenCalledTimes(2);
        expect(consultarConductores).toHaveBeenCalledTimes(2);
        expect(consultarViajes).toHaveBeenCalledTimes(2);
      });
    });

    it("cancelar avisa sin enviar nada", async () => {
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      cambiar("Kilometraje actual", "1");
      await usuarioEvento.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(alCancelar).toHaveBeenCalledTimes(1);
      expect(edicion.solicitudes).toHaveLength(0);
    });
  });

  describe("conductor asignado", () => {
    const AVISO_VIAJES = /Este vehículo tiene \d+ viajes? próximos?/;
    const AVISO_SIN_CONSULTA =
      "No pudimos comprobar si este vehículo tiene viajes próximos. Si los tiene, pasarán al nuevo conductor.";

    const opciones = () =>
      within(campoConductor())
        .getAllByRole("option")
        .map((opcion) => opcion.textContent);

    // Los viajes del conductor actual, contando cuántas veces se piden
    function configurarViajes(viajes: unknown[]) {
      const estado = { consultas: 0 };
      servidor.use(
        http.get(RUTA_VIAJES, () => {
          estado.consultas++;
          return HttpResponse.json(viajes);
        }),
      );
      return estado;
    }

    it("ofrece solo a los conductores habilitados", async () => {
      servidor.use(
        http.get(RUTA_CONDUCTORES, () =>
          HttpResponse.json([
            usuario(1, "Ana", "Admin", { rol: "Administrador" }),
            carlos,
            laura,
            usuario(4, "Pedro", "Ruiz", { estado: false }),
          ]),
        ),
      );
      await montarConListaCargada();

      expect(opciones()).toEqual(["Carlos Gómez", "Laura Pérez"]);
    });

    it("conserva al conductor actual deshabilitado como primera opción", async () => {
      servidor.use(
        http.get(RUTA_CONDUCTORES, () =>
          HttpResponse.json([{ ...carlos, estado: false }, laura]),
        ),
      );
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      expect(opciones()).toEqual([
        "Carlos Gómez (deshabilitado)",
        "Laura Pérez",
      ]);
      expect(campoConductor()).toHaveValue("2");

      cambiar("Kilometraje actual", "50000");
      await usuarioEvento.click(botonGuardar());
      await waitFor(() => expect(alGuardar).toHaveBeenCalled());
      expect(edicion.solicitudes[0]).toMatchObject({
        idUsuario: 2,
        kilometraje: 50000,
      });
    });

    it("solo ofrece al conductor actual cuando no hay otro habilitado", async () => {
      servidor.use(http.get(RUTA_CONDUCTORES, () => HttpResponse.json([carlos])));
      await montarConListaCargada();

      expect(opciones()).toEqual(["Carlos Gómez"]);
    });

    it("avisa cuántos viajes próximos pasarán al nuevo conductor", async () => {
      configurarViajes([viaje(20, 8), viaje(21, 8), viaje(22, 9)]);
      const edicion = configurarEdicion({
        ...vehiculo,
        idUsuario: 3,
        conductor: "Laura Pérez",
      });
      const usuarioEvento = await montarConListaCargada();
      expect(screen.queryByText(AVISO_VIAJES)).not.toBeInTheDocument();

      await usuarioEvento.selectOptions(campoConductor(), "3");

      expect(
        await screen.findByText(
          "Este vehículo tiene 2 viajes próximos. Al guardar pasarán a Laura Pérez, con sus puestos ocupados.",
        ),
      ).toBeInTheDocument();
      expect(botonGuardar()).toBeEnabled();

      await usuarioEvento.click(botonGuardar());
      await waitFor(() => expect(alGuardar).toHaveBeenCalled());
      expect(edicion.solicitudes[0]).toMatchObject({ idUsuario: 3 });
    });

    it("usa el singular cuando solo hay un viaje próximo", async () => {
      configurarViajes([viaje(20, 8)]);
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.selectOptions(campoConductor(), "3");

      expect(
        await screen.findByText(
          "Este vehículo tiene 1 viaje próximo. Al guardar pasará a Laura Pérez, con sus puestos ocupados.",
        ),
      ).toBeInTheDocument();
    });

    it("no avisa si el vehículo no tiene viajes próximos", async () => {
      const viajes = configurarViajes([viaje(22, 9)]);
      const usuarioEvento = await montarConListaCargada();
      await waitFor(() => expect(viajes.consultas).toBeGreaterThan(0));

      await usuarioEvento.selectOptions(campoConductor(), "3");

      expect(campoConductor()).toHaveValue("3");
      expect(screen.queryByText(AVISO_VIAJES)).not.toBeInTheDocument();
      expect(screen.queryByText(AVISO_SIN_CONSULTA)).not.toBeInTheDocument();
      expect(botonGuardar()).toBeEnabled();
    });

    it("avisa cuando no se pudieron consultar los viajes próximos", async () => {
      servidor.use(
        http.get(RUTA_VIAJES, () => new HttpResponse(null, { status: 500 })),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.selectOptions(campoConductor(), "3");

      expect(await screen.findByText(AVISO_SIN_CONSULTA)).toBeInTheDocument();
      expect(botonGuardar()).toBeEnabled();
    });

    it("no muestra ningún aviso mientras la consulta de viajes sigue pendiente", async () => {
      const respuesta = retener();
      servidor.use(
        http.get(RUTA_VIAJES, async () => {
          await respuesta.espera;
          return HttpResponse.json([viaje(20, 8)]);
        }),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.selectOptions(campoConductor(), "3");

      expect(screen.queryByText(AVISO_VIAJES)).not.toBeInTheDocument();
      expect(screen.queryByText(AVISO_SIN_CONSULTA)).not.toBeInTheDocument();
      expect(botonGuardar()).toBeEnabled();

      respuesta.liberar();
      expect(await screen.findByText(AVISO_VIAJES)).toBeInTheDocument();
    });

    it("quita el aviso al volver a elegir al conductor actual", async () => {
      configurarViajes([viaje(20, 8)]);
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.selectOptions(campoConductor(), "3");
      expect(await screen.findByText(AVISO_VIAJES)).toBeInTheDocument();
      await usuarioEvento.selectOptions(campoConductor(), "2");

      expect(screen.queryByText(AVISO_VIAJES)).not.toBeInTheDocument();
    });
  });

  describe("datos inválidos y errores", () => {
    const problema = (status: number, detail: string) =>
      HttpResponse.json({ title: "Error", status, detail }, { status });

    it("muestra los mensajes junto a cada campo y no llama a la API", async () => {
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      cambiar("Placa", "AB12");
      cambiar("Modelo del vehículo", "");
      cambiar("Kilometraje actual", "-5");
      cambiar("Vencimiento SOAT", "");
      await usuarioEvento.click(botonGuardar());

      expect(
        await screen.findByText("Usa el formato de placa ABC 123."),
      ).toBeInTheDocument();
      expect(screen.getByText("Escribe el modelo.")).toBeInTheDocument();
      expect(
        screen.getByText("Escribe un kilometraje igual o mayor que cero."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Indica el vencimiento del SOAT."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Placa")).toBeInvalid();
      expect(edicion.solicitudes).toHaveLength(0);
      expect(alGuardar).not.toHaveBeenCalled();
    });

    it("muestra junto a cada campo los errores de validación del servidor", async () => {
      servidor.use(
        http.put(RUTA_EDICION, () =>
          HttpResponse.json(
            {
              title: "One or more validation errors occurred.",
              status: 400,
              errors: {
                Placa: [
                  "La placa debe tener 3 letras y 3 números, por ejemplo SXK 204.",
                ],
                Kilometraje: ["El kilometraje no puede ser negativo."],
              },
            },
            { status: 400 },
          ),
        ),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.click(botonGuardar());

      expect(
        await screen.findByText(
          "La placa debe tener 3 letras y 3 números, por ejemplo SXK 204.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("El kilometraje no puede ser negativo."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Placa")).toBeInvalid();
      expect(screen.getByLabelText("Kilometraje actual")).toBeInvalid();
      expect(alGuardar).not.toHaveBeenCalled();
    });

    it("informa la placa repetida sin perder lo escrito", async () => {
      servidor.use(
        http.put(RUTA_EDICION, () =>
          problema(409, "Ya existe otro vehículo con la placa 'XYZ789'."),
        ),
      );
      const usuarioEvento = await montarConListaCargada();

      cambiar("Placa", "XYZ789");
      cambiar("Kilometraje actual", "50000");
      await usuarioEvento.click(botonGuardar());

      expect(
        await screen.findByText("Ya existe otro vehículo con la placa 'XYZ789'."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Placa")).toHaveValue("XYZ789");
      expect(screen.getByLabelText("Kilometraje actual")).toHaveValue(50000);
      expect(alGuardar).not.toHaveBeenCalled();
    });

    it("informa cuando el conductor elegido quedó inactivo", async () => {
      servidor.use(
        http.put(RUTA_EDICION, () =>
          problema(409, "El conductor seleccionado está inactivo."),
        ),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.selectOptions(campoConductor(), "3");
      await usuarioEvento.click(botonGuardar());

      expect(
        await screen.findByText("El conductor seleccionado está inactivo."),
      ).toBeInTheDocument();
      expect(campoConductor()).toHaveValue("3");
      expect(alGuardar).not.toHaveBeenCalled();
    });

    it("informa cuando el vehículo ya no existe", async () => {
      servidor.use(
        http.put(RUTA_EDICION, () =>
          problema(404, "No existe el vehículo con id 8."),
        ),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.click(botonGuardar());

      expect(
        await screen.findByText("No existe el vehículo con id 8."),
      ).toBeInTheDocument();
      expect(alGuardar).not.toHaveBeenCalled();
    });

    it("muestra el aviso de conexión y permite reintentar", async () => {
      let intentos = 0;
      servidor.use(
        http.put(RUTA_EDICION, () => {
          intentos++;
          return intentos === 1
            ? HttpResponse.error()
            : HttpResponse.json(vehiculo);
        }),
      );
      const usuarioEvento = await montarConListaCargada();

      await usuarioEvento.click(botonGuardar());
      expect(await screen.findByText(MENSAJE_CONEXION)).toBeInTheDocument();
      expect(alGuardar).not.toHaveBeenCalled();

      await usuarioEvento.click(botonGuardar());
      await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(vehiculo));
      expect(screen.queryByText(MENSAJE_CONEXION)).not.toBeInTheDocument();
    });

    it("no deja guardar si no se pudo cargar la lista de conductores", async () => {
      let intentos = 0;
      servidor.use(
        http.get(RUTA_CONDUCTORES, () => {
          intentos++;
          return intentos === 1
            ? new HttpResponse(null, { status: 500 })
            : HttpResponse.json([carlos, laura]);
        }),
      );
      const usuarioEvento = await montarFormulario();

      const reintentar = await screen.findByRole("button", {
        name: "Reintentar",
      });
      expect(botonGuardar()).toBeDisabled();
      expect(campoConductor()).toHaveValue("2");

      await usuarioEvento.click(reintentar);

      await waitFor(() => expect(botonGuardar()).toBeEnabled());
      expect(
        screen.queryByRole("button", { name: "Reintentar" }),
      ).not.toBeInTheDocument();
      expect(campoConductor()).toHaveValue("2");
    });

    it("envía null cuando se borra la fecha del último servicio", async () => {
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      cambiar("Fecha del último servicio (opcional)", "");
      await usuarioEvento.click(botonGuardar());

      await waitFor(() => expect(alGuardar).toHaveBeenCalled());
      expect(edicion.solicitudes[0]).toMatchObject({ fechaUltimoServicio: null });
    });

    it("acepta un documento ya vencido", async () => {
      const ayer = fechaLocal(-1);
      const edicion = configurarEdicion();
      const usuarioEvento = await montarConListaCargada();

      cambiar("Vencimiento SOAT", ayer);
      await usuarioEvento.click(botonGuardar());

      await waitFor(() => expect(alGuardar).toHaveBeenCalled());
      expect(edicion.solicitudes[0]).toMatchObject({ vencimientoSoat: ayer });
    });
  });
});
