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
