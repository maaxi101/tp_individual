import { NotFoundError } from "../errors/index.js";

export async function buscarOFallar(repository, id, entidad) {
  const encontrada = await repository.buscarPorId(id);
  if (!encontrada) {
    throw new NotFoundError(`No existe ${entidad} con id ${id}`);
  }
  return encontrada;
}

export function promedio(valores) {
  if (valores.length === 0) {
    return null;
  }
  return valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
}
