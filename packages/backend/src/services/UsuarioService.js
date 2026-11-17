import { ForbiddenError } from "../errors/index.js";
import { buscarOFallar } from "./helpers.js";

export class UsuarioService {
  constructor(usuarioRepository, eventoRepository) {
    this.usuarioRepository = usuarioRepository;
    this.eventoRepository = eventoRepository;
  }

  async listar() {
    return this.usuarioRepository.buscarTodos();
  }

  async obtener(id) {
    return buscarOFallar(this.usuarioRepository, id, "el usuario");
  }

  async listarFavoritos(usuario, usuarioId) {
    this.#exigirMismoUsuario(usuario, usuarioId);
    return usuario.favoritos;
  }

  async agregarFavorito(usuario, usuarioId, eventoId) {
    this.#exigirMismoUsuario(usuario, usuarioId);
    const evento = await buscarOFallar(
      this.eventoRepository,
      eventoId,
      "el evento",
    );
    usuario.agregarFavorito(evento);
    await this.usuarioRepository.guardar(usuario);
    return usuario.favoritos;
  }

  async quitarFavorito(usuario, usuarioId, eventoId) {
    this.#exigirMismoUsuario(usuario, usuarioId);
    const evento = await buscarOFallar(
      this.eventoRepository,
      eventoId,
      "el evento",
    );
    usuario.quitarFavorito(evento);
    await this.usuarioRepository.guardar(usuario);
    return usuario.favoritos;
  }

  #exigirMismoUsuario(usuario, usuarioId) {
    if (usuario.id !== usuarioId) {
      throw new ForbiddenError("Solo podés gestionar tus propios favoritos");
    }
  }
}
