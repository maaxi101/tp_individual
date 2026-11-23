import { Compra } from "./Compra.js";
import { ConflictError, NotFoundError } from "../errors/index.js";

export class Evento {
  constructor(
    nombre,
    descripcion,
    categoria,
    fecha,
    tiposEntrada,
    multimedia,
    organizador,
  ) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = fecha;
    this.tiposEntrada = tiposEntrada;
    this.multimedia = multimedia;
    this.organizador = organizador;
  }

  // true si alguno de los tipos de entrada tiene un precio dentro del rango
  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some(
      (tipo) => tipo.precio >= min && tipo.precio <= max,
    );
  }

  precioMinimo() {
    return Math.min(...this.tiposEntrada.map((tipo) => tipo.precio));
  }

  yaSeRealizo(ahora = new Date()) {
    return this.fecha <= ahora;
  }

  esOrganizador(usuario) {
    return this.organizador.id === usuario.id;
  }

  buscarTipoEntrada(tipoEntradaId) {
    return this.tiposEntrada.find((tipo) => tipo.id === tipoEntradaId) ?? null;
  }

  venderEntradas(comprador, tipoEntradaId, cantidad, minutosReserva) {
    if (this.yaSeRealizo()) {
      throw new ConflictError("El evento ya se realizó");
    }
    const tipoEntrada = this.buscarTipoEntrada(tipoEntradaId);
    if (!tipoEntrada) {
      throw new NotFoundError(
        `El evento no tiene un tipo de entrada con id ${tipoEntradaId}`,
      );
    }
    tipoEntrada.descontarCupo(cantidad);
    return new Compra(comprador, this, tipoEntrada, cantidad, minutosReserva);
  }
}
