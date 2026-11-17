import { AppError } from "./AppError.js";

// La acción viola una regla de negocio según el estado actual (409)
export class ConflictError extends AppError {}
