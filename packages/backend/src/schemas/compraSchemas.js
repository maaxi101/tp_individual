import { z } from "zod";
import { idPositivo, textoObligatorio } from "./comunes.js";

export const CrearCompraSchema = z.strictObject({
  eventoId: idPositivo,
  tipoEntradaId: idPositivo,
  cantidad: idPositivo,
});

export const MensajeSchema = z.strictObject({
  mensaje: textoObligatorio.max(1000, "no puede superar los 1000 caracteres"),
});

export const ReseniaSchema = z.strictObject({
  puntuacion: z.coerce
    .number({ error: "debe ser un número" })
    .int("debe ser un entero")
    .min(1, "debe estar entre 1 y 5")
    .max(5, "debe estar entre 1 y 5"),
  detalle: textoObligatorio.max(1000, "no puede superar los 1000 caracteres"),
});
