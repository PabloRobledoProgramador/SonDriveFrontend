import { afterEach, describe, expect, it, vi } from "vitest";
import { obtenerUrlApi } from "./configuracion";

describe("obtenerUrlApi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devuelve la dirección configurada en VITE_API_URL", () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:5064");

    expect(obtenerUrlApi()).toBe("http://localhost:5064");
  });

  it("devuelve la dirección quitando la barra final si la tiene", () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:5064/");

    expect(obtenerUrlApi()).toBe("http://localhost:5064");
  });

  it("lanza un error claro si ni VITE_API_URL ni VITE_URL_API están configuradas", () => {
    vi.stubEnv("VITE_API_URL", "");
    vi.stubEnv("VITE_URL_API", "");

    expect(() => obtenerUrlApi()).toThrow(
      "Falta configurar VITE_API_URL en el archivo .env",
    );
  });
});
