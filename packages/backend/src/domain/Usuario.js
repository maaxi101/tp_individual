export class Usuario {
  constructor(nombre, apellido) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.favoritos = [];
  }

  agregarFavorito(evento) {
    if (!this.favoritos.includes(evento)) {
      this.favoritos.push(evento);
    }
  }

  quitarFavorito(evento) {
    this.favoritos = this.favoritos.filter((e) => e !== evento);
  }
}
