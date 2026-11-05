import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En Docker sobre Windows/macOS los cambios del código montado solo se detectan por sondeo
    watch: { usePolling: process.env.VITE_USAR_SONDEO === "true" },
    open: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/pruebas/configuracion.ts"],
    globals: false,
    // Margen por prueba para equipos lentos (dentro de Docker comparten CPU con SQL Server)
    testTimeout: 15000,
    env: { VITE_URL_API: "http://api.prueba" },
  },
});
