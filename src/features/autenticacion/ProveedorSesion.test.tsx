import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { secciones as seccionesDelSitio, type Seccion } from "../../app/secciones";
import { solicitar } from "../../lib/clienteHttp";
import { URL_API_PRUEBA } from "../../pruebas/manejadores";
import { crearSesionDePrueba, renderizarConApp } from "../../pruebas/renderizarConApp";
import { servidor } from "../../pruebas/servidor";
import { CLAVE_SESION, guardarSesion } from "./sesion";

const AVISO_VENCIDA = "Tu sesión venció. Inicia sesión de nuevo.";

const seccionesConPrivada: Seccion[] = [
  ...seccionesDelSitio,
  {
    ruta: "/solo-admin",
    nombre: "Solo administradora",
    acceso: ["Administrador"],
    enNavegacion: false,
    pagina: () => <p>Contenido privado</p>,
  },
];

describe("ProveedorSesion", () => {
  it("conserva la sesión guardada al montar el sitio (recarga)", async () => {
    renderizarConApp("/", { sesion: crearSesionDePrueba("Conductor") });

    expect(await screen.findByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.getAllByText("Carlos").length).toBeGreaterThan(0);
  });

  it("Cerrar sesión borra la sesión, muestra Iniciar sesión y lleva al inicio", async () => {
    const usuario = userEvent.setup();
    const { router } = renderizarConApp("/iniciar-sesion?volver=%2F", { sesion: crearSesionDePrueba() });
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    await act(() => router.navigate("/?pagina=2"));

    await usuario.click(await screen.findByRole("button", { name: "Cerrar sesión" }));

    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(await screen.findByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
  });

  it("al abrir /iniciar-sesion con sesión lleva al inicio", async () => {
    const { router } = renderizarConApp("/iniciar-sesion", { sesion: crearSesionDePrueba() });

    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });

  it("si otra pestaña borra la sesión, se cierra sin navegar", async () => {
    const { router } = renderizarConApp("/", { sesion: crearSesionDePrueba() });
    await screen.findByRole("button", { name: "Cerrar sesión" });

    act(() => {
      localStorage.removeItem(CLAVE_SESION);
      window.dispatchEvent(new StorageEvent("storage", { key: CLAVE_SESION, newValue: null }));
    });

    expect(await screen.findByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
    expect(screen.queryByText(AVISO_VENCIDA)).not.toBeInTheDocument();
  });

  describe("vencimiento por tiempo", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date("2026-10-08T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const sesionQueVenceEnUnMinuto = () =>
      crearSesionDePrueba("Administrador", new Date("2026-10-08T12:01:00Z"));

    it("(a) en una ruta pública cierra la sesión, muestra el aviso y se queda en la ruta", async () => {
      const { router } = renderizarConApp("/", { sesion: sesionQueVenceEnUnMinuto() });
      await screen.findByRole("button", { name: "Cerrar sesión" });

      await act(() => vi.advanceTimersByTimeAsync(61_000));

      expect(await screen.findByText(AVISO_VENCIDA)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/");
    });

    it("(b) en una ruta privada lleva a iniciar sesión recordando la ruta", async () => {
      const { router } = renderizarConApp("/solo-admin", {
        sesion: sesionQueVenceEnUnMinuto(),
        secciones: seccionesConPrivada,
      });
      await screen.findByText("Contenido privado");

      await act(() => vi.advanceTimersByTimeAsync(61_000));

      await waitFor(() => expect(router.state.location.pathname).toBe("/iniciar-sesion"));
      expect(router.state.location.search).toBe("?volver=%2Fsolo-admin");
      expect(await screen.findByText(AVISO_VENCIDA)).toBeInTheDocument();
    });

    it("(d) el aviso se borra del historial para que no reaparezca al recargar", async () => {
      const { router } = renderizarConApp("/", { sesion: sesionQueVenceEnUnMinuto() });
      await screen.findByRole("button", { name: "Cerrar sesión" });

      await act(() => vi.advanceTimersByTimeAsync(61_000));

      await screen.findByText(AVISO_VENCIDA);
      await waitFor(() => expect(router.state.location.state).toBeNull());
    });

    it("(e) después del cierre, navegar no repite la redirección", async () => {
      const { router } = renderizarConApp("/solo-admin", {
        sesion: sesionQueVenceEnUnMinuto(),
        secciones: seccionesConPrivada,
      });
      await screen.findByText("Contenido privado");
      await act(() => vi.advanceTimersByTimeAsync(61_000));
      await waitFor(() => expect(router.state.location.pathname).toBe("/iniciar-sesion"));

      await act(() => router.navigate("/"));

      expect(router.state.location.pathname).toBe("/");
    });
  });

  it("(c) un 401 del servidor en una ruta pública lleva a iniciar sesión con el aviso", async () => {
    servidor.use(
      http.get(`${URL_API_PRUEBA}/api/autenticacion/perfil`, () =>
        HttpResponse.json({ status: 401 }, { status: 401 }),
      ),
    );
    const { router } = renderizarConApp("/", { sesion: crearSesionDePrueba() });
    await screen.findByRole("button", { name: "Cerrar sesión" });

    await act(async () => {
      await solicitar("/api/autenticacion/perfil").catch(() => undefined);
    });

    await waitFor(() => expect(router.state.location.pathname).toBe("/iniciar-sesion"));
    expect(router.state.location.search).toBe("?volver=%2F");
    expect(await screen.findByText(AVISO_VENCIDA)).toBeInTheDocument();
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it("(f) al abrir el sitio con una sesión ya vencida queda como visitante y ve el aviso", async () => {
    guardarSesion(crearSesionDePrueba("Administrador", new Date(Date.now() - 1000)));

    renderizarConApp("/");

    expect(await screen.findByText(AVISO_VENCIDA)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("(f) con una sesión dañada queda como visitante sin aviso", async () => {
    localStorage.setItem(CLAVE_SESION, "{dañada");

    renderizarConApp("/");

    expect(await screen.findByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByText(AVISO_VENCIDA)).not.toBeInTheDocument();
  });
});
