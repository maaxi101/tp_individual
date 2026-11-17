import { reseniaDTO } from "../dtos/resenia/reseniaDTO.js";
import { reseniasDeOrganizadorDTO } from "../dtos/resenia/reseniasDeOrganizadorDTO.js";
import { parsearId } from "./parametros.js";

export class ReseniaController {
  constructor(reseniaService) {
    this.reseniaService = reseniaService;
  }

  reseniar = async (req, res) => {
    const resenia = await this.reseniaService.reseniar(
      req.usuario,
      parsearId(req.params.id),
      req.validado.body,
    );
    res.status(201).json(reseniaDTO(resenia));
  };

  listarPorOrganizador = async (req, res) => {
    const resultado = await this.reseniaService.listarPorOrganizador(
      parsearId(req.params.id),
    );
    res.json(reseniasDeOrganizadorDTO(resultado));
  };
}
