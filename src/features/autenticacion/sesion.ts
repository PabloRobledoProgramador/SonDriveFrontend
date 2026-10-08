// Único lugar del sitio que lee y escribe la sesión en el navegador (principio IV, FR-013).
import { z } from "zod";
import type { Sesion } from "./tipos";

export const CLAVE_SESION = "sondrive.sesion";

const esquemaSesion = z.object({
  token: z.string().min(1),
  expiracion: z.string().refine((valor) => !Number.isNaN(Date.parse(valor))),
  usuario: z.object({
    id: z.number(),
    nombre: z.string(),
    apellido: z.string(),
    correo: z.string(),
    celular: z.string(),
    estado: z.boolean(),
    rol: z.enum(["Administrador", "Conductor"]),
    foto: z.string().nullable(),
  }),
});

export interface ResultadoLectura {
  sesion: Sesion | null;
  // true cuando había una sesión válida pero ya vencida (se muestra el aviso de sesión vencida)
  descartadaPorVencimiento: boolean;
}

export function leerSesion(ahora: Date = new Date()): ResultadoLectura {
  let texto: string | null;
  try {
    texto = localStorage.getItem(CLAVE_SESION);
  } catch {
    return { sesion: null, descartadaPorVencimiento: false };
  }
  if (!texto) return { sesion: null, descartadaPorVencimiento: false };

  let sesion: Sesion;
  try {
    sesion = esquemaSesion.parse(JSON.parse(texto));
  } catch {
    borrarSesion();
    return { sesion: null, descartadaPorVencimiento: false };
  }

  if (Date.parse(sesion.expiracion) <= ahora.getTime()) {
    borrarSesion();
    return { sesion: null, descartadaPorVencimiento: true };
  }

  return { sesion, descartadaPorVencimiento: false };
}

// Token de la sesión vigente, sin efectos secundarios (lo usa el cliente HTTP en cada solicitud)
export function obtenerTokenVigente(ahora: Date = new Date()): string | null {
  try {
    const texto = localStorage.getItem(CLAVE_SESION);
    if (!texto) return null;
    const resultado = esquemaSesion.safeParse(JSON.parse(texto));
    if (!resultado.success) return null;
    return Date.parse(resultado.data.expiracion) > ahora.getTime() ? resultado.data.token : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: Sesion): void {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Almacenamiento bloqueado (modo privado): la sesión dura solo mientras la página esté abierta
  }
}

export function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar
  }
}
