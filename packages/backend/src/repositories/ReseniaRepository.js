import { InMemoryRepository } from "./InMemoryRepository.js";

export class ReseniaRepository extends InMemoryRepository {
  async buscarPorOrganizador(organizadorId) {
    return this.buscarDonde(
      (resenia) => resenia.evento.organizador.id === organizadorId,
    );
  }

  async buscarPorCompradorYEvento(compradorId, eventoId) {
    const [resenia] = await this.buscarDonde(
      (resenia) =>
        resenia.comprador.id === compradorId && resenia.evento.id === eventoId,
    );
    return resenia ?? null;
  }
}
