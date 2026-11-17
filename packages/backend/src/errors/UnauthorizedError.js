import { AppError } from "./AppError.js";

// No se pudo identificar al usuario (401)
export class UnauthorizedError extends AppError {}
