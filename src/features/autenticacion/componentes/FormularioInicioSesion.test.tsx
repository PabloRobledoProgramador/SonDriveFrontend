import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  CLAVE_ADMIN,
  CORREO_ADMIN,
  CORREO_INACTIVO,
  URL_API_PRUEBA,
} from "../../../pruebas/manejadores";
import { renderizarConApp } from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";
import { CLAVE_SESION } from "../sesion";

const RUTA_LOGIN = `${URL_API_PRUEBA}/api/autenticacion/iniciar-sesion`;

async function llenarYEnviar(correo: string, clave: string) {
  const usuario = userEvent.setup();
  // La página se carga de forma diferida: esperar a que exista el formulario
  const campoCorreo = await screen.findByLabelText("Correo electrónico");
  if (correo) await usuario.type(campoCorreo, correo);
  if (clave) await usuario.type(screen.getByLabelText("Contraseña"), clave);
  await usuario.click(screen.getByRole("button", { name: "Entrar" }));
  return usuario;
}

describe("FormularioInicioSesion", () => {
  it("enviar vacío muestra los mensajes de cada campo y no hace solicitudes", async () => {
    let solicitudes = 0;
    servidor.events.on("request:start", () => {
      solicitudes++;
    });
    renderizarConApp("/iniciar-sesion");

    await llenarYEnviar("", "");

    expect(await screen.findByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La clave es obligatoria.")).toBeInTheDocument();
    expect(solicitudes).toBe(0);
    servidor.events.removeAllListeners();
  });

  it("credenciales incorrectas: muestra el mensaje del servidor, conserva el correo y limpia la contraseña", async () => {
    renderizarConApp("/iniciar-sesion");

    await llenarYEnviar(CORREO_ADMIN, "clave-errada");

    expect(await screen.findByText("Correo o clave incorrectos.")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(CORREO_ADMIN);
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
  });

  it("cuenta desactivada: muestra su mensaje", async () => {
    renderizarConApp("/iniciar-sesion");

    await llenarYEnviar(CORREO_INACTIVO, "Clave12345*");

    expect(
      await screen.findByText("El usuario está desactivado. Contacta al administrador."),
    ).toBeInTheDocument();
  });

  it("400 del servidor: asigna los errores a cada campo", async () => {
    servidor.use(
      http.post(RUTA_LOGIN, () =>
        HttpResponse.json(
          { status: 400, errors: { Correo: ["El correo no tiene un formato válido."] } },
          { status: 400 },
        ),
      ),
    );
    renderizarConApp("/iniciar-sesion");

    await llenarYEnviar(CORREO_ADMIN, CLAVE_ADMIN);

    const mensaje = await screen.findByText("El correo no tiene un formato válido.");
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("aria-describedby", mensaje.id);
  });

  it("sin conexión: muestra el mensaje de conexión", async () => {
    servidor.use(http.post(RUTA_LOGIN, () => HttpResponse.error()));
    renderizarConApp("/iniciar-sesion");

    await llenarYEnviar(CORREO_ADMIN, CLAVE_ADMIN);

    expect(
      await screen.findByText("No pudimos conectar con SonDrive. Revisa tu conexión e inténtalo de nuevo."),
    ).toBeInTheDocument();
  });

  it("doble clic en Entrar produce una sola solicitud y el botón muestra Entrando…", async () => {
    let solicitudes = 0;
    servidor.use(
      http.post(RUTA_LOGIN, async () => {
        solicitudes++;
        await delay(400);
        return HttpResponse.json({ status: 401, detail: "Correo o clave incorrectos." }, { status: 401 });
      }),
    );
    const usuario = userEvent.setup();
    renderizarConApp("/iniciar-sesion");
    await usuario.type(await screen.findByLabelText("Correo electrónico"), CORREO_ADMIN);
    await usuario.type(screen.getByLabelText("Contraseña"), CLAVE_ADMIN);

    await usuario.dblClick(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled());
    await screen.findByText("Correo o clave incorrectos.");
    expect(solicitudes).toBe(1);
  });

  it("éxito sin volver: guarda la sesión, va al inicio y la cabecera muestra el nombre", async () => {
    const { router } = renderizarConApp("/iniciar-sesion");

    await llenarYEnviar(CORREO_ADMIN, CLAVE_ADMIN);

    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(localStorage.getItem(CLAVE_SESION)).not.toBeNull();
    expect(await screen.findByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.getAllByText(/Administrador/).length).toBeGreaterThan(0);
  });

  it.each([
    ["/", "/"],
    ["/privada", "/privada"],
    ["//externo.com", "/"],
    ["https://externo.com", "/"],
  ])("éxito con volver=%s navega a %s", async (volver, esperado) => {
    const { router } = renderizarConApp(`/iniciar-sesion?volver=${encodeURIComponent(volver)}`);

    await llenarYEnviar(CORREO_ADMIN, CLAVE_ADMIN);

    await waitFor(() => expect(router.state.location.pathname).toBe(esperado));
  });

  it("el botón Iniciar sesión de la cabecera recuerda la página actual", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/");

    await usuario.click(await screen.findByRole("link", { name: "Iniciar sesión" }));

    expect(router.state.location.pathname).toBe("/iniciar-sesion");
    expect(router.state.location.search).toBe("?volver=%2F");
  });

  it("ofrece registro y no ofrece recuperación de contraseña", async () => {
    renderizarConApp("/iniciar-sesion");

    await screen.findByLabelText("Correo electrónico");

    expect(
      screen.getByRole("button", { name: "Registrarse" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Olvidaste/i)).not.toBeInTheDocument();
  });

  it("el botón Registrarse abre el formulario de creación de cuenta", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/iniciar-sesion");

    await usuario.click(
      await screen.findByRole("button", { name: "Registrarse" }),
    );

    expect(router.state.location.pathname).toBe("/registrarse");
    expect(
      await screen.findByRole("form", { name: "Crear cuenta" }),
    ).toBeInTheDocument();
  });
});
