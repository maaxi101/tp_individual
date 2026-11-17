import { InMemoryRepository } from "./InMemoryRepository.js";

export class CompraRepository extends InMemoryRepository {
  async buscarPorComprador(compradorId) {
    return this.buscarDonde((compra) => compra.comprador.id === compradorId);
  }

  async buscarPorEvento(eventoId) {
    return this.buscarDonde((compra) => compra.evento.id === eventoId);
  }
}
