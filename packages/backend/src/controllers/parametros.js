import { ValidationError } from "../errors/index.js";

// Los parámetros de ruta (/eventos/:id) llegan como string: se convierten acá,
// antes de pasarlos al service. El body y la query los valida el middleware
// validarSchema con Zod.
export function parsearId(valor, campo = "id") {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError(
      `El parámetro "${campo}" debe ser un entero positivo`,
    );
  }
  return id;
}
