import { afterEach, describe, expect, it, vi } from "vitest";
import { obtenerUrlApi } from "./configuracion";

describe("obtenerUrlApi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devuelve la dirección configurada en VITE_URL_API", () => {
    vi.stubEnv("VITE_URL_API", "http://localhost:5064");

    expect(obtenerUrlApi()).toBe("http://localhost:5064");
  });

  it("lanza un error claro si VITE_URL_API no está configurada", () => {
    vi.stubEnv("VITE_URL_API", "");

    expect(() => obtenerUrlApi()).toThrow("Falta configurar VITE_URL_API en el archivo .env");
  });
});
