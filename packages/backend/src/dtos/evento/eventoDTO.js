import { redondear } from "../helpers.js";
import { eventoResumenDTO } from "./eventoResumenDTO.js";

export const eventoDTO = ({ evento, puntajeOrganizador }) => ({
  ...eventoResumenDTO(evento),
  puntajeOrganizador: redondear(puntajeOrganizador),
});
