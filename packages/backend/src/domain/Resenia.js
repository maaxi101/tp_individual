import { ValidationError } from "../errors/index.js";

export class Resenia {
  constructor(comprador, evento, detalle, puntuacion) {
    if (typeof puntuacion !== "number" || puntuacion < 1 || puntuacion > 5) {
      throw new ValidationError("La puntuación debe ser un número entre 1 y 5");
    }
    this.comprador = comprador;
    this.evento = evento;
    this.detalle = detalle;
    this.puntuacion = puntuacion;
  }
}
