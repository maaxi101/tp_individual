import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/index.js";

const STATUS_POR_ERROR = [
  [ValidationError, 400],
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
  [NotFoundError, 404],
  [ConflictError, 409],
];

export function rutaNoEncontrada(req) {
  throw new NotFoundError(
    `No existe la ruta ${req.method} ${req.originalUrl}`,
  );
}

// Express reconoce los middlewares de error porque reciben 4 parámetros
// eslint-disable-next-line no-unused-vars
export function manejadorDeErrores(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ error: "El cuerpo de la solicitud no es un JSON válido" });
  }
  const [, status] = STATUS_POR_ERROR.find(
    ([TipoError]) => error instanceof TipoError,
  ) ?? [null, 500];
  if (status === 500) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
  res.status(status).json({ error: error.message });
}
