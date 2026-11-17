import { EstadoCompra } from "./EstadoCompra.js";
import { CambioEstadoCompra } from "./CambioEstadoCompra.js";
import { Mensaje } from "./Mensaje.js";
import { ConflictError } from "../errors/index.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const ESTADOS_ACTIVOS = [
  EstadoCompra.PENDIENTE,
  EstadoCompra.CONFIRMADA,
  EstadoCompra.UTILIZADA,
];

function inicioDelDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export class Compra {
  constructor(comprador, evento, tipoEntrada, cantidad) {
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
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

  confirmar(quien) {
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
      !this.evento.yaSeRealizo(ahora)
    );
  }

  // Libera el cupo y, si la compra ya estaba paga, la reembolsa
  cancelar(quien) {
    if (!this.puedeCancelarse()) {
      throw new ConflictError(this.#motivoNoCancelable());
    }
    const estabaPaga = this.estado === EstadoCompra.CONFIRMADA;
    this.actualizarEstado(EstadoCompra.CANCELADA, quien);
    this.tipoEntrada.reponerCupo(this.cantidad);
    if (estabaPaga) {
      this.actualizarEstado(EstadoCompra.REEMBOLSADA, quien);
    }
  }

  #motivoNoCancelable() {
    if (this.estado === EstadoCompra.UTILIZADA) {
      return "No se puede cancelar una compra ya utilizada";
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
