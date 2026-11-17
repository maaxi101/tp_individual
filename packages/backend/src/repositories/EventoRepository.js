import { InMemoryRepository } from "./InMemoryRepository.js";

// "Música" y "musica" deben coincidir en la búsqueda
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export class EventoRepository extends InMemoryRepository {
  // los tipos de entrada viven dentro del evento, así que su id lo asigna este repositorio
  #siguienteIdTipoEntrada = 1;

  async guardar(evento) {
    for (const tipo of evento.tiposEntrada) {
      if (tipo.id == null) {
        tipo.id = this.#siguienteIdTipoEntrada++;
      }
    }
    return super.guardar(evento);
  }

  async buscar({ texto, categoriaId, precioMin, precioMax } = {}) {
    const textoBuscado = texto ? normalizar(texto.trim()) : "";
    return this.buscarDonde(
      (evento) =>
        (!textoBuscado ||
          [evento.nombre, evento.descripcion, evento.categoria.nombre].some(
            (campo) => normalizar(campo).includes(textoBuscado),
          )) &&
        (categoriaId == null || evento.categoria.id === categoriaId) &&
        evento.tuPrecioEstaEntre(precioMin ?? 0, precioMax ?? Infinity),
    );
  }

  async buscarPorOrganizador(organizadorId) {
    return this.buscarDonde((evento) => evento.organizador.id === organizadorId);
  }
}
