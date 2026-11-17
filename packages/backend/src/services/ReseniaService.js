import { Resenia } from "../domain/Resenia.js";
import { ConflictError, ForbiddenError } from "../errors/index.js";
import { buscarOFallar, promedio } from "./helpers.js";

export class ReseniaService {
  constructor(reseniaRepository, compraRepository, usuarioRepository) {
    this.reseniaRepository = reseniaRepository;
    this.compraRepository = compraRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async reseniar(usuario, compraId, { puntuacion, detalle }) {
    const compra = await buscarOFallar(
      this.compraRepository,
      compraId,
      "la compra",
    );
    if (compra.comprador.id !== usuario.id) {
      throw new ForbiddenError("Solo el comprador puede reseñar esta compra");
    }
    if (!compra.puedeSerReseniada()) {
      throw new ConflictError("Solo se pueden reseñar compras utilizadas");
    }
    const existente = await this.reseniaRepository.buscarPorCompradorYEvento(
      usuario.id,
      compra.evento.id,
    );
    if (existente) {
      throw new ConflictError("Ya reseñaste este evento");
    }
    const resenia = new Resenia(usuario, compra.evento, detalle, puntuacion);
    return this.reseniaRepository.guardar(resenia);
  }

  async listarPorOrganizador(organizadorId) {
    await buscarOFallar(
      this.usuarioRepository,
      organizadorId,
      "el organizador",
    );
    const resenias =
      await this.reseniaRepository.buscarPorOrganizador(organizadorId);
    return { resenias, promedio: promedio(resenias.map((r) => r.puntuacion)) };
  }

  async puntajeDeOrganizador(organizadorId) {
    const resenias =
      await this.reseniaRepository.buscarPorOrganizador(organizadorId);
    return promedio(resenias.map((r) => r.puntuacion));
  }
}
