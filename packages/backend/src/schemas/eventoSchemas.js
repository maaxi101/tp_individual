import { z } from "zod";
import { idPositivo, opcional, textoObligatorio } from "./comunes.js";

const fechaFutura = z
  .string({ error: "es obligatoria" })
  .refine((valor) => !Number.isNaN(Date.parse(valor)), "debe ser una fecha ISO válida")
  .refine((valor) => new Date(valor) > new Date(), "debe ser una fecha futura");

const TipoEntradaSchema = z.strictObject({
  nombre: textoObligatorio,
  descripcion: z.string().trim().optional().default(""),
  precio: z.coerce
    .number({ error: "debe ser un número" })
    .nonnegative("debe ser mayor o igual a 0"),
  cupo: idPositivo,
});

export const CrearEventoSchema = z.strictObject({
  nombre: textoObligatorio,
  descripcion: textoObligatorio,
  categoriaId: idPositivo,
  fecha: fechaFutura,
  tiposEntrada: z
    .array(TipoEntradaSchema, { error: "debe ser una lista" })
    .min(1, "el evento debe tener al menos un tipo de entrada"),
  multimedia: z
    .array(z.url("debe ser una URL válida"), { error: "debe ser una lista de URLs" })
    .optional()
    .default([]),
});

// GET /eventos?q=&categoria=&precioMin=&precioMax=&orden=&dir=
export const BuscarEventosQuerySchema = z.object({
  q: opcional(z.string().trim()),
  categoria: opcional(idPositivo),
  precioMin: opcional(z.coerce.number({ error: "debe ser un número" })),
  precioMax: opcional(z.coerce.number({ error: "debe ser un número" })),
  orden: opcional(
    z.enum(["precio", "fecha", "puntaje"], {
      error: "debe ser precio, fecha o puntaje",
    }),
  ),
  dir: opcional(z.enum(["asc", "desc"], { error: "debe ser asc o desc" })),
});
