import { z } from "zod";

// Mensajes de error de Zod en español
z.config(z.locales.es());

export const idPositivo = z.coerce
  .number({ error: "debe ser un número" })
  .int("debe ser un entero")
  .positive("debe ser mayor a 0");

export const textoObligatorio = z
  .string({ error: "es obligatorio" })
  .trim()
  .min(1, "es obligatorio");

// Los query params vacíos ("?q=") se tratan como ausentes
export const opcional = (schema) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), schema.optional());
