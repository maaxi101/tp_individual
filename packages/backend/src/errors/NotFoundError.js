import { AppError } from "./AppError.js";

// El recurso buscado no existe (404)
export class NotFoundError extends AppError {}
