import { z } from "zod";

export const esquemaCrearConductor = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  apellido: z
    .string()
    .trim()
    .min(1, "Escribe los apellidos.")
    .max(100, "Los apellidos no pueden superar los 100 caracteres."),
  correo: z
    .string()
    .trim()
    .email("Escribe un correo válido.")
    .max(150, "El correo no puede superar los 150 caracteres."),
  celular: z
    .string()
    .regex(/^3\d{9}$/, "Usa 10 dígitos y comienza por 3."),
  clave: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
  foto: z
    .string()
    .trim()
    .refine(
      (url) => url === "" || z.url().safeParse(url).success,
      "Escribe una URL válida para la foto.",
    ),
});

export type DatosFormularioConductor = z.input<typeof esquemaCrearConductor>;
