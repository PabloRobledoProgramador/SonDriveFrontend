import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { servidor } from "./servidor";

// Margen para findBy/waitFor en equipos lentos (p. ej. dentro de Docker): las páginas se cargan de
// forma diferida y la primera puede tardar más de 1 s. Si todo va bien, no alarga las pruebas.
configure({ asyncUtilTimeout: 5000 });

// Configuración común de Vitest: API simulada con MSW, sin red real ni datos entre pruebas
beforeAll(() => {
  servidor.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  servidor.resetHandlers();
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

afterAll(() => {
  servidor.close();
});
