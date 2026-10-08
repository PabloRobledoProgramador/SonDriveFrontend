import { describe, expect, it } from "vitest";
import { ErrorApi, crearErrorDeConexion, crearErrorDesdeRespuesta } from "./errores";

function respuestaProblema(estado: number, cuerpo?: unknown) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/problem+json" },
  });
}

describe("crearErrorDeConexion", () => {
  it("indica que no hubo conexión con el servidor", () => {
    const error = crearErrorDeConexion();

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.tipo).toBe("conexion");
    expect(error.estado).toBeNull();
    expect(error.mensaje).toBe(
      "No pudimos conectar con SonDrive. Revisa tu conexión e inténtalo de nuevo.",
    );
  });
});

describe("crearErrorDesdeRespuesta", () => {
  it("400 con errores por campo: tipo validacion y claves en camelCase", async () => {
    const error = await crearErrorDesdeRespuesta(
      respuestaProblema(400, {
        title: "One or more validation errors occurred.",
        status: 400,
        errors: {
          Correo: ["El correo no tiene un formato válido."],
          Clave: ["La clave es obligatoria."],
        },
      }),
    );

    expect(error.tipo).toBe("validacion");
    expect(error.estado).toBe(400);
    expect(error.errores).toEqual({
      correo: ["El correo no tiene un formato válido."],
      clave: ["La clave es obligatoria."],
    });
  });

  it("401 del inicio de sesión: tipo credenciales con el detalle del servidor", async () => {
    const error = await crearErrorDesdeRespuesta(
      respuestaProblema(401, { title: "No autorizado", status: 401, detail: "Correo o clave incorrectos." }),
      { esInicioSesion: true },
    );

    expect(error.tipo).toBe("credenciales");
    expect(error.mensaje).toBe("Correo o clave incorrectos.");
  });

  it("401 fuera del inicio de sesión: tipo sesionVencida", async () => {
    const error = await crearErrorDesdeRespuesta(respuestaProblema(401, { status: 401 }));

    expect(error.tipo).toBe("sesionVencida");
    expect(error.mensaje).toBe("Tu sesión venció. Inicia sesión de nuevo.");
  });

  it("403: mensaje de permiso", async () => {
    const error = await crearErrorDesdeRespuesta(respuestaProblema(403, { status: 403 }));

    expect(error.tipo).toBe("prohibido");
    expect(error.mensaje).toBe("No tienes permiso para realizar esta acción.");
  });

  it("404 y 409: usan el detalle del servidor", async () => {
    const noEncontrado = await crearErrorDesdeRespuesta(
      respuestaProblema(404, { status: 404, detail: "El viaje no existe." }),
    );
    const regla = await crearErrorDesdeRespuesta(
      respuestaProblema(409, { status: 409, detail: "El vehículo ya tiene un viaje a esa hora." }),
    );

    expect(noEncontrado.tipo).toBe("noEncontrado");
    expect(noEncontrado.mensaje).toBe("El viaje no existe.");
    expect(regla.tipo).toBe("reglaNegocio");
    expect(regla.mensaje).toBe("El vehículo ya tiene un viaje a esa hora.");
  });

  it("500, cuerpo vacío o no JSON: mensaje genérico en español", async () => {
    const generico = "Ocurrió un error inesperado. Inténtalo de nuevo.";
    const servidor = await crearErrorDesdeRespuesta(
      respuestaProblema(500, { status: 500, detail: "Ocurrió un error inesperado." }),
    );
    const vacio = await crearErrorDesdeRespuesta(new Response(null, { status: 502 }));
    const html = await crearErrorDesdeRespuesta(new Response("<html>error</html>", { status: 500 }));

    expect(servidor.tipo).toBe("servidor");
    expect(servidor.mensaje).toBe(generico);
    expect(vacio.mensaje).toBe(generico);
    expect(html.mensaje).toBe(generico);
  });

  it("409 sin detalle: usa el mensaje genérico", async () => {
    const error = await crearErrorDesdeRespuesta(new Response(null, { status: 409 }));

    expect(error.tipo).toBe("reglaNegocio");
    expect(error.mensaje).toBe("Ocurrió un error inesperado. Inténtalo de nuevo.");
  });
});
