import { NotFoundError, UnauthorizedError } from "../errors/index.js";

// No hay login: el front indica qué usuario está usando la app con el header x-user-id
export function autenticar(usuarioService) {
  return async (req, res, next) => {
    const header = req.get("x-user-id");
    const id = Number(header);
    if (!header || !Number.isInteger(id) || id <= 0) {
      throw new UnauthorizedError("Falta o es inválido el header x-user-id");
    }
    try {
      req.usuario = await usuarioService.obtener(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError(`No existe el usuario ${id}`);
      }
      throw error;
    }
    next();
  };
}
