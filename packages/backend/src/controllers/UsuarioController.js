import { eventoResumenDTO } from "../dtos/evento/eventoResumenDTO.js";
import { usuarioDTO } from "../dtos/usuario/usuarioDTO.js";
import { parsearId } from "./parametros.js";

export class UsuarioController {
  constructor(usuarioService) {
    this.usuarioService = usuarioService;
  }

  listar = async (req, res) => {
    const usuarios = await this.usuarioService.listar();
    res.json(usuarios.map(usuarioDTO));
  };

  listarFavoritos = async (req, res) => {
    const favoritos = await this.usuarioService.listarFavoritos(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(favoritos.map(eventoResumenDTO));
  };

  agregarFavorito = async (req, res) => {
    const favoritos = await this.usuarioService.agregarFavorito(
      req.usuario,
      parsearId(req.params.id),
      req.validado.body.eventoId,
    );
    res.status(201).json(favoritos.map(eventoResumenDTO));
  };

  quitarFavorito = async (req, res) => {
    const favoritos = await this.usuarioService.quitarFavorito(
      req.usuario,
      parsearId(req.params.id),
      parsearId(req.params.eventoId, "eventoId"),
    );
    res.json(favoritos.map(eventoResumenDTO));
  };
}
