import { AppError } from "./AppError.js";

// El usuario no tiene permiso para la acción (403)
export class ForbiddenError extends AppError {}
