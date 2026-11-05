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

export const esquemaRegistro = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(100, "El nombre no puede superar los 100 caracteres."),
    apellido: z
      .string()
      .trim()
      .min(1, "El apellido es obligatorio.")
      .max(100, "El apellido no puede superar los 100 caracteres."),
    correo: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio.")
      .max(150, "El correo no puede superar los 150 caracteres.")
      .pipe(z.email("El correo no tiene un formato válido.")),
    celular: z
      .string()
      .trim()
      .regex(/^3\d{9}$/, "Usa un celular de 10 dígitos que empiece por 3."),
    clave: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .max(72, "La contraseña no puede superar los 72 caracteres."),
    confirmarClave: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((datos) => datos.clave === datos.confirmarClave, {
    path: ["confirmarClave"],
    message: "Las contraseñas no coinciden.",
  });

export type DatosRegistro = z.input<typeof esquemaRegistro>;
