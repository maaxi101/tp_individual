// Repositorio base en memoria con id autoincremental propio.
// Es async para que reemplazarlo por una base de datos real no afecte
// a las capas de arriba.
export class InMemoryRepository {
  #entidades = [];
  #siguienteId = 1;

  async guardar(entidad) {
    // las entidades se guardan por referencia, así que una entidad
    // existente ya refleja sus cambios y no hace falta reemplazarla
    if (entidad.id == null) {
      entidad.id = this.#siguienteId++;
      this.#entidades.push(entidad);
    }
    return entidad;
  }

  async buscarPorId(id) {
    return this.#entidades.find((entidad) => entidad.id === id) ?? null;
  }

  async buscarTodos() {
    return [...this.#entidades];
  }

  async buscarDonde(criterio) {
    return this.#entidades.filter(criterio);
  }
}
