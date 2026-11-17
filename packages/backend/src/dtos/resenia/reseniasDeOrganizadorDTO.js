import { redondear } from "../helpers.js";
import { reseniaDTO } from "./reseniaDTO.js";

export const reseniasDeOrganizadorDTO = ({ resenias, promedio }) => ({
  promedio: redondear(promedio),
  cantidad: resenias.length,
  resenias: resenias.map(reseniaDTO),
});
