import { eventoDTO } from "../dtos/evento/eventoDTO.js";
import { eventoDetalleDTO } from "../dtos/evento/eventoDetalleDTO.js";
import { parsearId } from "./parametros.js";

// body y query llegan ya validados por el middleware validarSchema (req.validado)
export class EventoController {
  constructor(eventoService) {
    this.eventoService = eventoService;
  }

  // GET /eventos?q=&categoria=&precioMin=&precioMax=&orden=&dir=
  buscar = async (req, res) => {
    const { q, categoria, precioMin, precioMax, orden, dir } = req.validado.query;
    const eventos = await this.eventoService.buscar({
      texto: q,
      categoriaId: categoria,
      precioMin,
      precioMax,
      orden,
      direccion: dir,
    });
    res.json(eventos.map(eventoDTO));
  };

  obtener = async (req, res) => {
    const detalle = await this.eventoService.obtenerDetalle(
      parsearId(req.params.id),
    );
    res.json(eventoDetalleDTO(detalle));
  };

  crear = async (req, res) => {
    const evento = await this.eventoService.crear(req.usuario, req.validado.body);
    res.status(201).json(eventoDTO({ evento, puntajeOrganizador: null }));
  };

  listarPorOrganizador = async (req, res) => {
    const eventos = await this.eventoService.listarPorOrganizador(
      parsearId(req.params.id),
    );
    res.json(eventos.map(eventoDTO));
  };
}
