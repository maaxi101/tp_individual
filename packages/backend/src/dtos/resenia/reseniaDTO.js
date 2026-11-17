import { usuarioDTO } from "../usuario/usuarioDTO.js";

export const reseniaDTO = (resenia) => ({
  id: resenia.id,
  comprador: usuarioDTO(resenia.comprador),
  evento: { id: resenia.evento.id, nombre: resenia.evento.nombre },
  detalle: resenia.detalle,
  puntuacion: resenia.puntuacion,
});
