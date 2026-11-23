import { EstadoCompra } from "./EstadoCompra.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";
import { Mensaje } from "./Mensaje.js";
import { ConflictError } from "../errors/index.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const MS_POR_MINUTO = 60 * 1000;
const ESTADOS_ACTIVOS = [
  EstadoCompra.PENDIENTE,
  EstadoCompra.CONFIRMADA,
  EstadoCompra.UTILIZADA,
];

function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export class Compra {
  // minutos que se reservan las entradas mientras la compra espera el pago
  static MINUTOS_RESERVA = 10;

  constructor(
    comprador,
    evento,
    tipoEntrada,
    cantidad,
    minutosReserva = Compra.MINUTOS_RESERVA,
  ) {
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
    this.creada = new Date();
    // fuente de verdad del vencimiento: la reserva vale hasta esta fecha,
    // la marque o no el job (ver confirmar y estaVencida)
    this.venceEn = new Date(this.creada.getTime() + minutosReserva * MS_POR_MINUTO);
    this.estado = EstadoCompra.PENDIENTE;
    this.mensajes = [];
    this.cambiosEstado = [
      new CambioEstadoCompra(this, EstadoCompra.PENDIENTE, comprador),
    ];
  }

  actualizarEstado(nuevoEstado, quien) {
    this.estado = nuevoEstado;
    this.cambiosEstado.push(new CambioEstadoCompra(this, nuevoEstado, quien));
  }

  // Una reserva pendiente cuyo plazo de pago ya pasó
  estaVencida(ahora = new Date()) {
    return this.estado === EstadoCompra.PENDIENTE && ahora >= this.venceEn;
  }

  // La pasa a VENCIDA y libera el cupo. quien = null: lo hace el sistema.
  // Devuelve true si cambió el estado.
  vencerSiExpiro(ahora = new Date()) {
    if (!this.estaVencida(ahora)) {
      return false;
    }
    this.actualizarEstado(EstadoCompra.VENCIDA, null);
    this.tipoEntrada.reponerCupo(this.cantidad);
    return true;
  }

  // Simula el pago. Se valida contra la fecha y no solo contra el estado:
  // aunque el job todavía no la haya marcado VENCIDA, un pago tardío se rechaza.
  confirmar(quien, ahora = new Date()) {
    if (this.estado === EstadoCompra.VENCIDA || this.estaVencida(ahora)) {
      throw new ConflictError("La reserva venció: ya no se puede pagar");
    }
    if (this.estado !== EstadoCompra.PENDIENTE) {
      throw new ConflictError(
        `Solo se puede confirmar una compra pendiente (estado actual: ${this.estado})`,
      );
    }
    this.actualizarEstado(EstadoCompra.CONFIRMADA, quien);
  }

  utilizar(quien) {
    if (this.estado !== EstadoCompra.CONFIRMADA) {
      throw new ConflictError(
        `Solo se puede utilizar una compra confirmada (estado actual: ${this.estado})`,
      );
    }
    this.actualizarEstado(EstadoCompra.UTILIZADA, quien);
  }

  puedeCancelarse(ahora = new Date()) {
    return (
      [EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA].includes(this.estado) &&
      !this.estaVencida(ahora) &&
      !this.evento.yaSeRealizo(ahora)
    );
  }

  // Libera el cupo y, si la compra ya estaba paga, la reembolsa
  cancelar(quien, ahora = new Date()) {
    if (!this.puedeCancelarse(ahora)) {
      throw new ConflictError(this.#motivoNoCancelable(ahora));
    }
    const estabaPaga = this.estado === EstadoCompra.CONFIRMADA;
    this.actualizarEstado(EstadoCompra.CANCELADA, quien);
    this.tipoEntrada.reponerCupo(this.cantidad);
    if (estabaPaga) {
      this.actualizarEstado(EstadoCompra.REEMBOLSADA, quien);
    }
  }

  #motivoNoCancelable(ahora) {
    if (this.estado === EstadoCompra.UTILIZADA) {
      return "No se puede cancelar una compra ya utilizada";
    }
    if (this.estado === EstadoCompra.VENCIDA || this.estaVencida(ahora)) {
      return "La reserva venció: las entradas ya se liberaron";
    }
    if (!ESTADOS_ACTIVOS.includes(this.estado)) {
      return "La compra ya fue cancelada";
    }
    return "No se puede cancelar: el evento ya se realizó";
  }

  estaActiva() {
    return ESTADOS_ACTIVOS.includes(this.estado);
  }

  // Días de calendario que faltan para el evento; solo aplica a compras confirmadas
  diasParaEvento(ahora = new Date()) {
    if (this.estado !== EstadoCompra.CONFIRMADA) {
      return null;
    }
    return Math.round(
      (inicioDelDia(this.evento.fecha) - inicioDelDia(ahora)) / MS_POR_DIA,
    );
  }

  esParticipante(usuario) {
    return (
      this.comprador.id === usuario.id || this.evento.esOrganizador(usuario)
    );
  }

  puedeSerReseniada() {
    return this.estado === EstadoCompra.UTILIZADA;
  }

  agregarMensaje(usuario, texto) {
    const mensaje = new Mensaje(usuario, texto);
    this.mensajes.push(mensaje);
    return mensaje;
  }
}
