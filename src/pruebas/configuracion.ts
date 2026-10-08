import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { servidor } from "./servidor";

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
