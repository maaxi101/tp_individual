import { Compra } from "../domain/Compra.js";
import { ForbiddenError } from "../errors/index.js";
import { buscarOFallar } from "./helpers.js";

// Los datos de entrada ya vienen con la forma correcta (validarSchema);
// acá solo viven las reglas de negocio: existencia, permisos, estados y cupo.
//
// Vencimiento de reservas: se aplica de forma perezosa cada vez que se lee
// una compra (así nunca se muestra ni se paga una reserva vencida) y además
// un job llama a vencerReservasExpiradas() para liberar el cupo en segundo plano.
export class CompraService {
  constructor(
    compraRepository,
    eventoRepository,
    { minutosReserva = Compra.MINUTOS_RESERVA } = {},
  ) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.minutosReserva = minutosReserva;
  }

  async comprar(comprador, { eventoId, tipoEntradaId, cantidad }) {
    const evento = await buscarOFallar(
      this.eventoRepository,
      eventoId,
      "el evento",
    );
    // libera el cupo de las reservas vencidas antes de verificar disponibilidad
    await this.#vencerExpiradas(
      await this.compraRepository.buscarPorEvento(eventoId),
    );
    const compra = evento.venderEntradas(
      comprador,
      tipoEntradaId,
      cantidad,
      this.minutosReserva,
    );
    await this.eventoRepository.guardar(evento);
    return this.compraRepository.guardar(compra);
  }

  async listarPorComprador(usuario, compradorId) {
    if (usuario.id !== compradorId) {
      throw new ForbiddenError("Solo podés ver tus propias compras");
    }
    const compras = await this.compraRepository.buscarPorComprador(compradorId);
    await this.#vencerExpiradas(compras);
    return compras;
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
    await this.#vencerExpiradas(compras);
    // las más nuevas primero
    compras.sort((a, b) => b.id - a.id);
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
    await this.#vencerExpiradas([compra]);
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

  // Lo usa el job: vence todas las reservas expiradas y devuelve cuántas
  async vencerReservasExpiradas(ahora = new Date()) {
    const vencidas = await this.compraRepository.buscarPendientesVencidas(ahora);
    return this.#vencerExpiradas(vencidas, ahora);
  }

  async #vencerExpiradas(compras, ahora = new Date()) {
    let cantidad = 0;
    for (const compra of compras) {
      if (compra.vencerSiExpiro(ahora)) {
        await this.eventoRepository.guardar(compra.evento);
        await this.compraRepository.guardar(compra);
        cantidad++;
      }
    }
    return cantidad;
  }

  #exigirComprador(compra, usuario, motivo) {
    if (compra.comprador.id !== usuario.id) {
      throw new ForbiddenError(motivo);
    }
  }
}
