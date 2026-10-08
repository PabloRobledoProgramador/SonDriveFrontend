import { afterEach, describe, expect, it, vi } from "vitest";
import { crearSesionDePrueba } from "../../pruebas/renderizarConApp";
import { CLAVE_SESION, guardarSesion, leerSesion, obtenerTokenVigente } from "./sesion";

const AHORA = new Date("2026-10-08T12:00:00Z");

describe("leerSesion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve la sesión vigente", () => {
    const sesion = crearSesionDePrueba("Conductor", new Date("2026-10-08T20:00:00Z"));
    guardarSesion(sesion);

    expect(leerSesion(AHORA)).toEqual({ sesion, descartadaPorVencimiento: false });
    expect(obtenerTokenVigente(AHORA)).toBe(sesion.token);
  });

  it.each([
    ["JSON dañado", "{no es json"],
    ["forma inválida", JSON.stringify({ token: "x" })],
    [
      "rol desconocido",
      JSON.stringify({ ...crearSesionDePrueba(), usuario: { ...crearSesionDePrueba().usuario, rol: "Pasajero" } }),
    ],
  ])("descarta y borra una sesión con %s, sin marcarla como vencida", (_caso, valor) => {
    localStorage.setItem(CLAVE_SESION, valor);

    expect(leerSesion(AHORA)).toEqual({ sesion: null, descartadaPorVencimiento: false });
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it("descarta la sesión vencida y lo informa", () => {
    guardarSesion(crearSesionDePrueba("Administrador", new Date("2026-10-08T11:59:59Z")));

    expect(leerSesion(AHORA)).toEqual({ sesion: null, descartadaPorVencimiento: true });
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(obtenerTokenVigente(AHORA)).toBeNull();
  });

  it("si el almacenamiento falla, queda como visitante sin romper", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("almacenamiento bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("almacenamiento bloqueado");
    });

    expect(() => guardarSesion(crearSesionDePrueba())).not.toThrow();
    expect(leerSesion(AHORA)).toEqual({ sesion: null, descartadaPorVencimiento: false });
    expect(obtenerTokenVigente(AHORA)).toBeNull();
  });
});
