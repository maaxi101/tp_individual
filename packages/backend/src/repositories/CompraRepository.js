import { InMemoryRepository } from "./InMemoryRepository.js";

export class CompraRepository extends InMemoryRepository {
  async buscarPorComprador(compradorId) {
    return this.buscarDonde((compra) => compra.comprador.id === compradorId);
  }

  async buscarPorEvento(eventoId) {
    return this.buscarDonde((compra) => compra.evento.id === eventoId);
  }

  // En memoria recorre todo; con una base de datos sería
  // WHERE estado = 'PENDIENTE' AND vence_en <= now() sobre un índice
  // (estado, vence_en), que solo toca las filas vencidas.
  async buscarPendientesVencidas(ahora = new Date()) {
    return this.buscarDonde((compra) => compra.estaVencida(ahora));
  }
}
