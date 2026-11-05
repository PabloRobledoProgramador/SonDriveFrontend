import { useQuery } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
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
import type { Usuario } from "../../autenticacion";
import FormularioEditarConductor from "./FormularioEditarConductor";

const RUTA_EDICION = `${URL_API_PRUEBA}/api/usuario/2/conductor`;

const conductor: Usuario = {
  id: 2,
  nombre: "Carlos",
  apellido: "Gómez",
  correo: "carlos@sondrive.com",
  celular: "3001234567",
  estado: true,
  rol: "Conductor",
  foto: "https://ejemplo.com/carlos.png",
};

const alGuardar = vi.fn();
const alCancelar = vi.fn();
// Consultas con los prefijos de las funcionalidades hermanas, para comprobar que se invalidan
const consultarVehiculos = vi.fn(() => Promise.resolve("vehiculos"));
const consultarViajes = vi.fn(() => Promise.resolve("viajes"));
let conductorEnPrueba: Usuario = conductor;

function PaginaDePrueba() {
  useQuery({ queryKey: ["vehiculos", "prueba"], queryFn: consultarVehiculos });
  useQuery({ queryKey: ["viajes", "prueba"], queryFn: consultarViajes });
  return (
    <FormularioEditarConductor
      conductor={conductorEnPrueba}
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

async function montarFormulario(datos: Usuario = conductor) {
  conductorEnPrueba = datos;
  renderizarConApp("/", {
    sesion: crearSesionDePrueba("Administrador"),
    secciones,
  });
  await screen.findByRole("form", { name: "Editar datos del conductor" });
  return userEvent.setup();
}

async function escribir(
  usuario: ReturnType<typeof userEvent.setup>,
  etiqueta: string,
  valor: string,
) {
  const campo = screen.getByLabelText(etiqueta);
  await usuario.clear(campo);
  if (valor) await usuario.type(campo, valor);
}

const guardar = (usuario: ReturnType<typeof userEvent.setup>) =>
  usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FormularioEditarConductor", () => {
  it("muestra los datos actuales del conductor y no pide contraseña", async () => {
    await montarFormulario();

    expect(screen.getByLabelText("Nombre")).toHaveValue("Carlos");
    expect(screen.getByLabelText("Apellidos")).toHaveValue("Gómez");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
      "carlos@sondrive.com",
    );
    expect(screen.getByLabelText("Celular")).toHaveValue("3001234567");
    expect(screen.getByLabelText("URL de foto (opcional)")).toHaveValue(
      "https://ejemplo.com/carlos.png",
    );
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });

  it("deja vacío el campo de la foto cuando el conductor no tiene", async () => {
    await montarFormulario({ ...conductor, foto: null });

    expect(screen.getByLabelText("URL de foto (opcional)")).toHaveValue("");
  });

  it("envía solo los cinco datos, recortados, y avisa al terminar", async () => {
    let solicitud: Record<string, unknown> | null = null;
    const actualizado: Usuario = {
      ...conductor,
      nombre: "Carla",
      celular: "3109876543",
      foto: null,
    };
    servidor.use(
      http.put(RUTA_EDICION, async ({ request }) => {
        solicitud = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(actualizado);
      }),
    );
    const usuario = await montarFormulario();

    await escribir(usuario, "Nombre", "  Carla ");
    await escribir(usuario, "Celular", " 3109876543 ");
    await escribir(usuario, "URL de foto (opcional)", "");
    await guardar(usuario);

    await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(actualizado));
    expect(solicitud).toEqual({
      nombre: "Carla",
      apellido: "Gómez",
      correo: "carlos@sondrive.com",
      celular: "3109876543",
      foto: null,
    });
  });

  it("vuelve a consultar los vehículos y los viajes después de guardar", async () => {
    servidor.use(http.put(RUTA_EDICION, () => HttpResponse.json(conductor)));
    const usuario = await montarFormulario();
    await waitFor(() => expect(consultarVehiculos).toHaveBeenCalledTimes(1));
    expect(consultarViajes).toHaveBeenCalledTimes(1);

    await guardar(usuario);

    await waitFor(() => expect(consultarVehiculos).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(consultarViajes).toHaveBeenCalledTimes(2));
  });

  it("guarda aunque no se haya cambiado nada", async () => {
    let solicitudes = 0;
    servidor.use(
      http.put(RUTA_EDICION, () => {
        solicitudes++;
        return HttpResponse.json(conductor);
      }),
    );
    const usuario = await montarFormulario();

    await guardar(usuario);

    await waitFor(() => expect(alGuardar).toHaveBeenCalledWith(conductor));
    expect(solicitudes).toBe(1);
  });

  it("mientras guarda muestra el avance y no permite un segundo envío", async () => {
    let solicitudes = 0;
    let responder: () => void = () => undefined;
    const respuestaPendiente = new Promise<void>((resolver) => {
      responder = resolver;
    });
    servidor.use(
      http.put(RUTA_EDICION, async () => {
        solicitudes++;
        await respuestaPendiente;
        return HttpResponse.json(conductor);
      }),
    );
    const usuario = await montarFormulario();

    await guardar(usuario);
    const enCurso = await screen.findByRole("button", { name: "Guardando…" });
    expect(enCurso).toBeDisabled();
    await usuario.click(enCurso);
    responder();

    await waitFor(() => expect(alGuardar).toHaveBeenCalledTimes(1));
    expect(solicitudes).toBe(1);
  });

  it("valida los datos antes de enviar y no llama a la API", async () => {
    let solicitudes = 0;
    servidor.use(
      http.put(RUTA_EDICION, () => {
        solicitudes++;
        return HttpResponse.json(conductor);
      }),
    );
    const usuario = await montarFormulario();

    await escribir(usuario, "Nombre", "");
    await escribir(usuario, "Correo electrónico", "no-es-correo");
    await escribir(usuario, "Celular", "300123");
    await escribir(usuario, "URL de foto (opcional)", "abc");
    await guardar(usuario);

    expect(await screen.findByText("Escribe el nombre.")).toBeInTheDocument();
    expect(screen.getByText("Escribe un correo válido.")).toBeInTheDocument();
    expect(
      screen.getByText("Usa 10 dígitos y comienza por 3."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escribe una URL válida para la foto."),
    ).toBeInTheDocument();
    expect(solicitudes).toBe(0);
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
              Celular: ["El celular debe tener 10 dígitos y empezar por 3."],
              Foto: ["La foto debe ser una dirección web válida."],
            },
          },
          { status: 400 },
        ),
      ),
    );
    const usuario = await montarFormulario();

    await guardar(usuario);

    expect(
      await screen.findByText(
        "El celular debe tener 10 dígitos y empezar por 3.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La foto debe ser una dirección web válida."),
    ).toBeInTheDocument();
    expect(alGuardar).not.toHaveBeenCalled();
  });

  it("informa el correo repetido sin perder lo escrito", async () => {
    servidor.use(
      http.put(RUTA_EDICION, () =>
        HttpResponse.json(
          {
            title: "Conflicto",
            status: 409,
            detail: "Ya existe otro usuario con el correo 'laura@sondrive.com'.",
          },
          { status: 409 },
        ),
      ),
    );
    const usuario = await montarFormulario();

    await escribir(usuario, "Correo electrónico", "laura@sondrive.com");
    await guardar(usuario);

    expect(
      await screen.findByText(
        "Ya existe otro usuario con el correo 'laura@sondrive.com'.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
      "laura@sondrive.com",
    );
    expect(alGuardar).not.toHaveBeenCalled();
  });

  it("muestra el aviso de conexión y permite reintentar", async () => {
    let intentos = 0;
    servidor.use(
      http.put(RUTA_EDICION, () => {
        intentos++;
        return intentos === 1
          ? HttpResponse.error()
          : HttpResponse.json(conductor);
      }),
    );
    const usuario = await montarFormulario();

    await escribir(usuario, "Nombre", "Carla");
    await guardar(usuario);

    expect(await screen.findByText(MENSAJE_CONEXION)).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Carla");
    expect(alGuardar).not.toHaveBeenCalled();

    await guardar(usuario);

    await waitFor(() => expect(alGuardar).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(MENSAJE_CONEXION)).not.toBeInTheDocument();
  });

  it("informa cuando el conductor ya no existe", async () => {
    servidor.use(
      http.put(RUTA_EDICION, () =>
        HttpResponse.json(
          {
            title: "No encontrado",
            status: 404,
            detail: "No existe un usuario con Id 2.",
          },
          { status: 404 },
        ),
      ),
    );
    const usuario = await montarFormulario();

    await guardar(usuario);

    expect(
      await screen.findByText("No existe un usuario con Id 2."),
    ).toBeInTheDocument();
    expect(alGuardar).not.toHaveBeenCalled();
  });

  it("avisa al cancelar sin enviar nada", async () => {
    const usuario = await montarFormulario();

    await escribir(usuario, "Nombre", "Otro");
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(alCancelar).toHaveBeenCalledTimes(1);
    expect(alGuardar).not.toHaveBeenCalled();
  });
});
