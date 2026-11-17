import { ConflictError } from "../errors/index.js";

export class TipoEntrada {
  constructor(nombre, descripcion, precio, cupo) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    // cupo disponible: se descuenta al vender y se repone al cancelar
    this.cupo = cupo;
  }

  hayCupoPara(cantidad) {
    return cantidad > 0 && cantidad <= this.cupo;
  }

  descontarCupo(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new ConflictError(
        `No hay cupo suficiente para "${this.nombre}": quedan ${this.cupo} entradas`,
      );
    }
    this.cupo -= cantidad;
  }

  reponerCupo(cantidad) {
    this.cupo += cantidad;
  }
}
