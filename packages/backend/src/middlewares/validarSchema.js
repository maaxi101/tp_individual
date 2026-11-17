import { ValidationError } from "../errors/index.js";

// Valida la forma de la entrada (body o query) con un esquema de Zod antes de
// llegar al controller. Los datos ya parseados quedan en req.validado[origen].
// No se pisa req.query porque en Express 5 es de solo lectura.
export function validarSchema(schema, origen = "body") {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origen] ?? {});
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((issue) => `${issue.path.join(".") || origen} ${issue.message}`)
        .join("; ");
      throw new ValidationError(`Datos inválidos: ${detalles}`);
    }
    req.validado = { ...req.validado, [origen]: resultado.data };
    next();
  };
}
