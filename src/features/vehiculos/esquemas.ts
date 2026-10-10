import { z } from "zod";

const anioActual = new Date().getFullYear();
const fechaValida = (valor: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
};
const esquemaFecha = (mensaje: string) =>
  z
    .string()
    .min(1, mensaje)
    .refine(fechaValida, "Indica una fecha válida.");

export const esquemaCrearVehiculo = z.object({
  idUsuario: z.string().min(1, "Elige el conductor.").refine(
    (id) => Number(id) > 0,
    "Elige un conductor válido.",
  ),
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}\s?\d{3}$/, "Usa el formato de placa ABC 123."),
  modelo: z
    .string()
    .trim()
    .min(1, "Escribe el modelo.")
    .max(100, "El modelo no puede superar los 100 caracteres."),
  annoModelo: z
    .string()
    .regex(/^\d{4}$/, "El año debe tener 4 dígitos.")
    .refine(
      (anio) => Number(anio) >= 1990 && Number(anio) <= anioActual + 1,
      "El año del modelo no es válido.",
    ),
  tipo: z.string().min(1, "Elige el tipo de vehículo.").max(50),
  kilometraje: z
    .string()
    .regex(/^\d+$/, "Escribe un kilometraje igual o mayor que cero."),
  fechaUltimoServicio: z
    .string()
    .refine(
      (fecha) =>
        fecha === "" ||
        (fechaValida(fecha) &&
          fecha <= new Date().toLocaleDateString("sv-SE")),
      "La fecha del último servicio no puede ser futura.",
    ),
  vencimientoSoat: esquemaFecha("Indica el vencimiento del SOAT."),
  vencimientoTecnomecanica: esquemaFecha(
    "Indica el vencimiento de la tecnomecánica.",
  ),
  vencimientoLicencia: esquemaFecha(
    "Indica el vencimiento de la licencia.",
  ),
});

export type DatosFormularioVehiculo = z.input<typeof esquemaCrearVehiculo>;

export const esquemaReportarFalla = z.object({
  descripcion: z
    .string()
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres.")
    .max(500, "La descripción no puede superar los 500 caracteres."),
  severidad: z.enum(["Informativo", "Alerta", "Crítico"]),
  fecha: z
    .string()
    .min(1, "Indica la fecha.")
    .refine(
      (fecha) =>
        fechaValida(fecha) &&
        fecha <= new Date().toLocaleDateString("sv-SE"),
      "La fecha no puede ser futura.",
    ),
});

export type DatosFormularioFalla = z.input<typeof esquemaReportarFalla>;
