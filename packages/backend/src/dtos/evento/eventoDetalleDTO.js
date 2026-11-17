import { reseniaDTO } from "../resenia/reseniaDTO.js";
import { eventoDTO } from "./eventoDTO.js";

export const eventoDetalleDTO = ({ evento, puntajeOrganizador, resenias }) => ({
  ...eventoDTO({ evento, puntajeOrganizador }),
  resenias: resenias.map(reseniaDTO),
});
