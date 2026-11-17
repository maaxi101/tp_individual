import { ForbiddenError } from "../errors/index.js";
import { buscarOFallar } from "./helpers.js";

// Los datos de entrada ya vienen con la forma correcta (validarSchema);
// acá solo viven las reglas de negocio: existencia, permisos, estados y cupo.
export class CompraService {
  constructor(compraRepository, eventoRepository) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
  }

  async comprar(comprador, { eventoId, tipoEntradaId, cantidad }) {
    const evento = await buscarOFallar(
      this.eventoRepository,
      eventoId,
      "el evento",
    );
    const compra = evento.venderEntradas(comprador, tipoEntradaId, cantidad);
    await this.eventoRepository.guardar(evento);
    return this.compraRepository.guardar(compra);
  }

  async listarPorComprador(usuario, compradorId) {
    if (usuario.id !== compradorId) {
      throw new ForbiddenError("Solo podés ver tus propias compras");
    }
    return this.compraRepository.buscarPorComprador(compradorId);
  }

  async listarPorEvento(usuario, eventoId) {
    const evento = await buscarOFallar(
      this.eventoRepository,
      eventoId,
      "el evento",
    );
    if (!evento.esOrganizador(usuario)) {
      throw new ForbiddenError(
        "Solo el organizador del evento puede ver sus compras",
      );
    }
    const compras = await this.compraRepository.buscarPorEvento(eventoId);
    return { evento, compras };
  }

  async obtener(usuario, compraId) {
    const compra = await buscarOFallar(
      this.compraRepository,
      compraId,
      "la compra",
    );
    if (!compra.esParticipante(usuario)) {
      throw new ForbiddenError("No participás de esta compra");
    }
    return compra;
  }

  // simula el pago de la compra
  async confirmar(usuario, compraId) {
    const compra = await this.obtener(usuario, compraId);
    this.#exigirComprador(
      compra,
      usuario,
      "Solo el comprador puede pagar la compra",
    );
    compra.confirmar(usuario);
    return this.compraRepository.guardar(compra);
  }

  // el organizador registra el ingreso al evento
  async utilizar(usuario, compraId) {
    const compra = await this.obtener(usuario, compraId);
    if (!compra.evento.esOrganizador(usuario)) {
      throw new ForbiddenError(
        "Solo el organizador puede marcar la entrada como utilizada",
      );
    }
    compra.utilizar(usuario);
    return this.compraRepository.guardar(compra);
  }

  async cancelar(usuario, compraId) {
    const compra = await this.obtener(usuario, compraId);
    this.#exigirComprador(
      compra,
      usuario,
      "Solo el comprador puede cancelar la compra",
    );
    compra.cancelar(usuario);
    await this.eventoRepository.guardar(compra.evento);
    return this.compraRepository.guardar(compra);
  }

  async listarMensajes(usuario, compraId) {
    const compra = await this.obtener(usuario, compraId);
    return compra.mensajes;
  }

  async enviarMensaje(usuario, compraId, texto) {
    const compra = await this.obtener(usuario, compraId);
    const mensaje = compra.agregarMensaje(usuario, texto);
    await this.compraRepository.guardar(compra);
    return mensaje;
  }

  #exigirComprador(compra, usuario, motivo) {
    if (compra.comprador.id !== usuario.id) {
      throw new ForbiddenError(motivo);
    }
  }
}
