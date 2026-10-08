import { z } from "zod";

// Mismas reglas y mensajes que InicioSesionDtoValidador del backend (principio III)
export const esquemaInicioSesion = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .max(150, "El correo no puede superar los 150 caracteres.")
    .pipe(z.email("El correo no tiene un formato válido.")),
  clave: z
    .string()
    .min(1, "La clave es obligatoria.")
    .max(72, "La clave no puede superar los 72 caracteres."),
});

export type DatosInicioSesion = z.input<typeof esquemaInicioSesion>;
