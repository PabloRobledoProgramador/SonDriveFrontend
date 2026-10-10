import { z } from "zod";

export const esquemaBuscarViaje = z
  .object({
    origenId: z.string().min(1, "Elige la ciudad de origen."),
    destinoId: z.string().min(1, "Elige la ciudad de destino."),
    fecha: z.string().optional(),
  })
  .refine(
    (datos) =>
      !datos.origenId || !datos.destinoId || datos.origenId !== datos.destinoId,
    {
      path: ["destinoId"],
      message: "El destino debe ser distinto del origen.",
    },
  );

export type DatosBuscarViaje = z.input<typeof esquemaBuscarViaje>;

export const esquemaCrearViaje = z
  .object({
    origenId: z.string().min(1, "Elige la ciudad de origen."),
    destinoId: z.string().min(1, "Elige la ciudad de destino."),
    vehiculoId: z.string().min(1, "Elige el vehículo."),
    fecha: z.string().min(1, "Elige la fecha."),
    hora: z.string().min(1, "Elige la hora."),
    precio: z
      .string()
      .min(1, "Escribe el precio.")
      .refine(
        (valor) => !valor || Number(valor) > 0,
        "El precio debe ser mayor a cero.",
      ),
  })
  .refine(
    (datos) =>
      !datos.origenId || !datos.destinoId || datos.origenId !== datos.destinoId,
    {
      path: ["destinoId"],
      message: "El destino debe ser distinto del origen.",
    },
  )
  .refine(
    (datos) =>
      !datos.fecha ||
      !datos.hora ||
      new Date(`${datos.fecha}T${datos.hora}`) > new Date(),
    { path: ["hora"], message: "La fecha y hora de salida deben ser futuras." },
  );

export type DatosCrearViaje = z.input<typeof esquemaCrearViaje>;

export const esquemaEditarViaje = z
  .object({
    fecha: z.string().min(1, "Elige la fecha."),
    hora: z.string().min(1, "Elige la hora."),
    precio: z
      .string()
      .min(1, "Escribe el precio.")
      .refine(
        (valor) => !valor || Number(valor) > 0,
        "El precio debe ser mayor a cero.",
      ),
  })
  .refine(
    (datos) =>
      !datos.fecha ||
      !datos.hora ||
      new Date(`${datos.fecha}T${datos.hora}`) > new Date(),
    { path: ["hora"], message: "La fecha y hora de salida deben ser futuras." },
  );

export type DatosEditarViaje = z.input<typeof esquemaEditarViaje>;
