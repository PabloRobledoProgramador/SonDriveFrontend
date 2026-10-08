import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { URL_API_PRUEBA } from "../pruebas/manejadores";
import { servidor } from "../pruebas/servidor";
import {
  registrarManejadorSesionVencida,
  registrarProveedorToken,
  solicitar,
} from "./clienteHttp";
import { ErrorApi } from "./errores";

afterEach(() => {
  registrarProveedorToken(() => null);
  registrarManejadorSesionVencida(() => {});
});

describe("solicitar", () => {
  it("antepone la URL de la API y devuelve el JSON recibido", async () => {
    servidor.use(http.get(`${URL_API_PRUEBA}/api/recurso`, () => HttpResponse.json({ valor: 1 })));

    await expect(solicitar<{ valor: number }>("/api/recurso")).resolves.toEqual({ valor: 1 });
  });

  it("envía el cuerpo como JSON", async () => {
    let recibido: unknown;
    servidor.use(
      http.post(`${URL_API_PRUEBA}/api/recurso`, async ({ request }) => {
        recibido = await request.json();
        return HttpResponse.json({});
      }),
    );

    await solicitar("/api/recurso", { metodo: "POST", cuerpo: { nombre: "Ana" } });

    expect(recibido).toEqual({ nombre: "Ana" });
  });

  it("agrega el token solo si el proveedor devuelve uno", async () => {
    const cabeceras: (string | null)[] = [];
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/recurso`, ({ request }) => {
        cabeceras.push(request.headers.get("Authorization"));
        return HttpResponse.json({});
      }),
    );

    await solicitar("/api/recurso");
    registrarProveedorToken(() => "abc123");
    await solicitar("/api/recurso");

    expect(cabeceras).toEqual([null, "Bearer abc123"]);
  });

  it("devuelve undefined en una respuesta 204", async () => {
    servidor.use(
      http.delete(`${URL_API_PRUEBA}/api/recurso`, () => new HttpResponse(null, { status: 204 })),
    );

    await expect(solicitar("/api/recurso", { metodo: "DELETE" })).resolves.toBeUndefined();
  });

  it("ante un 401 fuera del inicio de sesión avisa la sesión vencida y lanza sesionVencida", async () => {
    const manejador = vi.fn();
    registrarManejadorSesionVencida(manejador);
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/recurso`, () =>
        HttpResponse.json({ status: 401 }, { status: 401 }),
      ),
    );

    const error = await solicitar("/api/recurso").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect((error as ErrorApi).tipo).toBe("sesionVencida");
    expect(manejador).toHaveBeenCalledOnce();
  });

  it("ante un 401 del inicio de sesión no avisa la sesión vencida", async () => {
    const manejador = vi.fn();
    registrarManejadorSesionVencida(manejador);
    servidor.use(
      http.post(`${URL_API_PRUEBA}/api/autenticacion/iniciar-sesion`, () =>
        HttpResponse.json({ status: 401, detail: "Correo o clave incorrectos." }, { status: 401 }),
      ),
    );

    const error = await solicitar("/api/autenticacion/iniciar-sesion", {
      metodo: "POST",
      cuerpo: {},
      esInicioSesion: true,
    }).catch((e: unknown) => e);

    expect((error as ErrorApi).tipo).toBe("credenciales");
    expect(manejador).not.toHaveBeenCalled();
  });

  it("si no hay conexión lanza un error de tipo conexion", async () => {
    servidor.use(http.get(`${URL_API_PRUEBA}/api/recurso`, () => HttpResponse.error()));

    const error = await solicitar("/api/recurso").catch((e: unknown) => e);

    expect((error as ErrorApi).tipo).toBe("conexion");
  });
});
