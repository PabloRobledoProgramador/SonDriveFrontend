import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { URL_API_PRUEBA } from "../../../pruebas/manejadores";
import { renderizarConApp } from "../../../pruebas/renderizarConApp";
import { servidor } from "../../../pruebas/servidor";

const RUTA_REGISTRO = `${URL_API_PRUEBA}/api/usuario/registro`;

async function completarFormulario() {
  const usuario = userEvent.setup();
  const formulario = await screen.findByRole("form", { name: "Crear cuenta" });
  await usuario.type(screen.getByLabelText("Nombre"), "Ana");
  await usuario.type(screen.getByLabelText("Apellido"), "Pérez");
  await usuario.type(
    screen.getByLabelText("Correo electrónico"),
    "ana@ejemplo.com",
  );
  await usuario.type(screen.getByLabelText("Celular"), "3001234567");
  await usuario.type(screen.getByLabelText("Contraseña"), "Conductor123*");
  await usuario.type(
    screen.getByLabelText("Confirmar contraseña"),
    "Conductor123*",
  );
  return { usuario, formulario };
}

describe("FormularioRegistro", () => {
  it("valida campos obligatorios y no llama a la API mientras el formulario sea inválido", async () => {
    let solicitudes = 0;
    servidor.use(
      http.post(RUTA_REGISTRO, () => {
        solicitudes++;
        return HttpResponse.json({});
      }),
    );
    renderizarConApp("/registrarse");

    await userEvent.setup().click(
      await screen.findByRole("button", { name: "Registrarse" }),
    );

    expect(await screen.findByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El apellido es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Usa un celular de 10 dígitos que empiece por 3.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La contraseña debe tener al menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(solicitudes).toBe(0);
  });

  it("crea una cuenta con el UsuarioCrearDto y siempre solicita rol Conductor", async () => {
    let solicitud: Record<string, unknown> | null = null;
    servidor.use(
      http.post(RUTA_REGISTRO, async ({ request }) => {
        solicitud = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            id: 27,
            nombre: "Ana",
            apellido: "Pérez",
            correo: "ana@ejemplo.com",
            celular: "3001234567",
            estado: true,
            rol: "Conductor",
            foto: null,
          },
          { status: 201 },
        );
      }),
    );
    const { router } = renderizarConApp("/registrarse");
    const { usuario, formulario } = await completarFormulario();
    await usuario.click(
      within(formulario).getByRole("button", { name: "Registrarse" }),
    );

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/iniciar-sesion"),
    );
    expect(router.state.location.search).toBe("?correo=ana%40ejemplo.com");
    expect(solicitud).toEqual({
      nombre: "Ana",
      apellido: "Pérez",
      correo: "ana@ejemplo.com",
      celular: "3001234567",
      clave: "Conductor123*",
      estado: true,
      rol: "Conductor",
      foto: null,
    });
    expect(
      await screen.findByText(
        "Tu cuenta fue creada. Inicia sesión con tus datos.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
      "ana@ejemplo.com",
    );
  });

  it("rechaza contraseñas que no coinciden antes de llamar a la API", async () => {
    let solicitudes = 0;
    servidor.use(
      http.post(RUTA_REGISTRO, () => {
        solicitudes++;
        return HttpResponse.json({});
      }),
    );
    renderizarConApp("/registrarse");
    const usuario = userEvent.setup();
    const formulario = await screen.findByRole("form", { name: "Crear cuenta" });
    await usuario.type(screen.getByLabelText("Nombre"), "Ana");
    await usuario.type(screen.getByLabelText("Apellido"), "Pérez");
    await usuario.type(
      screen.getByLabelText("Correo electrónico"),
      "ana@ejemplo.com",
    );
    await usuario.type(screen.getByLabelText("Celular"), "3001234567");
    await usuario.type(screen.getByLabelText("Contraseña"), "Conductor123*");
    await usuario.type(
      screen.getByLabelText("Confirmar contraseña"),
      "OtraClave123*",
    );
    await usuario.click(
      within(formulario).getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden."),
    ).toBeInTheDocument();
    expect(solicitudes).toBe(0);
  });

  it("muestra el error por correo duplicado que devuelve la API", async () => {
    servidor.use(
      http.post(RUTA_REGISTRO, () =>
        HttpResponse.json(
          {
            title: "Regla de negocio incumplida",
            status: 409,
            detail: "Ya existe un usuario con ese correo.",
          },
          { status: 409 },
        ),
      ),
    );
    renderizarConApp("/registrarse");
    const { usuario, formulario } = await completarFormulario();
    await usuario.click(
      within(formulario).getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByText("Ya existe un usuario con ese correo."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
  });
});
