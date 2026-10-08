import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { crearRutas } from "../app/enrutador";
import Proveedores from "../app/proveedores";
import { secciones as seccionesDelSitio, type Seccion } from "../app/secciones";
import { guardarSesion } from "../features/autenticacion/sesion";
import type { Sesion } from "../features/autenticacion";

interface OpcionesRender {
  sesion?: Sesion;
  secciones?: Seccion[];
}

// Monta el sitio real (proveedores + enrutador) en memoria en la ruta indicada
export function renderizarConApp(ruta: string, { sesion, secciones }: OpcionesRender = {}) {
  if (sesion) guardarSesion(sesion);

  const clienteConsultas = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(crearRutas(secciones ?? seccionesDelSitio), {
    initialEntries: [ruta],
  });

  const resultado = render(
    <Proveedores clienteConsultas={clienteConsultas}>
      <RouterProvider router={router} />
    </Proveedores>,
  );

  return { ...resultado, router };
}

// Sesión de ejemplo vigente durante 8 horas
export function crearSesionDePrueba(
  rol: Sesion["usuario"]["rol"] = "Administrador",
  expiracion: Date = new Date(Date.now() + 8 * 60 * 60 * 1000),
): Sesion {
  return {
    token: "token-de-prueba",
    expiracion: expiracion.toISOString(),
    usuario: {
      id: rol === "Administrador" ? 1 : 2,
      nombre: rol === "Administrador" ? "Administrador" : "Carlos",
      apellido: rol === "Administrador" ? "SonDrive" : "Gómez",
      correo: rol === "Administrador" ? "admin@sondrive.com" : "carlos@sondrive.com",
      celular: "3000000000",
      estado: true,
      rol,
      foto: null,
    },
  };
}
