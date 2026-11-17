import { Evento } from "../domain/Evento.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";
import { ValidationError } from "../errors/index.js";
import { buscarOFallar } from "./helpers.js";

const CRITERIOS_DE_ORDEN = {
  precio: ({ evento }) => evento.precioMinimo(),
  fecha: ({ evento }) => evento.fecha.getTime(),
  puntaje: ({ puntajeOrganizador }) => puntajeOrganizador,
};

// Los datos de entrada ya vienen con la forma correcta (validarSchema);
// acá solo viven las reglas de negocio.
export class EventoService {
  constructor(
    eventoRepository,
    categoriaRepository,
    usuarioRepository,
    reseniaService,
  ) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
    this.usuarioRepository = usuarioRepository;
    this.reseniaService = reseniaService;
  }

  async buscar({
    texto,
    categoriaId,
    precioMin,
    precioMax,
    orden,
    direccion = "asc",
  }) {
    if (orden !== undefined && !CRITERIOS_DE_ORDEN[orden]) {
      throw new ValidationError(
        `Orden inválido: usá ${Object.keys(CRITERIOS_DE_ORDEN).join(", ")}`,
      );
    }
    const eventos = await this.eventoRepository.buscar({
      texto,
      categoriaId,
      precioMin,
      precioMax,
    });
    const resultado = await this.#conPuntajeOrganizador(eventos);
    if (orden) {
      resultado.sort(this.#comparador(CRITERIOS_DE_ORDEN[orden], direccion));
    }
    return resultado;
  }

  async obtenerDetalle(id) {
    const evento = await buscarOFallar(this.eventoRepository, id, "el evento");
    const { resenias, promedio } =
      await this.reseniaService.listarPorOrganizador(evento.organizador.id);
    return { evento, puntajeOrganizador: promedio, resenias };
  }

  async listarPorOrganizador(organizadorId) {
    await buscarOFallar(
      this.usuarioRepository,
      organizadorId,
      "el organizador",
    );
    const eventos =
      await this.eventoRepository.buscarPorOrganizador(organizadorId);
    return this.#conPuntajeOrganizador(eventos);
  }

  async crear(organizador, datos) {
    const categoria = await buscarOFallar(
      this.categoriaRepository,
      datos.categoriaId,
      "la categoría",
    );
    const tiposEntrada = datos.tiposEntrada.map(
      (tipo) =>
        new TipoEntrada(tipo.nombre, tipo.descripcion, tipo.precio, tipo.cupo),
    );
    const evento = new Evento(
      datos.nombre,
      datos.descripcion,
      categoria,
      new Date(datos.fecha),
      tiposEntrada,
      datos.multimedia,
      organizador,
    );
    return this.eventoRepository.guardar(evento);
  }

  async #conPuntajeOrganizador(eventos) {
    const puntajes = new Map();
    for (const { organizador } of eventos) {
      if (!puntajes.has(organizador.id)) {
        puntajes.set(
          organizador.id,
          await this.reseniaService.puntajeDeOrganizador(organizador.id),
        );
      }
    }
    return eventos.map((evento) => ({
      evento,
      puntajeOrganizador: puntajes.get(evento.organizador.id),
    }));
  }

  // los valores nulos (organizadores sin reseñas) quedan siempre al final
  #comparador(criterio, direccion) {
    const factor = direccion === "desc" ? -1 : 1;
    return (a, b) => {
      const valorA = criterio(a);
      const valorB = criterio(b);
      if (valorA == null) return valorB == null ? 0 : 1;
      if (valorB == null) return -1;
      return (valorA - valorB) * factor;
    };
  }
}
