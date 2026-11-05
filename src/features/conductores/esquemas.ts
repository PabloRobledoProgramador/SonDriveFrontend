import { z } from "zod";

const MENSAJE_FOTO = "Escribe una URL válida para la foto.";

// Datos comunes al alta y a la edición: así ambos formularios no pueden divergir.
// Los textos se recortan antes de validar, igual que en el servidor.
const datosConductor = {
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
    .trim()
    .regex(/^3\d{9}$/, "Usa 10 dígitos y comienza por 3."),
  // Opcional; si se escribe, solo http o https (misma regla que ValidacionFoto en el backend)
  foto: z
    .string()
    .trim()
    .max(500, "La URL de la foto no puede superar los 500 caracteres.")
    .refine(
      (url) =>
        url === "" ||
        (/^https?:\/\//i.test(url) && z.url().safeParse(url).success),
      MENSAJE_FOTO,
    ),
};

export const esquemaCrearConductor = z.object({
  ...datosConductor,
  clave: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
});

// La edición no incluye contraseña, rol ni estado
export const esquemaEditarConductor = z.object(datosConductor);

export type DatosFormularioConductor = z.input<typeof esquemaCrearConductor>;
export type DatosFormularioEdicionConductor = z.input<
  typeof esquemaEditarConductor
>;
